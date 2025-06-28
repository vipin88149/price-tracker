const cron = require('node-cron');
const Tracking = require('../models/Tracking');
const Product = require('../models/Product');
const User = require('../models/User');
const scraper = require('./scraper');
const notificationService = require('./notifications');

class PriceTrackerScheduler {
  constructor() {
    this.isRunning = false;
    this.jobs = new Map();
  }

  start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    console.log('Starting Price Tracker Scheduler...');
    this.isRunning = true;

    // Run price checks every hour
    cron.schedule('0 * * * *', () => {
      this.runPriceChecks();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    // Run daily cleanup and maintenance
    cron.schedule('0 2 * * *', () => {
      this.runMaintenance();
    }, {
      scheduled: true,
      timezone: 'UTC'
    });

    // Initial run
    setTimeout(() => {
      this.runPriceChecks();
    }, 5000); // Wait 5 seconds after startup
  }

  stop() {
    if (!this.isRunning) {
      console.log('Scheduler is not running');
      return;
    }

    console.log('Stopping Price Tracker Scheduler...');
    this.isRunning = false;
    
    // Stop all cron jobs
    cron.getTasks().forEach(task => task.stop());
  }

  async runPriceChecks() {
    if (!this.isRunning) return;

    console.log(`[${new Date().toISOString()}] Starting price checks...`);
    
    try {
      // Get all active tracking entries that need to be checked
      const trackingsToCheck = await Tracking.find({
        status: 'active',
        nextCheck: { $lte: new Date() }
      }).populate('user product');

      console.log(`Found ${trackingsToCheck.length} products to check`);

      for (const tracking of trackingsToCheck) {
        try {
          await this.checkProductPrice(tracking);
        } catch (error) {
          console.error(`Error checking price for tracking ${tracking._id}:`, error.message);
        }
      }

      console.log(`[${new Date().toISOString()}] Price checks completed`);
    } catch (error) {
      console.error('Error in price checks:', error);
    }
  }

  async checkProductPrice(tracking) {
    const { user, product } = tracking;

    if (!user || !product) {
      console.log(`Skipping tracking ${tracking._id}: Missing user or product`);
      return;
    }

    console.log(`Checking price for ${product.title} (${product.url})`);

    try {
      // Update product price
      const priceChanged = await scraper.updateProductPrice(product);
      
      if (priceChanged) {
        console.log(`Price changed for ${product.title}: ${product.currentPrice}`);
        
        // Check if target price is reached
        if (tracking.isTargetReached(product.currentPrice)) {
          console.log(`Target price reached for ${product.title}!`);
          
          // Add price alert
          tracking.addPriceAlert(product.currentPrice, 'target_reached');
          
          // Send notifications
          await this.sendPriceAlert(tracking, product, 'target_reached');
          
          // Mark tracking as completed
          tracking.complete();
        } else {
          // Check for significant price drop (more than 10%)
          const priceChange = product.getPriceChange();
          if (priceChange < -10) {
            console.log(`Significant price drop for ${product.title}: ${priceChange.toFixed(2)}%`);
            
            tracking.addPriceAlert(product.currentPrice, 'significant_drop');
            await this.sendPriceAlert(tracking, product, 'significant_drop');
          }
        }
      }

      // Check if product is back in stock
      if (product.availability === 'in_stock' && tracking.priceAlerts.length > 0) {
        const lastAlert = tracking.priceAlerts[tracking.priceAlerts.length - 1];
        if (lastAlert.type === 'out_of_stock') {
          console.log(`Product back in stock: ${product.title}`);
          tracking.addPriceAlert(product.currentPrice, 'back_in_stock');
          await this.sendPriceAlert(tracking, product, 'back_in_stock');
        }
      }

      // Calculate next check time
      tracking.calculateNextCheck();
      await tracking.save();

    } catch (error) {
      console.error(`Error checking price for ${product.title}:`, error.message);
      
      // Update next check time even if there's an error
      tracking.calculateNextCheck();
      await tracking.save();
    }
  }

  async sendPriceAlert(tracking, product, alertType) {
    const { user } = tracking;

    try {
      const alertMessages = {
        target_reached: `🎉 Target price reached! ${product.title} is now $${product.currentPrice}`,
        significant_drop: `📉 Price dropped! ${product.title} is now $${product.currentPrice} (${product.getPriceChange().toFixed(2)}% drop)`,
        back_in_stock: `✅ Back in stock! ${product.title} is available for $${product.currentPrice}`
      };

      const message = alertMessages[alertType] || `Price update for ${product.title}: $${product.currentPrice}`;

      // Send email notification
      if (tracking.notifications.email && user.preferences.emailNotifications) {
        await notificationService.sendEmailNotification(user.email, {
          subject: `Price Alert: ${product.title}`,
          message,
          product,
          tracking
        });
      }

      // Send WhatsApp notification
      if (tracking.notifications.whatsapp && user.preferences.whatsappNotifications && user.phone) {
        await notificationService.sendWhatsAppNotification(user.phone, {
          message,
          product,
          tracking
        });
      }

    } catch (error) {
      console.error(`Error sending notification for ${product.title}:`, error.message);
    }
  }

  async runMaintenance() {
    console.log(`[${new Date().toISOString()}] Running maintenance tasks...`);

    try {
      // Clean up old price history (keep only last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const products = await Product.find({
        'priceHistory.timestamp': { $lt: thirtyDaysAgo }
      });

      for (const product of products) {
        product.priceHistory = product.priceHistory.filter(
          entry => entry.timestamp >= thirtyDaysAgo
        );
        await product.save();
      }

      // Clean up completed trackings older than 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      await Tracking.deleteMany({
        status: 'completed',
        updatedAt: { $lt: ninetyDaysAgo }
      });

      // Clean up old price alerts (keep only last 20)
      const trackings = await Tracking.find({
        'priceAlerts.20': { $exists: true }
      });

      for (const tracking of trackings) {
        tracking.priceAlerts = tracking.priceAlerts.slice(-20);
        await tracking.save();
      }

      console.log(`[${new Date().toISOString()}] Maintenance completed`);
    } catch (error) {
      console.error('Error in maintenance:', error);
    }
  }

  // Manual price check for a specific tracking
  async checkSpecificTracking(trackingId) {
    try {
      const tracking = await Tracking.findById(trackingId).populate('user product');
      if (!tracking) {
        throw new Error('Tracking not found');
      }

      await this.checkProductPrice(tracking);
      return tracking;
    } catch (error) {
      console.error(`Error checking specific tracking ${trackingId}:`, error.message);
      throw error;
    }
  }

  // Get scheduler status
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextCheck: new Date(Date.now() + 60 * 60 * 1000), // Next hour
      activeJobs: this.jobs.size
    };
  }
}

module.exports = new PriceTrackerScheduler(); 
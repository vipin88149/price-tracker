const mongoose = require('mongoose');

const trackingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  targetPrice: {
    type: Number,
    required: true
  },
  checkFrequency: {
    type: String,
    enum: ['hourly', 'daily', 'weekly'],
    default: 'daily'
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    whatsapp: {
      type: Boolean,
      default: false
    }
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  },
  lastNotified: {
    type: Date
  },
  nextCheck: {
    type: Date,
    default: Date.now
  },
  priceAlerts: [{
    price: Number,
    timestamp: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['target_reached', 'significant_drop', 'back_in_stock']
    }
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
trackingSchema.index({ user: 1, product: 1 }, { unique: true });
trackingSchema.index({ status: 1, nextCheck: 1 });
trackingSchema.index({ user: 1, status: 1 });

// Method to check if target price is reached
trackingSchema.methods.isTargetReached = function(currentPrice) {
  return currentPrice <= this.targetPrice;
};

// Method to add price alert
trackingSchema.methods.addPriceAlert = function(price, type) {
  this.priceAlerts.push({
    price,
    type,
    timestamp: new Date()
  });
  
  this.lastNotified = new Date();
  
  // Keep only last 50 alerts
  if (this.priceAlerts.length > 50) {
    this.priceAlerts = this.priceAlerts.slice(-50);
  }
};

// Method to calculate next check time
trackingSchema.methods.calculateNextCheck = function() {
  const now = new Date();
  let nextCheck = new Date(now);
  
  switch (this.checkFrequency) {
    case 'hourly':
      nextCheck.setHours(nextCheck.getHours() + 1);
      break;
    case 'daily':
      nextCheck.setDate(nextCheck.getDate() + 1);
      break;
    case 'weekly':
      nextCheck.setDate(nextCheck.getDate() + 7);
      break;
    default:
      nextCheck.setDate(nextCheck.getDate() + 1);
  }
  
  this.nextCheck = nextCheck;
  return nextCheck;
};

// Method to pause tracking
trackingSchema.methods.pause = function() {
  this.status = 'paused';
};

// Method to resume tracking
trackingSchema.methods.resume = function() {
  this.status = 'active';
  this.calculateNextCheck();
};

// Method to complete tracking
trackingSchema.methods.complete = function() {
  this.status = 'completed';
};

module.exports = mongoose.model('Tracking', trackingSchema); 
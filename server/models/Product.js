const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  availability: {
    type: String,
    enum: ['in_stock', 'out_of_stock', 'limited'],
    default: 'in_stock'
  }
});

const productSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  originalPrice: {
    type: Number
  },
  currency: {
    type: String,
    default: 'USD'
  },
  availability: {
    type: String,
    enum: ['in_stock', 'out_of_stock', 'limited'],
    default: 'in_stock'
  },
  website: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  priceHistory: [priceHistorySchema],
  lastChecked: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
productSchema.index({ url: 1 });
productSchema.index({ website: 1 });
productSchema.index({ lastChecked: 1 });
productSchema.index({ isActive: 1 });

// Method to add price to history
productSchema.methods.addPriceToHistory = function(price, availability = 'in_stock') {
  this.priceHistory.push({
    price,
    currency: this.currency,
    availability,
    timestamp: new Date()
  });
  
  // Keep only last 100 price entries
  if (this.priceHistory.length > 100) {
    this.priceHistory = this.priceHistory.slice(-100);
  }
  
  this.currentPrice = price;
  this.availability = availability;
  this.lastChecked = new Date();
};

// Method to get price change percentage
productSchema.methods.getPriceChange = function() {
  if (this.priceHistory.length < 2) return 0;
  
  const current = this.priceHistory[this.priceHistory.length - 1].price;
  const previous = this.priceHistory[this.priceHistory.length - 2].price;
  
  return ((current - previous) / previous) * 100;
};

// Method to get lowest price
productSchema.methods.getLowestPrice = function() {
  if (this.priceHistory.length === 0) return null;
  
  return Math.min(...this.priceHistory.map(entry => entry.price));
};

// Method to get highest price
productSchema.methods.getHighestPrice = function() {
  if (this.priceHistory.length === 0) return null;
  
  return Math.max(...this.priceHistory.map(entry => entry.price));
};

module.exports = mongoose.model('Product', productSchema); 
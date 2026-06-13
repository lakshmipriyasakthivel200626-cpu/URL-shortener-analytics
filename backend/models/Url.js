const mongoose = require('mongoose');

const UrlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: [true, 'Please provide the original URL'],
    trim: true
  },

  shortCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  shortUrl: {
    type: String,
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  clicks: {
    type: Number,
    default: 0
  },

  // 🔥 ADD THIS (EXPIRY FEATURE)
  expiryDate: {
    type: Date,
    default: null
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Url', UrlSchema);
const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
  parkingLot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ParkingLot',
    required: true
  },
  spotNumber: {
    type: String,
    required: [true, 'Please provide a spot number'],
    trim: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED'],
    default: 'AVAILABLE'
  },
  floor: {
    type: String,
    trim: true
  },
  section: {
    type: String,
    trim: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated before saving
parkingSpotSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Compound index to ensure unique spot numbers within a parking lot
parkingSpotSchema.index({ parkingLot: 1, spotNumber: 1 }, { unique: true });

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);

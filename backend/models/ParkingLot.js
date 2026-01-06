const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a parking lot name'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
    trim: true
  },
  totalCapacity: {
    type: Number,
    required: [true, 'Please provide total capacity'],
    min: 1
  },
  description: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
parkingLotSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual field to get available slots count
parkingLotSchema.virtual('availableSlots', {
  ref: 'ParkingSpot',
  localField: '_id',
  foreignField: 'parkingLot',
  count: true,
  match: { status: 'AVAILABLE' }
});

// Ensure virtual fields are included when converting to JSON
parkingLotSchema.set('toJSON', { virtuals: true });
parkingLotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ParkingLot', parkingLotSchema);

const ParkingLot = require('../models/ParkingLot');
const ParkingSpot = require('../models/ParkingSpot');

// Get all parking lots with availability count
exports.getAllParkingLots = async (req, res) => {
  try {
    const parkingLots = await ParkingLot.find();

    // Get available slots count for each parking lot
    const lotsWithAvailability = await Promise.all(
      parkingLots.map(async (lot) => {
        const availableCount = await ParkingSpot.countDocuments({
          parkingLot: lot._id,
          status: 'AVAILABLE'
        });

        return {
          id: lot._id,
          name: lot.name,
          location: lot.location,
          totalCapacity: lot.totalCapacity,
          availableSlots: availableCount,
          occupiedSlots: lot.totalCapacity - availableCount,
          description: lot.description,
          createdAt: lot.createdAt,
          updatedAt: lot.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      count: lotsWithAvailability.length,
      data: lotsWithAvailability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single parking lot by ID
exports.getParkingLotById = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }

    // Get available slots count
    const availableCount = await ParkingSpot.countDocuments({
      parkingLot: parkingLot._id,
      status: 'AVAILABLE'
    });

    res.status(200).json({
      success: true,
      data: {
        id: parkingLot._id,
        name: parkingLot.name,
        location: parkingLot.location,
        totalCapacity: parkingLot.totalCapacity,
        availableSlots: availableCount,
        occupiedSlots: parkingLot.totalCapacity - availableCount,
        description: parkingLot.description,
        createdAt: parkingLot.createdAt,
        updatedAt: parkingLot.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new parking lot (Admin only)
exports.createParkingLot = async (req, res) => {
  try {
    const { name, location, totalCapacity, description } = req.body;

    // Validate input
    if (!name || !location || !totalCapacity) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, location, and total capacity'
      });
    }

    const parkingLot = await ParkingLot.create({
      name,
      location,
      totalCapacity,
      description
    });

    // Auto-generate parking slots based on totalCapacity
    const slots = [];
    const prefix = name.charAt(name.indexOf('Mall') + 5); // Get letter after 'Mall ' (e.g., 'A', 'B', 'C')
    const availableRatio = 0.67; // 67% available, 33% occupied
    const availableCount = Math.floor(totalCapacity * availableRatio);

    for (let i = 1; i <= totalCapacity; i++) {
      const spotNumber = `${prefix}${i}`;
      const status = i <= availableCount ? 'AVAILABLE' : 'OCCUPIED';

      slots.push({
        parkingLot: parkingLot._id,
        spotNumber: spotNumber,
        status: status,
        floor: location.includes('Floor') ? location.split(',')[0].trim() : 'Ground Floor',
        section: prefix
      });
    }

    await ParkingSpot.insertMany(slots);

    res.status(201).json({
      success: true,
      message: 'Parking lot created successfully with auto-generated slots',
      data: parkingLot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update parking lot (Admin only)
exports.updateParkingLot = async (req, res) => {
  try {
    const { name, location, totalCapacity, description } = req.body;

    let parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }

    // Update fields
    parkingLot.name = name || parkingLot.name;
    parkingLot.location = location || parkingLot.location;
    parkingLot.totalCapacity = totalCapacity || parkingLot.totalCapacity;
    parkingLot.description = description !== undefined ? description : parkingLot.description;

    await parkingLot.save();

    res.status(200).json({
      success: true,
      message: 'Parking lot updated successfully',
      data: parkingLot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete parking lot (Admin only)
exports.deleteParkingLot = async (req, res) => {
  try {
    const parkingLot = await ParkingLot.findById(req.params.id);

    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }

    // Delete all parking spots associated with this lot
    await ParkingSpot.deleteMany({ parkingLot: parkingLot._id });

    // Delete parking lot
    await ParkingLot.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Parking lot and associated spots deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const ParkingSpot = require('../models/ParkingSpot');
const ParkingLot = require('../models/ParkingLot');

// Get all slots for a specific parking lot
exports.getSlotsByLot = async (req, res) => {
  try {
    const { lotId } = req.params;

    // Check if parking lot exists
    const parkingLot = await ParkingLot.findById(lotId);
    if (!parkingLot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }

    // Get all slots for this parking lot
    const slots = await ParkingSpot.find({ parkingLot: lotId }).sort({ spotNumber: 1 });

    // Count available and occupied slots
    const availableCount = slots.filter(slot => slot.status === 'AVAILABLE').length;
    const occupiedCount = slots.filter(slot => slot.status === 'OCCUPIED').length;
    const reservedCount = slots.filter(slot => slot.status === 'RESERVED').length;

    res.status(200).json({
      success: true,
      data: {
        parkingLot: {
          id: parkingLot._id,
          name: parkingLot.name,
          location: parkingLot.location,
          totalCapacity: parkingLot.totalCapacity
        },
        summary: {
          total: slots.length,
          available: availableCount,
          occupied: occupiedCount,
          reserved: reservedCount
        },
        slots: slots
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single slot by ID
exports.getSlotById = async (req, res) => {
  try {
    const slot = await ParkingSpot.findById(req.params.id).populate('parkingLot', 'name location');

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    res.status(200).json({
      success: true,
      data: slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create new parking slot (Admin only)
exports.createSlot = async (req, res) => {
  try {
    const { parkingLot, spotNumber, status, floor, section } = req.body;

    // Validate input
    if (!parkingLot || !spotNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide parking lot ID and spot number'
      });
    }

    // Check if parking lot exists
    const lot = await ParkingLot.findById(parkingLot);
    if (!lot) {
      return res.status(404).json({
        success: false,
        message: 'Parking lot not found'
      });
    }

    // Check if spot number already exists in this lot
    const existingSpot = await ParkingSpot.findOne({ parkingLot, spotNumber });
    if (existingSpot) {
      return res.status(400).json({
        success: false,
        message: 'Spot number already exists in this parking lot'
      });
    }

    // Create slot
    const slot = await ParkingSpot.create({
      parkingLot,
      spotNumber,
      status: status || 'AVAILABLE',
      floor,
      section
    });

    res.status(201).json({
      success: true,
      message: 'Parking slot created successfully',
      data: slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update slot status (Admin only - for manual simulation)
exports.updateSlotStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!status || !['AVAILABLE', 'OCCUPIED', 'RESERVED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid status (AVAILABLE, OCCUPIED, or RESERVED)'
      });
    }

    let slot = await ParkingSpot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    // Update status
    slot.status = status;
    await slot.save();

    res.status(200).json({
      success: true,
      message: 'Slot status updated successfully',
      data: slot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete parking slot (Admin only)
exports.deleteSlot = async (req, res) => {
  try {
    const slot = await ParkingSpot.findById(req.params.id);

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Parking slot not found'
      });
    }

    await ParkingSpot.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Parking slot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Simulate real-time update (Admin only - for testing)
exports.simulateSlotUpdate = async (req, res) => {
  try {
    const { lotId } = req.params;

    // Get all slots for this lot
    const slots = await ParkingSpot.find({ parkingLot: lotId });

    if (slots.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No slots found for this parking lot'
      });
    }

    // Randomly update some slots
    const updates = [];
    for (let slot of slots) {
      // 30% chance to change status
      if (Math.random() < 0.3) {
        const statuses = ['AVAILABLE', 'OCCUPIED'];
        slot.status = statuses[Math.floor(Math.random() * statuses.length)];
        await slot.save();
        updates.push(slot);
      }
    }

    res.status(200).json({
      success: true,
      message: `Simulated update for ${updates.length} slots`,
      data: updates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

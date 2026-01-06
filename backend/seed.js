const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const ParkingLot = require('./models/ParkingLot');
const ParkingSpot = require('./models/ParkingSpot');

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await ParkingLot.deleteMany({});
    await ParkingSpot.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@smartpark.com',
      password: 'admin123',
      role: 'admin'
    });

    // Create regular users
    console.log('Creating regular users...');
    const user1 = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'user123',
      role: 'user'
    });

    const user2 = await User.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: 'user123',
      role: 'user'
    });

    console.log(`Created ${3} users (1 admin, 2 users)`);

    // Create parking lots
    console.log('Creating parking lots...');

    const lot1 = await ParkingLot.create({
      name: 'Mall A - Floor 1',
      location: 'Ground Floor, Mall A',
      totalCapacity: 15,
      description: 'Main parking area on ground floor'
    });

    const lot2 = await ParkingLot.create({
      name: 'Mall B - Floor 2',
      location: 'Second Floor, Mall B',
      totalCapacity: 15,
      description: 'Upper level parking with easy access to restaurants'
    });

    console.log(`Created ${2} parking lots`);

    // Create parking spots for Lot 1 (Mall A - Floor 1)
    console.log('Creating parking spots for Mall A - Floor 1...');
    const lot1Spots = [];

    for (let i = 1; i <= 15; i++) {
      const spotNumber = `A${i}`;
      const status = i <= 5 ? 'OCCUPIED' : 'AVAILABLE'; // First 5 occupied, rest available

      lot1Spots.push({
        parkingLot: lot1._id,
        spotNumber: spotNumber,
        status: status,
        floor: 'Ground Floor',
        section: 'A'
      });
    }

    await ParkingSpot.insertMany(lot1Spots);
    console.log(`Created ${lot1Spots.length} spots for Mall A - Floor 1`);

    // Create parking spots for Lot 2 (Mall B - Floor 2)
    console.log('Creating parking spots for Mall B - Floor 2...');
    const lot2Spots = [];

    for (let i = 1; i <= 15; i++) {
      const spotNumber = `B${i}`;
      const status = i <= 10 ? 'AVAILABLE' : 'OCCUPIED'; // First 10 available, rest occupied

      lot2Spots.push({
        parkingLot: lot2._id,
        spotNumber: spotNumber,
        status: status,
        floor: 'Floor 2',
        section: 'B'
      });
    }

    await ParkingSpot.insertMany(lot2Spots);
    console.log(`Created ${lot2Spots.length} spots for Mall B - Floor 2`);

    console.log('\n=== Seed Data Summary ===');
    console.log(`Users: 3 (1 admin, 2 users)`);
    console.log(`Parking Lots: 2`);
    console.log(`Parking Spots: ${lot1Spots.length + lot2Spots.length}`);
    console.log('\nAdmin credentials:');
    console.log('Email: admin@smartpark.com');
    console.log('Password: admin123');
    console.log('\nUser credentials:');
    console.log('Email: john@example.com / jane@example.com');
    console.log('Password: user123');
    console.log('\nSeeding completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error(`Error seeding data: ${error.message}`);
    process.exit(1);
  }
};

// Run seed
connectDB().then(() => seedData());

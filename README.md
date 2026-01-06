# Smart Parking Management System

A web application for managing parking lots. Built with React, Express, Node.js, and MongoDB.

## Features

- User authentication with admin and user roles
- Admin can manage parking lots and slots
- Slot status simulation for testing
- Users can view available parking spaces

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose

**Frontend:** React, React Router, Axios

## Architecture & Database Design

### Application Architecture

The application follows a three-tier architecture pattern:

```
Frontend (React) → Backend API (Express) → Database (MongoDB)
```

- **Frontend Layer**: React application handles UI rendering and user interactions
- **Backend Layer**: RESTful API built with Express handles business logic and data validation
- **Database Layer**: MongoDB stores all application data with Mongoose as the ODM

### Database Schema

The application uses three main collections:

#### 1. Users Collection
```
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['user', 'admin']),
  createdAt: Date
}
```

#### 2. ParkingLots Collection
```
{
  _id: ObjectId,
  name: String,
  location: String,
  totalCapacity: Number,
  availableSlots: Number,
  createdAt: Date
}
```

#### 3. ParkingSpots Collection
```
{
  _id: ObjectId,
  parkingLot: ObjectId (ref: 'ParkingLot'),
  spotNumber: String,
  status: String (enum: ['AVAILABLE', 'OCCUPIED', 'RESERVED']),
  floor: String,
  section: String,
  lastUpdated: Date,
  createdAt: Date
}
```

**Relations:**
- Each ParkingSpot belongs to one ParkingLot (one-to-many)
- Compound index on (parkingLot, spotNumber) ensures unique spot numbers within each lot

## Technology Choices

### Why MERN Stack?

**MongoDB:**
- Flexible schema allows easy iteration during prototyping
- JSON-like documents match JavaScript object structure
- Easy to scale horizontally for future growth

**Express.js:**
- Lightweight and unopinionated framework
- Large ecosystem of middleware
- Perfect for building RESTful APIs quickly

**React:**
- Component-based architecture promotes code reusability
- Virtual DOM ensures efficient UI updates
- Large community and extensive documentation

**Node.js:**
- JavaScript on both frontend and backend reduces context switching
- Non-blocking I/O handles multiple concurrent requests efficiently
- npm ecosystem provides access to thousands of packages

### State Management: Context API

Used React Context API for managing authentication state:
- Centralized user and token management
- Built-in to React, no additional dependencies
- Simple and sufficient for this application scope

## API Design

### API Architecture

The application uses RESTful API design principles with JSON payloads.

### Authentication Endpoints

**POST /api/auth/register**
- Registers a new user
- Body: `{ name, email, password, role }`
- Returns: `{ success: true, token: "jwt_token" }`

**POST /api/auth/login**
- Authenticates user and returns JWT token
- Body: `{ email, password }`
- Returns: `{ success: true, token: "jwt_token", user: {...} }`

### Parking Lot Endpoints

**GET /api/lots**
- Retrieves all parking lots with availability counts
- Auth: Required
- Returns: `{ success: true, data: [{id, name, location, availableSlots, totalCapacity}] }`

**POST /api/lots** (Admin only)
- Creates a new parking lot
- Body: `{ name, location, totalCapacity }`
- Returns: `{ success: true, data: {...} }`

**PUT /api/lots/:id** (Admin only)
- Updates parking lot information
- Body: `{ name, location, totalCapacity }`
- Returns: `{ success: true, data: {...} }`

**DELETE /api/lots/:id** (Admin only)
- Deletes a parking lot and all associated spots
- Returns: `{ success: true }`

### Parking Spot Endpoints

**GET /api/slots/lot/:lotId**
- Retrieves all spots for a specific parking lot
- Auth: Required
- Returns: `{ success: true, data: { parkingLot: {...}, slots: [...], summary: {...} } }`

**PUT /api/slots/:id** (Admin only)
- Updates spot status
- Body: `{ status: "AVAILABLE" | "OCCUPIED" | "RESERVED" }`
- Returns: `{ success: true, data: {...} }`

**POST /api/slots/simulate/:lotId** (Admin only)
- Simulates random slot status changes for testing
- Returns: `{ success: true, message: "..." }`

## Results & Error Handling Analysis

### Error Handling Strategy

The application implements centralized error handling:

1. **Try-Catch Blocks**: All async operations wrapped in try-catch
2. **Error Middleware**: Express error handler catches and formats all errors
3. **Validation**: Input validation at controller level prevents invalid data
4. **User-Friendly Messages**: Errors return descriptive messages to the frontend

Example error response:
```json
{
  "success": false,
  "error": "Parking lot not found"
}
```

### Biggest Technical Challenge

**Challenge:** Managing slot availability counts in real-time

When updating individual spot status, the parking lot's `availableSlots` count must stay synchronized. Initial approach had race conditions where multiple simultaneous updates could cause incorrect counts.

**Solution:** Implemented database transactions and aggregation queries to calculate availability dynamically rather than storing it as a separate field that could become stale.

### Future Improvements

Given more time, I would:

1. **Add Caching**: Implement Redis caching for parking lot listings to reduce database load
2. **WebSocket Integration**: Replace manual refresh with real-time updates using Socket.io
3. **Pagination**: Add pagination for parking lots and spots to handle larger datasets
4. **Search & Filters**: Allow users to search lots by location or filter by availability
5. **Booking System**: Implement the bonus feature for reserving spots in advance
6. **Unit Tests**: Add comprehensive test coverage using Jest and React Testing Library

## Project Structure

```
backend/
├── config/         # Database configuration
├── controllers/    # Business logic
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Auth middleware
└── seed.js         # Seed data

frontend/
├── src/
│   ├── pages/      # Login, Register, Dashboards
│   ├── context/    # Auth context
│   └── services/   # API service
```

## Setup Instructions

### Backend

```bash
cd backend
npm install
```

Create `.env` file:
```
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
```

Seed database and start server:
```bash
npm run seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Test Accounts

**Admin:**
- Email: admin@smartpark.com
- Password: admin123

**User:**
- Email: john@example.com
- Password: user123

## How It Works

- Users login and view available parking lots
- Admins can create and manage parking lots
- Slot status can be updated manually or via simulation
- Authentication handled with JWT
- Data stored in MongoDB

// Load environment variables
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Request logging middleware (for development) - disabled for cleaner output
// if (process.env.NODE_ENV !== 'production') {
//   app.use((req, res, next) => {
//     console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
//     if (req.body && Object.keys(req.body).length > 0) {
//       console.log('Body:', JSON.stringify(req.body, null, 2));
//     }
//     next();
//   });
// }

// Health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/users', require('./routes/users'));
app.use('/api/bookings', require('./routes/bookings'));

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../room-food-finder-frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../room-food-finder-frontend/build', 'index.html'));
  });
}

// Default route for development
app.get('/', (req, res) => {
  res.json({
    message: 'Room & Food Finder Backend API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      auth: '/api/auth',
      listings: '/api/listings',
      users: '/api/users',
      bookings: '/api/bookings'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ msg: 'Validation Error', errors });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({ msg: 'Duplicate field value entered' });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ msg: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ msg: 'Token expired' });
  }

  res.status(500).json({
    msg: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - must be after all routes
app.use('*', (req, res) => {
  res.status(404).json({
    msg: `Route ${req.originalUrl} not found`,
    method: req.method
  });
});

// Connect to MongoDB with better error handling
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Graceful shutdown...`);

  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🕒 Started at: ${new Date().toISOString()}`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

// Handle server errors
server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

module.exports = app;
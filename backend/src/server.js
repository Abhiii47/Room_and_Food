// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const listingRoutes = require('./routes/listings');
const bookingRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

// Basic security & parsers
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration - allow Vercel frontend and localhost for development
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({ 
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, check against allowed origins
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// rate limiter
app.use(rateLimit({ windowMs: 1000 * 30, max: 250 }));

// serve uploads - resolve path relative to backend root, not src folder
const uploadsPath = process.env.UPLOAD_DIR 
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// routes
app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/bookings', bookingRoutes);

// health
app.get('/api/health', (req, res) => res.json({ ok: true, now: new Date() }));

// Serve frontend static files in production (if frontend is built and placed in backend/public)
// This catch-all route should be LAST, after all API routes
if (process.env.SERVE_FRONTEND === 'true') {
  const frontendPath = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
  if (fs.existsSync(frontendPath)) {
    app.use(express.static(frontendPath));
    // Catch-all handler: send back React's index.html file for SPA routing
    app.get('*', (req, res) => {
      // Don't serve index.html for API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API route not found' });
      }
      res.sendFile(path.join(frontendPath, 'index.html'));
    });
  }
}

// Ensure uploads directory exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
  console.log(`Created uploads directory at: ${uploadsPath}`);
}

// connect mongo + start
const mongoUri = process.env.MONGO_URI;
if (!mongoUri) {
  console.error('❌ Error: MONGO_URI not found in environment variables');
  console.error('Please create a .env file with MONGO_URI');
  process.exit(1);
}

mongoose.connect(mongoUri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(()=> {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, ()=> {
      console.log(`🚀 Server listening on http://localhost:${PORT}`);
      console.log(`📁 Uploads directory: ${uploadsPath}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => { 
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('Please check:');
    console.error('  1. MONGO_URI in .env file is correct');
    console.error('  2. MongoDB connection string includes database name');
    console.error('  3. Network allows connection to MongoDB');
    process.exit(1); 
  });


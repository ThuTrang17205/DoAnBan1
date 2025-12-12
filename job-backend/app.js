/**
 * app.js - Express Application Configuration
 * Separate app config from server startup (optional, for better structure)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

// Import middleware
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { generalLimiter } = require('./middleware/rateLimiter');

// Import services
const uploadService = require('./services/uploadService');

// Import routes
const routes = require('./routes');

// Import passport config (for Google OAuth)
require('./config/passport'); // Create this file for passport strategies

// Initialize Express app
const app = express();

// ==================== MIDDLEWARE SETUP ====================

// Security headers
app.use(helmet());

// ✅ CORS configuration - FIXED
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Cache-Control',  // ✅ Thêm dòng này - FIX CORS ERROR
    'Pragma',         // ✅ Thêm dòng này
    'Expires',        // ✅ Thêm dòng này
    'X-Requested-With',
    'Accept'
  ],
  exposedHeaders: [
    'Content-Type',
    'Authorization',
    'Cache-Control',  // ✅ Thêm dòng này
    'Pragma',
    'Expires'
  ],
  maxAge: 86400 // 24 hours
}));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware (for Google OAuth)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'job-portal-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting (global)
app.use('/api/', generalLimiter);

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==================== INITIALIZE SERVICES ====================

// Initialize upload directories
uploadService.initializeDirectories();

// ==================== ROOT ROUTE ====================

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Job Portal API Server',
    version: '1.0.0',
    status: 'Running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      api: '/api',
      health: '/health',
      docs: '/api/docs'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: `${(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2)} MB`
    }
  });
});

// ==================== MOUNT API ROUTES ====================

// Mount all routes under /api
app.use('/api', routes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Export app
module.exports = app;
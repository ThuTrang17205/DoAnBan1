/**
 * server.js - Main Server Entry Point
 * Job Portal Backend API
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const cvRoutes = require('./routes/cv');
const jobRoutes = require('./routes/jobs');


// Initialize Express app
const app = express();

// ==================== MIDDLEWARE SETUP (ĐÚNG THỨ TỰ) ====================

// 1️⃣ CORS - PHẢI ĐẶT ĐẦU TIÊN
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'Cache-Control',      // ✅ ADD THIS
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// 2️⃣ Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3️⃣ Security headers
// 3️⃣ Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // ✅ Cho phép inline scripts
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  }
}));
// 4️⃣ Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 5️⃣ Session middleware (PHẢI TRƯỚC passport)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set true nếu dùng HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// 6️⃣ Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// 7️⃣ Debug logging (Development only)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log('\n📥 Incoming Request:');
    console.log('  Method:', req.method);
    console.log('  URL:', req.url);
    console.log('  Body:', req.body);
    console.log('  Content-Type:', req.headers['content-type']);
    next();
  });
}

// 8️⃣ Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Use CV routes
app.use('/api/cv', cvRoutes);



// Ung Tuyen Viec
app.use('/api/jobs', jobRoutes);
// ==================== INITIALIZE SERVICES ====================


const uploadService = require('./services/uploadService');
uploadService.initializeDirectories();

// ==================== ROOT ROUTE ====================


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Job Portal API Server',
    version: '1.0.0',
    status: 'Running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      api: '/api',
      health: '/health',
      statistics: '/api/statistics'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ==================== MOUNT API ROUTES ====================

const routes = require('./routes');
const statisticsRoutes = require('./routes/statisticsRoutes');

// Mount all routes under /api
app.use('/api', statisticsRoutes);
app.use('/api', routes);

// ==================== ERROR HANDLING ====================

const { notFound, errorHandler } = require('./middleware/errorHandler');

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ==================== UNCAUGHT EXCEPTIONS ====================

process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║              🚀 JOB PORTAL API SERVER                        ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log(`║  🌐 Server:       http://localhost:${PORT}                    ║`);
  console.log(`║  📡 API:          http://localhost:${PORT}/api                ║`);
  console.log(`║  💚 Health:       http://localhost:${PORT}/health             ║`);
  console.log(`║  🔧 Environment:  ${(process.env.NODE_ENV || 'development').padEnd(42)}║`);
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║  📌 Available Routes:                                         ║');
  console.log('║     🔐 AUTH:         /api/auth                                ║');
  console.log('║     💼 JOBS:         /api/jobs                                ║');
  console.log('║     📊 STATISTICS:   /api/statistics                          ║');
  console.log('║     👤 USERS:        /api/users                               ║');
  console.log('║     🏢 EMPLOYERS:    /api/employers                           ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
// ... code server.js

console.log('\n🔑 Environment Variables Check:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('DB_USER:', process.env.DB_USER);
console.log('PORT:', process.env.PORT);
module.exports = app;
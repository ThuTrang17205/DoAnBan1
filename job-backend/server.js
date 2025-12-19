/**
 * server.js - Main Server Entry Point
 * Job Portal Backend API with Rule-Based Matching
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const morgan = require('morgan');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const app = express();

// ==================== MIDDLEWARE SETUP (ĐÚNG THỨ TỰ) ====================

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization',
    'Cache-Control',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));


app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));


if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log('\nIncoming Request:');
    console.log('  Method:', req.method);
    console.log('  URL:', req.url);
    console.log('  Content-Type:', req.headers['content-type']);
    
    if (req.url.startsWith('/uploads')) {
      console.log('Static file request detected!');
      const filePath = path.join(__dirname, req.url);
      console.log('  Full path:', filePath);
      console.log('  File exists?', fs.existsSync(filePath));
    }
    
    if (req.url.includes('/matching')) {
      console.log('Matching API request');
      console.log('  Body:', JSON.stringify(req.body, null, 2));
    }
    
    next();
  });
}

console.log('Setting up static file serving...');
const uploadsPath = path.join(__dirname, 'uploads');
console.log('   Uploads path:', uploadsPath);
console.log('   Directory exists?', fs.existsSync(uploadsPath));

app.use('/uploads', express.static(uploadsPath, {
  setHeaders: (res, filepath) => {
    console.log('📤 Serving file:', filepath);
    if (filepath.endsWith('.pdf')) {
      res.set('Content-Type', 'application/pdf');
      res.set('Content-Disposition', 'inline');
      console.log('   Set PDF headers');
    }
  }
}));

const uploadService = require('./services/uploadService');
uploadService.initializeDirectories();

const emailService = require('./services/emailService');
console.log('Initializing email service...');
emailService.testConnection().then(isReady => {
  if (isReady) {
    console.log('Email service initialized successfully');
  } else {
    console.warn(' Email service is not ready. Check EMAIL_USER and EMAIL_PASS in .env');
  }
}).catch(err => {
  console.error('Email service initialization failed:', err.message);
});

const schedulerService = require('./services/schedulerService');


const routes = require('./routes');
const cvRoutes = require('./routes/cv');
const jobRoutes = require('./routes/jobs');
const matchingRoutes = require('./routes/matching');
const subscriptionRoutes = require('./routes/subscriptions');
const statisticsRoutes = require('./routes/statisticsRoutes');
const candidateRoutes = require('./routes/candidate.routes');


app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Job Portal API Server with AI Matching',
    version: '2.0.0',
    status: 'Running',
    environment: process.env.NODE_ENV || 'development',
    features: {
      matching: 'Rule-Based Algorithm',
      vip_required: true,
      rate_limiting: true
    },
    endpoints: {
      api: '/api',
      health: '/health',
      matching: '/api/matching',
      jobs: '/api/jobs',
      cv: '/api/cv',
      statistics: '/api/statistics'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: 'Connected',
      email: 'Ready',
      scheduler: 'Running',
      matching: 'Active'
    }
  });
});

app.use('/api/cv', cvRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/matching', matchingRoutes);  
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api', candidateRoutes);

app.use('/api', routes);


const { notFound, errorHandler } = require('./middleware/errorHandler');

app.use(notFound);
app.use(errorHandler);


process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  server.close(() => process.exit(1));
});

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║           JOB PORTAL API SERVER v2.0                       ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log(`║   Server:       http://localhost:${PORT}                    ║`);
  console.log(`║   API:          http://localhost:${PORT}/api                ║`);
  console.log(`║   Health:       http://localhost:${PORT}/health             ║`);
  console.log(`║   Uploads:      http://localhost:${PORT}/uploads            ║`);
  console.log(`║   Environment:  ${(process.env.NODE_ENV || 'development').padEnd(42)}║`);
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║   Available Routes:                                         ║');
  console.log('║      AUTH:         /api/auth                                ║');
  console.log('║      JOBS:         /api/jobs                                ║');
  console.log('║      CV:           /api/cv                                  ║');
  console.log('║      MATCHING:     /api/matching                            ║');
  console.log('║      VIP:          /api/subscriptions                       ║');
  console.log('║      STATISTICS:   /api/statistics                          ║');
  console.log('║      USERS:        /api/users                               ║');
  console.log('║      EMPLOYERS:    /api/employers                           ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║   Matching System:                                          ║');
  console.log('║     Algorithm:     Rule-Based Scoring                         ║');
  console.log('║     Skills:        35% weight                                 ║');
  console.log('║     Experience:    25% weight                                 ║');
  console.log('║     Education:     15% weight                                 ║');
  console.log('║     Location:      15% weight                                 ║');
  console.log('║     Salary:        10% weight                                 ║');
  console.log('╠═══════════════════════════════════════════════════════════════╣');
  console.log('║   Scheduler Service:                                        ║');
  console.log('║      Package expiry reminder: Daily at 9:00 AM             ║');
  console.log('║      Package expired check:   Daily at 10:00 AM            ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');
  
  schedulerService.startScheduler();

  console.log('Matching Endpoints Available:');
  console.log('   POST   /api/matching/jobs/:jobId/run-matching');
  console.log('   GET    /api/matching/jobs/:jobId/matched-candidates');
  console.log('   GET    /api/matching/candidates/:candidateId/matched-jobs');
  console.log('   GET    /api/matching/jobs/:jobId/matching-stats');
  console.log('   GET    /api/matching/recommended-jobs/:candidateId');
  console.log('   GET    /api/matching/top-candidates/:jobId');
  console.log('   POST   /api/matching/saved-cvs');
  console.log('   GET    /api/matching/saved-cvs');
  console.log('   GET    /api/matching/usage-stats\n');
});

// ==================== GRACEFUL SHUTDOWN ====================

const gracefulShutdown = () => {
  console.log('\nShutting down gracefully...');
  schedulerService.stopScheduler();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error(' Forcing shutdown...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// ==================== ENVIRONMENT CHECK ====================

console.log('\nEnvironment Variables Check:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('JWT_SECRET:    ', process.env.JWT_SECRET ? 'Loaded' : 'Missing');
console.log('DB_USER:       ', process.env.DB_USER || 'Missing');
console.log('DB_NAME:       ', process.env.DB_NAME || 'Missing');
console.log('DB_HOST:       ', process.env.DB_HOST || 'Missing');
console.log('EMAIL_USER:    ', process.env.EMAIL_USER ? 'Loaded' : 'Missing');
console.log('EMAIL_PASS:    ', process.env.EMAIL_PASS ? 'Loaded' : 'Missing');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Loaded' : ' Optional');
console.log('FRONTEND_URL:  ', process.env.FRONTEND_URL || 'http://localhost:3000');
console.log('PORT:          ', process.env.PORT || 5000);
console.log('NODE_ENV:      ', process.env.NODE_ENV || 'development');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

module.exports = app;
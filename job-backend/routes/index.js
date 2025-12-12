const express = require('express');
const router = express.Router();

console.log('📦 LOADING ROUTES INDEX...');

// Import all route modules
const authRoutes = require('./auth');
console.log('✅ authRoutes type:', typeof authRoutes);
console.log('✅ authRoutes:', authRoutes);

const jobRoutes = require('./jobs');
const applicationRoutes = require('./applications');
const userRoutes = require('./users');
const employerRoutes = require('./employers');
const adminRoutes = require('./admin');
const categoryRoutes = require('./categories');

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Info route
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Portal API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      jobs: '/api/jobs',
      applications: '/api/applications',
      users: '/api/users',
      employers: '/api/employers',
      admin: '/api/admin',
      categories: '/api/categories'
    },
    documentation: '/api/docs',
    health: '/api/health'
  });
});

// Mount routes
console.log('🔧 Mounting /auth route...');
router.use('/auth', authRoutes);
console.log('✅ /auth mounted!');

router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/users', userRoutes);
router.use('/employers', employerRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);

console.log('📦 ALL ROUTES MOUNTED!');

// Export router
module.exports = router;
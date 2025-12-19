/**
 * Admin Routes - WITH BODY PARSER FIX 1111
 * Protected routes for admin management
 */

const express = require('express');
const router = express.Router();


router.use(express.json({ limit: '10mb' }));
router.use(express.urlencoded({ extended: true, limit: '10mb' }));


const adminController = require('../controllers/adminController');


const { authMiddleware } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validateIdParam, validatePagination } = require('../middleware/validateInput');


router.use((req, res, next) => {
  console.log('\n🔍 ADMIN ROUTE DEBUG:');
  console.log('  Method:', req.method);
  console.log('  Path:', req.path);
  console.log('  Full URL:', req.originalUrl);
  console.log('  Body:', req.body);
  console.log('  Content-Type:', req.headers['content-type']);
  console.log('  Body Keys:', Object.keys(req.body));
  next();
});



/**
 * @route   POST /api/admin/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', (req, res, next) => {
  console.log(' HIT LOGIN ROUTE');
  console.log('  Body in route handler:', req.body);
  next();
}, adminController.login);




router.use(authMiddleware);
router.use(isAdmin);

/**
 * @route   POST /api/admin/logout
 * @desc    Admin logout
 * @access  Private (Admin)
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Đăng xuất thành công'
  });
});

/**
 * @route   GET /api/admin/profile
 * @desc    Get admin profile
 * @access  Private (Admin)
 */
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/stats', adminController.getStats || ((req, res) => {
  res.json({
    success: true,
    totalUsers: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
    topCategories: [],
    recentJobs: [],
    jobsByMonth: []
  });
}));

/**
 * @route   GET /api/admin/dashboard/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/dashboard/stats', adminController.getDashboardStats || ((req, res) => {
  res.json({
    success: true,
    message: 'Get dashboard stats',
    data: {
      totalUsers: 0,
      usersGrowth: 0,
      totalEmployers: 0,
      employersGrowth: 0,
      totalJobs: 0,
      jobsGrowth: 0,
      totalApplications: 0,
      applicationsGrowth: 0
    }
  });
}));



/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/users', validatePagination, adminController.getAllUsers || ((req, res) => {
  res.json({
    success: true,
    message: 'Get all users',
    data: []
  });
}));

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin)
 */
router.get('/users/:id', validateIdParam(), adminController.getUserById || ((req, res) => {
  res.json({
    success: true,
    message: 'Get user by ID',
    data: null
  });
}));

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin)
 */
router.delete('/users/:id', validateIdParam(), adminController.deleteUser || ((req, res) => {
  res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

/**
 * @route   PUT /api/admin/users/:id/toggle-status
 * @desc    Toggle user status
 * @access  Private (Admin)
 */
router.put('/users/:id/toggle-status', validateIdParam(), adminController.toggleUserStatus || ((req, res) => {
  res.json({
    success: true,
    message: 'User status toggled'
  });
}));



/**
 * @route   GET /api/admin/employers
 * @desc    Get all employers
 * @access  Private (Admin)
 */
router.get('/employers', validatePagination, adminController.getAllEmployers || ((req, res) => {
  res.json({
    success: true,
    message: 'Get all employers',
    data: []
  });
}));

/**
 * @route   GET /api/admin/employers/:id
 * @desc    Get employer by ID
 * @access  Private (Admin)
 */
router.get('/employers/:id', validateIdParam(), adminController.getEmployerById || ((req, res) => {
  res.json({
    success: true,
    message: 'Get employer by ID',
    data: null
  });
}));

/**
 * @route   DELETE /api/admin/employers/:id
 * @desc    Delete employer
 * @access  Private (Admin)
 */
router.delete('/employers/:id', validateIdParam(), adminController.deleteEmployer || ((req, res) => {
  res.json({
    success: true,
    message: 'Employer deleted successfully'
  });
}));

/**
 * @route   PUT /api/admin/employers/:id/verify
 * @desc    Verify employer
 * @access  Private (Admin)
 */
router.put('/employers/:id/verify', validateIdParam(), adminController.verifyEmployer || ((req, res) => {
  res.json({
    success: true,
    message: 'Employer verified successfully'
  });
}));

/**
 * @route   PUT /api/admin/employers/:id/toggle-status
 * @desc    Toggle employer status
 * @access  Private (Admin)
 */
router.put('/employers/:id/toggle-status', validateIdParam(), adminController.toggleEmployerStatus || ((req, res) => {
  res.json({
    success: true,
    message: 'Employer status toggled'
  });
}));



/**
 * @route   POST /api/admin/jobs
 * @desc    Create new job
 * @access  Private (Admin)
 */
router.post('/jobs', adminController.createJob || ((req, res) => {
  res.status(201).json({
    success: true,
    message: 'Create Job',
    data: req.body
  });
}));

/**
 * @route   GET /api/admin/jobs
 * @desc    Get all jobs
 * @access  Private (Admin)
 */
router.get('/jobs', validatePagination, adminController.getAllJobs || ((req, res) => {
  res.json({
    success: true,
    message: 'Add Jobs',
    data: []
  });
}));

/**
 * @route   GET /api/admin/jobs/:id
 * @desc    Get job by ID
 * @access  Private (Admin)
 */
router.get('/jobs/:id', validateIdParam(), adminController.getJobById || ((req, res) => {
  res.json({
    success: true,
    message: 'Get job by ID',
    data: null
  });
}));

/**
 * @route   PUT /api/admin/jobs/:id
 * @desc    Update job
 * @access  Private (Admin)
 */
router.put('/jobs/:id', validateIdParam(), adminController.updateJob || ((req, res) => {
  res.json({
    success: true,
    message: 'Job updated successfully',
    data: req.body
  });
}));

/**
 * @route   DELETE /api/admin/jobs/:id
 * @desc    Delete job
 * @access  Private (Admin)
 */
router.delete('/jobs/:id', validateIdParam(), adminController.deleteJob || ((req, res) => {
  res.json({
    success: true,
    message: 'Job deleted successfully'
  });
}));

/**
 * @route   PUT /api/admin/jobs/:id/toggle-featured
 * @desc    Toggle job featured status
 * @access  Private (Admin)
 */
router.put('/jobs/:id/toggle-featured', validateIdParam(), adminController.toggleJobFeatured || ((req, res) => {
  res.json({
    success: true,
    message: 'Job featured status toggled'
  });
}));


/**
 * @route   GET /api/admin/applications
 * @desc    Get all applications
 * @access  Private (Admin)
 */
router.get('/applications', validatePagination, adminController.getAllApplications || ((req, res) => {
  res.json({
    success: true,
    message: 'Get all applications',
    data: []
  });
}));

/**
 * @route   GET /api/admin/applications/:id
 * @desc    Get application by ID
 * @access  Private (Admin)
 */
router.get('/applications/:id', validateIdParam(), adminController.getApplicationById || ((req, res) => {
  res.json({
    success: true,
    message: 'Get application by ID',
    data: null
  });
}));

/**
 * @route   PUT /api/admin/applications/:id/status
 * @desc    Update application status
 * @access  Private (Admin)
 */
router.put('/applications/:id/status', validateIdParam(), adminController.updateApplicationStatus || ((req, res) => {
  res.json({
    success: true,
    message: 'Application status updated'
  });
}));

/**
 * @route   DELETE /api/admin/applications/:id
 * @desc    Delete application
 * @access  Private (Admin)
 */
router.delete('/applications/:id', validateIdParam(), adminController.deleteApplication || ((req, res) => {
  res.json({
    success: true,
    message: 'Application deleted successfully'
  });
}));

module.exports = router;
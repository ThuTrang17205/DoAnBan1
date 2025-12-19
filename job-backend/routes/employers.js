/**
 * Employer Routes  1111
 */

const express = require('express');
const router = express.Router();


const { authMiddleware } = require('../middleware/auth');
const { isEmployer } = require('../middleware/roleCheck');
const { 
  validateEmployerRegistration,
  validateIdParam,
  validatePagination,
  validateJobCreation
} = require('../middleware/validateInput');
const { 
  authLimiter,
  jobCreationLimiter,
  generalLimiter
} = require('../middleware/rateLimiter');


const employerController = require('../controllers/employerController');

const disableCache = (req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  next();
};



/**
 * @route   POST /api/employers/register
 * @desc    Register new employer
 * @access  Public
 */
router.post(
  '/register',
  
  employerController.register
);

/**
 * @route   POST /api/employers/login
 * @desc    Employer login
 * @access  Public
 */
router.post(
  '/login', 
  authLimiter, 
  employerController.login
);

/**
 * @route   GET /api/employers
 * @desc    Get all employers (public list)
 * @access  Public
 */
router.get(
  '/', 
  generalLimiter, 
  validatePagination, 
  employerController.getAllEmployers
);



router.use(authMiddleware);
router.use(isEmployer);

/**
 * @route   GET /api/employers/me/profile
 * @desc    Get employer profile
 * @access  Private (Employer)
 */
router.get(
  '/me/profile',
  disableCache,
  employerController.getMyProfile
);

/**
 * @route   PUT /api/employers/me/profile
 * @desc    Update employer profile
 * @access  Private (Employer)
 */
router.put(
  '/me/profile', 
  employerController.updateProfile
);

/**
 * @route   PUT /api/employers/me/change-password
 * @desc    Change employer password
 * @access  Private (Employer)
 */
router.put(
  '/me/change-password', 
  employerController.changePassword
);

/**
 * @route   GET /api/employers/me/dashboard
 * @desc    Get employer dashboard data
 * @access  Private (Employer)
 */
router.get(
  '/me/dashboard',
  disableCache,
  employerController.getDashboardStats
);



/**
 * @route   GET /api/employers/me/jobs
 * @desc    Get employer's jobs
 * @access  Private (Employer)
 */
router.get(
  '/me/jobs',
  disableCache,
  validatePagination, 
  employerController.getMyJobs
);

/**
 * @route   POST /api/employers/me/jobs
 * @desc    Create new job posting
 * @access  Private (Employer)
 */
router.post(
  '/me/jobs',
  jobCreationLimiter,
  validateJobCreation,
  employerController.createJob
);

/**
 * @route   GET /api/employers/me/jobs/:id
 * @desc    Get single job detail
 * @access  Private (Employer)
 */
router.get(
  '/me/jobs/:id',
  disableCache,
  validateIdParam(),
  employerController.getJobById
);

/**
 * @route   PUT /api/employers/me/jobs/:id
 * @desc    Update job posting
 * @access  Private (Employer)
 */
router.put(
  '/me/jobs/:id',
  validateIdParam(),
  employerController.updateJob
);

/**
 * @route   DELETE /api/employers/me/jobs/:id
 * @desc    Delete job posting
 * @access  Private (Employer)
 */
router.delete(
  '/me/jobs/:id',
  validateIdParam(),
  employerController.deleteJob
);


/**
 * @route   PUT /api/employers/me/jobs/:id/close
 * @desc    Close job posting
 * @access  Private (Employer)
 */
router.put(
  '/me/jobs/:id/close',
  validateIdParam(),
  employerController.closeJob
);

/**
 * @route   PUT /api/employers/me/jobs/:id/reopen
 * @desc    Reopen job posting
 * @access  Private (Employer)
 */
router.put(
  '/me/jobs/:id/reopen',
  validateIdParam(),
  employerController.reopenJob
);

/**
 * @route   GET /api/employers/me/applications
 * @desc    Get all applications for employer's jobs
 * @access  Private (Employer)
 */
router.get(
  '/me/applications',
  disableCache,
  validatePagination, 
  employerController.getMyApplications
);

/**
 * @route   POST /api/employers/me/upload-logo
 * @desc    Upload company logo
 * @access  Private (Employer)
 */
router.post(
  '/me/upload-logo',
  employerController.uploadLogo
);



/**
 * @route   GET /api/employers/:id
 * @desc    Get employer by ID (public profile)
 * @access  Public
 */
router.get(
  '/:id', 
  validateIdParam(), 
  employerController.getEmployerById
);

module.exports = router;
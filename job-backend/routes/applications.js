// =============================================
// FILE: routes/applicationRoutes.js
// APPLICATION ROUTES
// =============================================

const express = require('express');
const router = express.Router();
const {
  applyJob,
  getMyApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getEmployerApplicationStats,
  getUserApplicationStats,
  bulkUpdateStatus,
  checkApplication
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/auth');
// ============ PUBLIC ROUTES ============
// None

// ============ USER ROUTES ============
// Apply for a job
router.post('/apply/:jobId', protect, authorize('user'), applyJob);

// Check if already applied
router.get('/check/:jobId', protect, authorize('user'), checkApplication);

// Get my applications (as user/job seeker)
router.get('/my-applications', protect, authorize('user'), getMyApplications);

// Withdraw application
router.delete('/:id', protect, authorize('user'), withdrawApplication);

// Get user application statistics
router.get('/stats/user', protect, authorize('user'), getUserApplicationStats);

// ============ EMPLOYER ROUTES ============
// Get applications for a specific job
router.get('/job/:jobId', protect, authorize('employer'), getJobApplications);

// Update application status
router.put('/:id/status', protect, authorize('employer'), updateApplicationStatus);

// Bulk update application status
router.put('/bulk-update', protect, authorize('employer'), bulkUpdateStatus);

// Get employer application statistics
router.get('/stats/employer', protect, authorize('employer'), getEmployerApplicationStats);

// ============ SHARED ROUTES (USER OR EMPLOYER) ============
// Get single application by ID
router.get('/:id', protect, getApplicationById);

module.exports = router;
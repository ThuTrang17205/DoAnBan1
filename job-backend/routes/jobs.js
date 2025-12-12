const express = require('express');
const router = express.Router();

// Middleware
const { authMiddleware, optionalAuth, protect, authorize } = require('../middleware/auth');
const { validateIdParam, validatePagination } = require('../middleware/validateInput');
const { searchLimiter, generalLimiter } = require('../middleware/rateLimiter');
const employerController = require('../controllers/employerController');
const jobController = require('../controllers/jobController');
const Job = require('../models/Job');

/* ==================== PUBLIC ROUTES (NO AUTH) ==================== */

// GET ALL JOBS
router.get('/', generalLimiter, validatePagination, optionalAuth, jobController.getAllJobs);

// FEATURED JOBS
router.get('/featured', jobController.getFeaturedJobs);

// TRENDING JOBS
router.get('/trending', jobController.getTrendingJobs);

// LATEST JOBS
router.get('/latest', jobController.getLatestJobs);

// SEARCH JOBS
router.get('/search', searchLimiter, validatePagination, jobController.searchJobs);

// JOB BY CATEGORY
router.get('/category/:category', validatePagination, async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 0, limit = 10 } = req.query;
    
    const result = await Job.findByCategory(category, { page, limit });
    
    res.json({
      success: true,
      data: result.jobs,
      pagination: {
        page: result.page,
        limit: parseInt(limit),
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('💥 Get jobs by category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get jobs by category'
    });
  }
});

/* ==================== PROTECTED ROUTES (AUTH REQUIRED) ==================== */

// GET JOB STATS
router.get('/stats', authMiddleware, jobController.getJobStats);

// GET SAVED JOBS
router.get('/saved', authMiddleware, jobController.getSavedJobs);

// GET APPLIED JOBS
router.get('/applied', authMiddleware, jobController.getAppliedJobs);

// SAVE A JOB
router.post('/save/:id', authMiddleware, jobController.saveJob);

// UNSAVE A JOB (chỉ 1 lần thôi!)
router.delete('/unsave/:id', authMiddleware, jobController.unsaveJob);

// APPLY TO A JOB
router.post('/apply', authMiddleware, jobController.applyJob);

/* ==================== EMPLOYER ROUTES ==================== */

// CREATE NEW JOB
router.post('/', authMiddleware, employerController.createJob);

// UPDATE JOB STATUS (PATCH)
router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "open" or "closed"'
      });
    }
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check permissions
    const isAdmin = req.user?.role === 'admin';
    const isOwner = job.posted_by === req.user?.id; // ✅ Dùng posted_by
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this job'
      });
    }
    
    const updatedJob = await Job.updateStatus(jobId, status);
    
    res.json({
      success: true,
      message: 'Job status updated successfully',
      data: updatedJob
    });
    
  } catch (error) {
    console.error('💥 Update status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update job status'
    });
  }
});

// UPDATE JOB (PUT)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Check permissions
    const isAdmin = req.user?.role === 'admin';
    const isOwner = job.posted_by === req.user?.id; // ✅ Dùng posted_by
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this job'
      });
    }
    
    const updatedJob = await Job.update(jobId, req.body);
    
    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
    
  } catch (error) {
    console.error('💥 Update job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update job'
    });
  }
});

// DELETE JOB (Admin or Owner only)
// DELETE JOB (Admin or Owner only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    console.log('🗑️ DELETE /api/jobs/' + jobId);
    console.log('👤 User:', req.user?.id, req.user?.role);
    
    // Validate ID
    if (isNaN(jobId) || jobId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID'
      });
    }
    
    // Check if job exists
    const job = await Job.findById(jobId);
    
    if (!job) {
      console.log('❌ Job not found:', jobId);
      return res.status(404).json({
        success: false,
        message: `Job with ID ${jobId} not found`
      });
    }
    
    console.log('📋 Found job:', job.title);
    console.log('📋 Job posted_by:', job.posted_by);
    
    // Check permissions: Admin OR Job Owner
    const isAdmin = req.user?.role === 'admin';
    const isOwner = job.posted_by === req.user?.id; // ✅ Dùng posted_by
    
    console.log('🔐 Permissions:', { isAdmin, isOwner, jobPostedBy: job.posted_by, userId: req.user?.id });
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this job'
      });
    }
    
    // Delete job
    await Job.delete(jobId);
    
    console.log('✅ Job deleted:', jobId);
    
    res.json({
      success: true,
      message: 'Job deleted successfully',
      deletedJobId: jobId
    });
    
  } catch (error) {
    console.error('💥 Delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete job'
    });
  }
});

/* ==================== DYNAMIC ROUTES (PHẢI Ở CUỐI!) ==================== */

// GET JOB BY ID
router.get('/:id', validateIdParam(), optionalAuth, jobController.getJobById);

// RELATED JOBS
router.get('/:id/related', validateIdParam(), jobController.getRelatedJobs);

module.exports = router;
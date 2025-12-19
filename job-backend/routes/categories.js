/**
 * Category Routes
 * Job category management routes1111
 */

const express = require('express');
const router = express.Router();


const { authMiddleware } = require('../middleware/auth');
const { isAdmin } = require('../middleware/roleCheck');
const { validateIdParam, validatePagination } = require('../middleware/validateInput');
const { generalLimiter } = require('../middleware/rateLimiter');






/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', generalLimiter, (req, res) => {
  
  res.json({
    success: true,
    message: 'Get all categories',
    data: [
      {
        id: 1,
        name: 'Technology',
        slug: 'technology',
        icon: '💻',
        jobCount: 150,
        description: 'IT, Software, Hardware jobs'
      },
      {
        id: 2,
        name: 'Marketing',
        slug: 'marketing',
        icon: '📢',
        jobCount: 85,
        description: 'Digital Marketing, SEO, Content'
      },
      {
        id: 3,
        name: 'Design',
        slug: 'design',
        icon: '🎨',
        jobCount: 62,
        description: 'UI/UX, Graphic Design'
      },
      {
        id: 4,
        name: 'Sales',
        slug: 'sales',
        icon: '💼',
        jobCount: 120,
        description: 'Sales, Business Development'
      },
      {
        id: 5,
        name: 'Finance',
        slug: 'finance',
        icon: '💰',
        jobCount: 78,
        description: 'Accounting, Banking, Investment'
      },
      {
        id: 6,
        name: 'Healthcare',
        slug: 'healthcare',
        icon: '🏥',
        jobCount: 95,
        description: 'Medical, Nursing, Pharmacy'
      },
      {
        id: 7,
        name: 'Education',
        slug: 'education',
        icon: '📚',
        jobCount: 110,
        description: 'Teaching, Training, Tutoring'
      },
      {
        id: 8,
        name: 'Engineering',
        slug: 'engineering',
        icon: '⚙️',
        jobCount: 134,
        description: 'Mechanical, Civil, Electrical'
      },
      {
        id: 9,
        name: 'Customer Service',
        slug: 'customer-service',
        icon: '🎧',
        jobCount: 92,
        description: 'Support, Help Desk'
      },
      {
        id: 10,
        name: 'Human Resources',
        slug: 'human-resources',
        icon: '👥',
        jobCount: 55,
        description: 'HR, Recruitment, Training'
      }
    ]
  });
});

/**
 * @route   GET /api/categories/popular
 * @desc    Get popular categories (most jobs)
 * @access  Public
 */
router.get('/popular', (req, res) => {
  
  res.json({
    success: true,
    message: 'Get popular categories',
    data: []
  });
});

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', validateIdParam(), (req, res) => {
  
  res.json({
    success: true,
    message: 'Get category by ID',
    data: {
      id: req.params.id,
      name: 'Technology',
      slug: 'technology',
      icon: '💻',
      jobCount: 150
    }
  });
});

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get('/slug/:slug', (req, res) => {
  
  res.json({
    success: true,
    message: 'Get category by slug',
    data: {
      slug: req.params.slug,
      name: 'Technology',
      jobCount: 150
    }
  });
});

/**
 * @route   GET /api/categories/:id/jobs
 * @desc    Get jobs by category
 * @access  Public
 */
router.get('/:id/jobs', validateIdParam(), validatePagination, (req, res) => {
  
  res.json({
    success: true,
    message: 'Get jobs by category',
    category: req.params.id,
    data: [],
    pagination: {}
  });
});

/**
 * @route   GET /api/categories/:id/statistics
 * @desc    Get category statistics
 * @access  Public
 */
router.get('/:id/statistics', validateIdParam(), (req, res) => {
  
  res.json({
    success: true,
    message: 'Get category statistics',
    data: {
      totalJobs: 0,
      activeJobs: 0,
      totalApplications: 0,
      averageSalary: 0
    }
  });
});



router.use(authMiddleware);
router.use(isAdmin);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private (Admin)
 */
router.post('/', (req, res) => {
  
  res.json({
    success: true,
    message: 'Category created successfully',
    data: {
      id: 'new-category-id',
      name: req.body.name,
      slug: req.body.slug
    }
  });
});

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private (Admin)
 */
router.put('/:id', validateIdParam(), (req, res) => {
  
  res.json({
    success: true,
    message: 'Category updated successfully'
  });
});

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private (Admin)
 */
router.delete('/:id', validateIdParam(), (req, res) => {
  
  res.json({
    success: true,
    message: 'Category deleted successfully'
  });
});

/**
 * @route   PUT /api/categories/:id/icon
 * @desc    Update category icon
 * @access  Private (Admin)
 */
router.put('/:id/icon', validateIdParam(), (req, res) => {
  
  res.json({
    success: true,
    message: 'Category icon updated successfully',
    data: {
      icon: req.body.icon
    }
  });
});

/**
 * @route   POST /api/categories/reorder
 * @desc    Reorder categories
 * @access  Private (Admin)
 */
router.post('/reorder', (req, res) => {
  
  res.json({
    success: true,
    message: 'Categories reordered successfully'
  });
});

/**
 * @route   POST /api/categories/:id/merge
 * @desc    Merge category with another
 * @access  Private (Admin)
 */
router.post('/:id/merge', validateIdParam(), (req, res) => {
  
  res.json({
    success: true,
    message: 'Categories merged successfully'
  });
});

module.exports = router;
// routes/statisticsRoutes.js
const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

/**
 * @route   GET /api/statistics
 * @desc    Get public statistics
 * @access  Public
 */
router.get('/statistics', statisticsController.getStatistics);

/**
 * @route   GET /api/statistics/detailed
 * @desc    Get detailed statistics for admin
 * @access  Public (tạm thời, sau này có thể thêm auth middleware)
 */
router.get('/statistics/detailed', statisticsController.getDetailedStatistics);

module.exports = router;
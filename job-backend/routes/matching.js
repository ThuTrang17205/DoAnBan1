/**
 * Matching Routes
 * Handles CV-Job matching operations
 */

const express = require('express');
const router = express.Router();
console.log('🤖 MATCHING ROUTES LOADED!');

// Controllers
const matchingController = require('../controllers/matchingController');

// Middleware
const { authMiddleware, authorize } = require('../middleware/auth');
const { 
  checkVIPSubscription, 
  checkMatchingLimit, 
  logMatchingUsage 
} = require('../middleware/vipCheck');
const { 
  matchingLimiter, 
  saveCVLimiter, 
  matchingStatsLimiter 
} = require('../middleware/rateLimiter');

/**
 * @route   GET /api/matching/jobs/:jobId/matched-candidates
 * @desc    Get list of candidates matched with a job
 * @access  Private (Employer only)
 * @query   ?minScore=60&limit=20&offset=0&isQualified=true
 */
router.get(
  '/jobs/:jobId/matched-candidates',
  authMiddleware,
  authorize('employer', 'admin'),
  matchingController.getMatchedCandidates
);

/**
 * @route   GET /api/matching/candidates/:candidateId/matched-jobs
 * @desc    Get list of jobs matched with a candidate
 * @access  Private (Candidate can view their own, Admin can view all)
 * @query   ?minScore=60&limit=20&offset=0&isQualified=true&location=Hanoi
 */
router.get(
  '/candidates/:candidateId/matched-jobs',
  authMiddleware,
  authorize('candidate', 'admin'),
  matchingController.getMatchedJobs
);

/**
 * ROUTE TEST - KHÔNG CẦN ĐĂNG NHẬP
 */
router.post(
  '/jobs/:jobId/run-matching-test',
  async (req, res) => {
    try {
      console.log('🧪 Route test được gọi!');
      console.log('Job ID:', req.params.jobId);
      
      const matchingQueries = require('../queries/matching');
      const stats = await matchingQueries.runMatching(req.params.jobId);

      res.json({
        success: true,
        message: 'Matching hoàn tất thành công (CHẾ ĐỘ TEST)',
        data: {
          job_id: parseInt(req.params.jobId),
          stats: {
            total_candidates: parseInt(stats.total_candidates),
            qualified_candidates: parseInt(stats.qualified_candidates),
            average_score: parseFloat(stats.avg_score || 0).toFixed(2),
            max_score: parseFloat(stats.max_score || 0).toFixed(2),
            min_score: parseFloat(stats.min_score || 0).toFixed(2)
          }
        }
      });
    } catch (error) {
      console.error('❌ Lỗi trong route test:', error);
      res.status(500).json({ 
        success: false,
        message: 'Lỗi khi chạy matching',
        error: error.message,
        stack: error.stack
      });
    }
  }
);
/**
 * @route   POST /api/matching/jobs/:jobId/run-matching
 * @desc    Trigger matching algorithm for a specific job
 * @access  Private (Employer only) + VIP Required
 */
router.post(
  '/jobs/:jobId/run-matching',
  authMiddleware,
  authorize('employer', 'admin'),
  checkVIPSubscription,     // Check VIP subscription
  checkMatchingLimit,       // Check matching limit
  matchingLimiter,          // Rate limit
  matchingController.runMatching,
  logMatchingUsage          // Log after success
);

/**
 * @route   GET /api/matching/jobs/:jobId/matching-stats
 * @desc    Get matching statistics for a job
 * @access  Private (Employer only)
 */
router.get(
  '/jobs/:jobId/matching-stats',
  authMiddleware,
  authorize('employer', 'admin'),
  matchingStatsLimiter,
  matchingController.getMatchingStats
);

/**
 * @route   POST /api/matching/saved-cvs
 * @desc    Save a CV to employer's saved list
 * @access  Private (Employer only)
 */
router.post(
  '/saved-cvs',
  authMiddleware,
  authorize('employer', 'admin'),
  saveCVLimiter,
  async (req, res) => {
    try {
      const { cv_id, candidate_id, note } = req.body;
      
      if (!candidate_id) {
        return res.status(400).json({
          success: false,
          message: 'candidate_id is required'
        });
      }

      const db = require('../config/db');
      
      // Get company_id của employer
      const companyResult = await db.query(`
        SELECT id FROM companies WHERE employer_id = $1 LIMIT 1
      `, [req.user.id]);

      if (companyResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Bạn chưa có công ty. Vui lòng tạo công ty trước.'
        });
      }

      const companyId = companyResult.rows[0].id;

      // Check if already saved
      const existing = await db.query(`
        SELECT id FROM saved_cvs 
        WHERE company_id = $1 AND cv_id = $2
      `, [companyId, candidate_id]);

      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'CV này đã được lưu trước đó'
        });
      }

      // Insert
      await db.query(`
        INSERT INTO saved_cvs (company_id, cv_id, saved_at)
        VALUES ($1, $2, NOW())
      `, [companyId, candidate_id]);

      res.json({
        success: true,
        message: 'CV đã được lưu thành công'
      });
    } catch (error) {
      console.error('Error saving CV:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lưu CV',
        error: error.message
      });
    }
  }
);
/**
 * @route   DELETE /api/matching/saved-cvs/:candidateId
 * @desc    Remove a CV from saved list
 * @access  Private (Employer only)
 */
router.delete(
  '/saved-cvs/:candidateId',
  authMiddleware,
  authorize('employer', 'admin'),
  async (req, res) => {
    try {
      const { candidateId } = req.params;
      const db = require('../config/db');
      
      const result = await db.query(`
        DELETE FROM saved_cvs 
        WHERE employer_id = $1 AND candidate_id = $2
        RETURNING *
      `, [req.user.id, candidateId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'CV không tồn tại trong danh sách đã lưu'
        });
      }

      res.json({
        success: true,
        message: 'Đã xóa CV khỏi danh sách đã lưu'
      });
    } catch (error) {
      console.error('Error removing saved CV:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xóa CV',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/matching/saved-cvs
 * @desc    Get list of saved CVs for current employer
 * @access  Private (Employer only)
 */
router.get(
  '/saved-cvs',
  authMiddleware,
  authorize('employer', 'admin'),
  async (req, res) => {
    try {
      const db = require('../config/db');
      
      const result = await db.query(`
        SELECT 
          sc.id,
          sc.candidate_id,
          sc.cv_id,
          sc.note,
          sc.created_at as saved_at,
          u.name as candidate_name,
          u.email,
          u.avatar,
          u.job_title,
          up.total_years_experience,
          up.expected_salary,
          up.preferred_location,
          el.name as education_level,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'skill', sm.name,
                'slug', sm.slug,
                'proficiency_level', cs.proficiency_level
              )
            ) FILTER (WHERE sm.id IS NOT NULL),
            '[]'
          ) as skills
        FROM saved_cvs sc
        INNER JOIN users u ON sc.candidate_id = u.id
        INNER JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN education_levels el ON up.education_level_id = el.id
        LEFT JOIN candidate_skills cs ON u.id = cs.user_id
        LEFT JOIN skills_master sm ON cs.skill_id = sm.id
        WHERE sc.employer_id = $1
        GROUP BY 
          sc.id, sc.candidate_id, sc.cv_id, sc.note, sc.created_at,
          u.name, u.email, u.avatar, u.job_title,
          up.total_years_experience, up.expected_salary, up.preferred_location,
          el.name
        ORDER BY sc.created_at DESC
      `, [req.user.id]);

      res.json({
        success: true,
        data: {
          saved_cvs: result.rows,
          total: result.rows.length
        }
      });
    } catch (error) {
      console.error('Error getting saved CVs:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách CV đã lưu',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/matching/usage-stats
 * @desc    Get matching usage statistics for current employer
 * @access  Private (Employer only)
 */
router.get(
  '/usage-stats',
  authMiddleware,
  authorize('employer', 'admin'),
  async (req, res) => {
    try {
      const db = require('../config/db');
      
      // Get current subscription
      const subResult = await db.query(`
        SELECT 
          s.*,
          vp.ai_match_limit,
          vp.name as package_name
        FROM subscriptions s
        INNER JOIN vip_packages vp ON s.package_id = vp.id
        WHERE s.user_id = $1
          AND s.status = 'active'
          AND s.end_date >= CURRENT_DATE
        ORDER BY s.end_date DESC
        LIMIT 1
      `, [req.user.id]);

      if (subResult.rows.length === 0) {
        return res.json({
          success: true,
          data: {
            has_subscription: false,
            message: 'Không có gói VIP đang hoạt động'
          }
        });
      }

      const subscription = subResult.rows[0];
      
      // Get usage this month
      const usageResult = await db.query(`
        SELECT COUNT(*) as count
        FROM matching_logs
        WHERE user_id = $1
          AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
      `, [req.user.id]);

      const used = parseInt(usageResult.rows[0].count);
      const limit = subscription.ai_match_limit;
      
      res.json({
        success: true,
        data: {
          has_subscription: true,
          package_name: subscription.package_name,
          used_this_month: used,
          limit: limit,
          remaining: limit === -1 ? -1 : Math.max(0, limit - used),
          unlimited: limit === -1,
          can_use: limit === -1 || used < limit
        }
      });
    } catch (error) {
      console.error('Error getting usage stats:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê sử dụng',
        error: error.message
      });
    }
  }
);

/**
 * @route   GET /api/matching/test
 * @desc    Test matching routes
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Matching routes are working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
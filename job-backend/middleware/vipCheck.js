/**
 * VIP Check Middleware
 * Kiểm tra gói VIP và giới hạn sử dụng matching
 */

const db = require('../config/db');

/**
 * Check if user has active VIP subscription
 */
const checkVIPSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await db.query(`
      SELECT 
        s.id,
        s.employer_id as user_id,
        s.package_name,
        s.package_type,
        s.status,
        s.start_date,
        s.end_date,
        s.price
      FROM subscriptions s
      WHERE s.employer_id = $1
        AND s.status = 'active'
        AND s.end_date >= CURRENT_DATE
      ORDER BY s.end_date DESC
      LIMIT 1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn cần có gói VIP để sử dụng tính năng này',
        error_code: 'NO_ACTIVE_SUBSCRIPTION'
      });
    }

    
    req.subscription = result.rows[0];
    next();
  } catch (error) {
    console.error('Error checking VIP subscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra gói VIP',
      error: error.message
    });
  }
};

/**
 * Check matching limit for current month
 */
const checkMatchingLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    
    if (!req.subscription) {
      return res.status(403).json({
        success: false,
        message: 'Không tìm thấy thông tin gói VIP',
        error_code: 'SUBSCRIPTION_NOT_FOUND'
      });
    }

    const aiMatchLimit = req.subscription.ai_match_limit;

    
    if (aiMatchLimit === -1) {
      req.matchingUsage = {
        used: 0,
        limit: -1,
        remaining: -1,
        unlimited: true
      };
      return next();
    }

    
    const result = await db.query(`
  SELECT COUNT(*) as count
  FROM employer_matching_usage
  WHERE employer_id = $1
    AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
`, [userId]);

    const usedCount = parseInt(result.rows[0].count);

    if (usedCount >= aiMatchLimit) {
      return res.status(403).json({
        success: false,
        message: 'Bạn đã hết lượt matching trong tháng này',
        error_code: 'MATCHING_LIMIT_EXCEEDED',
        data: {
          used: usedCount,
          limit: aiMatchLimit,
          package_name: req.subscription.package_name
        }
      });
    }

    
    req.matchingUsage = {
      used: usedCount,
      limit: aiMatchLimit,
      remaining: aiMatchLimit - usedCount,
      unlimited: false
    };

    next();
  } catch (error) {
    console.error('Error checking matching limit:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra giới hạn matching',
      error: error.message
    });
  }
};

/**
 * Log matching usage after successful operation
 * Use this AFTER the controller executes successfully
 */
const logMatchingUsage = async (req, res, next) => {
  
  const originalJson = res.json.bind(res);
  
  res.json = function(data) {
    
    if (data && data.success) {
      const userId = req.user.id;
      const jobId = req.params.jobId || null;
      const matchedCount = data.data?.stats?.total_candidates || 0;

      
 db.query(`
  INSERT INTO employer_matching_usage (employer_id, job_id, matched_count, created_at)
  VALUES ($1, $2, $3, NOW())
`, [userId, jobId, matchedCount])
        .catch(err => console.error('Error logging matching usage:', err));
    }
    
    return originalJson(data);
  };
  
  next();
};

/**
 * Combined middleware: Check VIP + Check Limit
 */
const requireVIPWithMatchingLimit = [
  checkVIPSubscription,
  checkMatchingLimit
];

module.exports = {
  checkVIPSubscription,
  checkMatchingLimit,
  logMatchingUsage,
  requireVIPWithMatchingLimit
};
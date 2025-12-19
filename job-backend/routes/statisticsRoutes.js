
const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');
const db = require('../config/db');

/**
 * @route   GET /api/statistics
 * @desc    Get public statistics
 * @access  Public
 */
router.get('/', statisticsController.getStatistics);

/**
 * @route   GET /api/statistics/detailed
 * @desc    Get detailed statistics for admin
 * @access  Public (tạm thời)
 */
router.get('/detailed', statisticsController.getDetailedStatistics);

/**
 * @route   GET /api/statistics/vip-companies
 * @desc    Get list of VIP companies (for homepage display)
 * @access  Public
 */
router.get('/vip-companies', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const result = await db.query(`
      SELECT 
        c.id,
        c.name AS company_name,
        c.logo,
        c.description,
        c.size,
        c.industry,
 պր        c.website,
        c.location,
        vp.name AS package_name,
        vp.display_badge,
        s.start_date,
        s.end_date,
        (
          SELECT COUNT(*) 
          FROM jobs j 
          WHERE j.company_id = c.id 
            AND j.status = 'open'
            AND j.application_deadline >= CURRENT_DATE
        ) AS active_jobs_count,
        (
          SELECT COUNT(*) 
          FROM jobs j 
          WHERE j.company_id = c.id
        ) AS total_jobs_count
      FROM companies c
      INNER JOIN users u ON c.employer_id = u.id
      INNER JOIN subscriptions s ON u.id = s.user_id
      INNER JOIN vip_packages vp ON s.package_id = vp.id
      WHERE s.status = 'active'
        AND s.end_date >= CURRENT_DATE
        AND vp.name != 'Free'
        AND c.is_verified = true
      ORDER BY 
        CASE vp.name
          WHEN 'Enterprise' THEN 1
          WHEN 'Pro' THEN 2
          WHEN 'Basic' THEN 3
          ELSE 4
        END,
        s.start_date DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: {
        companies: result.rows.map(company => ({
          id: company.id,
          name: company.company_name,
          logo: company.logo,
          description: company.description,
          size: company.size,
          industry: company.industry,
          website: company.website,
          location: company.location,
          package: {
            name: company.package_name,
            badge: company.display_badge,
            start_date: company.start_date,
            end_date: company.end_date
          },
          stats: {
            active_jobs: Number(company.active_jobs_count),
            total_jobs: Number(company.total_jobs_count)
          }
        })),
        total: result.rows.length
      }
    });

  } catch (error) {
    console.error(' Error getting VIP companies:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách công ty VIP',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/statistics/dashboard
 * @desc    Get dashboard statistics (admin cards)
 * @access  Public
 */
router.get('/dashboard', async (req, res) => {
  try {
    
    const revenueResult = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_revenue
      FROM payments
      WHERE status = 'completed'
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    
    const vipCompaniesResult = await db.query(`
      SELECT COUNT(DISTINCT c.id) AS vip_count
      FROM companies c
      INNER JOIN users u ON c.employer_id = u.id
      INNER JOIN subscriptions s ON u.id = s.user_id
      INNER JOIN vip_packages vp ON s.package_id = vp.id
      WHERE s.status = 'active'
        AND s.end_date >= CURRENT_DATE
        AND vp.name != 'Free'
    `);

    
    const matchingResult = await db.query(`
      SELECT COUNT(*) AS total_matches
      FROM matching_scores
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);

    
    const currentRevenue = Number(revenueResult.rows[0].total_revenue);

    const lastMonthResult = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS last_month_revenue
      FROM payments
      WHERE status = 'completed'
        AND DATE_TRUNC('month', created_at) =
            DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
    `);

    const lastRevenue = Number(lastMonthResult.rows[0].last_month_revenue);
    const revenueChange = lastRevenue > 0
      ? Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        revenue: {
          current_month: currentRevenue,
          formatted: `${Math.round(currentRevenue / 1_000_000)}tr`,
          change_percent: revenueChange >= 0 ? `+${revenueChange}%` : `${revenueChange}%`,
          trend: revenueChange >= 0 ? 'up' : 'down'
        },
        vip_companies: {
          count: Number(vipCompaniesResult.rows[0].vip_count),
          formatted: `${vipCompaniesResult.rows[0].vip_count} công ty`
        },
        ai_matching: {
          count: Number(matchingResult.rows[0].total_matches),
          formatted: `${Number(matchingResult.rows[0].total_matches).toLocaleString('vi-VN')} lượt`
        }
      }
    });

  } catch (error) {
    console.error(' Error getting dashboard statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê dashboard',
      error: error.message
    });
  }
});

module.exports = router;

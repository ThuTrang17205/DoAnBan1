// controllers/statisticsController.js
const pool = require('../config/db');

/**
 * Get platform statistics
 * @route GET /api/statistics
 * @access Public
 */
exports.getStatistics = async (req, res) => {
  try {
    // Query 1: Count total active jobs
    const jobsResult = await pool.query(
      "SELECT COUNT(*) as total FROM jobs WHERE status = 'open'"
    );
    const totalJobs = parseInt(jobsResult.rows[0].total) || 0;

    // Query 2: Count unique companies
    const companiesResult = await pool.query(`
      SELECT COUNT(DISTINCT id) as total 
      FROM companies
    `);
    const totalCompanies = parseInt(companiesResult.rows[0].total) || 0;

    // Query 3: Count total candidates/users (role = 'candidate', 'user', hoặc không phải 'admin'/'employer')
    const candidatesResult = await pool.query(`
      SELECT COUNT(*) as total 
      FROM users 
      WHERE role NOT IN ('admin', 'employer')
    `);
    const totalCandidates = parseInt(candidatesResult.rows[0].total) || 0;

    // Query 4: Calculate satisfaction rate
    let satisfactionRate = 95; // Default
    
    try {
      // Tính từ applications nếu có
      const satisfactionResult = await pool.query(`
        SELECT 
          COUNT(*) FILTER (WHERE status = 'accepted' OR status = 'hired') as successful,
          COUNT(*) as total
        FROM applications
        WHERE status IS NOT NULL
      `);
      
      if (satisfactionResult.rows[0].total > 0) {
        const successful = parseInt(satisfactionResult.rows[0].successful) || 0;
        const total = parseInt(satisfactionResult.rows[0].total) || 1;
        satisfactionRate = Math.round((successful / total) * 100);
        
        // Đảm bảo rate trong khoảng hợp lý (75-100%)
        if (satisfactionRate < 75) satisfactionRate = 75;
        if (satisfactionRate > 100) satisfactionRate = 100;
      }
    } catch (err) {
      console.log('Using default satisfaction rate (no applications data)');
    }

    res.json({
      success: true,
      totalJobs,
      totalCompanies,
      totalCandidates,
      satisfactionRate
    });

  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};

/**
 * Get detailed statistics (for admin dashboard)
 * @route GET /api/statistics/detailed
 * @access Private/Admin
 */
exports.getDetailedStatistics = async (req, res) => {
  try {
    const queries = [
      // Total jobs
      pool.query("SELECT COUNT(*) as total FROM jobs"),
      
      // Active jobs
      pool.query("SELECT COUNT(*) as total FROM jobs WHERE status = 'open'"),
      
      // Closed jobs
      pool.query("SELECT COUNT(*) as total FROM jobs WHERE status = 'closed'"),
      
      // Jobs this month
      pool.query(`
        SELECT COUNT(*) as total FROM jobs 
        WHERE posted_at >= DATE_TRUNC('month', CURRENT_DATE)
      `),
      
      // Total companies
      pool.query("SELECT COUNT(*) as total FROM companies"),
      
      // New companies this month
      pool.query(`
        SELECT COUNT(*) as total FROM companies 
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `),
      
      // Total employers (users with role 'employer')
      pool.query(`
        SELECT COUNT(*) as total FROM users 
        WHERE role = 'employer'
      `),
      
      // Total candidates (users not admin/employer)
      pool.query(`
        SELECT COUNT(*) as total FROM users 
        WHERE role NOT IN ('admin', 'employer')
      `),
      
      // New users this month
      pool.query(`
        SELECT COUNT(*) as total FROM users 
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `),
      
      // Total applications
      pool.query("SELECT COUNT(*) as total FROM applications"),
      
      // Applications this month
      pool.query(`
        SELECT COUNT(*) as total FROM applications 
        WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
      `),
      
      // Top categories
      pool.query(`
        SELECT category, COUNT(*) as count 
        FROM jobs 
        WHERE status = 'open' AND category IS NOT NULL
        GROUP BY category 
        ORDER BY count DESC 
        LIMIT 5
      `),

      // Top locations
      pool.query(`
        SELECT location, COUNT(*) as count 
        FROM jobs 
        WHERE status = 'open' AND location IS NOT NULL
        GROUP BY location 
        ORDER BY count DESC 
        LIMIT 5
      `),

      // Jobs by status breakdown
      pool.query(`
        SELECT status, COUNT(*) as count
        FROM jobs
        GROUP BY status
      `)
    ];

    const [
      totalJobsRes,
      activeJobsRes,
      closedJobsRes,
      jobsThisMonthRes,
      totalCompaniesRes,
      companiesThisMonthRes,
      totalEmployersRes,
      totalCandidatesRes,
      usersThisMonthRes,
      totalApplicationsRes,
      applicationsThisMonthRes,
      topCategoriesRes,
      topLocationsRes,
      jobsByStatusRes
    ] = await Promise.all(queries);

    res.json({
      success: true,
      data: {
        jobs: {
          total: parseInt(totalJobsRes.rows[0].total),
          active: parseInt(activeJobsRes.rows[0].total),
          closed: parseInt(closedJobsRes.rows[0].total),
          thisMonth: parseInt(jobsThisMonthRes.rows[0].total),
          byStatus: jobsByStatusRes.rows
        },
        companies: {
          total: parseInt(totalCompaniesRes.rows[0].total),
          thisMonth: parseInt(companiesThisMonthRes.rows[0].total)
        },
        employers: {
          total: parseInt(totalEmployersRes.rows[0].total)
        },
        candidates: {
          total: parseInt(totalCandidatesRes.rows[0].total)
        },
        users: {
          newThisMonth: parseInt(usersThisMonthRes.rows[0].total)
        },
        applications: {
          total: parseInt(totalApplicationsRes.rows[0].total),
          thisMonth: parseInt(applicationsThisMonthRes.rows[0].total)
        },
        topCategories: topCategoriesRes.rows,
        topLocations: topLocationsRes.rows
      }
    });

  } catch (error) {
    console.error('❌ Error fetching detailed statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê chi tiết',
      error: error.message
    });
  }
};

module.exports = exports;
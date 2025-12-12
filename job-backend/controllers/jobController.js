// =============================================
// jobController.js - PostgreSQL Version
// JOB CRUD OPERATIONS - COMPLETE
// =============================================

const pool = require('../config/db'); // PostgreSQL connection

// =============================================
// PUBLIC ROUTES
// =============================================

// @desc    Get all jobs (with filters and pagination)
// @route   GET /api/jobs
// @access  Public
exports.getAllJobs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = "posted_at", 
      order = "DESC", 
      category, 
      location 
    } = req.query;

    let whereClause = "WHERE 1=1";
    const values = [];
    let paramCount = 1;

    // Filter category
    if (category) {
      whereClause += ` AND category = $${paramCount}`;
      values.push(category);
      paramCount++;
    }

    // Filter location
    if (location) {
      whereClause += ` AND location ILIKE $${paramCount}`;
      values.push(`%${location}%`);
      paramCount++;
    }

    // Count total jobs
    const totalQuery = `
      SELECT COUNT(*) AS total
      FROM jobs
      ${whereClause}
    `;
    const totalResult = await pool.query(totalQuery, values);
    const total = totalResult.rows[0].total;

    const offset = (page - 1) * limit;

    // Main query
    const jobsQuery = `
      SELECT 
        id,
        title,
        company_id,
        company_name,
        description,
        min_salary,
        max_salary,
        salary,
        job_type,
        location,
        category,
        experience,
        posted_at,
        status
      FROM jobs
      ${whereClause}
      ORDER BY ${sort} ${order}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;

    values.push(parseInt(limit), offset);

    const jobsResult = await pool.query(jobsQuery, values);

    res.json({
      success: true,
      message: "Lấy danh sách việc làm thành công",
      data: jobsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(total),
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Get all jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách việc làm",
      error: error.message,
    });
  }
};

// @desc    Get featured jobs
// @route   GET /api/jobs/featured
// @access  Public
exports.getFeaturedJobs = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, title, company_name, description, 
        min_salary, max_salary, currency,
        location, experience, category, posted_at
      FROM jobs
      WHERE status = 'open'
      ORDER BY views DESC, posted_at DESC
      LIMIT 6
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      message: 'Get featured jobs',
      data: result.rows
    });

  } catch (error) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get trending jobs
// @route   GET /api/jobs/trending
// @access  Public
exports.getTrendingJobs = async (req, res) => {
  try {
    const query = `
      SELECT 
        id, title, company_name, 
        min_salary, max_salary, salary,
        location, category, experience, posted_at
      FROM jobs
      WHERE status = 'open'
      ORDER BY views DESC, posted_at DESC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      message: 'Get trending jobs',
      data: result.rows
    });

  } catch (error) {
    console.error('Get trending jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get latest jobs
// @route   GET /api/jobs/latest
// @access  Public
exports.getLatestJobs = async (req, res) => {
  try {
    const query = `
      SELECT 
        id,
        title,
        company,
        location,
        min_salary,
        max_salary,
        salary,
        job_type,
        category,
        experience,
        posted_at
      FROM jobs
      WHERE status = 'open'
      ORDER BY posted_at DESC
    `;

    const result = await pool.query(query);

    res.json({
      success: true,
      message: "Get latest jobs",
      data: result.rows
    });

  } catch (error) {
    console.error("Get latest jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách việc làm mới nhất",
      error: error.message,
    });
  }
};

// @desc    Search jobs
// @route   GET /api/jobs/search
// @access  Public
exports.searchJobs = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm'
      });
    }

    const searchQuery = `
      SELECT 
        id, title, company_name, description, salary, 
        location, experience, category, posted_at
      FROM jobs
      WHERE status = 'active'
        AND (
          title ILIKE $1 
          OR description ILIKE $1 
          OR company_name ILIKE $1
          OR category ILIKE $1
        )
      ORDER BY posted_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM jobs
      WHERE status = 'active'
        AND (
          title ILIKE $1 
          OR description ILIKE $1 
          OR company_name ILIKE $1
          OR category ILIKE $1
        )
    `;

    const searchTerm = `%${q}%`;
    
    const [jobsResult, countResult] = await Promise.all([
      pool.query(searchQuery, [searchTerm, parseInt(limit), offset]),
      pool.query(countQuery, [searchTerm])
    ]);

    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      message: 'Search results',
      query: q,
      data: jobsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Search jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm kiếm',
      error: error.message
    });
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('=== GET JOB BY ID ===');
    console.log('Requested ID:', id);

    const query = `
      SELECT 
        id,
        title,
        company_id,
        company,          -- ✅ FIX: Đổi từ company_name sang company
        description,
        min_salary,
        max_salary,
        salary,
        job_type,
        location,
        category,
        experience,
        posted_at,
        status,
        url,              -- ✅ THÊM: url để ứng tuyển
        original_url      -- ✅ THÊM: original_url backup
      FROM jobs
      WHERE id = $1
    `;

    const result = await pool.query(query, [parseInt(id)]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy công việc với ID ${id}. Vui lòng kiểm tra lại ID.`
      });
    }

    const job = result.rows[0];

    // ✅ Map snake_case sang camelCase
    const formattedJob = {
      id: job.id,
      title: job.title,
      companyId: job.company_id,
      companyName: job.company,        // ✅ FIX: Map company sang companyName
      description: job.description,
      minSalary: job.min_salary,
      maxSalary: job.max_salary,
      salary: job.salary,
      jobType: job.job_type,
      location: job.location,
      category: job.category,
      experience: job.experience,
      postedAt: job.posted_at,
      status: job.status,
      url: job.url,                    
      originalUrl: job.original_url    
    };

    res.json({
      success: true,
      data: formattedJob
    });

  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin công việc',
      error: error.message
    });
  }
};
// @desc    Get related jobs
// @route   GET /api/jobs/:id/related
// @access  Public
exports.getRelatedJobs = async (req, res) => {
  try {
    const { id } = req.params;

    // Lấy job hiện tại
    const currentJob = await pool.query(
      'SELECT category, location FROM jobs WHERE id = $1',
      [id]
    );

    if (currentJob.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc'
      });
    }

    const { category, location } = currentJob.rows[0];

    const query = `
      SELECT 
        id, title, company_name, 
        min_salary, max_salary, currency,
        location, experience, category, posted_at
      FROM jobs
      WHERE id != $1 
        AND status = 'open'
        AND (category = $2 OR location ILIKE $3)
      ORDER BY posted_at DESC
      LIMIT 5
    `;

    const result = await pool.query(query, [
      id,
      category,
      `%${location}%`
    ]);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('Get related jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// =============================================
// PROTECTED ROUTES
// =============================================


// @desc    Get job statistics (saved & applied count)
// @route   GET /api/jobs/stats
// @access  Private
exports.getJobStats = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📊 Getting job stats for user:', userId);

    // Count saved jobs
    const savedResult = await pool.query(
      'SELECT COUNT(*) FROM saved_jobs WHERE user_id = $1',
      [userId]
    );

    // Count applied jobs
    const appliedResult = await pool.query(
      'SELECT COUNT(*) FROM applied_jobs WHERE user_id = $1',
      [userId]
    );

    const stats = {
      saved: parseInt(savedResult.rows[0].count) || 0,
      applied: parseInt(appliedResult.rows[0].count) || 0
    };

    console.log('✅ Job stats:', stats);

    res.json(stats);

  } catch (error) {
    console.error('❌ Error getting job stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get job stats',
      message: error.message 
    });
  }
};

// @desc    Get saved jobs
// @route   GET /api/jobs/saved
// @access  Private
exports.getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('💾 Getting saved jobs for user:', userId);

    const result = await pool.query(
      `SELECT 
        id,
        job_id,
        saved_date,
        job_title,
        company_name,
        company_logo,
        location,
        salary
      FROM saved_jobs
      WHERE user_id = $1
      ORDER BY saved_date DESC`,
      [userId]
    );

    console.log(`✅ Found ${result.rows.length} saved jobs`);

    res.json(result.rows);

  } catch (error) {
    console.error('❌ Error getting saved jobs:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get saved jobs',
      message: error.message 
    });
  }
};

// @desc    Get applied jobs
// @route   GET /api/jobs/applied
// @access  Private
// @desc    Get applied jobs
// @route   GET /api/jobs/applied
// @access  Private
exports.getAppliedJobs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 1000 } = req.query; // ✅ Thêm limit từ query

    console.log('📤 Getting applied jobs for user:', userId);
    console.log('📊 Limit:', limit);

    const result = await pool.query(
      `SELECT 
        id,
        job_id,
        job_title,
        company_name,
        company_logo,
        location,
        salary,
        cv_used,
        applied_date,
        status,
        cover_letter,
        created_at
      FROM applied_jobs
      WHERE user_id = $1
      ORDER BY applied_date DESC
      LIMIT $2`, // ✅ Thêm LIMIT
      [userId, limit]
    );

    console.log(`✅ Found ${result.rows.length} applied jobs`);

    // ✅ Trả về đúng format mà frontend expect
    res.json({
      success: true,
      total: result.rows.length,
      data: result.rows,           // ← Frontend dùng data
      applications: result.rows     // ← Hoặc applications
    });

  } catch (error) {
    console.error('❌ Error getting applied jobs:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get applied jobs',
      message: error.message 
    });
  }
};

// @desc    Save a job
// @route   POST /api/jobs/save/:id
// @access  Private
exports.saveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    console.log(`💾 User ${userId} saving job ${jobId}`);

    // Check if already saved
    const existing = await pool.query(
      'SELECT id FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Job already saved' 
      });
    }

    // Get job details
    const jobResult = await pool.query(
      'SELECT title, company_name, location, salary FROM jobs WHERE id = $1',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    const job = jobResult.rows[0];

    // Save job with details
    await pool.query(
      `INSERT INTO saved_jobs 
        (user_id, job_id, job_title, company_name, location, salary, saved_date) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId, jobId, job.title, job.company_name, job.location, job.salary]
    );

    console.log('✅ Job saved successfully');

    res.json({ 
      success: true, 
      message: 'Job saved successfully' 
    });

  } catch (error) {
    console.error('❌ Error saving job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to save job',
      message: error.message 
    });
  }
};

// @desc    Unsave a job
// @route   DELETE /api/jobs/unsave/:id
// @access  Private
exports.unsaveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    console.log(`🗑️ User ${userId} unsaving job ${jobId}`);

    await pool.query(
      'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );

    console.log('✅ Job unsaved successfully');

    res.json({ 
      success: true, 
      message: 'Job unsaved successfully' 
    });

  } catch (error) {
    console.error('❌ Error unsaving job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to unsave job',
      message: error.message 
    });
  }
};

// @desc    Apply to a job
// @route   POST /api/jobs/apply
// @access  Private
// @desc    Apply to a job
// @route   POST /api/jobs/apply
// @access  Private
exports.applyJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      job_id, 
      job_title, 
      company_name, 
      company_logo, 
      location, 
      salary, 
      cv_used,
      cover_letter 
    } = req.body;

    console.log(`📤 User ${userId} applying to job ${job_id}`);

    // Validate required fields
    if (!job_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required field: job_id' 
      });
    }

    // Check if already applied
    const existing = await pool.query(
      'SELECT id FROM applied_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, job_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Job already applied' 
      });
    }

    // Insert application with all details
    const result = await pool.query(
      `INSERT INTO applied_jobs 
        (user_id, job_id, job_title, company_name, company_logo, location, salary, cv_used, cover_letter, applied_date, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), 'pending')
       RETURNING id`,
      [
        userId, 
        job_id, 
        job_title || 'Unknown Position',
        company_name || 'Unknown Company', 
        company_logo || null, 
        location || 'Not specified', 
        salary || 'Negotiable', 
        cv_used || null,
        cover_letter || null
      ]
    );

    console.log('✅ Application submitted successfully, ID:', result.rows[0].id);

    res.json({ 
      success: true, 
      message: 'Application submitted successfully',
      data: {
        id: result.rows[0].id,
        job_id,
        applied_date: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error applying to job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to apply to job',
      message: error.message 
    });
  }
};


const pool = require('../config/db'); 


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

   
    if (category) {
      whereClause += ` AND category = $${paramCount}`;
      values.push(category);
      paramCount++;
    }

 
    if (location) {
      whereClause += ` AND location ILIKE $${paramCount}`;
      values.push(`%${location}%`);
      paramCount++;
    }

    
    const totalQuery = `
      SELECT COUNT(*) AS total
      FROM jobs
      ${whereClause}
    `;
    const totalResult = await pool.query(totalQuery, values);
    const total = totalResult.rows[0].total;

    const offset = (page - 1) * limit;

    
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
// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
exports.getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('\n=== GET JOB BY ID ===');
    console.log(' Requested ID:', id);

    
    const query = `
      SELECT 
        id,
        title,
        company_id,
        company_name,
        company,
        description,
        requirements,
        benefits,
        min_salary,
        max_salary,
        salary,
        currency,
        job_type,
        experience,
        location,
        category,
        deadline,
        positions_available,
        posted_at,
        status,
        url,
        original_url,
        is_remote,
        is_urgent,
        is_featured,
        view_count,
        application_count
      FROM jobs
      WHERE id = $1
    `;

    const result = await pool.query(query, [parseInt(id)]);

    if (result.rows.length === 0) {
      console.log(' Job not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: `Không tìm thấy công việc với ID ${id}`
      });
    }

    const job = result.rows[0];
    console.log(' Raw job from database:', {
      id: job.id,
      title: job.title,
      company_name: job.company_name,
      company: job.company,
      requirements: job.requirements ? 'HAS DATA' : 'NULL',
      benefits: job.benefits ? 'HAS DATA' : 'NULL'
    });

    
    const formattedJob = {
      // Basic info
      id: job.id,
      title: job.title,
      
      // Company info - ưu tiên company_name, fallback về company
      companyId: job.company_id,
      companyName: job.company_name || job.company || 'Công ty chưa cập nhật',
      company_name: job.company_name || job.company || 'Công ty chưa cập nhật',
      
      // Job details - TÌM THẤY CÁC TRƯỜNG NÀY!
      description: job.description,
      requirements: job.requirements,  // ✅ Đã có trong DB
      benefits: job.benefits,          // ✅ Đã có trong DB
      
      // Salary info
      minSalary: job.min_salary,
      maxSalary: job.max_salary,
      salary: job.salary,
      currency: job.currency || 'VND',
      
      // Job type & experience
      jobType: job.job_type,
      job_type: job.job_type,
      experience: job.experience,
      experienceLevel: job.experience,
      
      // Location
      location: job.location,
      category: job.category,
      
      // Additional info
      deadline: job.deadline,
      positions: job.positions_available || 1,
      
      // Dates & status
      postedAt: job.posted_at,
      created_at: job.posted_at,
      status: job.status,
      
      // URLs
      url: job.url,
      originalUrl: job.original_url,
      
      // Flags
      isRemote: job.is_remote,
      isUrgent: job.is_urgent,
      isFeatured: job.is_featured,
      
      // Stats
      viewCount: job.view_count,
      applicationCount: job.application_count
    };

    console.log('✅ Successfully formatted job:', formattedJob.id);
    console.log('✅ Has requirements:', !!formattedJob.requirements);
    console.log('✅ Has benefits:', !!formattedJob.benefits);
    console.log('✅ Company name:', formattedJob.companyName);

    res.json({
      success: true,
      data: formattedJob
    });

  } catch (error) {
    console.error('\n❌ ERROR in getJobById:');
    console.error('❌ Message:', error.message);
    console.error('❌ Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin công việc',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
// @desc    Get related jobs
// @route   GET /api/jobs/:id/related
// @access  Public
exports.getRelatedJobs = async (req, res) => {
  try {
    const { id } = req.params;

   
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
  let client;
  
  try {
    const userId = req.user.id;

    console.log(`\n📊 [getJobStats] User ${userId}`);

    client = await pool.connect();

    // ✅ Đếm từ CẢ 3 BẢNG
    const query = `
      SELECT 
        (SELECT COUNT(*)::INTEGER FROM saved_jobs WHERE user_id = $1) as saved,
        (SELECT COUNT(*)::INTEGER FROM applications WHERE user_id = $1) as applied_internal,
        (SELECT COUNT(*)::INTEGER FROM applied_jobs WHERE user_id = $1) as applied_external
    `;

    const result = await client.query(query, [userId]);
    const stats = result.rows[0];

    const savedCount = stats.saved || 0;
    const appliedInternalCount = stats.applied_internal || 0;
    const appliedExternalCount = stats.applied_external || 0;
    
    // ✅ TỔNG = internal + external
    const totalApplied = appliedInternalCount + appliedExternalCount;

    console.log(`   📊 Saved: ${savedCount}`);
    console.log(`   📋 Internal: ${appliedInternalCount}`);
    console.log(`   🌐 External: ${appliedExternalCount}`);
    console.log(`   ✅ TOTAL APPLIED: ${totalApplied}\n`);

    res.json({
      success: true,
      saved: savedCount,
      applied: totalApplied,  // ← QUAN TRỌNG: Phải là tổng!
      applied_internal: appliedInternalCount,
      applied_external: appliedExternalCount
    });

  } catch (error) {
    console.error('❌ [getJobStats] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Cannot fetch stats',
      message: error.message
    });
  } finally {
    if (client) client.release();
  }
};


// @desc    Get saved jobs
// @route   GET /api/jobs/saved
// @access  Private
exports.getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log(' Getting saved jobs for user:', userId);

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

    console.log(` Found ${result.rows.length} saved jobs`);

    res.json(result.rows);

  } catch (error) {
    console.error(' Error getting saved jobs:', error);
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
  let client;
  
  try {
    const userId = req.user.id;
    const { limit = 1000, offset = 0 } = req.query;

    console.log(`🌐 [getAppliedJobs] User ${userId}`);

    client = await pool.connect();

    // Query bảng applied_jobs (external/crawled jobs)
    const query = `
      SELECT 
        id,
        job_id,
        job_title,
        company_name,
        company_logo,
        location,
        salary,
        applied_date,
        status,
        cv_used,
        cover_letter,
        created_at
      FROM applied_jobs
      WHERE user_id = $1
      ORDER BY applied_date DESC NULLS LAST
      LIMIT $2 OFFSET $3
    `;

    const result = await client.query(query, [userId, parseInt(limit), parseInt(offset)]);

    const countResult = await client.query(
      'SELECT COUNT(*)::INTEGER as total FROM applied_jobs WHERE user_id = $1',
      [userId]
    );

    const total = countResult.rows[0]?.total || 0;

    console.log(`   ✅ Found ${result.rows.length}/${total} external jobs\n`);

    res.json({
      success: true,
      data: result.rows,
      applications: result.rows,
      count: result.rows.length,
      total: total
    });

  } catch (error) {
    console.error('❌ [getAppliedJobs] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Cannot fetch applied jobs',
      message: error.message
    });
  } finally {
    if (client) client.release();
  }
};


// @desc    Save a job
// @route   POST /api/jobs/save/:id
// @access  Private
exports.saveJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.id;

    console.log(` User ${userId} saving job ${jobId}`);

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

    
    await pool.query(
      `INSERT INTO saved_jobs 
        (user_id, job_id, job_title, company_name, location, salary, saved_date) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
      [userId, jobId, job.title, job.company_name, job.location, job.salary]
    );

    console.log(' Job saved successfully');

    res.json({ 
      success: true, 
      message: 'Job saved successfully' 
    });

  } catch (error) {
    console.error(' Error saving job:', error);
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

    console.log(` User ${userId} unsaving job ${jobId}`);

    await pool.query(
      'DELETE FROM saved_jobs WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );

    console.log(' Job unsaved successfully');

    res.json({ 
      success: true, 
      message: 'Job unsaved successfully' 
    });

  } catch (error) {
    console.error(' Error unsaving job:', error);
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

    console.log(` User ${userId} applying to job ${job_id}`);

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

    console.log(' Application submitted successfully, ID:', result.rows[0].id);

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
    console.error('Error applying to job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to apply to job',
      message: error.message 
    });
  }
};
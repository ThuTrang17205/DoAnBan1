// =============================================
// FILE: applicationController.js (PostgreSQL Version)
// JOB APPLICATIONS MANAGEMENT
// =============================================

const pool = require('../config/db');

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (User)
exports.applyJob = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { coverLetter, resume, cover_letter, cv_file, expected_salary, salary_currency, available_from } = req.body;
    const jobId = req.params.jobId;
    const userId = req.user.id;

    // Support both naming conventions
    const finalCoverLetter = coverLetter || cover_letter;
    const finalResume = resume || cv_file;

    await client.query('BEGIN');

    // Check if job exists and is active
    const jobResult = await client.query(
      'SELECT id, status, title FROM jobs WHERE id = $1',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc'
      });
    }

    const job = jobResult.rows[0];

    if (job.status !== 'open' && job.status !== 'active') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Công việc này không còn nhận hồ sơ'
      });
    }

    // Check if already applied
    const existingAppResult = await client.query(
      'SELECT id FROM applications WHERE job_id = $1 AND user_id = $2',
      [jobId, userId]
    );

    if (existingAppResult.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Bạn đã ứng tuyển công việc này rồi'
      });
    }

    // Create application
    const result = await client.query(
      `INSERT INTO applications (
        job_id,
        user_id,
        cover_letter,
        cv_file,
        expected_salary,
        salary_currency,
        available_from,
        status,
        created_at,
        ngay_ung_tuyen
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [
        jobId,
        userId,
        finalCoverLetter || null,
        finalResume || null,
        expected_salary || null,
        salary_currency || 'VND',
        available_from || null,
        'pending'
      ]
    );

    await client.query('COMMIT');

    // Get application with job and user details
    const applicationResult = await client.query(
      `SELECT 
        a.*,
        j.title as job_title,
        j.location as job_location,
        j.min_salary,
        j.max_salary,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'Ứng tuyển thành công',
      application: applicationResult.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Apply job error:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã ứng tuyển công việc này rồi'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Lỗi server khi ứng tuyển',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// @desc    Get my applications (user)
// @route   GET /api/applications/my-applications
// @access  Private (User)
exports.getMyApplications = async (req, res) => {
  try {
    const { page = 1, limit = 1000, status } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    console.log(`📊 getMyApplications - userId: ${userId}`);

    // ✅ UNION CẢ 2 BẢNG: applied_jobs + applications
    let query = `
      SELECT 
        'external' as application_type,
        aj.id,
        aj.job_id,
        aj.job_title,
        aj.company_name,
        aj.company_logo,
        aj.location,
        aj.salary,
        aj.applied_date as created_at,
        aj.cv_used,
        'pending' as status,
        NULL as cover_letter,
        NULL as expected_salary
      FROM applied_jobs aj
      WHERE aj.user_id = $1
      
      UNION ALL
      
      SELECT 
        'internal' as application_type,
        a.id,
        a.job_id,
        j.title as job_title,
        j.company_name,
        j.company_logo,
        j.location,
        CONCAT(j.min_salary, ' - ', j.max_salary, ' ', COALESCE(j.currency, 'VND')) as salary,
        a.created_at,
        a.cv_file as cv_used,
        a.status,
        a.cover_letter,
        a.expected_salary
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      WHERE a.user_id = $1
    `;

    const params = [userId];
    let paramIndex = 2;

    // Filter by status if provided
    if (status) {
      query = `
        SELECT * FROM (${query}) combined_apps
        WHERE status = $${paramIndex}
      `;
      params.push(status);
      paramIndex++;
    }

    // Add ordering and pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    console.log(`📝 Executing UNION query...`);
    const appsResult = await pool.query(query, params);
    
    console.log(`✅ Query returned ${appsResult.rows.length} rows (external + internal)`);

    // Count total from BOTH tables
    const countQuery = `
      SELECT COUNT(*) as total FROM (
        SELECT id FROM applied_jobs WHERE user_id = $1
        UNION ALL
        SELECT id FROM applications WHERE user_id = $1
      ) combined
    `;
    
    const countResult = await pool.query(countQuery, [userId]);
    const total = parseInt(countResult.rows[0].total);
    
    console.log(`📊 Total applications (external + internal): ${total}`);

    res.json({
      success: true,
      count: appsResult.rows.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      applications: appsResult.rows
    });

  } catch (error) {
    console.error('❌ Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};


// @desc    Get applications for a job (employer)
// @route   GET /api/applications/job/:jobId
// @access  Private (Employer - job owner only)
exports.getJobApplications = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const jobId = req.params.jobId;
    const employerId = req.user.id;

    // Check if job exists and belongs to employer
    const jobResult = await pool.query(
      'SELECT id, title, posted_by FROM jobs WHERE id = $1',
      [jobId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc'
      });
    }

    const job = jobResult.rows[0];

    if (job.posted_by !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem hồ sơ của công việc này'
      });
    }

    let query = `
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM applications a
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.job_id = $1
    `;

    const params = [jobId];
    let paramIndex = 2;

    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    const appsResult = await pool.query(query, params);

    // Count total
    let countQuery = 'SELECT COUNT(*) as total FROM applications WHERE job_id = $1';
    const countParams = [jobId];

    if (status) {
      countQuery += ' AND status = $2';
      countParams.push(status);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      count: appsResult.rows.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      applications: appsResult.rows
    });

  } catch (error) {
    console.error('❌ Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get single application
// @route   GET /api/applications/:id
// @access  Private (User owns or Employer owns job)
exports.getApplicationById = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const currentUserId = req.user.id;

    const result = await pool.query(
      `SELECT 
        a.*,
        j.id as job_id,
        j.title as job_title,
        j.location as job_location,
        j.min_salary,
        j.max_salary,
        j.currency,
        j.posted_by as job_posted_by,
        u.id as user_id,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.id = $1`,
      [applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ ứng tuyển'
      });
    }

    const application = result.rows[0];

    // Check permission
    const isApplicant = application.user_id === currentUserId;
    const isEmployer = application.job_posted_by === currentUserId;

    if (!isApplicant && !isEmployer) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem hồ sơ này'
      });
    }

    res.json({
      success: true,
      application
    });

  } catch (error) {
    console.error('❌ Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Update application status (employer)
// @route   PUT /api/applications/:id/status
// @access  Private (Employer - job owner only)
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { status, note, employer_notes, rejection_reason } = req.body;
    const applicationId = req.params.id;
    const employerId = req.user.id;

    // Support both naming conventions
    const finalNote = note || employer_notes;

    // Get application and check ownership
    const appResult = await pool.query(
      `SELECT a.*, j.posted_by 
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = $1`,
      [applicationId]
    );

    if (appResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ ứng tuyển'
      });
    }

    const application = appResult.rows[0];

    // Check if employer owns the job
    if (application.posted_by !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật hồ sơ này'
      });
    }

    // Update application
    const updateResult = await pool.query(
      `UPDATE applications 
       SET status = $1,
           employer_notes = $2,
           rejection_reason = $3,
           status_changed_at = NOW(),
           status_changed_by = $4,
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [status, finalNote, rejection_reason, employerId, applicationId]
    );

    // Get updated application with user details
    const result = await pool.query(
      `SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email
      FROM applications a
      INNER JOIN users u ON a.user_id = u.id
      WHERE a.id = $1`,
      [applicationId]
    );

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      application: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Withdraw application (user)
// @route   DELETE /api/applications/:id
// @access  Private (User - owner only)
exports.withdrawApplication = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, user_id, status FROM applications WHERE id = $1',
      [applicationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy hồ sơ ứng tuyển'
      });
    }

    const application = result.rows[0];

    // Check ownership
    if (application.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền rút hồ sơ này'
      });
    }

    // Cannot withdraw if already accepted/rejected
    if (application.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Không thể rút hồ sơ đã được xử lý'
      });
    }

    await pool.query('DELETE FROM applications WHERE id = $1', [applicationId]);

    res.json({
      success: true,
      message: 'Đã rút hồ sơ ứng tuyển'
    });

  } catch (error) {
    console.error('❌ Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get application statistics (employer)
// @route   GET /api/applications/stats/employer
// @access  Private (Employer)
exports.getEmployerApplicationStats = async (req, res) => {
  try {
    const employerId = req.user.id;

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN a.status = 'accepted' OR a.status = 'approved' THEN 1 ELSE 0 END) as accepted_applications,
        SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected_applications
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      WHERE j.posted_by = $1`,
      [employerId]
    );

    const stats = result.rows[0];

    res.json({
      success: true,
      stats: {
        totalApplications: parseInt(stats.total_applications) || 0,
        pendingApplications: parseInt(stats.pending_applications) || 0,
        acceptedApplications: parseInt(stats.accepted_applications) || 0,
        rejectedApplications: parseInt(stats.rejected_applications) || 0
      }
    });

  } catch (error) {
    console.error('❌ Get employer application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Get application statistics (user)
// @route   GET /api/applications/stats/user
// @access  Private (User)
exports.getUserApplicationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN status = 'accepted' OR status = 'approved' THEN 1 ELSE 0 END) as accepted_applications,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_applications
      FROM applications
      WHERE user_id = $1`,
      [userId]
    );

    const stats = result.rows[0];

    res.json({
      success: true,
      stats: {
        totalApplications: parseInt(stats.total_applications) || 0,
        pendingApplications: parseInt(stats.pending_applications) || 0,
        acceptedApplications: parseInt(stats.accepted_applications) || 0,
        rejectedApplications: parseInt(stats.rejected_applications) || 0
      }
    });

  } catch (error) {
    console.error('❌ Get user application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

// @desc    Bulk update application status
// @route   PUT /api/applications/bulk-update
// @access  Private (Employer)
exports.bulkUpdateStatus = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { applicationIds, status, note, employer_notes } = req.body;
    const employerId = req.user.id;

    // Support both naming conventions
    const finalNote = note || employer_notes;

    if (!applicationIds || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một hồ sơ'
      });
    }

    await client.query('BEGIN');

    // Check if employer owns all jobs
    const checkResult = await client.query(
      `SELECT DISTINCT j.posted_by
       FROM applications a
       INNER JOIN jobs j ON a.job_id = j.id
       WHERE a.id = ANY($1::int[])`,
      [applicationIds]
    );

    const unauthorized = checkResult.rows.some(
      row => row.posted_by !== employerId
    );

    if (unauthorized) {
      await client.query('ROLLBACK');
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật một số hồ sơ'
      });
    }

    // Update all applications
    await client.query(
      `UPDATE applications 
       SET status = $1,
           employer_notes = $2,
           status_changed_at = NOW(),
           status_changed_by = $3,
           updated_at = NOW()
       WHERE id = ANY($4::int[])`,
      [status, finalNote, employerId, applicationIds]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `Đã cập nhật ${applicationIds.length} hồ sơ thành công`
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Bulk update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  } finally {
    client.release();
  }
};

// @desc    Check if user already applied to a job
// @route   GET /api/applications/check/:jobId
// @access  Private (User)
exports.checkApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const jobId = req.params.jobId;

    const result = await pool.query(
      'SELECT id, status, created_at FROM applications WHERE user_id = $1 AND job_id = $2',
      [userId, jobId]
    );

    res.json({
      success: true,
      hasApplied: result.rows.length > 0,
      application: result.rows[0] || null
    });

  } catch (error) {
    console.error('❌ Check application error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
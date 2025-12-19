const { pool } = require('../config/db');

// @desc    Apply for a job
// @route   POST /api/applications/apply/:jobId
// @access  Private (User)
exports.applyJob = async (req, res) => {
  const client = await pool.connect();
  
  try {
    console.log('\n========================================');
    console.log(' APPLICATION SUBMISSION DEBUG');
    console.log('========================================');
    console.log(' req.body:', JSON.stringify(req.body, null, 2));
    console.log(' req.file:', req.file);
    console.log(' req.body.cv_id:', req.body.cv_id);
    console.log('========================================\n');

    const { 
      coverLetter, 
      cover_letter, 
      cv_id,           
      cv_file,         
      expected_salary, 
      salary_currency, 
      available_from 
    } = req.body;
    
    const jobId = req.params.jobId;
    const userId = req.user.id;

    const finalCoverLetter = coverLetter || cover_letter;

    await client.query('BEGIN');

    
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

    
    let finalCVPath = null;
    let savedCvId = null;

    console.log('\n CV RESOLUTION PROCESS:');

   
    if (req.file) {
      finalCVPath = req.file.path;
      console.log('   Case 1: Using uploaded file');
      console.log('     Path:', finalCVPath);
      
      
      console.log('   Saving new CV to user_cvs table...');
      
      try {
        const saveCvQuery = `
          INSERT INTO user_cvs (
            user_id,
            file_name,
            file_path,
            file_url,
            file_size,
            upload_date,
            is_default
          )
          VALUES ($1, $2, $3, $4, $5, NOW(), false)
          RETURNING id
        `;
        
        const saveCvResult = await client.query(saveCvQuery, [
          userId,
          req.file.originalname,
          req.file.path,
          `/${req.file.path.replace(/\\/g, '/')}`, 
          req.file.size
        ]);
        
        savedCvId = saveCvResult.rows[0].id;
        console.log('   CV saved to user_cvs with ID:', savedCvId);
      } catch (cvError) {
        console.error('   Error saving CV to user_cvs:', cvError.message);
        
      }
    }
    
    else if (cv_id) {
      const cvIdInt = parseInt(cv_id);
      console.log('   Case 2: Looking up existing CV');
      console.log('     cv_id:', cvIdInt);
      
      const cvResult = await client.query(
        'SELECT id, file_path, file_url FROM user_cvs WHERE id = $1 AND user_id = $2',
        [cvIdInt, userId]
      );

      if (cvResult.rows.length === 0) {
        await client.query('ROLLBACK');
        console.log('      CV not found');
        return res.status(400).json({
          success: false,
          message: 'CV không tồn tại hoặc không thuộc về bạn'
        });
      }

      const cv = cvResult.rows[0];
      finalCVPath = cv.file_path || cv.file_url;
      savedCvId = cv.id;
      console.log('      Using CV ID:', savedCvId);
      console.log('     Path:', finalCVPath);
    }
    // Case 3: cv_file string (backward compatibility)
    else if (cv_file) {
      finalCVPath = cv_file;
      console.log('   Case 3: Using cv_file string');
    }
    // Case 4: No CV provided
    else {
      await client.query('ROLLBACK');
      console.log('   Case 4: No CV provided');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn CV hoặc upload CV mới'
      });
    }

    console.log('\n FINAL VALUES:');
    console.log('   CV Path:', finalCVPath);
    console.log('   CV ID in user_cvs:', savedCvId);

    if (!finalCVPath) {
      await client.query('ROLLBACK');
      console.log(' CRITICAL: finalCVPath is null!');
      return res.status(400).json({
        success: false,
        message: 'Lỗi xử lý CV. Vui lòng thử lại.'
      });
    }

    // Insert application
    const insertQuery = `
      INSERT INTO applications (
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
      RETURNING *
    `;
    
    const insertParams = [
      jobId,
      userId,
      finalCoverLetter || null,
      finalCVPath,
      expected_salary || null,
      salary_currency || 'VND',
      available_from || null,
      'pending'
    ];

    console.log('\n INSERT APPLICATION:');
    console.log('Params:', insertParams);

    const result = await client.query(insertQuery, insertParams);

    await client.query('COMMIT');

    console.log('\n APPLICATION CREATED!');
    console.log('   Application ID:', result.rows[0].id);
    console.log('   CV File:', result.rows[0].cv_file);
    console.log('   CV saved to user_cvs ID:', savedCvId);
    console.log('========================================\n');

    // Get full application details
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
      application: applicationResult.rows[0],
      cv_saved_to_user_cvs: !!savedCvId,
      cv_id: savedCvId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n APPLICATION ERROR:');
    console.error('   Message:', error.message);
    console.error('   Stack:', error.stack);
    console.error('========================================\n');
    
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
    const userId = req.user.id;
    const { limit = 1000 } = req.query;

    console.log(` getMyApplications - userId: ${userId}`);

    const query = `
      SELECT 
        a.id,
        a.job_id,
        a.user_id,
        a.status,
        a.ngay_ung_tuyen,
        a.cv_file,
        a.cover_letter,
        a.created_at
      FROM applications a
      WHERE a.user_id = $1
      ORDER BY a.ngay_ung_tuyen DESC NULLS LAST
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, parseInt(limit)]);

    const applicationsWithJobs = await Promise.all(
      result.rows.map(async (app) => {
        try {
          const jobResult = await pool.query(
            `SELECT id, title, company_name, location, min_salary, max_salary, currency
             FROM jobs WHERE id = $1`,
            [app.job_id]
          );

          const job = jobResult.rows[0];

          return {
            application_type: 'internal',
            id: app.id,
            job_id: app.job_id,
            job_title: job ? job.title : 'Không rõ',
            company_name: job ? job.company_name : 'Không rõ',
            company_logo: null,
            location: job ? job.location : 'Không rõ',
            salary: job 
              ? `${job.min_salary || ''} - ${job.max_salary || ''} ${job.currency || 'VND'}`
              : 'Thỏa thuận',
            ngay_ung_tuyen: app.ngay_ung_tuyen,
            created_at: app.created_at,
            cv_file: app.cv_file,
            status: app.status || 'pending',
            cover_letter: app.cover_letter
          };
        } catch (err) {
          console.error(` Error loading job ${app.job_id}:`, err);
          return {
            application_type: 'internal',
            id: app.id,
            job_id: app.job_id,
            job_title: 'Lỗi tải thông tin',
            company_name: 'Không rõ',
            company_logo: null,
            location: 'Không rõ',
            salary: 'Thỏa thuận',
            ngay_ung_tuyen: app.ngay_ung_tuyen,
            created_at: app.created_at,
            cv_file: app.cv_file,
            status: app.status || 'pending',
            cover_letter: app.cover_letter
          };
        }
      })
    );

    res.json({
      success: true,
      count: applicationsWithJobs.length,
      total: applicationsWithJobs.length,
      applications: applicationsWithJobs,
      data: applicationsWithJobs
    });

  } catch (error) {
    console.error(' Error:', error);
    
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
        a.cv_file,
        a.cover_letter,
        a.expected_salary,
        a.salary_currency,
        a.available_from,
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
    console.error(' Get job applications error:', error);
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
    console.error(' Get application by ID error:', error);
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

    const finalNote = note || employer_notes;

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

    if (application.posted_by !== employerId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật hồ sơ này'
      });
    }

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
    console.error(' Update application status error:', error);
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

    if (application.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền rút hồ sơ này'
      });
    }

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
    console.error(' Withdraw application error:', error);
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
    console.error(' Get employer application stats error:', error);
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
    console.error(' Get user application stats error:', error);
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

    const finalNote = note || employer_notes;

    if (!applicationIds || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng chọn ít nhất một hồ sơ'
      });
    }

    await client.query('BEGIN');

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
    console.error(' Bulk update status error:', error);
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
    console.error(' Check application error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
/**
 * Employer Controller - PostgreSQL Version
 * Compatible with pg Pool
 */

const pool = require('../config/db'); // ✅ PostgreSQL Pool

// @desc    Create new job posting
// @route   POST /api/employers/me/jobs
// @access  Private (Employer)
// @desc    Create new job posting
// @route   POST /api/employers/me/jobs
// @access  Private (Employer)
// @desc    Create new job posting
// @route   POST /api/employers/me/jobs
// @access  Private (Employer)
exports.createJob = async (req, res) => {
  const client = await pool.connect();
  try {
    console.log(">>> EMPLOYER ID:", req.user?.id);
    const employerId = req.user.id;

    // START TRANSACTION
    await client.query("BEGIN");

    // 1. Lấy thông tin công ty
    const companyResult = await client.query(
      "SELECT id, package_type, remaining_jobs, current_jobs, name FROM companies WHERE employer_id = $1",
      [employerId]
    );

    if (companyResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Bạn chưa tạo công ty" });
    }

    const company = companyResult.rows[0];

    // 2. Kiểm tra gói FREE
    if (company.package_type.toUpperCase() === "FREE") {
      if (company.remaining_jobs <= 0) {
        await client.query("ROLLBACK");
        return res.status(403).json({
          success: false,
          message: "Gói FREE chỉ được đăng 2 job. Vui lòng nâng cấp gói!"
        });
      }

      // TRỪ 1 SLOT
      await client.query(
        `UPDATE companies 
         SET remaining_jobs = remaining_jobs - 1,
             current_jobs   = current_jobs + 1
         WHERE id = $1`,
        [company.id]
      );
    }

    // 3. Lấy data từ request body
    const { 
      title, 
      description, 
      location, 
      salary,
      min_salary,
      max_salary,
      currency = 'VND',
      job_type, 
      category,
      requirements,
      benefits,
      deadline,
      experience,
      skills_required,
      contact_person,
      contact_email,
      contact_phone,
      positions_available = 1,
      working_hours,
      working_days,
      city,
      district,
      address,
      education_required,
      gender_required,
      age_min,
      age_max,
      salary_negotiable = false,
      is_urgent = false,
      is_remote = false
    } = req.body;

    if (!title || !description) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "Thiếu tiêu đề hoặc mô tả công việc!"
      });
    }

    // 4. Tạo job với đầy đủ fields
    const result = await client.query(
      `INSERT INTO jobs (
        title, 
        description, 
        location, 
        salary,
        min_salary,
        max_salary,
        currency,
        job_type, 
        category, 
        company_id,
        company_name,
        posted_by,
        status,
        requirements,
        benefits,
        deadline,
        experience,
        skills_required,
        contact_person,
        contact_email,
        contact_phone,
        positions_available,
        working_hours,
        working_days,
        city,
        district,
        address,
        education_required,
        gender_required,
        age_min,
        age_max,
        salary_negotiable,
        is_urgent,
        is_remote
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34
      )
      RETURNING *`,
      [
        title,
        description,
        location || null,
        salary || null,
        min_salary || null,
        max_salary || null,
        currency,
        job_type || null,
        category || null,
        company.id,
        company.name, // ✅ Thêm company_name
        employerId,
        'open',
        requirements || null,
        benefits || null,
        deadline || null,
        experience || null,
        skills_required || null,
        contact_person || null,
        contact_email || null,
        contact_phone || null,
        positions_available,
        working_hours || null,
        working_days || null,
        city || null,
        district || null,
        address || null,
        education_required || null,
        gender_required || null,
        age_min || null,
        age_max || null,
        salary_negotiable,
        is_urgent,
        is_remote
      ]
    );

    // commit
    await client.query("COMMIT");

    res.json({
      success: true,
      job: result.rows[0]
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error(">>> ERROR CREATE JOB:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi đăng job",
      error: error.message
    });
  } finally {
    client.release();
  }
};

// @desc    Update job posting
// @route   PUT /api/employers/me/jobs/:id
// @access  Private (Employer)
exports.updateJob = async (req, res) => {
  try {
    const employerId = req.user.id;
    const jobId = req.params.id;

    const companyId = await getCompanyId(employerId);
    if (!companyId) {
      return res.status(404).json({ success: false, message: "Không tìm thấy công ty của bạn" });
    }

    const check = await pool.query(
      "SELECT id FROM jobs WHERE id = $1 AND company_id = $2",
      [jobId, companyId]
    );

    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Không tìm thấy tin tuyển dụng hoặc không có quyền" });
    }

    const fields = Object.keys(req.body);
    const values = Object.values(req.body);

    const setQuery = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");

    await pool.query(
      `UPDATE jobs SET ${setQuery} WHERE id = $${fields.length + 1}`,
      [...values, jobId]
    );

    res.status(200).json({ success: true, message: "Cập nhật thành công" });

  } catch (error) {
    console.error("❌ Update job error:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};


// @desc    Delete job posting
// @route   DELETE /api/employers/me/jobs/:id
// @access  Private (Employer)
exports.deleteJob = async (req, res) => {
  try {
    const employerId = req.user.id;
    const jobId = req.params.id;

    const companyId = await getCompanyId(employerId);
    if (!companyId) {
      return res.status(404).json({ success: false, message: "Không tìm thấy công ty của bạn" });
    }

    const check = await pool.query(
      "SELECT id FROM jobs WHERE id = $1 AND company_id = $2",
      [jobId, companyId]
    );

    if (check.rows.length === 0) {
      return res.status(403).json({ success: false, message: "Không có quyền xoá" });
    }

    await pool.query("DELETE FROM jobs WHERE id = $1", [jobId]);

    res.status(200).json({ success: true, message: "Xoá thành công" });

  } catch (error) {
    console.error("❌ Delete job error:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống" });
  }
};


// @desc    Get single job detail (for employer to view/edit)
// @route   GET /api/employers/me/jobs/:id
// @access  Private (Employer)
exports.getJobById = async (req, res) => {
  try {
    const employerId = req.user.id;
    const jobId = req.params.id;

    // ✅ B1: Lấy company_id của employer
    const companyResult = await pool.query(
      "SELECT id FROM companies WHERE employer_id = $1",
      [employerId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công ty của bạn'
      });
    }

    const companyId = companyResult.rows[0].id;

    // ✅ B2: Query với companyId
    const result = await pool.query(`
      SELECT 
        j.*,
        COUNT(DISTINCT a.id) as application_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.id = $1 AND j.company_id = $2
      GROUP BY j.id
    `, [jobId, companyId]);  // ✅ Dùng companyId

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng'
      });
    }

    res.json({
      success: true,
      job: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin tin tuyển dụng',
      error: error.message
    });
  }
};

// @desc    Get employer's jobs (PostgreSQL version)
// @route   GET /api/employers/me/jobs
// @access  Private (Employer)
exports.getMyJobs = async (req, res) => {
  try {
    console.log('🔍 ===== getMyJobs CALLED =====');

    const employerId = req.user.id;
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (page - 1) * limit;

    // 👉 B1: Lấy company_id của employer
    const companyResult = await pool.query(
      "SELECT id FROM companies WHERE employer_id = $1",
      [employerId]
    );

    if (companyResult.rows.length === 0) {
      return res.json({
        success: true,
        jobs: [],
        total: 0,
        totalPages: 0,
        currentPage: Number(page)
      });
    }

    const companyId = companyResult.rows[0].id;
    console.log("🏢 Company ID:", companyId);

    // 👉 B2: Build query bằng companyId
    let query = `
      SELECT 
        j.*,
        COUNT(DISTINCT a.id) as application_count,
        COUNT(DISTINCT CASE WHEN a.status = 'pending' THEN a.id END) as pending_count
      FROM jobs j
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE j.company_id = $1
    `;

    const params = [companyId];
    let paramIndex = 2;

    if (status) {
      query += ` AND j.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (search) {
      query += ` AND j.title ILIKE $${paramIndex}`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ` GROUP BY j.id ORDER BY j.posted_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

    params.push(Number(limit), offset);

    // 👉 Lấy jobs
    const jobsResult = await pool.query(query, params);
    const jobs = jobsResult.rows;

    // 👉 Count total
    let countQuery = `SELECT COUNT(*) FROM jobs WHERE company_id = $1`;
    const countParams = [companyId];
    let countIndex = 2;

    if (status) {
      countQuery += ` AND status = $${countIndex}`;
      countParams.push(status);
      countIndex++;
    }

    if (search) {
      countQuery += ` AND title ILIKE $${countIndex}`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = Number(countResult.rows[0].count);

    res.json({
      success: true,
      count: jobs.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      jobs
    });

  } catch (error) {
    console.error('❌ Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách công việc',
      error: error.message
    });
  }
};

// @desc    Get applications for employer's jobs (PostgreSQL version)
// @route   GET /api/employers/me/applications
// @access  Private (Employer)
exports.getMyApplications = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { page = 1, limit = 10, status, jobId } = req.query;
    const offset = (page - 1) * limit;

    console.log('🔍 Getting applications for employer:', employerId);
    console.log('📋 Filters:', { status, jobId });

    // ✅ LẤY COMPANY_ID
    const companyResult = await pool.query(
      "SELECT id FROM companies WHERE employer_id = $1",
      [employerId]
    );

    if (companyResult.rows.length === 0) {
      console.log('❌ No company found for employer:', employerId);
      return res.json({
        success: true,
        applications: [],
        total: 0,
        totalPages: 0,
        currentPage: Number(page)
      });
    }

    const companyId = companyResult.rows[0].id;
    console.log('🏢 Company ID:', companyId);

    // ✅ QUERY VỚI CẢ 2 ĐIỀU KIỆN (posted_by HOẶC company_id)
    // Vì có thể job được tạo bằng posted_by hoặc company_id
    let query = `
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        j.title as job_title,
        j.location as job_location,
        j.min_salary,
        j.max_salary,
        j.currency
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN users u ON a.user_id = u.id
      WHERE (j.posted_by = $1 OR j.company_id = $2)
    `;

    const params = [employerId, companyId];
    let paramIndex = 3;

    // Add filters
    if (status) {
      query += ` AND a.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (jobId) {
      query += ` AND a.job_id = $${paramIndex}`;
      params.push(jobId);
      paramIndex++;
    }

    query += ` ORDER BY a.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(Number(limit), offset);

    console.log('📝 Query:', query);
    console.log('📝 Params:', params);

    // Get applications
    const appsResult = await pool.query(query, params);
    const applications = appsResult.rows;

    console.log('✅ Found applications:', applications.length);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      WHERE (j.posted_by = $1 OR j.company_id = $2)
    `;
    
    const countParams = [employerId, companyId];
    let countParamIndex = 3;

    if (status) {
      countQuery += ` AND a.status = $${countParamIndex}`;
      countParams.push(status);
      countParamIndex++;
    }

    if (jobId) {
      countQuery += ` AND a.job_id = $${countParamIndex}`;
      countParams.push(jobId);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    console.log('📊 Total applications:', total);

    res.json({
      success: true,
      count: applications.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      applications
    });

  } catch (error) {
    console.error('❌ Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách ứng tuyển',
      error: error.message
    });
  }
};
// @desc    Get employer dashboard stats (PostgreSQL version)
// @route   GET /api/employers/me/dashboard
// @access  Private (Employer)
exports.getDashboardStats = async (req, res) => {
  try {
    const employerId = req.user.id;

    // Get jobs stats
    const jobStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'active' OR status = 'open' THEN 1 ELSE 0 END) as active_jobs,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_jobs,
        SUM(COALESCE(views, 0)) as total_views
      FROM jobs 
      WHERE company_id = $1
    `, [employerId]);

    const jobStats = jobStatsResult.rows[0];

    // Get applications stats
    const appStatsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN a.status = 'pending' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN a.status = 'accepted' OR a.status = 'approved' THEN 1 ELSE 0 END) as accepted_applications,
        SUM(CASE WHEN a.status = 'rejected' THEN 1 ELSE 0 END) as rejected_applications
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      WHERE j.company_id = $1
    `, [employerId]);

    const appStats = appStatsResult.rows[0];

    // Get recent applications
    const recentAppsResult = await pool.query(`
      SELECT 
        a.*,
        u.name as user_name,
        u.email as user_email,
        j.title as job_title
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      INNER JOIN users u ON a.user_id = u.id
      WHERE j.company_id = $1
      ORDER BY a.created_at DESC
      LIMIT 5
    `, [employerId]);

    res.json({
      success: true,
      stats: {
        jobs: {
          total: parseInt(jobStats.total_jobs) || 0,
          active: parseInt(jobStats.active_jobs) || 0,
          closed: parseInt(jobStats.closed_jobs) || 0
        },
        applications: {
          total: parseInt(appStats.total_applications) || 0,
          pending: parseInt(appStats.pending_applications) || 0,
          accepted: parseInt(appStats.accepted_applications) || 0,
          rejected: parseInt(appStats.rejected_applications) || 0
        },
        views: parseInt(jobStats.total_views) || 0,
        recentApplications: recentAppsResult.rows
      }
    });

  } catch (error) {
    console.error('❌ Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê',
      error: error.message
    });
  }
};

// @desc    Get employer profile (PostgreSQL version)
// @route   GET /api/employers/me/profile
// @access  Private (Employer)
exports.getMyProfile = async (req, res) => {
  try {
    const employerId = req.user.id;

    // Get user info
    const userResult = await pool.query(
      'SELECT id, username, email, name, role, company_name, contact_person, phone, company_size, industry, created_at FROM users WHERE id = $1',
      [employerId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin employer'
      });
    }

    const user = userResult.rows[0];

    // Get additional stats
    const jobCountResult = await pool.query(
      'SELECT COUNT(*) as count FROM jobs WHERE company_id = $1',
      [employerId]
    );

    const appCountResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM applications a
      INNER JOIN jobs j ON a.job_id = j.id
      WHERE j.company_id = $1
    `, [employerId]);

    res.json({
      success: true,
      employer: {
        ...user,
        profile: {
          company: user.company_name,
          contactPerson: user.contact_person,
          phone: user.phone,
          companySize: user.company_size,
          industry: user.industry
        },
        stats: {
          totalJobs: parseInt(jobCountResult.rows[0].count) || 0,
          totalApplications: parseInt(appCountResult.rows[0].count) || 0
        }
      }
    });

  } catch (error) {
    console.error('❌ Get my profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin profile',
      error: error.message
    });
  }
};

// @desc    Update employer profile (PostgreSQL version)
// @route   PUT /api/employers/me/profile
// @access  Private (Employer)
exports.updateProfile = async (req, res) => {
  try {
    const employerId = req.user.id;
    const {
      company_name,
      contact_person,
      phone,
      company_size,
      industry,
      website,
      address,
      description
    } = req.body;

    // Update user table
    await pool.query(`
      UPDATE users 
      SET 
        company_name = COALESCE($1, company_name),
        contact_person = COALESCE($2, contact_person),
        phone = COALESCE($3, phone),
        company_size = COALESCE($4, company_size),
        industry = COALESCE($5, industry),
        updated_at = NOW()
      WHERE id = $6
    `, [company_name, contact_person, phone, company_size, industry, employerId]);

    // Get updated user info
    const userResult = await pool.query(
      'SELECT id, username, email, name, role, company_name, contact_person, phone, company_size, industry FROM users WHERE id = $1',
      [employerId]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      employer: userResult.rows[0]
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật thông tin',
      error: error.message
    });
  }
};

// @desc    Upload logo (PostgreSQL version)
// @route   POST /api/employers/me/upload-logo
// @access  Private (Employer)
exports.uploadLogo = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { logoUrl } = req.body;

    if (!logoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp URL logo'
      });
    }

    // Update logo in users table
    await pool.query(
      'UPDATE users SET logo = $1, updated_at = NOW() WHERE id = $2',
      [logoUrl, employerId]
    );

    res.json({
      success: true,
      message: 'Upload logo thành công',
      logoUrl
    });

  } catch (error) {
    console.error('❌ Upload logo error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi upload logo',
      error: error.message
    });
  }
};

// @desc    Change employer password
// @route   PUT /api/employers/me/change-password
// @access  Private (Employer)
exports.changePassword = async (req, res) => {
  try {
    const employerId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin'
      });
    }

    // Get current user
    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [employerId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Verify current password (implement your password verification)
    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(currentPassword, userResult.rows[0].password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Mật khẩu hiện tại không đúng'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, employerId]
    );

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đổi mật khẩu',
      error: error.message
    });
  }
};

// @desc    Register new employer
// @route   POST /api/employers/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      name,
      companyName,
      contactPerson,
      phone,
      companySize,
      industry
    } = req.body;
    
    const company_name = companyName;
    const contact_person = contactPerson;
    const company_size = companySize;

    // Validate required fields
    if (!email || !password || !company_name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin (email, password, company_name)'
      });
    }

    // Check if email exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ BẮT ĐẦU TRANSACTION
    await pool.query('BEGIN');

    try {
      // 1. Insert new user
      const userResult = await pool.query(`
        INSERT INTO users (
          username, email, password, name, role, 
          company_name, contact_person, phone, company_size, industry
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, username, email, name, role, company_name
      `, [
        username || email.split('@')[0],
        email,
        hashedPassword,
        name || company_name,
        'employer',
        company_name,
        contact_person,
        phone,
        company_size,
        industry
      ]);

      const user = userResult.rows[0];

      // 2. ✅ Tạo company (KHÔNG tạo employers nữa)
      await pool.query(`
        INSERT INTO companies (
          employer_id, 
          name, 
          description, 
          location, 
          source,
          package_type,
          remaining_jobs,
          current_jobs
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        user.id,
        company_name,
        `Công ty ${company_name}`,
        null,
        'registered',
        'FREE',
        2,
        0
      ]);

      // ✅ COMMIT TRANSACTION
      await pool.query('COMMIT');

      // Generate JWT token
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          company_name: user.company_name
        }
      });

    } catch (err) {
      // ✅ ROLLBACK nếu có lỗi
      await pool.query('ROLLBACK');
      throw err;
    }

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký',
      error: error.message
    });
  }
};

// @desc    Employer login
// @route   POST /api/employers/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp email và password'
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND role = $2',
      [email, 'employer']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    const user = result.rows[0];

    // Verify password
    const bcrypt = require('bcrypt');
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Generate JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        company_name: user.company_name,
        contact_person: user.contact_person,
        phone: user.phone,
        company_size: user.company_size,
        industry: user.industry
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng nhập',
      error: error.message
    });
  }
};

// @desc    Get all employers
// @route   GET /api/employers
// @access  Public
exports.getAllEmployers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, industry, company_size } = req.query;
    const offset = (page - 1) * limit;

    // Build query
    let query = `
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.name, 
        u.company_name,
        u.contact_person,
        u.phone,
        u.company_size,
        u.industry,
        u.logo,
        COUNT(j.id) as total_jobs
      FROM users u
      LEFT JOIN jobs j ON u.id = j.company_id
      WHERE u.role = 'employer'
    `;

    const params = [];
    let paramIndex = 1;

    // Add filters
    if (search) {
      query += ` AND (u.company_name ILIKE ${paramIndex} OR u.name ILIKE ${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (industry) {
      query += ` AND u.industry = ${paramIndex}`;
      params.push(industry);
      paramIndex++;
    }

    if (company_size) {
      query += ` AND u.company_size = ${paramIndex}`;
      params.push(company_size);
      paramIndex++;
    }

    query += ` GROUP BY u.id ORDER BY u.id DESC LIMIT ${paramIndex} OFFSET ${paramIndex + 1}`;
    params.push(Number(limit), offset);

    // Get employers
    const result = await pool.query(query, params);
    const employers = result.rows;

    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE role = 'employer'`;
    const countParams = [];
    let countParamIndex = 1;

    if (search) {
      countQuery += ` AND (company_name ILIKE ${countParamIndex} OR name ILIKE ${countParamIndex})`;
      countParams.push(`%${search}%`);
      countParamIndex++;
    }

    if (industry) {
      countQuery += ` AND industry = ${countParamIndex}`;
      countParams.push(industry);
      countParamIndex++;
    }

    if (company_size) {
      countQuery += ` AND company_size = ${countParamIndex}`;
      countParams.push(company_size);
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      count: employers.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      employers
    });

  } catch (error) {
    console.error('❌ Get all employers error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách employers',
      error: error.message
    });
  }
};

// @desc    Get employer by ID
// @route   GET /api/employers/:id
// @access  Public
exports.getEmployerById = async (req, res) => {
  try {
    const employerId = req.params.id;

    // Get employer info
    const userResult = await pool.query(`
      SELECT 
        id, username, email, name, company_name,
        contact_person, phone, company_size, industry, logo
      FROM users 
      WHERE id = $1 AND role = 'employer'
    `, [employerId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy employer'
      });
    }

    const employer = userResult.rows[0];

    // Get employer's jobs
    const jobsResult = await pool.query(`
      SELECT 
        id, title, location, min_salary, max_salary, 
        currency, category, status, posted_at, deadline
      FROM jobs 
      WHERE company_id = $1 AND status = 'open'
      ORDER BY posted_at DESC
      LIMIT 10
    `, [employerId]);

    // Get stats
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as active_jobs
      FROM jobs
      WHERE company_id = $1
    `, [employerId]);

    res.json({
      success: true,
      employer: {
        ...employer,
        stats: {
          total_jobs: parseInt(statsResult.rows[0].total_jobs) || 0,
          active_jobs: parseInt(statsResult.rows[0].active_jobs) || 0
        },
        recent_jobs: jobsResult.rows
      }
    });

  } catch (error) {
    console.error('❌ Get employer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin employer',
      error: error.message
    });
  }
};
// @desc    Close job posting
// @route   PUT /api/employers/jobs/:id/close
// @access  Private (Employer)
exports.closeJob = async (req, res) => {
  try {
    const employerId = req.user.id;
    const jobId = req.params.id;

    // Lấy company_id của employer
    const companyResult = await pool.query(
      "SELECT id FROM companies WHERE employer_id = $1",
      [employerId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy công ty của bạn" 
      });
    }

    const companyId = companyResult.rows[0].id;

    // Kiểm tra job có thuộc về employer này không
    const checkResult = await pool.query(
      "SELECT id, status FROM jobs WHERE id = $1 AND company_id = $2",
      [jobId, companyId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy tin tuyển dụng hoặc không có quyền" 
      });
    }

    const job = checkResult.rows[0];

    if (job.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: "Tin tuyển dụng đã được đóng trước đó"
      });
    }

    // Đóng tin tuyển dụng
    await pool.query(
      "UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2",
      ['closed', jobId]
    );

    res.json({ 
      success: true, 
      message: "Đã đóng tin tuyển dụng thành công" 
    });

  } catch (error) {
    console.error("❌ Close job error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi hệ thống khi đóng tin tuyển dụng",
      error: error.message
    });
  }
};

// @desc    Reopen job posting
// @route   PUT /api/employers/jobs/:id/reopen
// @access  Private (Employer)
exports.reopenJob = async (req, res) => {
  try {
    const employerId = req.user.id;
    const jobId = req.params.id;

    // Lấy company_id của employer
    const companyResult = await pool.query(
      "SELECT id FROM companies WHERE employer_id = $1",
      [employerId]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy công ty của bạn" 
      });
    }

    const companyId = companyResult.rows[0].id;

    // Kiểm tra job có thuộc về employer này không
    const checkResult = await pool.query(
      "SELECT id, status FROM jobs WHERE id = $1 AND company_id = $2",
      [jobId, companyId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Không tìm thấy tin tuyển dụng hoặc không có quyền" 
      });
    }

    const job = checkResult.rows[0];

    if (job.status === 'open' || job.status === 'active') {
      return res.status(400).json({
        success: false,
        message: "Tin tuyển dụng đang mở"
      });
    }

    // Mở lại tin tuyển dụng
    await pool.query(
      "UPDATE jobs SET status = $1, updated_at = NOW() WHERE id = $2",
      ['open', jobId]
    );

    res.json({ 
      success: true, 
      message: "Đã mở lại tin tuyển dụng thành công" 
    });

  } catch (error) {
    console.error("❌ Reopen job error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi hệ thống khi mở lại tin tuyển dụng",
      error: error.message
    });
  }
};
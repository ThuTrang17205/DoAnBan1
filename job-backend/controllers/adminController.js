/**
 * Admin Controller
 * Handles all admin-related operations
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');



 // ==================== Admin MANAGEMENT ====================
/**
 * Admin Login
 * @route POST /api/admin/login
 * @access Public
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('🔐 Admin login attempt');
    console.log('  Username:', username);
    console.log('  Password:', password ? '✓ provided' : '✗ missing');
    
    // Validate input
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu'
      });
    }

    const mockAdmin = {
      id: 1,
      username: 'admin',
      password: '$2b$10$rBV2uLZEPvKZ3Z1Z1Z1Z1O', 
      email: 'admin@jobportal.com',
      role: 'admin',
      fullName: 'Administrator'
    };

  
    if (username !== mockAdmin.username) {
      console.log(' Admin not found');
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    const isPasswordValid = password === 'admin123';

    if (!isPasswordValid) {
      console.log(' Invalid password');
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    
    const token = jwt.sign(
      { 
        id: mockAdmin.id, 
        username: mockAdmin.username,
        role: mockAdmin.role 
      },
      process.env.JWT_SECRET || 'your-secret-key-here',
      { expiresIn: '7d' }
    );

    console.log(' Login successful');
    console.log('  Token:', token.substring(0, 20) + '...');

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      admin: {
        id: mockAdmin.id,
        username: mockAdmin.username,
        email: mockAdmin.email,
        role: mockAdmin.role,
        fullName: mockAdmin.fullName
      }
    });

  } catch (error) {
    console.error(' Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi khi đăng nhập'
    });
  }
};

/**
 * Get Dashboard Statistics
 * @route GET /api/admin/stats
 * @access Private (Admin)
 */
exports.getStats = async (req, res) => {
  try {
    const stats = {
      totalUsers: 0,
      totalEmployers: 0,
      totalJobs: 0,
      totalApplications: 0,
      activeJobs: 0,
      pendingApplications: 0,
      topCategories: [],
      recentJobs: [],
      jobsByMonth: []
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê'
    });
  }
};

/**
 * Get dashboard statistics
 * @route GET /api/admin/dashboard/stats
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const pool = require('../config/db');

    
    const usersQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month') as this_month,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' 
                         AND created_at < NOW() - INTERVAL '1 month') as last_month
      FROM users
      WHERE role = 'user'
    `;
    const usersResult = await pool.query(usersQuery);
    const users = usersResult.rows[0];
    const usersGrowth = users.last_month > 0 
      ? ((users.this_month - users.last_month) / users.last_month * 100).toFixed(0)
      : 0;

   
    const employersQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 month') as this_month,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '2 month' 
                         AND created_at < NOW() - INTERVAL '1 month') as last_month
      FROM users
      WHERE role = 'employer'
    `;
    const employersResult = await pool.query(employersQuery);
    const employers = employersResult.rows[0];
    const employersGrowth = employers.last_month > 0 
      ? ((employers.this_month - employers.last_month) / employers.last_month * 100).toFixed(0)
      : 0;

    
    const jobsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE posted_at >= NOW() - INTERVAL '1 month') as this_month,
        COUNT(*) FILTER (WHERE posted_at >= NOW() - INTERVAL '2 month' 
                         AND posted_at < NOW() - INTERVAL '1 month') as last_month
      FROM jobs
      WHERE status = 'open'
    `;
    const jobsResult = await pool.query(jobsQuery);
    const jobs = jobsResult.rows[0];
    const jobsGrowth = jobs.last_month > 0 
      ? ((jobs.this_month - jobs.last_month) / jobs.last_month * 100).toFixed(0)
      : 0;

   
    const applicationsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE ngay_ung_tuyen >= NOW() - INTERVAL '1 month') as this_month,
        COUNT(*) FILTER (WHERE ngay_ung_tuyen >= NOW() - INTERVAL '2 month' 
                         AND ngay_ung_tuyen < NOW() - INTERVAL '1 month') as last_month
      FROM applications
    `;
    const applicationsResult = await pool.query(applicationsQuery);
    const applications = applicationsResult.rows[0];
    const applicationsGrowth = applications.last_month > 0 
      ? ((applications.this_month - applications.last_month) / applications.last_month * 100).toFixed(0)
      : 0;

    console.log(' Dashboard stats:', {
      users: users.total,
      employers: employers.total,
      jobs: jobs.total,
      applications: applications.total
    });

    res.json({
      success: true,
      data: {
        totalUsers: parseInt(users.total),
        usersGrowth: parseInt(usersGrowth),
        totalEmployers: parseInt(employers.total),
        employersGrowth: parseInt(employersGrowth),
        totalJobs: parseInt(jobs.total),
        jobsGrowth: parseInt(jobsGrowth),
        totalApplications: parseInt(applications.total),
        applicationsGrowth: parseInt(applicationsGrowth)
      }
    });

  } catch (error) {
    console.error(' Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thống kê',
      error: error.message
    });
  }
};

/**
 * Add job
 * @route PUT /api/admin/jobs/:id
 */
exports.createJob = async (req, res) => {
  try {
    const {
      title,
      company,
      company_name,
      location,
      min_salary,
      max_salary,
      currency,
      salary,
      category,
      job_type,
      experience,
      description,
      requirements,
      benefits,
      url,
      original_url,
      source,
      deadline,
      status
    } = req.body;

    console.log(' Creating new job');
    console.log(' Job data:', req.body);

    const pool = require('../config/db');

    const query = `
      INSERT INTO jobs (
        title,
        company,
        company_name,
        location,
        min_salary,
        max_salary,
        currency,
        salary,
        category,
        job_type,
        experience,
        description,
        requirements,
        benefits,
        url,
        original_url,
        source,
        deadline,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const values = [
      title,
      company,
      company_name || null,
      location,
      min_salary || null,
      max_salary || null,
      currency || 'VND',
      salary || null,
      category || null,
      job_type || null,
      experience || null,
      description || null,
      requirements || null,
      benefits || null,
      url || null,
      original_url || null,
      source || null,
      deadline || null,
      status || 'open'
    ];

    console.log(' Executing query with values:', values);

    const result = await pool.query(query, values);

    console.log(' Query result:', result.rows);

    res.status(201).json({
      success: true,
      message: 'Tạo công việc thành công',
      data: result.rows[0]
    });

  } catch (error) {
    console.error(' Error creating job:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo công việc',
      error: error.message
    });
  }
};


/**
 * Update job
 * @route PUT /api/admin/jobs/:id
 */
exports.updateJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const {
      title,
      company_name,
      location,
      job_type,
      experience,
      category,
      min_salary,
      max_salary,
      description,
      status
    } = req.body;

    console.log(' Updating job:', jobId);
    console.log(' Update data:', req.body);

    const pool = require('../config/db');

    
    const query = `
      UPDATE jobs 
      SET 
        title = $1,
        company_name = $2,
        location = $3,
        job_type = $4,
        experience = $5,
        category = $6,
        min_salary = $7,
        max_salary = $8,
        description = $9,
        status = $10
      WHERE id = $11
      RETURNING *
    `;

    const values = [
      title,
      company_name,
      location,
      job_type,
      experience,
      category,
      min_salary || null,
      max_salary || null,
      description,
      status,
      jobId
    ];

    console.log(' Executing query with values:', values);

    const result = await pool.query(query, values);

    console.log(' Query result:', result.rows);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật công việc thành công',
      data: result.rows[0]
    });

  } catch (error) {
    console.error(' Error updating job:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật công việc',
      error: error.message
    });
  }
};

/**
 * Get job by ID
 * @route GET /api/admin/jobs/:id
 */
exports.getJobById = async (req, res) => {
  try {
    const Job = require('../models/Job');
    const job = await Job.findById(req.params.id).populate('employer', 'companyName email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công việc'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error(' Error getting job:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin công việc',
      error: error.message
    });
  }
};

// ==================== USER MANAGEMENT ====================

/**
 * Get all users
 * @route GET /api/admin/users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const pool = require('../config/db');
    const { page = 1, limit = 10, search = '', role = '' } = req.query;
    const offset = (page - 1) * limit;

    
    let whereClause = '';
    const queryParams = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` WHERE (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR username ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    if (role) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ` role = $${paramIndex}`;
      queryParams.push(role);
      paramIndex++;
    }

    
    const countQuery = `SELECT COUNT(*) FROM users${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    
    const query = `
      SELECT 
        id, 
        username, 
        name, 
        email, 
        role, 
        phone,
        company_name,
        contact_person,
        company_size,
        industry,
        created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    queryParams.push(limit, offset);
    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error(' Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách users',
      error: error.message
    });
  }
};

/**
 * Get user by ID
 * @route GET /api/admin/users/:id
 */
exports.getUserById = async (req, res) => {
  try {
    const pool = require('../config/db');
    const userId = req.params.id;

    const query = `
      SELECT 
        id, 
        username, 
        name, 
        email, 
        role, 
        phone,
        company_name,
        contact_person,
        company_size,
        industry,
        google_id,
        created_at
      FROM users
      WHERE id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error(' Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin user',
      error: error.message
    });
  }
};

/**
 * Delete user
 * @route DELETE /api/admin/users/:id
 */
exports.deleteUser = async (req, res) => {
  try {
    const pool = require('../config/db');
    const userId = req.params.id;

    
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản của chính bạn'
      });
    }

    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy user'
      });
    }

    res.json({
      success: true,
      message: 'Xóa user thành công'
    });

  } catch (error) {
    console.error(' Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa user',
      error: error.message
    });
  }
};

/**
 * Toggle user status (block/unblock)
 * @route PUT /api/admin/users/:id/toggle-status
 */
exports.toggleUserStatus = async (req, res) => {
  try {
    const pool = require('../config/db');
    const userId = req.params.id;


    res.json({
      success: true,
      message: 'Tính năng này yêu cầu thêm cột "status" vào bảng users',
      note: 'Chạy: ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT \'active\';'
    });

  } catch (error) {
    console.error(' Error toggling user status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thay đổi trạng thái user',
      error: error.message
    });
  }
};

// ==================== EMPLOYER MANAGEMENT ====================

/**
 * Get All Employers
 */
exports.getAllEmployers = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    res.json({
      success: true,
      data: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách nhà tuyển dụng'
    });
  }
};

/**
 * Get Employer By ID
 */
exports.getEmployerById = async (req, res) => {
  try {
    res.json({
      success: true,
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin nhà tuyển dụng'
    });
  }
};

/**
 * Delete Employer
 */
exports.deleteEmployer = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Xóa nhà tuyển dụng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa nhà tuyển dụng'
    });
  }
};

/**
 * Verify Employer
 */
exports.verifyEmployer = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Xác thực nhà tuyển dụng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xác thực nhà tuyển dụng'
    });
  }
};

/**
 * Toggle Employer Status
 */
exports.toggleEmployerStatus = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Cập nhật trạng thái nhà tuyển dụng thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái'
    });
  }
};

// ==================== JOB MANAGEMENT ====================

/**
 * Get All Jobs
 */
exports.getAllJobs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    res.json({
      success: true,
      data: [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: 0,
        pages: 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách công việc'
    });
  }
};

/**
 * Delete Job
 */
exports.deleteJob = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Xóa công việc thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể xóa công việc'
    });
  }
};

/**
 * Toggle Job Featured Status
 */
exports.toggleJobFeatured = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Cập nhật trạng thái nổi bật thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Không thể cập nhật trạng thái'
    });
  }
};

// ==================== APPLICATION MANAGEMENT ====================

/**
 * Get All Applications
 */
/**
 * Get all applications
 * @route GET /api/admin/applications
 */
exports.getAllApplications = async (req, res) => {
  try {
    const pool = require('../config/db');
    const { page = 1, limit = 10, status = '', search = '' } = req.query;
    const offset = (page - 1) * limit;

    // Build WHERE clause
    let whereClause = '';
    const queryParams = [];
    let paramIndex = 1;

    if (status) {
      whereClause = ` WHERE a.status = $${paramIndex}`;
      queryParams.push(status);
      paramIndex++;
    }

    if (search) {
      whereClause += whereClause ? ' AND' : ' WHERE';
      whereClause += ` (u.name ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR j.title ILIKE $${paramIndex})`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count
    const countQuery = `
      SELECT COUNT(*) 
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN jobs j ON a.job_id = j.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].count);

    // Get applications with user and job info
    const query = `
      SELECT 
        a.id,
        a.user_id,
        a.job_id,
        a.status,
        a.ngay_ung_tuyen,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        j.title as job_title,
        j.company_name,
        j.location
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN jobs j ON a.job_id = j.id
      ${whereClause}
      ORDER BY a.ngay_ung_tuyen DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);
    const result = await pool.query(query, queryParams);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error(' Error getting applications:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách applications',
      error: error.message
    });
  }
};

/**
 * Get application by ID
 * @route GET /api/admin/applications/:id
 */
exports.getApplicationById = async (req, res) => {
  try {
    const pool = require('../config/db');
    const applicationId = req.params.id;

    const query = `
      SELECT 
        a.id,
        a.user_id,
        a.job_id,
        a.status,
        a.ngay_ung_tuyen,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        u.username,
        j.title as job_title,
        j.company_name,
        j.location,
        j.job_type,
        j.experience,
        j.category,
        j.min_salary,
        j.max_salary,
        j.description
      FROM applications a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN jobs j ON a.job_id = j.id
      WHERE a.id = $1
    `;

    const result = await pool.query(query, [applicationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy application'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    console.error(' Error getting application:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin application',
      error: error.message
    });
  }
};

/**
 * Update application status
 * @route PUT /api/admin/applications/:id/status
 */
exports.updateApplicationStatus = async (req, res) => {
  try {
    const pool = require('../config/db');
    const applicationId = req.params.id;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Trạng thái không hợp lệ. Chỉ chấp nhận: pending, reviewed, accepted, rejected'
      });
    }

    const query = `
      UPDATE applications 
      SET status = $1
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, applicationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy application'
      });
    }

    res.json({
      success: true,
      message: 'Cập nhật trạng thái thành công',
      data: result.rows[0]
    });

  } catch (error) {
    console.error(' Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái',
      error: error.message
    });
  }
};

/**
 * Delete application
 * @route DELETE /api/admin/applications/:id
 */
exports.deleteApplication = async (req, res) => {
  try {
    const pool = require('../config/db');
    const applicationId = req.params.id;

    const query = 'DELETE FROM applications WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [applicationId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy application'
      });
    }

    res.json({
      success: true,
      message: 'Xóa application thành công'
    });

  } catch (error) {
    console.error(' Error deleting application:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa application',
      error: error.message
    });
  }
};
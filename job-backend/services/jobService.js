/**
 * Job Service
 * Handles job business logic
 */

const pool = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

/**
 * Create new job
 */
const createJob = async (jobData) => {
  const {
    title,
    company,
    company_id,
    company_name,
    location,
    salary,
    min_salary,
    max_salary,
    currency,
    category,
    job_type,
    description,
    requirements,
    benefits,
    url,
    source,
    posted_at,
    original_url,
    deadline,
    experience
  } = jobData;

  const query = `
    INSERT INTO jobs (
      title, company, company_id, company_name,
      location, salary, min_salary, max_salary, currency,
      category, job_type, description, requirements, benefits,
      url, source, posted_at, original_url,
      deadline, experience, status
    )
    VALUES (
      $1,$2,$3,$4,
      $5,$6,$7,$8,$9,
      $10,$11,$12,$13,$14,
      $15,$16,$17,$18,
      $19,$20,'active'
    )
    RETURNING *
  `;

  const values = [
    title, company, company_id, company_name,
    location, salary, min_salary, max_salary, currency,
    category, job_type, description, requirements, benefits,
    url, source, posted_at, original_url,
    deadline, experience
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};


/**
 * Get all jobs with filters and pagination
 */
const getAllJobs = async (filters = {}, pagination = {}) => {
  const {
    category,
    location,
    jobType,
    salaryMin,
    salaryMax,
    search,
    status = 'active',
    isFeatured
  } = filters;

  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;

  let whereConditions = ['1=1'];
  let values = [];
  let valueIndex = 1;

  
  if (status) {
    whereConditions.push(`status = $${valueIndex}`);
    values.push(status);
    valueIndex++;
  }

  
  if (category) {
    whereConditions.push(`category = $${valueIndex}`);
    values.push(category);
    valueIndex++;
  }

  
  if (location) {
    whereConditions.push(`location ILIKE $${valueIndex}`);
    values.push(`%${location}%`);
    valueIndex++;
  }

  
  if (jobType) {
    whereConditions.push(`job_type = $${valueIndex}`);
    values.push(jobType);
    valueIndex++;
  }

  
  if (salaryMin) {
    whereConditions.push(`(min_salary >= $${valueIndex} OR salary >= $${valueIndex})`);
    values.push(salaryMin);
    valueIndex++;
  }

  if (salaryMax) {
    whereConditions.push(`(max_salary <= $${valueIndex} OR salary <= $${valueIndex})`);
    values.push(salaryMax);
    valueIndex++;
  }

  
  if (isFeatured !== undefined) {
    whereConditions.push(`is_featured = $${valueIndex}`);
    values.push(isFeatured);
    valueIndex++;
  }

  
  if (search) {
    whereConditions.push(
      `(title ILIKE $${valueIndex} OR description ILIKE $${valueIndex} OR company ILIKE $${valueIndex})`
    );
    values.push(`%${search}%`);
    valueIndex++;
  }

  
  whereConditions.push(`expires_at > NOW()`);

  const whereClause = whereConditions.join(' AND ');

  
  const countQuery = `SELECT COUNT(*) FROM jobs WHERE ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  
  const query = `
    SELECT 
      j.*,
      e.company_name as employer_name,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
    FROM jobs j
    LEFT JOIN employers e ON j.employer_id = e.id
    WHERE ${whereClause}
    ORDER BY j.is_featured DESC, j.created_at DESC
    LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
  `;

  values.push(limit, offset);
  const result = await pool.query(query, values);

  return {
    jobs: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
};

/**
 * Get job by ID
 */
const getJobById = async (jobId) => {
  const query = `
    SELECT 
      j.*,
      e.company_name,
      e.address as company_address,
      e.website as company_website,
      e.description as company_description,
      u.email as employer_email,
      u.phone as employer_phone,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
    FROM jobs j
    LEFT JOIN employers e ON j.employer_id = e.id
    LEFT JOIN users u ON e.user_id = u.id
    WHERE j.id = $1
  `;

  const result = await pool.query(query, [jobId]);

  if (result.rows.length === 0) {
    throw new AppError('Công việc không tồn tại', 404);
  }

  
  await pool.query(
    'UPDATE jobs SET view_count = view_count + 1 WHERE id = $1',
    [jobId]
  );

  return result.rows[0];
};

/**
 * Update job
 */
const updateJob = async (jobId, jobData, employerId) => {
  
  const checkQuery = 'SELECT employer_id FROM jobs WHERE id = $1';
  const checkResult = await pool.query(checkQuery, [jobId]);

  if (checkResult.rows.length === 0) {
    throw new AppError('Công việc không tồn tại', 404);
  }

  if (checkResult.rows[0].employer_id !== employerId) {
    throw new AppError('Bạn không có quyền chỉnh sửa công việc này', 403);
  }

  
  const fields = [];
  const values = [];
  let valueIndex = 1;

  const allowedFields = [
    'title', 'company', 'location', 'salary', 'min_salary', 'max_salary',
    'job_type', 'category', 'description', 'requirements', 'benefits',
    'skills', 'experience_level', 'education_level', 'number_of_positions',
    'expires_at'
  ];

  for (const field of allowedFields) {
    if (jobData[field] !== undefined) {
      fields.push(`${field} = $${valueIndex}`);
      values.push(jobData[field]);
      valueIndex++;
    }
  }

  if (fields.length === 0) {
    throw new AppError('Không có dữ liệu để cập nhật', 400);
  }

  fields.push(`updated_at = NOW()`);
  values.push(jobId);

  const query = `
    UPDATE jobs 
    SET ${fields.join(', ')}
    WHERE id = $${valueIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete job
 */
const deleteJob = async (jobId, employerId, isAdmin = false) => {
  
  const checkQuery = 'SELECT employer_id FROM jobs WHERE id = $1';
  const checkResult = await pool.query(checkQuery, [jobId]);

  if (checkResult.rows.length === 0) {
    throw new AppError('Công việc không tồn tại', 404);
  }

  if (!isAdmin && checkResult.rows[0].employer_id !== employerId) {
    throw new AppError('Bạn không có quyền xóa công việc này', 403);
  }

  
  const query = `
    UPDATE jobs 
    SET status = 'deleted', updated_at = NOW()
    WHERE id = $1
    RETURNING id
  `;

  await pool.query(query, [jobId]);

  return { message: 'Xóa công việc thành công' };
};

/**
 * Get jobs by employer
 */
const getJobsByEmployer = async (employerId, filters = {}, pagination = {}) => {
  const { status, page = 1, limit = 10 } = { ...filters, ...pagination };
  const offset = (page - 1) * limit;

  let whereClause = 'employer_id = $1';
  const values = [employerId];

  if (status) {
    whereClause += ' AND status = $2';
    values.push(status);
  }

  
  const countQuery = `SELECT COUNT(*) FROM jobs WHERE ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  
  const query = `
    SELECT 
      j.*,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
    FROM jobs j
    WHERE ${whereClause}
    ORDER BY j.created_at DESC
    LIMIT $${values.length + 1} OFFSET $${values.length + 2}
  `;

  values.push(limit, offset);
  const result = await pool.query(query, values);

  return {
    jobs: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get featured jobs
 */
const getFeaturedJobs = async (limit = 6) => {
  const query = `
    SELECT 
      j.*,
      e.company_name,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
    FROM jobs j
    LEFT JOIN employers e ON j.employer_id = e.id
    WHERE j.is_featured = true 
      AND j.status = 'active' 
      AND j.expires_at > NOW()
    ORDER BY j.created_at DESC
    LIMIT $1
  `;

  const result = await pool.query(query, [limit]);
  return result.rows;
};

/**
 * Get trending jobs (most viewed/applied)
 */
const getTrendingJobs = async (limit = 10) => {
  const query = `
    SELECT 
      j.*,
      e.company_name,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
    FROM jobs j
    LEFT JOIN employers e ON j.employer_id = e.id
    WHERE j.status = 'active' AND j.expires_at > NOW()
    ORDER BY j.view_count DESC, application_count DESC
    LIMIT $1
  `;

  const result = await pool.query(query, [limit]);
  return result.rows;
};

/**
 * Get latest jobs
 */
const getLatestJobs = async (limit = 10) => {
  const query = `
    SELECT 
      j.*,
      e.company_name,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
    FROM jobs j
    LEFT JOIN employers e ON j.employer_id = e.id
    WHERE j.status = 'active' AND j.expires_at > NOW()
    ORDER BY j.created_at DESC
    LIMIT $1
  `;

  const result = await pool.query(query, [limit]);
  return result.rows;
};

/**
 * Get jobs by category
 */
const getJobsByCategory = async (category, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;

  
  const countQuery = `
    SELECT COUNT(*) FROM jobs 
    WHERE category = $1 AND status = 'active' AND expires_at > NOW()
  `;
  const countResult = await pool.query(countQuery, [category]);
  const total = parseInt(countResult.rows[0].count);

  
  const query = `
    SELECT 
      j.*,
      e.company_name,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
    FROM jobs j
    LEFT JOIN employers e ON j.employer_id = e.id
    WHERE j.category = $1 AND j.status = 'active' AND j.expires_at > NOW()
    ORDER BY j.is_featured DESC, j.created_at DESC
    LIMIT $2 OFFSET $3
  `;

  const result = await pool.query(query, [category, limit, offset]);

  return {
    jobs: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Search jobs
 */
const searchJobs = async (searchTerm, filters = {}, pagination = {}) => {
  return getAllJobs({ ...filters, search: searchTerm }, pagination);
};

/**
 * Toggle job featured status (Admin only)
 */
const toggleFeatured = async (jobId, isFeatured) => {
  const query = `
    UPDATE jobs 
    SET is_featured = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [isFeatured, jobId]);

  if (result.rows.length === 0) {
    throw new AppError('Công việc không tồn tại', 404);
  }

  return result.rows[0];
};

/**
 * Change job status (Admin only)
 */
const changeJobStatus = async (jobId, status) => {
  const validStatuses = ['active', 'inactive', 'expired', 'deleted'];
  
  if (!validStatuses.includes(status)) {
    throw new AppError('Trạng thái không hợp lệ', 400);
  }

  const query = `
    UPDATE jobs 
    SET status = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;

  const result = await pool.query(query, [status, jobId]);

  if (result.rows.length === 0) {
    throw new AppError('Công việc không tồn tại', 404);
  }

  return result.rows[0];
};

/**
 * Get job statistics
 */
const getJobStatistics = async () => {
  const query = `
    SELECT 
      COUNT(*) as total_jobs,
      COUNT(*) FILTER (WHERE status = 'active') as active_jobs,
      COUNT(*) FILTER (WHERE status = 'expired') as expired_jobs,
      COUNT(*) FILTER (WHERE is_featured = true) as featured_jobs,
      COUNT(DISTINCT category) as total_categories,
      COUNT(DISTINCT employer_id) as total_employers_with_jobs
    FROM jobs
  `;

  const result = await pool.query(query);
  return result.rows[0];
};

/**
 * Get jobs expiring soon
 */
const getExpiringJobs = async (days = 7) => {
  const query = `
    SELECT 
      j.*,
      e.company_name,
      u.email as employer_email
    FROM jobs j
    LEFT JOIN employers e ON j.employer_id = e.id
    LEFT JOIN users u ON e.user_id = u.id
    WHERE j.status = 'active' 
      AND j.expires_at > NOW() 
      AND j.expires_at <= NOW() + INTERVAL '${days} days'
    ORDER BY j.expires_at ASC
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Expire old jobs (run as cron job)
 */
const expireOldJobs = async () => {
  const query = `
    UPDATE jobs 
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'active' AND expires_at <= NOW()
    RETURNING id, title
  `;

  const result = await pool.query(query);
  
  return {
    expiredCount: result.rowCount,
    expiredJobs: result.rows
  };
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobsByEmployer,
  getFeaturedJobs,
  getTrendingJobs,
  getLatestJobs, 
  getJobsByCategory,
  searchJobs,
  toggleFeatured,
  changeJobStatus,
  getJobStatistics,
  getExpiringJobs,
  expireOldJobs
};
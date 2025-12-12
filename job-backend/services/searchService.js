/**
 * Search Service
 * Handles search and filter logic for jobs and other entities
 */

const pool = require('../config/db');

/**
 * Build search query with filters
 */
const buildSearchQuery = (baseQuery, filters = {}, params = []) => {
  let query = baseQuery;
  let whereConditions = [];
  let values = [...params];
  let valueIndex = values.length + 1;

  // Search keyword (search in title, description, company)
  if (filters.search) {
    whereConditions.push(`(
      title ILIKE $${valueIndex} OR 
      description ILIKE $${valueIndex} OR 
      company ILIKE $${valueIndex} OR
      requirements ILIKE $${valueIndex}
    )`);
    values.push(`%${filters.search}%`);
    valueIndex++;
  }

  // Category filter
  if (filters.category) {
    whereConditions.push(`category = $${valueIndex}`);
    values.push(filters.category);
    valueIndex++;
  }

  // Location filter
  if (filters.location) {
    whereConditions.push(`location ILIKE $${valueIndex}`);
    values.push(`%${filters.location}%`);
    valueIndex++;
  }

  // Job type filter (full-time, part-time, etc.)
  if (filters.jobType) {
    if (Array.isArray(filters.jobType)) {
      const placeholders = filters.jobType.map((_, i) => `$${valueIndex + i}`).join(', ');
      whereConditions.push(`job_type IN (${placeholders})`);
      values.push(...filters.jobType);
      valueIndex += filters.jobType.length;
    } else {
      whereConditions.push(`job_type = $${valueIndex}`);
      values.push(filters.jobType);
      valueIndex++;
    }
  }

  // Salary range filter
  if (filters.salaryMin) {
    whereConditions.push(`(salary_min >= $${valueIndex} OR salary >= $${valueIndex})`);
    values.push(filters.salaryMin);
    valueIndex++;
  }

  if (filters.salaryMax) {
    whereConditions.push(`(salary_max <= $${valueIndex} OR salary <= $${valueIndex})`);
    values.push(filters.salaryMax);
    valueIndex++;
  }

  // Experience level filter
  if (filters.experienceLevel) {
    if (Array.isArray(filters.experienceLevel)) {
      const placeholders = filters.experienceLevel.map((_, i) => `$${valueIndex + i}`).join(', ');
      whereConditions.push(`experience_level IN (${placeholders})`);
      values.push(...filters.experienceLevel);
      valueIndex += filters.experienceLevel.length;
    } else {
      whereConditions.push(`experience_level = $${valueIndex}`);
      values.push(filters.experienceLevel);
      valueIndex++;
    }
  }

  // Education level filter
  if (filters.educationLevel) {
    whereConditions.push(`education_level = $${valueIndex}`);
    values.push(filters.educationLevel);
    valueIndex++;
  }

  // Status filter
  if (filters.status) {
    whereConditions.push(`status = $${valueIndex}`);
    values.push(filters.status);
    valueIndex++;
  } else {
    // Default: only active jobs
    whereConditions.push(`status = 'active'`);
  }

  // Featured filter
  if (filters.isFeatured !== undefined) {
    whereConditions.push(`is_featured = $${valueIndex}`);
    values.push(filters.isFeatured);
    valueIndex++;
  }

  // Date posted filter (last 24h, 7 days, 30 days)
  if (filters.postedWithin) {
    const days = parseInt(filters.postedWithin);
    whereConditions.push(`created_at >= NOW() - INTERVAL '${days} days'`);
  }

  // Skills filter
  if (filters.skills) {
    const skills = Array.isArray(filters.skills) ? filters.skills : [filters.skills];
    const skillConditions = skills.map(skill => `skills ILIKE '%${skill}%'`);
    whereConditions.push(`(${skillConditions.join(' OR ')})`);
  }

  // Not expired
  whereConditions.push(`expires_at > NOW()`);

  // Combine all conditions
  if (whereConditions.length > 0) {
    query += ` WHERE ${whereConditions.join(' AND ')}`;
  }

  return { query, values, valueIndex };
};

/**
 * Build sort query
 */
const buildSortQuery = (sortBy = 'newest', sortOrder = 'DESC') => {
  const sortMapping = {
    newest: 'created_at DESC',
    oldest: 'created_at ASC',
    salary_high: 'COALESCE(salary_max, salary, 0) DESC',
    salary_low: 'COALESCE(salary_min, salary, 0) ASC',
    title: 'title ASC',
    company: 'company ASC',
    views: 'view_count DESC',
    applications: '(SELECT COUNT(*) FROM applications WHERE job_id = jobs.id) DESC',
    featured: 'is_featured DESC, created_at DESC'
  };

  return sortMapping[sortBy] || sortMapping.newest;
};

/**
 * Search jobs with advanced filters
 */
const searchJobs = async (filters = {}, pagination = {}) => {
  const { page = 1, limit = 10, sortBy = 'newest' } = pagination;
  const offset = (page - 1) * limit;

  // Build query
  const baseQuery = `
    SELECT 
      j.*,
      e.company_name as employer_name,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
    FROM jobs j
    LEFT JOIN employers e ON j.employer_id = e.id
  `;

  const { query: whereQuery, values } = buildSearchQuery(baseQuery, filters);
  const sortQuery = buildSortQuery(sortBy);

  // Count total
  const countQuery = `SELECT COUNT(*) FROM jobs j WHERE 1=1 ${whereQuery.split('WHERE')[1] || ''}`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  // Get jobs
  const finalQuery = `${whereQuery} ORDER BY ${sortQuery} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
  values.push(limit, offset);
  
  const result = await pool.query(finalQuery, values);

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
 * Get autocomplete suggestions
 */
const getAutocompleteSuggestions = async (query, type = 'all', limit = 10) => {
  const suggestions = {
    jobs: [],
    companies: [],
    locations: [],
    categories: []
  };

  if (!query || query.length < 2) {
    return suggestions;
  }

  try {
    // Job titles
    if (type === 'all' || type === 'jobs') {
      const jobQuery = `
        SELECT DISTINCT title, COUNT(*) as count
        FROM jobs
        WHERE title ILIKE $1 AND status = 'active'
        GROUP BY title
        ORDER BY count DESC
        LIMIT $2
      `;
      const jobResult = await pool.query(jobQuery, [`%${query}%`, limit]);
      suggestions.jobs = jobResult.rows.map(r => r.title);
    }

    // Companies
    if (type === 'all' || type === 'companies') {
      const companyQuery = `
        SELECT DISTINCT company, COUNT(*) as count
        FROM jobs
        WHERE company ILIKE $1 AND status = 'active'
        GROUP BY company
        ORDER BY count DESC
        LIMIT $2
      `;
      const companyResult = await pool.query(companyQuery, [`%${query}%`, limit]);
      suggestions.companies = companyResult.rows.map(r => r.company);
    }

    // Locations
    if (type === 'all' || type === 'locations') {
      const locationQuery = `
        SELECT DISTINCT location, COUNT(*) as count
        FROM jobs
        WHERE location ILIKE $1 AND status = 'active'
        GROUP BY location
        ORDER BY count DESC
        LIMIT $2
      `;
      const locationResult = await pool.query(locationQuery, [`%${query}%`, limit]);
      suggestions.locations = locationResult.rows.map(r => r.location);
    }

    // Categories
    if (type === 'all' || type === 'categories') {
      const categoryQuery = `
        SELECT DISTINCT category, COUNT(*) as count
        FROM jobs
        WHERE category ILIKE $1 AND status = 'active'
        GROUP BY category
        ORDER BY count DESC
        LIMIT $2
      `;
      const categoryResult = await pool.query(categoryQuery, [`%${query}%`, limit]);
      suggestions.categories = categoryResult.rows.map(r => r.category);
    }

    return suggestions;
  } catch (error) {
    console.error('Error getting autocomplete suggestions:', error);
    return suggestions;
  }
};

/**
 * Get popular search terms
 */
const getPopularSearches = async (limit = 10) => {
  try {
    // This would typically come from a search_history table
    // For now, return most common job titles
    const query = `
      SELECT title, COUNT(*) as search_count
      FROM jobs
      WHERE status = 'active'
      GROUP BY title
      ORDER BY search_count DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    return result.rows.map(r => r.title);
  } catch (error) {
    console.error('Error getting popular searches:', error);
    return [];
  }
};

/**
 * Get similar jobs (based on category, location, skills)
 */
const getSimilarJobs = async (jobId, limit = 6) => {
  try {
    // Get original job details
    const jobQuery = 'SELECT * FROM jobs WHERE id = $1';
    const jobResult = await pool.query(jobQuery, [jobId]);
    
    if (jobResult.rows.length === 0) {
      return [];
    }

    const job = jobResult.rows[0];

    // Find similar jobs
    const similarQuery = `
      SELECT 
        j.*,
        e.company_name,
        (
          CASE 
            WHEN j.category = $2 THEN 3
            ELSE 0
          END +
          CASE 
            WHEN j.location = $3 THEN 2
            ELSE 0
          END +
          CASE 
            WHEN j.experience_level = $4 THEN 1
            ELSE 0
          END
        ) as similarity_score
      FROM jobs j
      LEFT JOIN employers e ON j.employer_id = e.id
      WHERE j.id != $1 
        AND j.status = 'active' 
        AND j.expires_at > NOW()
      ORDER BY similarity_score DESC, j.created_at DESC
      LIMIT $5
    `;

    const result = await pool.query(similarQuery, [
      jobId,
      job.category,
      job.location,
      job.experience_level,
      limit
    ]);

    return result.rows;
  } catch (error) {
    console.error('Error getting similar jobs:', error);
    return [];
  }
};

/**
 * Get job recommendations for user (based on profile, skills, saved jobs)
 */
const getJobRecommendations = async (userId, limit = 10) => {
  try {
    // Get user profile and preferences
    const userQuery = `
      SELECT up.*, u.email
      FROM user_profiles up
      JOIN users u ON up.user_id = u.id
      WHERE up.user_id = $1
    `;
    const userResult = await pool.query(userQuery, [userId]);
    
    if (userResult.rows.length === 0) {
      // Return popular jobs if no profile
      return await getPopularJobs(limit);
    }

    const profile = userResult.rows[0];

    // Get user's saved jobs and applications to understand preferences
    const preferencesQuery = `
      SELECT DISTINCT j.category, j.location, j.job_type
      FROM jobs j
      LEFT JOIN saved_jobs sj ON j.id = sj.job_id
      LEFT JOIN applications a ON j.id = a.job_id
      WHERE sj.user_id = $1 OR a.user_id = $1
      LIMIT 20
    `;
    const preferencesResult = await pool.query(preferencesQuery, [userId]);

    // Build recommendation query based on user profile
    const recommendQuery = `
      SELECT DISTINCT
        j.*,
        e.company_name,
        (
          CASE WHEN j.category = ANY($2::text[]) THEN 3 ELSE 0 END +
          CASE WHEN j.location = ANY($3::text[]) THEN 2 ELSE 0 END +
          CASE WHEN j.job_type = ANY($4::text[]) THEN 1 ELSE 0 END
        ) as relevance_score
      FROM jobs j
      LEFT JOIN employers e ON j.employer_id = e.id
      WHERE j.status = 'active' 
        AND j.expires_at > NOW()
        AND j.id NOT IN (
          SELECT job_id FROM applications WHERE user_id = $1
        )
      ORDER BY relevance_score DESC, j.created_at DESC
      LIMIT $5
    `;

    const categories = preferencesResult.rows.map(r => r.category).filter(Boolean);
    const locations = preferencesResult.rows.map(r => r.location).filter(Boolean);
    const jobTypes = preferencesResult.rows.map(r => r.job_type).filter(Boolean);

    const result = await pool.query(recommendQuery, [
      userId,
      categories.length > 0 ? categories : [profile.preferred_category || ''],
      locations.length > 0 ? locations : [profile.preferred_location || ''],
      jobTypes.length > 0 ? jobTypes : ['full-time'],
      limit
    ]);

    return result.rows;
  } catch (error) {
    console.error('Error getting job recommendations:', error);
    return [];
  }
};

/**
 * Get popular jobs (most viewed/applied)
 */
const getPopularJobs = async (limit = 10) => {
  try {
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
  } catch (error) {
    console.error('Error getting popular jobs:', error);
    return [];
  }
};

/**
 * Advanced filter: Get jobs by multiple criteria with OR logic
 */
const getJobsByMultipleCriteria = async (criteriaGroups, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;

  // Build OR conditions for each criteria group
  const orConditions = criteriaGroups.map((group, index) => {
    const conditions = [];
    
    if (group.category) conditions.push(`category = '${group.category}'`);
    if (group.location) conditions.push(`location ILIKE '%${group.location}%'`);
    if (group.jobType) conditions.push(`job_type = '${group.jobType}'`);
    
    return `(${conditions.join(' AND ')})`;
  });

  const query = `
    SELECT 
      j.*,
      e.company_name,
      (SELECT COUNT(*) FROM applications WHERE job_id = j.id) as application_count
    FROM jobs j
    LEFT JOIN employers e ON j.employer_id = e.id
    WHERE (${orConditions.join(' OR ')})
      AND j.status = 'active'
      AND j.expires_at > NOW()
    ORDER BY j.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await pool.query(query, [limit, offset]);
  return result.rows;
};

/**
 * Search employers
 */
const searchEmployers = async (searchTerm, filters = {}, pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;

  let whereConditions = ['1=1'];
  const values = [];
  let valueIndex = 1;

  // Search in company name, description
  if (searchTerm) {
    whereConditions.push(`(company_name ILIKE $${valueIndex} OR description ILIKE $${valueIndex})`);
    values.push(`%${searchTerm}%`);
    valueIndex++;
  }

  // Verified filter
  if (filters.isVerified !== undefined) {
    whereConditions.push(`is_verified = $${valueIndex}`);
    values.push(filters.isVerified);
    valueIndex++;
  }

  const whereClause = whereConditions.join(' AND ');

  // Count query
  const countQuery = `SELECT COUNT(*) FROM employers WHERE ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = parseInt(countResult.rows[0].count);

  // Main query
  const query = `
    SELECT 
      e.*,
      (SELECT COUNT(*) FROM jobs WHERE employer_id = e.id AND status = 'active') as active_jobs
    FROM employers e
    WHERE ${whereClause}
    ORDER BY e.created_at DESC
    LIMIT $${valueIndex} OFFSET $${valueIndex + 1}
  `;
  
  values.push(limit, offset);
  const result = await pool.query(query, values);

  return {
    employers: result.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  searchJobs,
  getSimilarJobs,
  getJobRecommendations,
  getPopularJobs,
  getAutocompleteSuggestions,
  getPopularSearches,
  getJobsByMultipleCriteria,
  searchEmployers,
  buildSearchQuery,
  buildSortQuery
};
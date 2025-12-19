
const pool = require('../config/db');
const bcrypt = require('bcrypt');

class User {
  /**
   * Tìm tất cả users
   * @param {Object} options - Filter options
   * @returns {Promise<Array>}
   */
  static async findAll(options = {}) {
    try {
      const { role, limit = 100, offset = 0 } = options;
      
      let query = 'SELECT * FROM users WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      if (role) {
        query += ` AND role = $${paramIndex}`;
        params.push(role);
        paramIndex++;
      }
      
      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);
      
      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error(' Error in User.findAll:', error.message);
      throw error;
    }
  }

  /**
   * Tìm user theo ID
   * @param {Number} id - User ID
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(' Error in User.findById:', error.message);
      throw error;
    }
  }

  /**
   * Tìm user theo email
   * @param {String} email - User email
   * @returns {Promise<Object|null>}
   */
  static async findByEmail(email) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(' Error in User.findByEmail:', error.message);
      throw error;
    }
  }

  /**
   * Tìm user theo Google ID
   * @param {String} googleId - Google ID
   * @returns {Promise<Object|null>}
   */
  static async findByGoogleId(googleId) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE google_id = $1',
        [googleId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(' Error in User.findByGoogleId:', error.message);
      throw error;
    }
  }

  /**
   * Tìm user theo username
   * @param {String} username - Username
   * @returns {Promise<Object|null>}
   */
  static async findByUsername(username) {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE username = $1',
        [username]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(' Error in User.findByUsername:', error.message);
      throw error;
    }
  }

  /**
   * Tạo user mới
   * @param {Object} userData - User data
   * @returns {Promise<Object>}
   */
  static async create(userData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const {
        username,
        password,
        email,
        name,
        role = 'user',
        google_id = null,
        company_name = null,
        contact_person = null,
        phone = null,
        company_size = null,
        industry = null
      } = userData;

      
      let hashedPassword = password;
      if (password && !password.startsWith('GOOGLE_USER_')) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      
      const result = await client.query(
        `INSERT INTO users 
         (username, password, email, name, role, google_id, 
          company_name, contact_person, phone, company_size, industry, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
         RETURNING id, username, email, name, role, google_id, 
                   company_name, contact_person, phone, company_size, industry, created_at`,
        [username, hashedPassword, email, name, role, google_id,
         company_name, contact_person, phone, company_size, industry]
      );

      const user = result.rows[0];

      
      if (role === 'user') {
        await client.query(
          `INSERT INTO user_profiles (user_id, ky_nang, kinh_nghiem, hoc_van, cv_file)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.id, '', '', '', null]
        );
      } else if (role === 'employer') {
        await client.query(
          `INSERT INTO employers (user_id, company, description)
           VALUES ($1, $2, $3)`,
          [user.id, company_name || '', '']
        );
      }

      await client.query('COMMIT');
      console.log(' User created:', user.email);
      
      return user;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(' Error in User.create:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Cập nhật user
   * @param {Number} id - User ID
   * @param {Object} updates - Data to update
   * @returns {Promise<Object>}
   */
  static async update(id, updates) {
    try {
      const fields = [];
      const values = [];
      let paramIndex = 1;

      
      const allowedFields = [
        'name', 'email', 'username', 'phone', 
        'company_name', 'contact_person', 'company_size', 'industry',
        'avatar_url', 'google_id'
      ];

      Object.keys(updates).forEach(key => {
        if (allowedFields.includes(key) && updates[key] !== undefined) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      });

      if (fields.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(id);
      
      const query = `
        UPDATE users 
        SET ${fields.join(', ')}
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      console.log(' User updated:', result.rows[0].email);
      return result.rows[0];
    } catch (error) {
      console.error(' Error in User.update:', error.message);
      throw error;
    }
  }

  /**
   * Cập nhật password
   * @param {Number} id - User ID
   * @param {String} newPassword - New password
   * @returns {Promise<Boolean>}
   */
  static async updatePassword(id, newPassword) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, id]
      );
      
      console.log(' Password updated for user ID:', id);
      return true;
    } catch (error) {
      console.error(' Error in User.updatePassword:', error.message);
      throw error;
    }
  }

  /**
   * Xóa user
   * @param {Number} id - User ID
   * @returns {Promise<Boolean>}
   */
  static async delete(id) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      
      await client.query('DELETE FROM user_profiles WHERE user_id = $1', [id]);
      await client.query('DELETE FROM employers WHERE user_id = $1', [id]);
      await client.query('DELETE FROM applications WHERE user_id = $1', [id]);
      await client.query('DELETE FROM saved_jobs WHERE user_id = $1', [id]);
      await client.query('DELETE FROM applied_jobs WHERE user_id = $1', [id]);
      
      
      const employerResult = await client.query(
        'SELECT id FROM employers WHERE user_id = $1',
        [id]
      );
      if (employerResult.rows.length > 0) {
        const employerId = employerResult.rows[0].id;
        await client.query('DELETE FROM jobs WHERE employer_id = $1', [employerId]);
      }
      
      
      await client.query('DELETE FROM users WHERE id = $1', [id]);
      
      await client.query('COMMIT');
      console.log(' User deleted, ID:', id);
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(' Error in User.delete:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verify password
   * @param {String} plainPassword - Plain text password
   * @param {String} hashedPassword - Hashed password from DB
   * @returns {Promise<Boolean>}
   */
  static async verifyPassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error(' Error in User.verifyPassword:', error.message);
      throw error;
    }
  }

  /**
   * Get user with profile
   * @param {Number} id - User ID
   * @returns {Promise<Object|null>}
   */
  static async findByIdWithProfile(id) {
    try {
      const user = await this.findById(id);
      if (!user) return null;

      let profile = null;
      
      if (user.role === 'user') {
        const result = await pool.query(
          'SELECT * FROM user_profiles WHERE user_id = $1',
          [id]
        );
        profile = result.rows[0] || null;
      } else if (user.role === 'employer') {
        const result = await pool.query(
          'SELECT * FROM employers WHERE user_id = $1',
          [id]
        );
        profile = result.rows[0] || null;
      }

      return {
        ...user,
        profile
      };
    } catch (error) {
      console.error(' Error in User.findByIdWithProfile:', error.message);
      throw error;
    }
  }

  /**
   * Update user profile
   * @param {Number} userId - User ID
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>}
   */
  static async updateProfile(userId, profileData) {
    try {
      const user = await this.findById(userId);
      if (!user) throw new Error('User not found');

      if (user.role === 'user') {
        const { ky_nang, kinh_nghiem, hoc_van, cv_file } = profileData;
        
        const result = await pool.query(
          `UPDATE user_profiles 
           SET ky_nang = $1, kinh_nghiem = $2, hoc_van = $3, cv_file = $4
           WHERE user_id = $5
           RETURNING *`,
          [ky_nang, kinh_nghiem, hoc_van, cv_file, userId]
        );
        
        return result.rows[0];
      } else if (user.role === 'employer') {
        const { company, description } = profileData;
        
        const result = await pool.query(
          `UPDATE employers 
           SET company = $1, description = $2
           WHERE user_id = $3
           RETURNING *`,
          [company, description, userId]
        );
        
        return result.rows[0];
      }
    } catch (error) {
      console.error(' Error in User.updateProfile:', error.message);
      throw error;
    }
  }

  /**
   * Count users by role
   * @param {String} role - User role
   * @returns {Promise<Number>}
   */
  static async countByRole(role) {
    try {
      const result = await pool.query(
        'SELECT COUNT(*) FROM users WHERE role = $1',
        [role]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error(' Error in User.countByRole:', error.message);
      throw error;
    }
  }

  /**
   * Search users
   * @param {String} searchTerm - Search term
   * @returns {Promise<Array>}
   */
  static async search(searchTerm) {
    try {
      const result = await pool.query(
        `SELECT id, username, email, name, role, company_name 
         FROM users 
         WHERE name ILIKE $1 OR email ILIKE $1 OR username ILIKE $1
         ORDER BY created_at DESC
         LIMIT 20`,
        [`%${searchTerm}%`]
      );
      return result.rows;
    } catch (error) {
      console.error(' Error in User.search:', error.message);
      throw error;
    }
  }

  

  /**
   * [MATCHING] Lấy candidate profile cho rule-based matching
   * @param {Number} userId - User ID
   * @returns {Promise<Object|null>}
   */
  static async getCandidateForMatching(userId) {
    try {
      const query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u.avatar_url,
          
          -- Profile information
          up.education_level_id,
          up.total_years_experience,
          up.expected_salary_min,
          up.expected_salary_max,
          up.current_location,
          up.preferred_location,
          up.job_type_preference,
          up.willing_to_relocate,
          
          -- CV parsed data
          cpd.skills as parsed_skills,
          cpd.total_experience_years as cv_experience,
          cpd.education_level as cv_education,
          cpd.current_position,
          cpd.languages,
          
          -- Skills aggregation
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'skill_id', cs.skill_id,
                'skill_name', sm.name,
                'category', sm.category,
                'proficiency_level', cs.proficiency_level,
                'years_experience', cs.years_experience
              )
            ) FILTER (WHERE cs.skill_id IS NOT NULL),
            '[]'::json
          ) as skills,
          
          -- Work experience aggregation
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'position', we.position,
                'company', we.company,
                'start_date', we.start_date,
                'end_date', we.end_date,
                'is_current', we.is_current,
                'description', we.description
              ) ORDER BY we.start_date DESC
            ) FILTER (WHERE we.id IS NOT NULL),
            '[]'::json
          ) as work_experience,
          
          -- Education aggregation
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'degree', e.degree,
                'institution', e.institution,
                'field_of_study', e.field_of_study,
                'start_date', e.start_date,
                'end_date', e.end_date,
                'gpa', e.gpa
              ) ORDER BY e.start_date DESC
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::json
          ) as education
          
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN cv_parsed_data cpd ON u.id = cpd.user_id
        LEFT JOIN candidate_skills cs ON u.id = cs.user_id
        LEFT JOIN skills_master sm ON cs.skill_id = sm.id
        LEFT JOIN work_experience we ON u.id = we.user_id
        LEFT JOIN education e ON u.id = e.user_id
        WHERE u.id = $1 AND u.role = 'user'
        GROUP BY u.id, up.education_level_id, up.total_years_experience,
                 up.expected_salary_min, up.expected_salary_max,
                 up.current_location, up.preferred_location, 
                 up.job_type_preference, up.willing_to_relocate,
                 cpd.skills, cpd.total_experience_years, cpd.education_level,
                 cpd.current_position, cpd.languages
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(' Error in User.getCandidateForMatching:', error.message);
      throw error;
    }
  }

  /**
   * [MATCHING] Lấy danh sách candidates cho bulk matching
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>}
   */
  static async getCandidatesForMatching(filters = {}) {
    try {
      const {
        limit = 100,
        offset = 0,
        minExperience = null,
        maxExperience = null,
        educationLevels = null,
        locations = null,
        skillIds = null
      } = filters;

      let query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u.avatar_url,
          up.education_level_id,
          up.total_years_experience,
          up.expected_salary_min,
          up.expected_salary_max,
          up.current_location,
          up.preferred_location,
          up.job_type_preference,
          up.willing_to_relocate,
          cpd.skills as parsed_skills,
          cpd.total_experience_years as cv_experience,
          cpd.education_level as cv_education,
          
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'skill_id', cs.skill_id,
                'skill_name', sm.name,
                'category', sm.category,
                'proficiency_level', cs.proficiency_level,
                'years_experience', cs.years_experience
              )
            ) FILTER (WHERE cs.skill_id IS NOT NULL),
            '[]'::json
          ) as skills
          
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN cv_parsed_data cpd ON u.id = cpd.user_id
        LEFT JOIN candidate_skills cs ON u.id = cs.user_id
        LEFT JOIN skills_master sm ON cs.skill_id = sm.id
        WHERE u.role = 'user'
      `;

      const params = [];
      let paramIndex = 1;

      if (minExperience !== null) {
        query += ` AND up.total_years_experience >= $${paramIndex}`;
        params.push(minExperience);
        paramIndex++;
      }
      
      if (maxExperience !== null) {
        query += ` AND up.total_years_experience <= $${paramIndex}`;
        params.push(maxExperience);
        paramIndex++;
      }

      if (educationLevels && educationLevels.length > 0) {
        query += ` AND up.education_level_id = ANY($${paramIndex})`;
        params.push(educationLevels);
        paramIndex++;
      }

      if (locations && locations.length > 0) {
        query += ` AND (up.current_location = ANY($${paramIndex}) OR up.preferred_location = ANY($${paramIndex}))`;
        params.push(locations);
        paramIndex++;
      }

      if (skillIds && skillIds.length > 0) {
        query += ` AND cs.skill_id = ANY($${paramIndex})`;
        params.push(skillIds);
        paramIndex++;
      }

      query += `
        GROUP BY u.id, up.education_level_id, up.total_years_experience,
                 up.expected_salary_min, up.expected_salary_max,
                 up.current_location, up.preferred_location,
                 up.job_type_preference, up.willing_to_relocate,
                 cpd.skills, cpd.total_experience_years, cpd.education_level
        ORDER BY u.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error(' Error in User.getCandidatesForMatching:', error.message);
      throw error;
    }
  }

  /**
   * [MATCHING] Get candidate skill proficiency
   * @param {Number} userId - User ID
   * @param {Number} skillId - Skill ID
   * @returns {Promise<Object|null>}
   */
  static async getCandidateSkillProficiency(userId, skillId) {
    try {
      const result = await pool.query(
        `SELECT 
          cs.*,
          sm.name as skill_name,
          sm.category
         FROM candidate_skills cs
         INNER JOIN skills_master sm ON cs.skill_id = sm.id
         WHERE cs.user_id = $1 AND cs.skill_id = $2`,
        [userId, skillId]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error(' Error in User.getCandidateSkillProficiency:', error.message);
      throw error;
    }
  }

  /**
   * [MATCHING] Get candidates by location
   * @param {String} location - Location
   * @param {Number} limit - Limit
   * @returns {Promise<Array>}
   */
  static async getCandidatesByLocation(location, limit = 50) {
    try {
      const result = await pool.query(
        `SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          up.current_location,
          up.preferred_location,
          up.willing_to_relocate,
          up.total_years_experience
         FROM users u
         INNER JOIN user_profiles up ON u.id = up.user_id
         WHERE u.role = 'user' 
           AND (
             up.current_location ILIKE $1 OR 
             up.preferred_location ILIKE $1 OR
             up.willing_to_relocate = true
           )
         ORDER BY 
           CASE 
             WHEN up.current_location ILIKE $1 THEN 1
             WHEN up.preferred_location ILIKE $1 THEN 2
             ELSE 3
           END,
           u.created_at DESC
         LIMIT $2`,
        [`%${location}%`, limit]
      );
      return result.rows;
    } catch (error) {
      console.error(' Error in User.getCandidatesByLocation:', error.message);
      throw error;
    }
  }

  /**
   * [MATCHING] Bulk get candidates for matching
   * @param {Array} candidateIds - Array of candidate IDs
   * @returns {Promise<Array>}
   */
  static async bulkGetCandidatesForMatching(candidateIds) {
    try {
      if (!candidateIds || candidateIds.length === 0) {
        return [];
      }

      const query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          up.education_level_id,
          up.total_years_experience,
          up.expected_salary_min,
          up.expected_salary_max,
          up.current_location,
          up.preferred_location,
          up.job_type_preference,
          
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'skill_id', cs.skill_id,
                'proficiency_level', cs.proficiency_level,
                'years_experience', cs.years_experience
              )
            ) FILTER (WHERE cs.skill_id IS NOT NULL),
            '[]'::json
          ) as skills
          
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN candidate_skills cs ON u.id = cs.user_id
        WHERE u.id = ANY($1) AND u.role = 'user'
        GROUP BY u.id, u.name, u.email, up.education_level_id,
                 up.total_years_experience, up.expected_salary_min,
                 up.expected_salary_max, up.current_location,
                 up.preferred_location, up.job_type_preference
      `;

      const result = await pool.query(query, [candidateIds]);
      return result.rows;
    } catch (error) {
      console.error(' Error in User.bulkGetCandidatesForMatching:', error.message);
      throw error;
    }
  }

  /**
   * [MATCHING] Get candidates by skills
   * @param {Array} skillIds - Array of skill IDs
   * @param {Object} options - Additional options
   * @returns {Promise<Array>}
   */
  static async getCandidatesBySkills(skillIds, options = {}) {
    try {
      const {
        minProficiency = null,
        minYearsExperience = 0,
        limit = 50
      } = options;

      let query = `
        SELECT DISTINCT
          u.id,
          u.name,
          u.email,
          u.phone,
          up.total_years_experience,
          up.current_location,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'skill_id', cs.skill_id,
                'skill_name', sm.name,
                'proficiency_level', cs.proficiency_level,
                'years_experience', cs.years_experience
              )
            ) FILTER (WHERE cs.skill_id = ANY($1)),
            '[]'::json
          ) as matching_skills
        FROM users u
        INNER JOIN candidate_skills cs ON u.id = cs.user_id
        INNER JOIN skills_master sm ON cs.skill_id = sm.id
        LEFT JOIN user_profiles up ON u.id = up.user_id
        WHERE u.role = 'user' 
          AND cs.skill_id = ANY($1)
      `;

      const params = [skillIds];
      let paramIndex = 2;

      if (minProficiency) {
        query += ` AND cs.proficiency_level IN (
          CASE 
            WHEN $${paramIndex} = 'advanced' THEN ARRAY['advanced']
            WHEN $${paramIndex} = 'intermediate' THEN ARRAY['intermediate', 'advanced']
            ELSE ARRAY['beginner', 'intermediate', 'advanced']
          END
        )`;
        params.push(minProficiency);
        paramIndex++;
      }

      if (minYearsExperience > 0) {
        query += ` AND cs.years_experience >= $${paramIndex}`;
        params.push(minYearsExperience);
        paramIndex++;
      }

      query += `
        GROUP BY u.id, u.name, u.email, u.phone, up.total_years_experience, up.current_location
        ORDER BY COUNT(DISTINCT cs.skill_id) DESC
        LIMIT $${paramIndex}
      `;
      params.push(limit);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error(' Error in User.getCandidatesBySkills:', error.message);
      throw error;
    }
  }

  /**
   * [MATCHING] Update candidate skills
   * @param {Number} userId - User ID
   * @param {Array} skills - Array of skills
   * @returns {Promise<Boolean>}
   */
  static async updateCandidateSkills(userId, skills) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      await client.query('DELETE FROM candidate_skills WHERE user_id = $1', [userId]);

      if (skills && skills.length > 0) {
        for (const skill of skills) {
          await client.query(
            `INSERT INTO candidate_skills (user_id, skill_id, proficiency_level, years_experience)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, skill_id) 
             DO UPDATE SET 
               proficiency_level = EXCLUDED.proficiency_level,
               years_experience = EXCLUDED.years_experience`,
            [
              userId, 
              skill.skill_id, 
              skill.proficiency_level || 'intermediate', 
              skill.years_experience || 0
            ]
          );
        }
      }

      await client.query('COMMIT');
      console.log(' Candidate skills updated for user ID:', userId);
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error(' Error in User.updateCandidateSkills:', error.message);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * [MATCHING] Get candidate statistics
   * @returns {Promise<Object>}
   */
  static async getCandidateStatistics() {
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(DISTINCT u.id) as total_candidates,
          COUNT(DISTINCT CASE WHEN cpd.id IS NOT NULL THEN u.id END) as with_cv,
          COUNT(DISTINCT CASE WHEN cs.id IS NOT NULL THEN u.id END) as with_skills,
          
          -- Experience distribution
          COUNT(CASE WHEN up.total_years_experience < 1 THEN 1 END) as exp_fresher,
          COUNT(CASE WHEN up.total_years_experience BETWEEN 1 AND 3 THEN 1 END) as exp_1_3,
          COUNT(CASE WHEN up.total_years_experience BETWEEN 3 AND 5 THEN 1 END) as exp_3_5,
          COUNT(CASE WHEN up.total_years_experience BETWEEN 5 AND 10 THEN 1 END) as exp_5_10,
          COUNT(CASE WHEN up.total_years_experience >= 10 THEN 1 END) as exp_10_plus,
          
          -- Education distribution
          COUNT(CASE WHEN up.education_level_id = 1 THEN 1 END) as edu_high_school,
          COUNT(CASE WHEN up.education_level_id = 2 THEN 1 END) as edu_bachelors,
          COUNT(CASE WHEN up.education_level_id = 3 THEN 1 END) as edu_masters,
          COUNT(CASE WHEN up.education_level_id = 4 THEN 1 END) as edu_phd
          
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN cv_parsed_data cpd ON u.id = cpd.user_id
        LEFT JOIN candidate_skills cs ON u.id = cs.user_id
        WHERE u.role = 'user'
      `);

      
      const topSkills = await pool.query(`
        SELECT 
          sm.id,
          sm.name,
          sm.category,
          COUNT(DISTINCT cs.user_id) as candidate_count
        FROM candidate_skills cs
        INNER JOIN skills_master sm ON cs.skill_id = sm.id
        INNER JOIN users u ON cs.user_id = u.id
        WHERE u.role = 'user'
        GROUP BY sm.id, sm.name, sm.category
        ORDER BY candidate_count DESC
        LIMIT 20
      `);

      return {
        ...stats.rows[0],
        top_skills: topSkills.rows
      };
    } catch (error) {
      console.error(' Error in User.getCandidateStatistics:', error.message);
      throw error;
    }
  }

  /**
   * [MATCHING] Advanced candidate search
   * @param {Object} searchParams - Search parameters
   * @returns {Promise<Array>}
   */
  static async advancedCandidateSearch(searchParams) {
    try {
      const {
        keywords = null,
        skillIds = null,
        minExperience = null,
        maxExperience = null,
        educationLevels = null,
        locations = null,
        minSalary = null,
        maxSalary = null,
        jobTypes = null,
        limit = 50,
        offset = 0
      } = searchParams;

      let query = `
        SELECT DISTINCT
          u.id,
          u.name,
          u.email,
          u.phone,
          u.avatar_url,
          up.total_years_experience,
          up.education_level_id,
          up.current_location,
          up.preferred_location,
          up.expected_salary_min,
          up.expected_salary_max,
          up.job_type_preference,
          cpd.current_position,
          
          -- Matching skills count
          COUNT(DISTINCT CASE WHEN cs.skill_id = ANY($1) THEN cs.skill_id END) as matching_skills_count
          
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN cv_parsed_data cpd ON u.id = cpd.user_id
        LEFT JOIN candidate_skills cs ON u.id = cs.user_id
        WHERE u.role = 'user'
      `;

      const params = [skillIds || []];
      let paramIndex = 2;

      
      if (keywords) {
        query += ` AND (
          u.name ILIKE ${paramIndex} OR
          cpd.current_position ILIKE ${paramIndex} OR
          EXISTS (
            SELECT 1 FROM candidate_skills cs2
            INNER JOIN skills_master sm ON cs2.skill_id = sm.id
            WHERE cs2.user_id = u.id AND sm.name ILIKE ${paramIndex}
          )
        )`;
        params.push(`%${keywords}%`);
        paramIndex++;
      }

      
      if (minExperience !== null) {
        query += ` AND up.total_years_experience >= ${paramIndex}`;
        params.push(minExperience);
        paramIndex++;
      }
      
      if (maxExperience !== null) {
        query += ` AND up.total_years_experience <= ${paramIndex}`;
        params.push(maxExperience);
        paramIndex++;
      }

      
      if (educationLevels && educationLevels.length > 0) {
        query += ` AND up.education_level_id = ANY(${paramIndex})`;
        params.push(educationLevels);
        paramIndex++;
      }

      
      if (locations && locations.length > 0) {
        query += ` AND (
          up.current_location = ANY(${paramIndex}) OR 
          up.preferred_location = ANY(${paramIndex})
        )`;
        params.push(locations);
        paramIndex++;
      }

      
      if (minSalary !== null) {
        query += ` AND up.expected_salary_max >= ${paramIndex}`;
        params.push(minSalary);
        paramIndex++;
      }
      
      if (maxSalary !== null) {
        query += ` AND up.expected_salary_min <= ${paramIndex}`;
        params.push(maxSalary);
        paramIndex++;
      }

      
      if (jobTypes && jobTypes.length > 0) {
        query += ` AND up.job_type_preference = ANY(${paramIndex})`;
        params.push(jobTypes);
        paramIndex++;
      }

      query += `
        GROUP BY u.id, u.name, u.email, u.phone, u.avatar_url,
                 up.total_years_experience, up.education_level_id,
                 up.current_location, up.preferred_location,
                 up.expected_salary_min, up.expected_salary_max,
                 up.job_type_preference, cpd.current_position
        ORDER BY matching_skills_count DESC, u.created_at DESC
        LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
      `;
      
      params.push(limit, offset);

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error(' Error in User.advancedCandidateSearch:', error.message);
      throw error;
    }
  }

  /**
   * [MATCHING] Get candidate detailed profile
   * @param {Number} userId - User ID
   * @returns {Promise<Object|null>}
   */
  static async getCandidateDetailedProfile(userId) {
    try {
      const query = `
        SELECT 
          u.id,
          u.name,
          u.email,
          u.phone,
          u.avatar_url,
          u.created_at,
          
          -- Profile info
          up.education_level_id,
          up.total_years_experience,
          up.expected_salary_min,
          up.expected_salary_max,
          up.current_location,
          up.preferred_location,
          up.job_type_preference,
          up.willing_to_relocate,
          up.bio,
          
          -- CV parsed data
          cpd.skills as parsed_skills,
          cpd.total_experience_years,
          cpd.education_level as cv_education,
          cpd.current_position,
          cpd.languages,
          cpd.certifications,
          
          -- Skills with full details
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'skill_id', cs.skill_id,
                'skill_name', sm.name,
                'category', sm.category,
                'proficiency_level', cs.proficiency_level,
                'years_experience', cs.years_experience
              )
            ) FILTER (WHERE cs.skill_id IS NOT NULL),
            '[]'::json
          ) as skills,
          
          -- Work experience
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', we.id,
                'position', we.position,
                'company', we.company,
                'start_date', we.start_date,
                'end_date', we.end_date,
                'is_current', we.is_current,
                'description', we.description,
                'responsibilities', we.responsibilities,
                'achievements', we.achievements
              ) ORDER BY we.start_date DESC
            ) FILTER (WHERE we.id IS NOT NULL),
            '[]'::json
          ) as work_experience,
          
          -- Education
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', e.id,
                'degree', e.degree,
                'institution', e.institution,
                'field_of_study', e.field_of_study,
                'start_date', e.start_date,
                'end_date', e.end_date,
                'gpa', e.gpa,
                'description', e.description
              ) ORDER BY e.start_date DESC
            ) FILTER (WHERE e.id IS NOT NULL),
            '[]'::json
          ) as education,
          
          -- Certifications
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'id', cert.id,
                'name', cert.name,
                'issuing_organization', cert.issuing_organization,
                'issue_date', cert.issue_date,
                'expiry_date', cert.expiry_date,
                'credential_id', cert.credential_id
              ) ORDER BY cert.issue_date DESC
            ) FILTER (WHERE cert.id IS NOT NULL),
            '[]'::json
          ) as certifications
          
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN cv_parsed_data cpd ON u.id = cpd.user_id
        LEFT JOIN candidate_skills cs ON u.id = cs.user_id
        LEFT JOIN skills_master sm ON cs.skill_id = sm.id
        LEFT JOIN work_experience we ON u.id = we.user_id
        LEFT JOIN education e ON u.id = e.user_id
        LEFT JOIN certifications cert ON u.id = cert.user_id
        WHERE u.id = $1 AND u.role = 'user'
        GROUP BY u.id, up.education_level_id, up.total_years_experience,
                 up.expected_salary_min, up.expected_salary_max,
                 up.current_location, up.preferred_location,
                 up.job_type_preference, up.willing_to_relocate, up.bio,
                 cpd.skills, cpd.total_experience_years, cpd.education_level,
                 cpd.current_position, cpd.languages, cpd.certifications
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows[0] || null;
    } catch (error) {
      console.error(' Error in User.getCandidateDetailedProfile:', error.message);
      throw error;
    }
  }

  /**
   * [MATCHING] Get candidates by relevance to job
   * @param {Object} jobRequirements - Job requirements
   * @param {Object} options - Search options
   * @returns {Promise<Array>}
   */
  static async getCandidatesByRelevance(jobRequirements, options = {}) {
    try {
      const {
        requiredSkillIds = [],
        preferredSkillIds = [],
        minExperience = 0,
        maxExperience = null,
        educationLevelId = null,
        location = null,
        salaryRange = null,
        limit = 50,
        offset = 0
      } = jobRequirements;

      const { includeDetails = false } = options;

      let query = `
        SELECT DISTINCT
          u.id,
          u.name,
          u.email,
          u.phone,
          u.avatar_url,
          up.total_years_experience,
          up.education_level_id,
          up.current_location,
          up.preferred_location,
          up.expected_salary_min,
          up.expected_salary_max,
          cpd.current_position,
          
          -- Relevance score components
          COUNT(DISTINCT CASE WHEN cs.skill_id = ANY($1) THEN cs.skill_id END) as required_skills_match,
          COUNT(DISTINCT CASE WHEN cs.skill_id = ANY($2) THEN cs.skill_id END) as preferred_skills_match,
          
          CASE 
            WHEN up.total_years_experience >= $3 THEN 1 
            ELSE 0 
          END as experience_match,
          
          CASE 
            WHEN up.education_level_id >= $4 THEN 1 
            ELSE 0 
          END as education_match
          
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN cv_parsed_data cpd ON u.id = cpd.user_id
        LEFT JOIN candidate_skills cs ON u.id = cs.user_id
        WHERE u.role = 'user'
      `;

      const params = [
        requiredSkillIds.length > 0 ? requiredSkillIds : [0],
        preferredSkillIds.length > 0 ? preferredSkillIds : [0],
        minExperience || 0,
        educationLevelId || 0
      ];
      let paramIndex = 5;

      if (maxExperience !== null) {
        query += ` AND up.total_years_experience <= ${paramIndex}`;
        params.push(maxExperience);
        paramIndex++;
      }

      if (location) {
        query += ` AND (
          up.current_location ILIKE ${paramIndex} OR 
          up.preferred_location ILIKE ${paramIndex} OR
          up.willing_to_relocate = true
        )`;
        params.push(`%${location}%`);
        paramIndex++;
      }

      if (salaryRange) {
        const { min, max } = salaryRange;
        if (min !== null) {
          query += ` AND up.expected_salary_max >= ${paramIndex}`;
          params.push(min);
          paramIndex++;
        }
        if (max !== null) {
          query += ` AND up.expected_salary_min <= ${paramIndex}`;
          params.push(max);
          paramIndex++;
        }
      }

      query += `
        GROUP BY u.id, u.name, u.email, u.phone, u.avatar_url,
                 up.total_years_experience, up.education_level_id,
                 up.current_location, up.preferred_location,
                 up.expected_salary_min, up.expected_salary_max,
                 cpd.current_position
        ORDER BY 
          required_skills_match DESC,
          preferred_skills_match DESC,
          experience_match DESC,
          education_match DESC,
          u.created_at DESC
        LIMIT ${paramIndex} OFFSET ${paramIndex + 1}
      `;
      
      params.push(limit, offset);

      const result = await pool.query(query, params);
      
      if (includeDetails && result.rows.length > 0) {
        const candidateIds = result.rows.map(c => c.id);
        const detailedCandidates = await this.bulkGetCandidatesForMatching(candidateIds);
        
        return result.rows.map(candidate => {
          const detailed = detailedCandidates.find(d => d.id === candidate.id);
          return {
            ...candidate,
            ...detailed
          };
        });
      }

      return result.rows;
    } catch (error) {
      console.error(' Error in User.getCandidatesByRelevance:', error.message);
      throw error;
    }
  }

  /**
   * [MATCHING] Count matching candidates
   * @param {Object} criteria - Search criteria
   * @returns {Promise<Number>}
   */
  static async countMatchingCandidates(criteria) {
    try {
      const {
        skillIds = null,
        minExperience = null,
        maxExperience = null,
        educationLevels = null,
        locations = null
      } = criteria;

      let query = `
        SELECT COUNT(DISTINCT u.id) as count
        FROM users u
        LEFT JOIN user_profiles up ON u.id = up.user_id
        LEFT JOIN candidate_skills cs ON u.id = cs.user_id
        WHERE u.role = 'user'
      `;

      const params = [];
      let paramIndex = 1;

      if (skillIds && skillIds.length > 0) {
        query += ` AND cs.skill_id = ANY(${paramIndex})`;
        params.push(skillIds);
        paramIndex++;
      }

      if (minExperience !== null) {
        query += ` AND up.total_years_experience >= ${paramIndex}`;
        params.push(minExperience);
        paramIndex++;
      }

      if (maxExperience !== null) {
        query += ` AND up.total_years_experience <= ${paramIndex}`;
        params.push(maxExperience);
        paramIndex++;
      }

      if (educationLevels && educationLevels.length > 0) {
        query += ` AND up.education_level_id = ANY(${paramIndex})`;
        params.push(educationLevels);
        paramIndex++;
      }

      if (locations && locations.length > 0) {
        query += ` AND (up.current_location = ANY(${paramIndex}) OR up.preferred_location = ANY(${paramIndex}))`;
        params.push(locations);
        paramIndex++;
      }

      const result = await pool.query(query, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error(' Error in User.countMatchingCandidates:', error.message);
      throw error;
    }
  }
}

module.exports = User;
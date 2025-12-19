// ===================== JOB MODEL =====================
const pool = require('../config/db');

class Job {

  // ===================== CÁC HÀM CŨ =====================

  static async findAll(options = {}) {
    try {
      const { page = 0, limit = 6, search = '', location = '', category = '', status = 'open' } = options;
      const offset = parseInt(page) * parseInt(limit);

      let where = [];
      let params = [];
      let i = 1;

      if (search) {
        where.push(`(
          j.title ILIKE $${i} OR j.description ILIKE $${i} OR j.category ILIKE $${i}
        )`);
        params.push(`%${search}%`);
        i++;
      }

      if (location) {
        where.push(`j.location ILIKE $${i}`);
        params.push(`%${location}%`);
        i++;
      }

      if (category) {
        where.push(`j.category = $${i}`);
        params.push(category);
        i++;
      }

      if (status) {
        where.push(`j.status = $${i}`);
        params.push(status);
        i++;
      }

      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const count = await pool.query(
        `SELECT COUNT(*) FROM jobs j ${whereClause}`,
        params
      );

      const jobs = await pool.query(
        `SELECT j.*
         FROM jobs j
         ${whereClause}
         ORDER BY j.posted_at DESC
         LIMIT $${i} OFFSET $${i + 1}`,
        [...params, limit, offset]
      );

      return {
        jobs: jobs.rows,
        total: parseInt(count.rows[0].count),
        page,
        totalPages: Math.ceil(count.rows[0].count / limit)
      };
    } catch (e) {
      console.error('Job.findAll error:', e.message);
      throw e;
    }
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM jobs WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  static async create(data, employerId) {
    const result = await pool.query(
      `INSERT INTO jobs (employer_id, title, description, requirements, benefits, location,
        min_salary, max_salary, category, experience, status, posted_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,NOW())
       RETURNING *`,
      [
        employerId,
        data.title,
        data.description,
        data.requirements,
        data.benefits,
        data.location,
        data.min_salary,
        data.max_salary,
        data.category,
        data.experience,
        data.status || 'open'
      ]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const result = await pool.query(
      `UPDATE jobs
       SET title=$1, description=$2, requirements=$3, benefits=$4,
           location=$5, min_salary=$6, max_salary=$7,
           category=$8, experience=$9, status=$10
       WHERE id=$11
       RETURNING *`,
      [
        data.title, data.description, data.requirements, data.benefits,
        data.location, data.min_salary, data.max_salary,
        data.category, data.experience, data.status, id
      ]
    );
    return result.rows[0];
  }

  static async delete(id) {
    await pool.query('DELETE FROM applications WHERE job_id = $1', [id]);
    await pool.query('DELETE FROM jobs WHERE id = $1', [id]);
    return true;
  }

  // ===================== CÁC HÀM MATCHING (ĐÃ FIX) =====================

  static async findByIdWithParsedData(jobId) {
    const result = await pool.query(
      `SELECT j.*, jpd.*
       FROM jobs j
       LEFT JOIN job_parsed_data jpd ON j.id = jpd.job_id
       WHERE j.id = $1`,
      [jobId]
    );
    return result.rows[0] || null;
  }

  static async getJobsWithParsedData() {
    const result = await pool.query(
      `SELECT j.*, jpd.*
       FROM jobs j
       LEFT JOIN job_parsed_data jpd ON j.id = jpd.job_id
       WHERE j.status = 'open'`
    );
    return result.rows;
  }

  static async getJobSkills(jobId) {
    const result = await pool.query(
      `SELECT js.*, sm.name
       FROM job_skills js
       JOIN skills_master sm ON js.skill_id = sm.id
       WHERE js.job_id = $1`,
      [jobId]
    );
    return result.rows;
  }

  static async saveParsedData(jobId, parsedData) {
    const result = await pool.query(
      `INSERT INTO job_parsed_data (job_id, required_skills, preferred_skills, parsed_at)
       VALUES ($1,$2,$3,NOW())
       ON CONFLICT (job_id)
       DO UPDATE SET
         required_skills = EXCLUDED.required_skills,
         preferred_skills = EXCLUDED.preferred_skills,
         parsed_at = NOW()
       RETURNING *`,
      [
        jobId,
        parsedData.required_skills,
        parsedData.preferred_skills
      ]
    );
    return result.rows[0];
  }

  static async updateJobSkills(jobId, skills) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM job_skills WHERE job_id=$1', [jobId]);

      for (const s of skills) {
        await client.query(
          `INSERT INTO job_skills (job_id, skill_id, is_required, weight)
           VALUES ($1,$2,$3,$4)`,
          [jobId, s.skill_id, s.is_required, s.weight || 1]
        );
      }
      await client.query('COMMIT');
      return true;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  static async getEmployerJobsForMatching(employerId) {
    const result = await pool.query(
      `SELECT j.id, j.title, COUNT(ms.id) AS matched
       FROM jobs j
       LEFT JOIN matching_scores ms ON j.id = ms.job_id
       WHERE j.posted_by = $1
       GROUP BY j.id`,
      [employerId]
    );
    return result.rows;
  }
}

module.exports = Job;

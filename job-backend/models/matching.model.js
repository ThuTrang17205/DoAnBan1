const pool = require('../config/db');

class MatchingModel {

  
  static async saveMatchingScore(matchData) {
    const query = `
      INSERT INTO matching_scores (
        job_id, candidate_id, total_score,
        skills_score, experience_score, education_score,
        location_score, salary_score, is_qualified
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      ON CONFLICT (job_id, candidate_id)
      DO UPDATE SET
        total_score = EXCLUDED.total_score,
        skills_score = EXCLUDED.skills_score,
        experience_score = EXCLUDED.experience_score,
        education_score = EXCLUDED.education_score,
        location_score = EXCLUDED.location_score,
        salary_score = EXCLUDED.salary_score,
        is_qualified = EXCLUDED.is_qualified,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const values = [
      matchData.job_id,
      matchData.candidate_id,
      matchData.total_score,
      matchData.skills_score,
      matchData.experience_score,
      matchData.education_score,
      matchData.location_score,
      matchData.salary_score,
      matchData.is_qualified
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  
  static async getMatchingScores(jobId, options = {}) {
    let query = `
      SELECT
        ms.*,
        u.name AS candidate_name,
        u.email AS candidate_email,
        cpd.current_position,
        cpd.total_experience_years,
        cpd.education_level
      FROM matching_scores ms
      JOIN users u ON ms.candidate_id = u.id
      LEFT JOIN cv_parsed_data cpd ON cpd.user_id = u.id
      WHERE ms.job_id = $1
    `;

    const params = [jobId];
    let idx = 1;

    if (options.minScore) {
      query += ` AND ms.total_score >= $${++idx}`;
      params.push(options.minScore);
    }

    if (options.qualifiedOnly) {
      query += ` AND ms.is_qualified = true`;
    }

    query += ` ORDER BY ms.total_score DESC`;

    if (options.limit) {
      query += ` LIMIT $${++idx}`;
      params.push(options.limit);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  
  static async getCandidateMatchingScores(candidateId, options = {}) {
    let query = `
      SELECT
        ms.*,
        j.title,
        j.company,
        j.location,
        j.job_type,
        j.min_salary,
        j.max_salary
      FROM matching_scores ms
      JOIN jobs j ON ms.job_id = j.id
      WHERE ms.candidate_id = $1
        AND j.status = 'open'
    `;

    const params = [candidateId];
    let idx = 1;

    if (options.minScore) {
      query += ` AND ms.total_score >= $${++idx}`;
      params.push(options.minScore);
    }

    query += ` ORDER BY ms.total_score DESC`;

    if (options.limit) {
      query += ` LIMIT $${++idx}`;
      params.push(options.limit);
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  
  static async logMatching(logData) {
    const query = `
      INSERT INTO matching_logs (job_id, candidate_id, action, score, metadata)
      VALUES ($1,$2,$3,$4,$5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      logData.job_id,
      logData.candidate_id,
      logData.action,
      logData.score,
      JSON.stringify(logData.metadata || {})
    ]);
    return result.rows[0];
  }

  
  static async getMatchingConfig() {
    const result = await pool.query(`
      SELECT criteria, weight
      FROM matching_config
      WHERE is_active = true
    `);

    const config = {};
    result.rows.forEach(r => {
      config[r.criteria] = parseFloat(r.weight);
    });
    return config;
  }

  static async updateMatchingWeights(weights) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('UPDATE matching_config SET is_active = false');

      for (const key of Object.keys(weights)) {
        await client.query(`
          INSERT INTO matching_config(criteria, weight, is_active)
          VALUES ($1,$2,true)
          ON CONFLICT (criteria)
          DO UPDATE SET weight = $2, is_active = true
        `, [key, weights[key]]);
      }

      await client.query('COMMIT');
      return true;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  
  static async getMatchScoreDetail(jobId, candidateId) {
    const result = await pool.query(`
      SELECT
        ms.*,
        j.title AS job_title,
        u.name AS candidate_name,
        cpd.skills AS candidate_skills,
        jpd.required_skills
      FROM matching_scores ms
      JOIN jobs j ON j.id = ms.job_id
      JOIN users u ON u.id = ms.candidate_id
      LEFT JOIN cv_parsed_data cpd ON cpd.user_id = u.id
      LEFT JOIN job_parsed_data jpd ON jpd.job_id = j.id
      WHERE ms.job_id = $1 AND ms.candidate_id = $2
    `, [jobId, candidateId]);

    return result.rows[0] || null;
  }

  
  static async getTopMatchedCandidatesForJob(jobId, limit = 50) {
    const result = await pool.query(`
      SELECT
        ms.*,
        u.name,
        cpd.current_position
      FROM matching_scores ms
      JOIN users u ON u.id = ms.candidate_id
      LEFT JOIN cv_parsed_data cpd ON cpd.user_id = u.id
      WHERE ms.job_id = $1
        AND ms.is_qualified = true
      ORDER BY ms.total_score DESC
      LIMIT $2
    `, [jobId, limit]);

    return result.rows;
  }

  static async getTopMatchedJobsForCandidate(candidateId, limit = 10) {
    const result = await pool.query(`
      SELECT
        ms.*,
        j.title,
        j.company
      FROM matching_scores ms
      JOIN jobs j ON j.id = ms.job_id
      WHERE ms.candidate_id = $1
        AND ms.is_qualified = true
        AND j.status = 'open'
      ORDER BY ms.total_score DESC
      LIMIT $2
    `, [candidateId, limit]);

    return result.rows;
  }

  
  static async cleanupOldScores(days = 30) {
    const result = await pool.query(`
      DELETE FROM matching_scores
      WHERE updated_at < NOW() - INTERVAL '${days} days'
      RETURNING id
    `);
    return result.rows.length;
  }
  
static async getCandidateSkills(candidateId) {
  const result = await pool.query(`
    SELECT 
      sm.name as skill_name,
      sm.slug,
      cs.proficiency_level,
      cs.years_experience
    FROM candidate_skills cs
    INNER JOIN skills_master sm ON cs.skill_id = sm.id
    WHERE cs.user_id = $1
  `, [candidateId]);
  
  return result.rows;
}


static async getCandidatesSkillsBatch(candidateIds) {
  const result = await pool.query(`
    SELECT 
      cs.user_id as candidate_id,
      json_agg(json_build_object(
        'skill_name', sm.name,
        'slug', sm.slug,
        'proficiency_level', cs.proficiency_level
      )) as skills
    FROM candidate_skills cs
    INNER JOIN skills_master sm ON cs.skill_id = sm.id
    WHERE cs.user_id = ANY($1)
    GROUP BY cs.user_id
  `, [candidateIds]);
  
  return result.rows;
}
}

module.exports = MatchingModel;

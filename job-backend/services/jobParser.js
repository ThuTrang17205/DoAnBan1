
const pool = require('../config/db');
const { readCV } = require('../utils/fileReader');
const { parseJobText } = require('../utils/jobTextExtractor'); 

class JobParserService {
  /**
   * Parse job từ jobId (auto detect text source)
   */
  static async parseByJobId(jobId) {
    
    const jobQuery = `
      SELECT 
        id, 
        title,
        description, 
        requirements, 
        file_path
      FROM jobs 
      WHERE id = $1
    `;
    const jobResult = await pool.query(jobQuery, [jobId]);

    if (jobResult.rows.length === 0) {
      throw new Error(`Job ${jobId} không tồn tại`);
    }

    const job = jobResult.rows[0];

    
    let rawText = '';
    
    if (job.file_path) {
      console.log(`Reading JD file: ${job.file_path}`);
      rawText = await readCV(job.file_path);
    } else {
      console.log('Using text from description + requirements');
      rawText = [
        job.title || '',
        job.description || '',
        job.requirements || ''
      ].join('\n\n');
    }

    if (!rawText.trim()) {
      throw new Error('Job không có nội dung để parse');
    }

    
    const parsed = await parseJobText(rawText);

    
    const insertQuery = `
      INSERT INTO job_parsed_data (
        job_id,
        required_skills,
        min_experience_years,
        required_education_level,
        job_level,
        job_description,
        parsed_at,
        parsing_method
      )
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), 'RULE_BASED')
      ON CONFLICT (job_id)
      DO UPDATE SET
        required_skills = EXCLUDED.required_skills,
        min_experience_years = EXCLUDED.min_experience_years,
        required_education_level = EXCLUDED.required_education_level,
        job_level = EXCLUDED.job_level,
        job_description = EXCLUDED.job_description,
        parsed_at = NOW(),
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      jobId,
      JSON.stringify(parsed.required_skills), 
      parsed.min_experience_years,
      parsed.required_education_level,
      parsed.job_level,
      rawText.substring(0, 5000) 
    ];

    const result = await pool.query(insertQuery, values);
    
    console.log(`Parsed job ${jobId}:`, {
      skills: parsed.required_skills.length,
      min_exp: parsed.min_experience_years,
      education: parsed.required_education_level
    });

    return result.rows[0];
  }

  /**
   * Parse job từ text trực tiếp (không cần jobId)
   * Dùng cho preview/test
   */
  static async parseFromText(description) {
    if (!description || !description.trim()) {
      throw new Error('Description is empty');
    }

    const parsed = await parseJobText(description);
    return parsed;
  }

  /**
   * Parse nhiều jobs cùng lúc
   */
  static async parseBatchJobs(jobIds) {
    const results = [];
    const errors = [];

    for (const jobId of jobIds) {
      try {
        const result = await this.parseByJobId(jobId);
        results.push(result);
      } catch (error) {
        console.error(`Error parsing job ${jobId}:`, error.message);
        errors.push({ jobId, error: error.message });
      }
    }

    return { 
      success: results.length, 
      failed: errors.length,
      results, 
      errors 
    };
  }
}

module.exports = JobParserService;
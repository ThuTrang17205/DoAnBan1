const pool = require('../config/db');

class CVModel {
  /**
   * Lấy CV mặc định của user kèm parsed data
   */
  static async getDefaultCVByUserId(userId) {
    const query = `
      SELECT cv.*, cpd.*
      FROM user_cvs cv
      LEFT JOIN cv_parsed_data cpd ON cv.id = cpd.cv_id
      WHERE cv.user_id = $1 AND cv.is_default = true
      ORDER BY cv.upload_date DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * Lấy parsed CV data theo cv_id
   */
  static async getParsedCVData(cvId) {
    const query = `
      SELECT * FROM cv_parsed_data WHERE cv_id = $1
    `;
    const result = await pool.query(query, [cvId]);
    return result.rows[0];
  }

  /**
   * Lấy tất cả CV của user
   */
  static async getCVsByUserId(userId) {
    const query = `
      SELECT cv.*, cpd.skills, cpd.total_experience_years, cpd.education_level
      FROM user_cvs cv
      LEFT JOIN cv_parsed_data cpd ON cv.id = cpd.cv_id
      WHERE cv.user_id = $1
      ORDER BY cv.is_default DESC, cv.upload_date DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  /**
   * [MỚI] Lấy parsed CV data theo user_id (cho matching)
   * Trả về thông tin cần thiết cho rule-based matching
   */
  static async getParsedCVDataByUserId(userId) {
    const query = `
      SELECT 
        cpd.id,
        cpd.user_id,
        cpd.cv_id,
        cpd.skills,
        cpd.total_experience_years,
        cpd.education_level,
        cpd.expected_salary_min,
        cpd.expected_salary_max,
        cpd.current_position,
        cpd.languages,
        cpd.certifications,
        cpd.projects,
        cv.file_path,
        cv.is_default
      FROM cv_parsed_data cpd
      INNER JOIN user_cvs cv ON cpd.cv_id = cv.id
      WHERE cpd.user_id = $1 AND cv.is_default = true
      ORDER BY cv.upload_date DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  /**
   * [MỚI] Lưu/cập nhật parsed CV data
   */
  static async saveParsedData(cvId, userId, parsedData) {
    const {
      skills,
      total_experience_years,
      education_level,
      expected_salary_min,
      expected_salary_max,
      current_position,
      languages,
      certifications,
      projects,
      raw_text
    } = parsedData;

    const query = `
      INSERT INTO cv_parsed_data (
        cv_id, user_id, skills, total_experience_years, education_level,
        expected_salary_min, expected_salary_max, current_position,
        languages, certifications, projects, raw_text, parsed_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
      ON CONFLICT (cv_id) 
      DO UPDATE SET
        skills = EXCLUDED.skills,
        total_experience_years = EXCLUDED.total_experience_years,
        education_level = EXCLUDED.education_level,
        expected_salary_min = EXCLUDED.expected_salary_min,
        expected_salary_max = EXCLUDED.expected_salary_max,
        current_position = EXCLUDED.current_position,
        languages = EXCLUDED.languages,
        certifications = EXCLUDED.certifications,
        projects = EXCLUDED.projects,
        raw_text = EXCLUDED.raw_text,
        parsed_at = NOW()
      RETURNING *
    `;

    const values = [
      cvId, userId, skills, total_experience_years, education_level,
      expected_salary_min, expected_salary_max, current_position,
      languages, certifications, projects, raw_text
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * [MỚI] Upload CV mới
   */
  static async uploadCV(userId, fileData, isDefault = false) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Nếu đây là CV mặc định, set các CV khác thành không mặc định
      if (isDefault) {
        await client.query(
          'UPDATE user_cvs SET is_default = false WHERE user_id = $1',
          [userId]
        );
      }

      // Insert CV mới
      const cvResult = await client.query(
        `INSERT INTO user_cvs (user_id, file_name, file_path, file_size, mime_type, is_default, upload_date)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         RETURNING *`,
        [userId, fileData.file_name, fileData.file_path, fileData.file_size, fileData.mime_type, isDefault]
      );

      await client.query('COMMIT');
      return cvResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * [MỚI] Set CV làm mặc định
   */
  static async setDefaultCV(userId, cvId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Kiểm tra CV có thuộc về user không
      const checkResult = await client.query(
        'SELECT id FROM user_cvs WHERE id = $1 AND user_id = $2',
        [cvId, userId]
      );

      if (checkResult.rows.length === 0) {
        throw new Error('CV not found or does not belong to user');
      }

      // Set tất cả CV của user thành không mặc định
      await client.query(
        'UPDATE user_cvs SET is_default = false WHERE user_id = $1',
        [userId]
      );

      // Set CV được chọn làm mặc định
      const result = await client.query(
        'UPDATE user_cvs SET is_default = true WHERE id = $1 RETURNING *',
        [cvId]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * [MỚI] Xóa CV
   */
  static async deleteCV(userId, cvId) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Kiểm tra CV có thuộc về user không
      const checkResult = await client.query(
        'SELECT id, is_default FROM user_cvs WHERE id = $1 AND user_id = $2',
        [cvId, userId]
      );

      if (checkResult.rows.length === 0) {
        throw new Error('CV not found or does not belong to user');
      }

      const isDefault = checkResult.rows[0].is_default;

      // Xóa parsed data trước
      await client.query('DELETE FROM cv_parsed_data WHERE cv_id = $1', [cvId]);

      // Xóa CV
      await client.query('DELETE FROM user_cvs WHERE id = $1', [cvId]);

      // Nếu xóa CV mặc định, set CV khác làm mặc định
      if (isDefault) {
        const otherCVResult = await client.query(
          `UPDATE user_cvs 
           SET is_default = true 
           WHERE user_id = $1 
           AND id = (SELECT id FROM user_cvs WHERE user_id = $1 ORDER BY upload_date DESC LIMIT 1)
           RETURNING *`,
          [userId]
        );
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * [MỚI] Lấy thống kê CV
   */
  static async getCVStatistics(userId) {
    const query = `
      SELECT 
        COUNT(*) as total_cvs,
        COUNT(*) FILTER (WHERE cpd.id IS NOT NULL) as parsed_cvs,
        MAX(cv.upload_date) as last_upload
      FROM user_cvs cv
      LEFT JOIN cv_parsed_data cpd ON cv.id = cpd.cv_id
      WHERE cv.user_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }
}

module.exports = CVModel;
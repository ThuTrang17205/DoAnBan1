
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const { readCV } = require('../utils/fileReader');
const { parseCVText } = require('../utils/textExtractor');

class CVParserService {

  /**
   * Parse CV từ file path (hỗ trợ cả JSON và PDF/DOC)
   * @param {String} filePath - Đường dẫn file CV
   * @returns {Object} Parsed CV data
   */
  static async parseCVFile(filePath) {
    const absolutePath = path.resolve(filePath);

    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath}`);
    }

    const ext = path.extname(absolutePath).toLowerCase();
    console.log(`🔍 Parsing file: ${path.basename(absolutePath)} (${ext})`);

    
    if (ext === '.json') {
      console.log('📄 Detected JSON file, reading directly...');
      const jsonContent = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
      
      return await this.parseJSONCV(jsonContent); 
    }

    
    console.log('📄 Parsing PDF/DOC file...');
    const rawText = await readCV(absolutePath);
    
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('Could not extract text from file');
    }

    return await this.parseCVText(rawText); 
  }

  /**
   * Parse JSON CV từ CV Builder
   * @param {Object} jsonContent - Nội dung JSON
   * @returns {Object} Parsed data
   */
  static async parseJSONCV(jsonContent) {
    console.log('🔄 Converting JSON CV to parsed format...');

    
    const skillsStr = Array.isArray(jsonContent.skills) 
      ? JSON.stringify(jsonContent.skills) 
      : (jsonContent.skills ? JSON.stringify([jsonContent.skills]) : null);

    return {
      full_name: jsonContent.fullName || null,
      email: jsonContent.email || null,
      phone: jsonContent.phone || null,
      
      
      skills: skillsStr,
      skill_levels: null, 
      
      
      total_experience_years: this.calculateYearsFromExperience(jsonContent.experience),
      work_history: jsonContent.experience 
        ? JSON.stringify(jsonContent.experience) 
        : null,
      current_position: jsonContent.position || null,
      current_company: jsonContent.experience?.[0]?.company || null,
      
      
      education_level: jsonContent.education?.[0]?.degree || null,
      major: null,
      university: jsonContent.education?.[0]?.school || null,
      graduation_year: this.extractYear(jsonContent.education?.[0]?.period),
      
      
      certifications: null,
      languages: null,
      expected_salary_min: null,
      expected_salary_max: null,
      salary_currency: "VND",
      career_objectives: jsonContent.objective || null,
      notable_projects: null,
      awards: null,
      confidence_score: 1.0 
    };
  }

  /**
   * Parse text CV (PDF/DOC) bằng rule-based hoặc AI
   * ✅ FIXED: Now properly async
   * @param {String} rawText - Text content
   * @returns {Object} Parsed data
   */
  static async parseCVText(rawText) {
    console.log('🔄 Parsing text content...');
    
    
    const parsed = await parseCVText(rawText);

    
    return parsed;
  }

  /**
   * Parse 1 CV theo cv_id và lưu vào database
   * @param {Number} cvId - ID của CV trong user_cvs
   * @param {String} filePath - Optional: đường dẫn file (nếu đã biết)
   */
  static async parseAndSave(cvId, filePath = null) {
    console.log(`📋 Parsing CV id=${cvId}...`);

    
    let cv;
    if (!filePath) {
      const cvQuery = `
        SELECT id, user_id, file_path, json_backup_path
        FROM user_cvs
        WHERE id = $1
      `;
      const cvResult = await pool.query(cvQuery, [cvId]);

      if (cvResult.rows.length === 0) {
        throw new Error('CV không tồn tại');
      }

      cv = cvResult.rows[0];
      
      
      filePath = cv.json_backup_path || cv.file_path;
    } else {
      
      const cvResult = await pool.query(
        'SELECT id, user_id FROM user_cvs WHERE id = $1',
        [cvId]
      );
      
      if (cvResult.rows.length === 0) {
        throw new Error('CV không tồn tại');
      }
      
      cv = cvResult.rows[0];
    }

    console.log(`📂 File path: ${filePath}`);

    
    const parsed = await this.parseCVFile(filePath);

    console.log(`✅ Parsed successfully:`, {
      full_name: parsed.full_name,
      email: parsed.email,
      skills: typeof parsed.skills === 'string' ? 'JSON string' : 'Array',
      experience_years: parsed.total_experience_years
    });

    
    const insertQuery = `
      INSERT INTO cv_parsed_data (
        cv_id,
        user_id,
        full_name,
        email,
        phone,
        skills,
        skill_levels,
        total_experience_years,
        work_history,
        current_position,
        current_company,
        education_level,
        major,
        university,
        graduation_year,
        certifications,
        languages,
        expected_salary_min,
        expected_salary_max,
        salary_currency,
        career_objectives,
        notable_projects,
        awards,
        confidence_score,
        parsing_method,
        parsed_at
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
        $21,$22,$23,$24,$25,NOW()
      )
      ON CONFLICT (cv_id)
      DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        skills = EXCLUDED.skills,
        skill_levels = EXCLUDED.skill_levels,
        total_experience_years = EXCLUDED.total_experience_years,
        work_history = EXCLUDED.work_history,
        current_position = EXCLUDED.current_position,
        current_company = EXCLUDED.current_company,
        education_level = EXCLUDED.education_level,
        major = EXCLUDED.major,
        university = EXCLUDED.university,
        graduation_year = EXCLUDED.graduation_year,
        certifications = EXCLUDED.certifications,
        languages = EXCLUDED.languages,
        expected_salary_min = EXCLUDED.expected_salary_min,
        expected_salary_max = EXCLUDED.expected_salary_max,
        salary_currency = EXCLUDED.salary_currency,
        career_objectives = EXCLUDED.career_objectives,
        notable_projects = EXCLUDED.notable_projects,
        awards = EXCLUDED.awards,
        confidence_score = EXCLUDED.confidence_score,
        parsing_method = EXCLUDED.parsing_method,
        parsed_at = NOW(),
        updated_at = NOW()
      RETURNING *
    `;

    const ext = path.extname(filePath).toLowerCase();
    const parsingMethod = ext === '.json' ? 'JSON' : 'RULE';

    const values = [
      cv.id,
      cv.user_id,
      parsed.full_name,
      parsed.email,
      parsed.phone,
      parsed.skills, 
      parsed.skill_levels,
      parsed.total_experience_years,
      parsed.work_history,
      parsed.current_position,
      parsed.current_company,
      parsed.education_level,
      parsed.major,
      parsed.university,
      parsed.graduation_year,
      parsed.certifications,
      parsed.languages,
      parsed.expected_salary_min,
      parsed.expected_salary_max,
      parsed.salary_currency,
      parsed.career_objectives,
      parsed.notable_projects,
      parsed.awards,
      parsed.confidence_score,
      parsingMethod
    ];

    const result = await pool.query(insertQuery, values);
    console.log(`✅ CV parsed and saved, record id=${result.rows[0].id}`);
    
    return result.rows[0];
  }

  /**
   * BACKWARD COMPATIBILITY: Parse theo cv_id (old method)
   */
  static async parseByCvId(cvId) {
    return await this.parseAndSave(cvId);
  }

  
  
  

  /**
   * Tính tổng số năm kinh nghiệm từ mảng experience
   */
  static calculateYearsFromExperience(experience) {
    if (!experience || !Array.isArray(experience)) return null;
    
    let totalMonths = 0;
    
    for (const exp of experience) {
      if (!exp.period) continue;
      
      
      const match = exp.period.match(/(\d{4})\s*[-–]\s*(\d{4}|\w+)/);
      if (match) {
        const startYear = parseInt(match[1]);
        const endPart = match[2];
        
        let endYear;
        const currentKeywords = ['present', 'nay', 'hiện tại', 'current', 'now'];
        if (currentKeywords.some(kw => endPart.toLowerCase().includes(kw))) {
          endYear = new Date().getFullYear();
        } else {
          endYear = parseInt(endPart);
        }
        
        if (!isNaN(startYear) && !isNaN(endYear)) {
          totalMonths += (endYear - startYear) * 12;
        }
      }
    }
    
    return totalMonths > 0 ? Math.round(totalMonths / 12 * 10) / 10 : null;
  }

  /**
   * Trích xuất năm từ period string
   */
  static extractYear(periodString) {
    if (!periodString) return null;
    
    
    const match = periodString.match(/(\d{4})/);
    return match ? parseInt(match[1]) : null;
  }
}







module.exports = CVParserService;


module.exports.parseCV = async (cvId, filePath) => {
  return await CVParserService.parseAndSave(cvId, filePath);
};








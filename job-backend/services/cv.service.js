
import fs from "fs";
import path from "path";
import pool from "../config/db.js";
import { parseCVFile } from "./cvParser.service.js";

/**
 * Lấy danh sách CV CHƯA được parse
 */
export const getUnparsedCVs = async () => {
  const query = `
    SELECT uc.*
    FROM user_cvs uc
    LEFT JOIN cv_parsed_data cpd ON cpd.cv_id = uc.id
    WHERE cpd.id IS NULL
      AND uc.file_path IS NOT NULL
    ORDER BY uc.upload_date ASC
  `;
  const { rows } = await pool.query(query);
  return rows;
};

/**
 * Parse 1 CV theo cv_id hoặc cv object
 * @param {number|object} cvOrId - CV ID hoặc CV object
 * @param {string} filePath - Optional: file path nếu truyền CV ID
 */
export const parseSingleCV = async (cvOrId, filePath = null) => {
  let cv;
  let absolutePath;

  
  if (typeof cvOrId === 'object') {
    
    cv = cvOrId;
    absolutePath = path.resolve(cv.file_path);
  } else {
    
    if (!filePath) {
      throw new Error("File path is required when passing CV ID");
    }
    
    
    const result = await pool.query(
      'SELECT * FROM user_cvs WHERE id = $1',
      [cvOrId]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`CV not found with id: ${cvOrId}`);
    }
    
    cv = result.rows[0];
    absolutePath = path.resolve(filePath);
  }

  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`CV file not found: ${absolutePath}`);
  }

  console.log(`🔍 Parsing CV id=${cv.id}, path=${absolutePath}`);

  
  let parsedResult;
  const ext = path.extname(absolutePath).toLowerCase();
  
  if (ext === '.json') {
    console.log('📄 Detected JSON file, reading directly...');
    const jsonContent = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    
    
    parsedResult = {
      full_name: jsonContent.fullName || null,
      email: jsonContent.email || null,
      phone: jsonContent.phone || null,
      skills: jsonContent.skills || null,
      skill_levels: null, 
      total_experience_years: calculateYearsFromExperience(jsonContent.experience),
      work_history: jsonContent.experience ? JSON.stringify(jsonContent.experience) : null,
      current_position: jsonContent.position || null,
      current_company: jsonContent.experience?.[0]?.company || null,
      education_level: jsonContent.education?.[0]?.degree || null,
      major: null, 
      university: jsonContent.education?.[0]?.school || null,
      graduation_year: extractYear(jsonContent.education?.[0]?.period),
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
  } else {
    
    console.log('📄 Parsing PDF/DOC file with AI...');
    parsedResult = await parseCVFile(absolutePath);
  }

  if (!parsedResult) {
    throw new Error("Parsing failed or empty result");
  }

  const {
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
    confidence_score
  } = parsedResult;

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
      parsing_method
    )
    VALUES (
      $1,$2,$3,$4,$5,
      $6,$7,$8,$9,$10,
      $11,$12,$13,$14,$15,
      $16,$17,$18,$19,$20,
      $21,$22,$23,$24,$25
    )
    ON CONFLICT (cv_id) DO UPDATE SET
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
      parsed_at = CURRENT_TIMESTAMP
    RETURNING id
  `;

  const parsingMethod = ext === '.json' ? 'JSON' : 'AI';
  
  const values = [
    cv.id,
    cv.user_id,
    full_name || null,
    email || null,
    phone || null,
    skills || null,
    skill_levels || null,
    total_experience_years || null,
    work_history || null,
    current_position || null,
    current_company || null,
    education_level || null,
    major || null,
    university || null,
    graduation_year || null,
    certifications || null,
    languages || null,
    expected_salary_min || null,
    expected_salary_max || null,
    salary_currency || "VND",
    career_objectives || null,
    notable_projects || null,
    awards || null,
    confidence_score || null,
    parsingMethod
  ];

  const { rows } = await pool.query(insertQuery, values);
  console.log(`✅ CV parsed successfully, record id=${rows[0]?.id}`);
  return rows[0];
};

/**
 * Parse TOÀN BỘ CV chưa parse
 */
export const parseAllUnparsedCVs = async () => {
  const cvs = await getUnparsedCVs();

  const results = {
    total: cvs.length,
    success: 0,
    failed: 0,
    errors: []
  };

  for (const cv of cvs) {
    try {
      await parseSingleCV(cv);
      results.success++;
      console.log(`✅ Parsed CV id=${cv.id}`);
    } catch (err) {
      results.failed++;
      results.errors.push({
        cv_id: cv.id,
        error: err.message
      });
      console.error(`❌ Failed CV id=${cv.id}:`, err.message);
    }
  }

  return results;
};





/**
 * Tính tổng số năm kinh nghiệm từ mảng experience
 */
function calculateYearsFromExperience(experience) {
  if (!experience || !Array.isArray(experience)) return null;
  
  let totalMonths = 0;
  
  for (const exp of experience) {
    if (!exp.period) continue;
    
    
    const match = exp.period.match(/(\d{4})\s*[-–]\s*(\d{4}|\w+)/);
    if (match) {
      const startYear = parseInt(match[1]);
      const endPart = match[2];
      
      let endYear;
      if (endPart.toLowerCase() === 'present' || endPart.toLowerCase() === 'nay' || endPart.toLowerCase() === 'hiện tại') {
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
function extractYear(periodString) {
  if (!periodString) return null;
  
  
  const match = periodString.match(/(\d{4})/);
  return match ? parseInt(match[1]) : null;
}

/**
 * Export wrapper function cho controller
 * Để tương thích với cách gọi: parseCV(cvId, filePath)
 */
export const parseCV = async (cvId, filePath) => {
  return await parseSingleCV(cvId, filePath);
};
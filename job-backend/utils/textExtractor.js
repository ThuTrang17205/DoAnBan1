
const pool = require('../config/db');

let SKILLS_CACHE = null;
let CACHE_TIME = null;
const CACHE_DURATION = 3600000; 

async function loadSkillsFromDB() {
  const now = Date.now();
  
  if (SKILLS_CACHE && CACHE_TIME && (now - CACHE_TIME < CACHE_DURATION)) {
    return SKILLS_CACHE;
  }

  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        slug,
        category
      FROM skills_master
      ORDER BY name
    `);

    SKILLS_CACHE = result.rows.map(r => ({
      id: r.id,
      name: r.name.toLowerCase(),
      slug: r.slug,
      category: r.category
    }));

    CACHE_TIME = now;
    console.log(`✅ Loaded ${SKILLS_CACHE.length} skills from database`);
    
    return SKILLS_CACHE;
  } catch (error) {
    console.error('❌ Error loading skills from DB:', error);
    
    
    return [
      { id: null, name: 'javascript', slug: 'javascript', category: 'programming' },
      { id: null, name: 'nodejs', slug: 'nodejs', category: 'framework' },
      { id: null, name: 'react', slug: 'react', category: 'framework' },
      { id: null, name: 'python', slug: 'python', category: 'programming' },
      { id: null, name: 'java', slug: 'java', category: 'programming' },
      { id: null, name: 'typescript', slug: 'typescript', category: 'programming' },
      { id: null, name: 'mongodb', slug: 'mongodb', category: 'database' },
      { id: null, name: 'postgresql', slug: 'postgresql', category: 'database' },
      { id: null, name: 'docker', slug: 'docker', category: 'devops' },
      { id: null, name: 'git', slug: 'git', category: 'tool' }
    ];
  }
}

function normalizeText(text) {
  if (!text) return '';
  
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function extractSkills(text) {
  const skills = await loadSkillsFromDB();
  const textLower = text.toLowerCase();
  const found = new Map(); 

  for (const skill of skills) {
    
    const nameRegex = new RegExp(`\\b${escapeRegex(skill.name)}\\b`, 'i');
    if (nameRegex.test(textLower)) {
      found.set(skill.slug, skill.slug); 
    }
  }

  return Array.from(found.values());
}

function extractExperience(text) {
  const textLower = text.toLowerCase();
  let maxYears = 0;

  
  const pattern1 = /(\d+)\+?\s*(?:năm|years?)\s*(?:kinh nghiệm|experience|làm việc|work)/gi;
  let match;
  while ((match = pattern1.exec(textLower)) !== null) {
    const years = parseInt(match[1]);
    if (years > maxYears && years < 50) maxYears = years;
  }

  
  const pattern2 = /(?:kinh nghiệm|experience).*?(\d+)\+?\s*(?:năm|years?)/gi;
  while ((match = pattern2.exec(textLower)) !== null) {
    const years = parseInt(match[1]);
    if (years > maxYears && years < 50) maxYears = years;
  }

  
  const pattern3 = /(\d{4})\s*[-–—]\s*(\d{4}|(?:present|hiện tại|nay))/gi;
  const currentYear = new Date().getFullYear();
  let totalYearsFromDates = 0;
  
  while ((match = pattern3.exec(text)) !== null) {
    const startYear = parseInt(match[1]);
    const endYear = match[2].match(/\d{4}/) 
      ? parseInt(match[2]) 
      : currentYear;
    
    const years = endYear - startYear;
    if (years > 0 && years < 50 && startYear >= 1990) {
      totalYearsFromDates += years;
    }
  }

  
  return Math.max(maxYears, Math.min(totalYearsFromDates, 40));
}

function extractEducation(text) {
  const textLower = text.toLowerCase();

  const levels = [
    { 
      keywords: ['tiến sĩ', 'tiến sỹ', 'phd', 'ph.d', 'doctorate'], 
      value: 'phd' 
    },
    { 
      keywords: ['thạc sĩ', 'thạc sỹ', 'master', "master's", 'cao học'], 
      value: 'master' 
    },
    { 
      keywords: ['đại học', 'bachelor', "bachelor's", 'cử nhân', 'đh '], 
      value: 'bachelor' 
    },
    { 
      keywords: ['cao đẳng', 'associate', 'cđ '], 
      value: 'associate' 
    },
    { 
      keywords: ['trung học', 'phổ thông', 'high school', 'thpt'], 
      value: 'high_school' 
    }
  ];

  for (const level of levels) {
    for (const keyword of level.keywords) {
      if (textLower.includes(keyword)) {
        return level.value;
      }
    }
  }

  return 'other';
}

function extractFullName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  
  const namePatterns = [
    /(?:name|họ tên|tên):\s*([^\n]+)/i,
    /^([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)+)$/m
  ];

  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  
  if (lines.length > 0 && /^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/.test(lines[0])) {
    return lines[0];
  }

  return null;
}

function extractCurrentPosition(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const jobTitleKeywords = [
    'developer', 'engineer', 'programmer', 'architect', 'designer',
    'analyst', 'manager', 'director', 'lead', 'senior', 'junior',
    'specialist', 'consultant', 'admin', 'devops', 'tester',
    'qa', 'ba', 'product owner', 'scrum master', 'cto', 'ceo',
    'team lead', 'tech lead', 'staff engineer'
  ];

  
  for (let i = 0; i < Math.min(lines.length, 5); i++) {
    const line = lines[i];
    const lineLower = line.toLowerCase();
    
    for (const keyword of jobTitleKeywords) {
      if (lineLower.includes(keyword)) {
        return line; 
      }
    }
  }

  
  const positionMatch = text.match(/(?:vị trí|position|chức vụ|current role):\s*([^\n]+)/i);
  if (positionMatch) {
    return positionMatch[1].trim();
  }

  return null;
}

function extractEmail(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const match = text.match(emailRegex);
  return match ? match[0] : null;
}

function extractPhone(text) {
  const phonePatterns = [
    /(?:\+84|84|0)[\s.-]?\d{2,3}[\s.-]?\d{3}[\s.-]?\d{3,4}/g,
    /\d{10,11}/g
  ];

  for (const pattern of phonePatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/[\s.-]/g, '');
    }
  }

  return null;
}

function extractLocation(text) {
  const textLower = text.toLowerCase();
  
  const cities = [
    'hà nội', 'hanoi', 'hồ chí minh', 'ho chi minh', 'hcm', 'saigon',
    'đà nẵng', 'da nang', 'hải phòng', 'hai phong', 'cần thơ', 'can tho'
  ];

  for (const city of cities) {
    if (textLower.includes(city)) {
      
      return city.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
  }

  return null;
}

async function parseCVText(rawText) {
  if (!rawText || !rawText.trim()) {
    throw new Error('CV text is empty');
  }

  const text = normalizeText(rawText);

  
  const skillsArray = await extractSkills(text);
  const fullName = extractFullName(text);
  const email = extractEmail(text);
  const phone = extractPhone(text);
  const experienceYears = extractExperience(text);
  const educationLevel = extractEducation(text);
  const currentPosition = extractCurrentPosition(text);
  const location = extractLocation(text);

  return {
    
    full_name: fullName,
    name: fullName,  
    email: email,
    phone: phone,
    
    
    skills: JSON.stringify(skillsArray), 
    skill_levels: null, 
    
    
    experience_years: experienceYears,
    total_experience_years: experienceYears, 
    work_history: null,
    current_position: currentPosition,
    current_company: null,
    
    
    education_level: educationLevel,
    major: null,
    university: null,
    graduation_year: null,
    
    
    certifications: null,
    languages: null,
    expected_salary_min: null,
    expected_salary_max: null,
    salary_currency: 'VND',
    career_objectives: null,
    objective: null, 
    notable_projects: null,
    awards: null,
    
    
    location: location,
    
    
    confidence_score: 0.7 
  };
}

function clearSkillsCache() {
  SKILLS_CACHE = null;
  CACHE_TIME = null;
  console.log('✅ Skills cache cleared');
}

module.exports = {
  normalizeText,
  extractSkills,
  extractExperience,
  extractEducation,
  extractFullName,
  extractCurrentPosition,
  extractEmail,
  extractPhone,
  extractLocation,
  parseCVText,
  clearSkillsCache,
  loadSkillsFromDB,
  escapeRegex  
};
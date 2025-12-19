
const pool = require('../config/db');
const { loadSkillsFromDB, escapeRegex } = require('./textExtractor.improved');

async function parseJobText(rawText) {
  if (!rawText || !rawText.trim()) {
    throw new Error('Job description is empty');
  }

  const text = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const skills = await extractRequiredSkills(text);

  return {
    required_skills: skills.map(s => s.slug),
    required_skills_detailed: skills,
    min_experience_years: extractMinExperience(text),
    max_experience_years: extractMaxExperience(text),
    required_education_level: extractRequiredEducation(text),
    job_level: extractJobLevel(text),
    job_type: extractJobType(text),
    benefits: extractBenefits(text),
    salary_info: extractSalaryInfo(text),
    location: extractLocation(text)
  };
}

async function extractRequiredSkills(text) {
  const skills = await loadSkillsFromDB();
  const textLower = text.toLowerCase();
  const found = new Map();

  for (const skill of skills) {
    const nameRegex = new RegExp(`\\b${escapeRegex(skill.name)}\\b`, 'i');
    if (nameRegex.test(textLower)) {
      found.set(skill.id || skill.slug, {
        id: skill.id,
        name: skill.name,
        slug: skill.slug
      });
    }
  }

  return Array.from(found.values());
}

function extractMinExperience(text) {
  const textLower = text.toLowerCase();

  const patterns = [
    
    /(?:yêu cầu|cần|require|minimum).*?(?:tối thiểu|ít nhất|at least).*?(\d+)\+?\s*(?:năm|years?)/i,
    
    /(?:tối thiểu|ít nhất|minimum|at least).*?(\d+)\+?\s*(?:năm|years?)/i,
    
    /(?:yêu cầu|require).*?(\d+)\s*[-–]\s*\d+\s*(?:năm|years?)/i,
    
    /(\d+)\+\s*(?:năm|years?).*?(?:kinh nghiệm|experience)/i,
    
    /(\d+)\s*(?:năm|years?).*?(?:trở lên|or more|above)/i
  ];

  for (const pattern of patterns) {
    const match = textLower.match(pattern);
    if (match) {
      const years = parseInt(match[1]);
      if (years >= 0 && years < 50) return years;
    }
  }

  return 0;
}

function extractMaxExperience(text) {
  const textLower = text.toLowerCase();

  
  const rangePattern = /(\d+)\s*[-–]\s*(\d+)\s*(?:năm|years?).*?(?:kinh nghiệm|experience)/i;
  const match = textLower.match(rangePattern);
  
  if (match) {
    const max = parseInt(match[2]);
    if (max > 0 && max < 50) return max;
  }

  return null;
}

function extractRequiredEducation(text) {
  const textLower = text.toLowerCase();

  
  const requirementPatterns = [
    { keywords: ['yêu cầu.*?(?:tiến sĩ|phd)', 'cần.*?phd'], value: 'phd' },
    { keywords: ['yêu cầu.*?(?:thạc sĩ|master)', 'cần.*?master'], value: 'master' },
    { keywords: ['yêu cầu.*?(?:đại học|bachelor|cử nhân)', 'cần.*?bachelor'], value: 'bachelor' },
    { keywords: ['yêu cầu.*?cao đẳng', 'cần.*?cao đẳng'], value: 'associate' }
  ];

  for (const level of requirementPatterns) {
    for (const keyword of level.keywords) {
      const regex = new RegExp(keyword, 'i');
      if (regex.test(textLower)) {
        return level.value;
      }
    }
  }

  
  if (/tiến sĩ|phd/i.test(textLower)) return 'phd';
  if (/thạc sĩ|master/i.test(textLower)) return 'master';
  if (/đại học|bachelor/i.test(textLower)) return 'bachelor';

  return null;
}

function extractJobLevel(text) {
  const textLower = text.toLowerCase();

  const levels = [
    { keywords: ['senior', 'cao cấp', 'chuyên gia', 'expert'], value: 'senior' },
    { keywords: ['middle', 'trung cấp', 'mid-level'], value: 'middle' },
    { keywords: ['junior', 'sơ cấp', 'entry-level'], value: 'junior' },
    { keywords: ['intern', 'thực tập sinh', 'internship'], value: 'intern' },
    { keywords: ['fresher', 'mới ra trường'], value: 'fresher' }
  ];

  for (const level of levels) {
    for (const keyword of level.keywords) {
      if (textLower.includes(keyword)) {
        return level.value;
      }
    }
  }

  return 'entry';
}

function extractJobType(text) {
  const textLower = text.toLowerCase();

  if (/full[- ]?time|toàn thời gian/i.test(textLower)) return 'full-time';
  if (/part[- ]?time|bán thời gian/i.test(textLower)) return 'part-time';
  if (/contract|hợp đồng/i.test(textLower)) return 'contract';
  if (/freelance|tự do/i.test(textLower)) return 'freelance';
  if (/intern|thực tập/i.test(textLower)) return 'internship';

  return 'full-time'; 
}

function extractBenefits(text) {
  const textLower = text.toLowerCase();
  const benefits = [];

  const benefitKeywords = [
    { keywords: ['bảo hiểm', 'insurance', 'bhxh', 'bhyt'], value: 'insurance' },
    { keywords: ['thưởng', 'bonus', '13th month'], value: 'bonus' },
    { keywords: ['đào tạo', 'training', 'học tập'], value: 'training' },
    { keywords: ['du lịch', 'team building', 'outing'], value: 'team_building' },
    { keywords: ['laptop', 'máy tính'], value: 'laptop' },
    { keywords: ['remote', 'wfh', 'work from home', 'làm việc từ xa'], value: 'remote' },
    { keywords: ['gym', 'fitness', 'thể thao'], value: 'gym' },
    { keywords: ['nghỉ phép', 'annual leave', 'paid leave'], value: 'paid_leave' }
  ];

  for (const benefit of benefitKeywords) {
    for (const keyword of benefit.keywords) {
      if (textLower.includes(keyword)) {
        benefits.push(benefit.value);
        break;
      }
    }
  }

  return [...new Set(benefits)]; 
}

function extractSalaryInfo(text) {
  const textLower = text.toLowerCase();

  
  const salaryPatterns = [
    
    /(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|million)/i,
    
    /\$?\s*(\d+(?:[.,]\d+)?)\s*[-–]\s*(\d+(?:[.,]\d+)?)\s*(?:usd|\$)?/i,
    
    /(?:lương|salary).*?(\d+(?:[.,]\d+)?)\s*(?:triệu|tr|million)/i
  ];

  for (const pattern of salaryPatterns) {
    const match = textLower.match(pattern);
    if (match) {
      const min = parseFloat(match[1].replace(',', '.'));
      const max = match[2] ? parseFloat(match[2].replace(',', '.')) : null;

      return {
        min: min,
        max: max,
        currency: textLower.includes('usd') || textLower.includes('$') ? 'USD' : 'VND',
        unit: textLower.includes('triệu') ? 'million' : 'raw'
      };
    }
  }

  
  if (/thỏa thuận|negotiable|cạnh tranh/i.test(textLower)) {
    return {
      negotiable: true,
      min: null,
      max: null
    };
  }

  return null;
}

function extractLocation(text) {
  const textLower = text.toLowerCase();

  const locations = [
    { keywords: ['hà nội', 'hanoi', 'ha noi'], value: 'Hà Nội' },
    { keywords: ['hồ chí minh', 'ho chi minh', 'hcm', 'saigon', 'sài gòn'], value: 'Hồ Chí Minh' },
    { keywords: ['đà nẵng', 'da nang'], value: 'Đà Nẵng' },
    { keywords: ['hải phòng', 'hai phong'], value: 'Hải Phòng' },
    { keywords: ['cần thơ', 'can tho'], value: 'Cần Thơ' }
  ];

  for (const loc of locations) {
    for (const keyword of loc.keywords) {
      if (textLower.includes(keyword)) {
        return loc.value;
      }
    }
  }

  return null;
}

module.exports = {
  parseJobText,
  extractRequiredSkills,
  extractMinExperience,
  extractMaxExperience,
  extractRequiredEducation,
  extractJobLevel,
  extractJobType,
  extractBenefits,
  extractSalaryInfo,
  extractLocation
};
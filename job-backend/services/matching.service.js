
const pool = require('../config/db');
const MatchingModel = require('../models/matching.model');

class MatchingService {
  /**
   * Match nhiều candidates cho 1 job (Core function)
   * @param {Number} jobId 
   * @param {Object} options - { candidateIds, limit, useRelations }
   */
  async matchCandidatesForJob(jobId, options = {}) {
    const { 
      candidateIds, 
      limit = 100,
      useRelations = true 
    } = options;

    console.log(`Starting matching for job ${jobId}`);

    
    const jobQuery = await pool.query(`
      SELECT 
        jpd.*,
        j.title,
        j.min_salary,
        j.max_salary,
        j.location,
        j.education_level_id
      FROM job_parsed_data jpd
      INNER JOIN jobs j ON j.id = jpd.job_id
      WHERE jpd.job_id = $1
    `, [jobId]);

    if (jobQuery.rows.length === 0) {
      throw new Error(`Job ${jobId} chưa được parse. Vui lòng parse job trước.`);
    }

    const jobData = jobQuery.rows[0];
    console.log(`Job: ${jobData.title || jobData.job_title}`);

    
    let jobSkills = [];
    if (useRelations) {
      const jobSkillsQuery = await pool.query(`
        SELECT 
          js.skill_id,
          js.is_required,
          js.required_level,
          js.weight,
          sm.name as skill_name,
          sm.slug as skill_slug
        FROM job_skills js
        INNER JOIN skills_master sm ON js.skill_id = sm.id
        WHERE js.job_id = $1
        ORDER BY js.is_required DESC, js.weight DESC
      `, [jobId]);

      jobSkills = jobSkillsQuery.rows;
      console.log(`Job requires ${jobSkills.length} skills (from job_skills table)`);
    } else {
      
      if (jobData.required_skills) {
        const skills = typeof jobData.required_skills === 'string' 
          ? JSON.parse(jobData.required_skills)
          : jobData.required_skills;
        
        jobSkills = skills.map(s => ({
          skill_slug: typeof s === 'string' ? s : s.slug,
          is_required: true,
          required_level: 3,
          weight: 1.0
        }));
        console.log(`Job requires ${jobSkills.length} skills (from JSONB)`);
      }
    }

    
    

let candidateQuery = `
  SELECT DISTINCT 
    cpd.cv_id,
    cpd.user_id,
    cpd.skills,
    cpd.skill_levels,
    cpd.total_experience_years,
    cpd.education_level,
    cpd.current_position,
    cpd.expected_salary_min,
    cpd.expected_salary_max,
    cpd.phone,
    cpd.work_history,         
    u.id as user_id,
    u.name,
    u.email,
    u.avatar,
    up.education_level_id,
    up.current_location,
    up.preferred_location
  FROM cv_parsed_data cpd
  INNER JOIN users u ON cpd.user_id = u.id
  LEFT JOIN user_profiles up ON u.id = up.user_id
  WHERE u.role = 'user'
    AND u.is_active = true
`;

    const params = [];

    if (candidateIds && candidateIds.length > 0) {
      candidateQuery += ` AND cpd.user_id = ANY($1)`;
      params.push(candidateIds);
    }

    candidateQuery += ` LIMIT $${params.length + 1}`;
    params.push(limit);

    const candidatesResult = await pool.query(candidateQuery, params);
    const candidates = candidatesResult.rows;

    console.log(`Found ${candidates.length} candidates to match`);

    
    const weights = await this.getMatchingWeights();

    
    const matches = [];
    let processed = 0;

    for (const candidate of candidates) {
      try {
        
        let candidateSkills = [];
        if (useRelations) {
          const candidateSkillsQuery = await pool.query(`
            SELECT 
              cs.skill_id,
              cs.proficiency_level,
              cs.years_experience,
              sm.name as skill_name,
              sm.slug as skill_slug
            FROM candidate_skills cs
            INNER JOIN skills_master sm ON cs.skill_id = sm.id
            WHERE cs.user_id = $1
          `, [candidate.user_id]);

          candidateSkills = candidateSkillsQuery.rows;
        } else {
          
          if (candidate.skills) {
            const skills = typeof candidate.skills === 'string'
              ? JSON.parse(candidate.skills)
              : candidate.skills;
            
            candidateSkills = skills.map(s => ({
              skill_slug: typeof s === 'string' ? s : s.slug || s.name,
              proficiency_level: 3
            }));
          }
        }

        
        const scores = await this.calculateMatchScores(
          jobData,
          jobSkills,
          candidate,
          candidateSkills,
          weights
        );

        
        await MatchingModel.saveMatchingScore({
          job_id: jobId,
          candidate_id: candidate.user_id,
          ...scores
        });

      matches.push({
  
  candidate_id: candidate.user_id,
  cv_id: candidate.cv_id,
  
  
  candidate_name: candidate.name,
  candidate_email: candidate.email,
  candidate_phone: candidate.phone,
  candidate_avatar: candidate.avatar,
  
  
  current_position: candidate.current_position,
  total_experience_years: candidate.total_experience_years,
  education_level: candidate.education_level,
  current_location: candidate.current_location,
  
  
  work_history: candidate.work_history,  
  education: candidate.education,
  skills: candidate.skills,
  skill_levels: candidate.skill_levels,
  bio: candidate.bio,
  
  
  expected_salary_min: candidate.expected_salary_min,
  expected_salary_max: candidate.expected_salary_max,
  
  
  ...scores
});
        processed++;
        if (processed % 10 === 0) {
          console.log(`Processed ${processed}/${candidates.length} candidates`);
        }

      } catch (error) {
        console.error(`Error matching candidate ${candidate.user_id}:`, error.message);
      }
    }

    
    matches.sort((a, b) => b.total_score - a.total_score);

    console.log(`Matching completed! Top score: ${matches[0]?.total_score || 0}`);

    return {
      job_id: jobId,
      total_candidates: matches.length,
      qualified_candidates: matches.filter(m => m.is_qualified).length,
      matches
    };
  }

  /**
   * Tính điểm chi tiết (Core scoring algorithm)
   */
  async calculateMatchScores(jobData, jobSkills, candidateData, candidateSkills, weights) {
    
    const skillsScore = this.calculateSkillsScore(jobSkills, candidateSkills);

    
    const experienceScore = this.calculateExperienceScore(
      jobData.min_experience_years,
      jobData.max_experience_years,
      candidateData.total_experience_years
    );

    
    const educationScore = await this.calculateEducationScore(
      jobData.education_level_id,
      candidateData.education_level_id,
      candidateData.education_level 
    );

    
    const locationScore = this.calculateLocationScore(
      jobData.work_location || jobData.location,
      candidateData.preferred_location || candidateData.current_location
    );

    
    const salaryScore = this.calculateSalaryScore(
      jobData.salary_min,
      jobData.salary_max,
      candidateData.expected_salary_min,
      candidateData.expected_salary_max
    );

    
    const totalScore = 
      skillsScore * weights.skills +
      experienceScore * weights.experience +
      educationScore * weights.education +
      locationScore * weights.location +
      salaryScore * weights.salary;

    const isQualified = totalScore >= 60;

    return {
      total_score: Math.round(totalScore * 100) / 100,
      skills_score: Math.round(skillsScore * 100) / 100,
      experience_score: Math.round(experienceScore * 100) / 100,
      education_score: Math.round(educationScore * 100) / 100,
      location_score: Math.round(locationScore * 100) / 100,
      salary_score: Math.round(salaryScore * 100) / 100,
      is_qualified: isQualified
    };
  }

  /**
   * Tính điểm Skills (ADVANCED với level matching)
   */
  calculateSkillsScore(jobSkills, candidateSkills) {
    if (!jobSkills || jobSkills.length === 0) return 100;
    if (!candidateSkills || candidateSkills.length === 0) return 0;

    
    const candidateSkillMap = new Map();
    candidateSkills.forEach(cs => {
      const key = cs.skill_id || cs.skill_slug;
      candidateSkillMap.set(key, cs);
    });

    let totalScore = 0;
    let totalWeight = 0;

    
    for (const jobSkill of jobSkills) {
      const weight = jobSkill.weight || 1.0;
      totalWeight += weight;

      const key = jobSkill.skill_id || jobSkill.skill_slug;
      const candidateSkill = candidateSkillMap.get(key);

      if (!candidateSkill) {
        
        if (jobSkill.is_required) {
          
          totalScore += 0 * weight;
        } else {
          
          totalScore += 50 * weight;
        }
      } else {
        
        const candidateLevel = candidateSkill.proficiency_level || 3;
        const requiredLevel = jobSkill.required_level || 3;

        if (candidateLevel >= requiredLevel) {
          
          totalScore += 100 * weight;
        } else if (candidateLevel === requiredLevel - 1) {
          
          totalScore += 80 * weight;
        } else {
          
          totalScore += 60 * weight;
        }
      }
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Tính điểm Experience
   */
  calculateExperienceScore(minRequired, maxRequired, candidateExp) {
    if (!minRequired && !maxRequired) return 100;
    if (!candidateExp) return 0;

    const min = parseFloat(minRequired) || 0;
    const max = parseFloat(maxRequired) || 999;
    const exp = parseFloat(candidateExp);

    if (exp >= min && exp <= max) {
      
      return 100;
    } else if (exp >= min) {
      
      return 90;
    } else {
      
      const ratio = exp / min;
      if (ratio >= 0.8) return 80; 
      if (ratio >= 0.6) return 60; 
      return Math.max(0, ratio * 100);
    }
  }

  /**
   * Tính điểm Education (dùng rank từ education_levels)
   */
  async calculateEducationScore(jobEducationId, candidateEducationId, candidateEducationText) {
    if (!jobEducationId) return 100; 

    
    if (jobEducationId && candidateEducationId) {
      const query = await pool.query(`
        SELECT 
          (SELECT rank FROM education_levels WHERE id = $1) as job_rank,
          (SELECT rank FROM education_levels WHERE id = $2) as candidate_rank
      `, [jobEducationId, candidateEducationId]);

      if (query.rows.length > 0) {
        const { job_rank, candidate_rank } = query.rows[0];
        
        if (candidate_rank >= job_rank) return 100; 
        if (candidate_rank === job_rank - 1) return 80; 
        return 60; 
      }
    }

    
    if (candidateEducationText) {
      const jobEducation = await pool.query(
        'SELECT name FROM education_levels WHERE id = $1',
        [jobEducationId]
      );
      
      if (jobEducation.rows.length > 0) {
        const jobName = jobEducation.rows[0].name.toLowerCase();
        const candidateName = candidateEducationText.toLowerCase();
        
        if (candidateName.includes(jobName)) return 100;
      }
    }

    return 50; 
  }

  /**
   * Tính điểm Location
   */
  calculateLocationScore(jobLocation, candidateLocation) {
    if (!jobLocation) return 100; 
    if (!candidateLocation) return 50; 

    const jobLoc = jobLocation.toLowerCase();
    const candLoc = candidateLocation.toLowerCase();

    
    if (candLoc.includes(jobLoc) || jobLoc.includes(candLoc)) return 100;

    
    const cities = ['hanoi', 'hcm', 'ho chi minh', 'danang', 'da nang'];
    for (const city of cities) {
      if (jobLoc.includes(city) && candLoc.includes(city)) return 100;
    }

    
    if (jobLoc.includes('remote') || candLoc.includes('remote')) return 90;

    
    return 30;
  }

  /**
   * Tính điểm Salary
   */
  calculateSalaryScore(jobMin, jobMax, candidateMin, candidateMax) {
    if (!jobMin && !jobMax) return 100; 
    if (!candidateMin && !candidateMax) return 100; 

    const jMin = parseFloat(jobMin) || 0;
    const jMax = parseFloat(jobMax) || 999999999;
    const cMin = parseFloat(candidateMin) || 0;
    const cMax = parseFloat(candidateMax) || 999999999;

    
    if (cMin <= jMax && cMax >= jMin) {
      
      const overlapMin = Math.max(cMin, jMin);
      const overlapMax = Math.min(cMax, jMax);
      const overlapRange = overlapMax - overlapMin;
      const jobRange = jMax - jMin;
      
      const overlapRatio = jobRange > 0 ? overlapRange / jobRange : 1;
      return Math.min(100, 50 + overlapRatio * 50); 
    }

    
    if (cMin > jMax) {
      
      const gap = ((cMin - jMax) / jMax) * 100;
      if (gap <= 10) return 40; 
      if (gap <= 20) return 20; 
      return 0; 
    }

    
    return 80;
  }

  /**
   * Get matching weights from config
   */
  async getMatchingWeights() {
    const config = await MatchingModel.getMatchingConfig();
    
    
    return {
      skills: config.skills || 0.5,
      experience: config.experience || 0.25,
      education: config.education || 0.15,
      location: config.location || 0.05,
      salary: config.salary || 0.05
    };
  }

  /**
   * Match jobs cho 1 candidate
   */
  async matchJobsForCandidate(candidateId, options = {}) {
    const { filters, limit = 20 } = options;

    console.log(`🔍 Finding jobs for candidate ${candidateId}`);

    
    

    throw new Error('matchJobsForCandidate: Not implemented yet');
  }

  /**
   * Get recommended jobs (từ DB)
   */
  async getRecommendedJobs(candidateId, options = {}) {
    return await MatchingModel.getCandidateMatchingScores(candidateId, options);
  }

  /**
   * Get top candidates (từ DB)
   */
  async getTopCandidates(jobId, options = {}) {
    return await MatchingModel.getMatchingScores(jobId, options);
  }
}

module.exports = new MatchingService();
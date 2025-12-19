
const db = require('../config/db');




const getMatchedCandidates = async (jobId, filters = {}) => {
  const { 
    minScore = 0, 
    limit = 20, 
    offset = 0,
    isQualified = null 
  } = filters;

  let query = `
    SELECT 
      ms.id,
      ms.candidate_id as user_id,
      ms.job_id,
      ms.skills_score,
      ms.experience_score,
      ms.salary_score,
      ms.location_score,
      ms.education_score,
      ms.total_score,
      ms.is_qualified,
      ms.created_at,
      u.name as full_name,
      u.email,
      u.avatar,
      u.phone,
      u.job_title as desired_position,
      u.experience_years as years_of_experience,
      u.desired_salary_min,
      u.desired_salary_max,
      u.desired_location as preferred_location,
      u.education_level,
      u.skills as skills_list
    FROM matching_scores ms
    INNER JOIN users u ON ms.candidate_id = u.id
    WHERE ms.job_id = $1
      AND ms.total_score >= $2
      AND u.role = 'candidate'
      ${isQualified !== null ? 'AND ms.is_qualified = $5' : ''}
    ORDER BY ms.total_score DESC
    LIMIT $3 OFFSET $4
  `;

  const params = isQualified !== null 
    ? [jobId, minScore, limit, offset, isQualified]
    : [jobId, minScore, limit, offset];

  const result = await db.query(query, params);
  
  
  const countQuery = `
    SELECT COUNT(*) 
    FROM matching_scores ms
    INNER JOIN users u ON ms.candidate_id = u.id
    WHERE ms.job_id = $1 
      AND ms.total_score >= $2
      AND u.role = 'candidate'
      ${isQualified !== null ? 'AND ms.is_qualified = $3' : ''}
  `;
  
  const countParams = isQualified !== null 
    ? [jobId, minScore, isQualified]
    : [jobId, minScore];
  
  const countResult = await db.query(countQuery, countParams);
  
  return {
    candidates: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: Math.floor(offset / limit) + 1,
      limit: limit,
      offset: offset
    }
  };
};




const getMatchedJobs = async (candidateId, filters = {}) => {
  const { 
    minScore = 0, 
    limit = 20, 
    offset = 0,
    isQualified = null,
    location = null
  } = filters;

  let query = `
    SELECT 
      ms.id,
      ms.candidate_id,
      ms.job_id,
      ms.skills_score,
      ms.experience_score,
      ms.salary_score,
      ms.location_score,
      ms.education_score,
      ms.total_score,
      ms.is_qualified,
      ms.created_at,
      j.title,
      j.description,
      j.location,
      j.city,
      j.min_salary,
      j.max_salary,
      j.required_years_experience,
      j.education_required,
      j.skills_required,
      j.posted_at as job_posted_at,
      j.application_deadline,
      j.is_remote,
      j.job_type,
      c.name as company_name,
      c.logo as company_logo,
      c.size as company_size,
      EXISTS(
        SELECT 1 FROM applications 
        WHERE job_id = j.id AND user_id = $1
      ) as has_applied
    FROM matching_scores ms
    INNER JOIN jobs j ON ms.job_id = j.id
    LEFT JOIN companies c ON j.company_id = c.id
    WHERE ms.candidate_id = $1
      AND ms.total_score >= $2
      AND j.status = 'open'
      ${isQualified !== null ? 'AND ms.is_qualified = $5' : ''}
      ${location ? 'AND (j.location ILIKE $6 OR j.city ILIKE $6)' : ''}
    ORDER BY ms.total_score DESC
    LIMIT $3 OFFSET $4
  `;

  let params = [candidateId, minScore, limit, offset];
  if (isQualified !== null) params.push(isQualified);
  if (location) params.push(`%${location}%`);

  const result = await db.query(query, params);
  
  
  let countQuery = `
    SELECT COUNT(*) 
    FROM matching_scores ms
    INNER JOIN jobs j ON ms.job_id = j.id
    WHERE ms.candidate_id = $1 
      AND ms.total_score >= $2
      AND j.status = 'open'
  `;
  
  let countParams = [candidateId, minScore];
  let paramIndex = 3;
  
  if (isQualified !== null) {
    countQuery += ` AND ms.is_qualified = $${paramIndex}`;
    countParams.push(isQualified);
    paramIndex++;
  }
  
  if (location) {
    countQuery += ` AND (j.location ILIKE $${paramIndex} OR j.city ILIKE $${paramIndex})`;
    countParams.push(`%${location}%`);
  }
  
  const countResult = await db.query(countQuery, countParams);
  
  return {
    jobs: result.rows,
    pagination: {
      total: parseInt(countResult.rows[0].count),
      page: Math.floor(offset / limit) + 1,
      limit: limit,
      offset: offset
    }
  };
};




const runMatching = async (jobId) => {
  const client = await db.connect();
  
  try {
    await client.query('BEGIN');

    console.log(`Starting matching for job ID: ${jobId}`);

    
    await client.query('DELETE FROM matching_scores WHERE job_id = $1', [jobId]);

    
const jobResult = await client.query(`
  SELECT 
    j.id,
    j.status,
    j.min_salary,
    j.max_salary,
    COALESCE(j.city, j.location) as location,
    COALESCE(j.required_years_experience, 0) as experience_required,
    j.education_required,
    COALESCE(j.skills_required, ARRAY[]::text[]) as skills_required
  FROM jobs j
  WHERE j.id = $1 AND j.status = 'open'
`, [jobId]);

    if (jobResult.rows.length === 0) {
      throw new Error('Job not found or not open');
    }

    const job = jobResult.rows[0];
    console.log('Job details:', {
      id: job.id,
      skills_count: job.skills_required?.length || 0,
      experience_required: job.experience_required,
      location: job.location
    });

    
    const candidatesResult = await client.query(`
      SELECT 
        id as candidate_id,
        name,
        COALESCE(skills, ARRAY[]::text[]) as skills,
        COALESCE(experience_years, 0) as experience_years,
        desired_salary_min,
        desired_salary_max,
        desired_location,
        education_level
      FROM users
      WHERE role = 'candidate'
        AND COALESCE(is_active, true) = true
        AND COALESCE(is_seeking_job, true) = true
    `);

    console.log(`Found ${candidatesResult.rows.length} candidates to match`);

    if (candidatesResult.rows.length === 0) {
      console.log('No candidates found');
      await client.query('COMMIT');
      return {
        total_candidates: 0,
        qualified_candidates: 0,
        avg_score: 0,
        max_score: 0,
        min_score: 0
      };
    }

    
    const matchingScores = [];
    
    for (const candidate of candidatesResult.rows) {
      console.log(`Processing candidate ${candidate.candidate_id}: ${candidate.name}`);

      
      let skillsScore = 100.0;
      if (job.skills_required && job.skills_required.length > 0) {
        if (!candidate.skills || candidate.skills.length === 0) {
          skillsScore = 0.0;
          console.log(`  - Skills: 0% (no skills)`);
        } else {
          const matchedSkills = job.skills_required.filter(skill => 
            candidate.skills.includes(skill)
          );
          skillsScore = (matchedSkills.length / job.skills_required.length) * 100.0;
          console.log(`  - Skills: ${skillsScore.toFixed(2)}% (${matchedSkills.length}/${job.skills_required.length} matched)`);
        }
      } else {
        console.log(`  - Skills: 100% (no requirements)`);
      }

      
      let experienceScore = 100.0;
      if (job.experience_required > 0) {
        if (candidate.experience_years >= job.experience_required) {
          experienceScore = 100.0;
        } else if (candidate.experience_years >= job.experience_required * 0.8) {
          experienceScore = 80.0;
        } else if (candidate.experience_years >= job.experience_required * 0.5) {
          experienceScore = 50.0;
        } else {
          experienceScore = 30.0;
        }
        console.log(`  - Experience: ${experienceScore}% (has ${candidate.experience_years}, needs ${job.experience_required})`);
      } else {
        console.log(`  - Experience: 100% (no requirements)`);
      }

      
      let salaryScore = 100.0;
      if (job.min_salary && job.max_salary && candidate.desired_salary_min) {
        const candidateMax = candidate.desired_salary_max || candidate.desired_salary_min * 2;
        
        if (candidate.desired_salary_min <= job.max_salary && candidateMax >= job.min_salary) {
          salaryScore = 100.0;
        } else if (candidate.desired_salary_min <= job.max_salary * 1.2) {
          salaryScore = 80.0;
        } else if (candidate.desired_salary_min <= job.max_salary * 1.5) {
          salaryScore = 60.0;
        } else {
          salaryScore = 40.0;
        }
        console.log(`  - Salary: ${salaryScore}% (wants ${candidate.desired_salary_min}-${candidateMax}, offers ${job.min_salary}-${job.max_salary})`);
      } else {
        console.log(`  - Salary: 100% (no requirements)`);
      }

      
      let locationScore = 100.0;
      if (job.location) {
        if (!candidate.desired_location) {
          locationScore = 50.0;
          console.log(`  - Location: 50% (candidate has no preference)`);
        } else {
          const jobLoc = job.location.toLowerCase().trim();
          const candLoc = candidate.desired_location.toLowerCase().trim();
          
          if (jobLoc === candLoc) {
            locationScore = 100.0;
          } else if (jobLoc.includes(candLoc) || candLoc.includes(jobLoc)) {
            locationScore = 80.0;
          } else {
            locationScore = 30.0;
          }
          console.log(`  - Location: ${locationScore}% (wants "${candidate.desired_location}", job in "${job.location}")`);
        }
      } else {
        console.log(`  - Location: 100% (no requirements)`);
      }

      
      let educationScore = 100.0;
      if (job.education_required && candidate.education_level) {
        const eduLevel = candidate.education_level.toLowerCase();
        
        if (eduLevel.match(/(master|tiến sĩ|thạc sĩ|phd|doctorate)/)) {
          educationScore = 100.0;
        } else if (eduLevel.match(/(bachelor|đại học|cử nhân|university)/)) {
          educationScore = 90.0;
        } else if (eduLevel.match(/(college|cao đẳng|diploma)/)) {
          educationScore = 70.0;
        } else {
          educationScore = 50.0;
        }
        console.log(`  - Education: ${educationScore}% (has "${candidate.education_level}")`);
      } else if (!job.education_required) {
        console.log(`  - Education: 100% (no requirements)`);
      } else {
        educationScore = 50.0;
        console.log(`  - Education: 50% (no education info)`);
      }

      
      const totalScore = Math.round(
        (skillsScore * 0.35 +
         experienceScore * 0.25 +
         salaryScore * 0.20 +
         locationScore * 0.10 +
         educationScore * 0.10) * 100
      ) / 100;

      const isQualified = totalScore >= 70;
      console.log(`  → Total Score: ${totalScore}% (${isQualified ? 'QUALIFIED' : 'not qualified'})`);

      
      if (totalScore > 0) {
        matchingScores.push({
          candidate_id: candidate.candidate_id,
          skills_score: Math.round(skillsScore * 100) / 100,
          experience_score: Math.round(experienceScore * 100) / 100,
          salary_score: Math.round(salaryScore * 100) / 100,
          location_score: Math.round(locationScore * 100) / 100,
          education_score: Math.round(educationScore * 100) / 100,
          total_score: totalScore,
          is_qualified: isQualified
        });
      }
    }

    console.log(`Calculated scores for ${matchingScores.length} candidates`);

    
    if (matchingScores.length > 0) {
      for (const score of matchingScores) {
        await client.query(`
          INSERT INTO matching_scores (
            job_id, candidate_id, skills_score, experience_score,
            salary_score, location_score, education_score,
            total_score, is_qualified, created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
        `, [
          jobId,
          score.candidate_id,
          score.skills_score,
          score.experience_score,
          score.salary_score,
          score.location_score,
          score.education_score,
          score.total_score,
          score.is_qualified
        ]);
      }
      console.log(`Inserted ${matchingScores.length} matching scores`);
    }

    await client.query('COMMIT');
    console.log('Transaction committed successfully');

    
    const stats = await client.query(`
      SELECT 
        COALESCE(COUNT(*), 0) as total_candidates,
        COALESCE(COUNT(*) FILTER (WHERE is_qualified = true), 0) as qualified_candidates,
        COALESCE(ROUND(AVG(total_score)::numeric, 2), 0) as avg_score,
        COALESCE(MAX(total_score), 0) as max_score,
        COALESCE(MIN(total_score), 0) as min_score
      FROM matching_scores
      WHERE job_id = $1
    `, [jobId]);

    const result = stats.rows[0];
    console.log('Final stats:', result);
    return result;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in runMatching:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    throw error;
  } finally {
    client.release();
  }
};




const getMatchingStats = async (jobId) => {
  const query = `
    SELECT 
      COALESCE(COUNT(*), 0) as total_matched,
      COALESCE(COUNT(*) FILTER (WHERE is_qualified = true), 0) as qualified_count,
      COALESCE(COUNT(*) FILTER (WHERE total_score >= 80), 0) as excellent_matches,
      COALESCE(COUNT(*) FILTER (WHERE total_score >= 60 AND total_score < 80), 0) as good_matches,
      COALESCE(COUNT(*) FILTER (WHERE total_score < 60), 0) as fair_matches,
      COALESCE(AVG(skills_score), 0) as avg_skills_score,
      COALESCE(AVG(experience_score), 0) as avg_experience_score,
      COALESCE(AVG(salary_score), 0) as avg_salary_score,
      COALESCE(AVG(location_score), 0) as avg_location_score,
      COALESCE(AVG(education_score), 0) as avg_education_score,
      COALESCE(AVG(total_score), 0) as avg_total_score
    FROM matching_scores
    WHERE job_id = $1
  `;

  const result = await db.query(query, [jobId]);
  return result.rows[0];
};




module.exports = {
  getMatchedCandidates,
  getMatchedJobs,
  runMatching,
  getMatchingStats
};
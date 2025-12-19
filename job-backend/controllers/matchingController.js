const matchingService = require('../services/matching.service');
const MatchingModel = require('../models/matching.model');
const pool = require('../config/db');

class MatchingController {
  
  /**
   * POST /api/matching/jobs/:jobId/run-matching
   * Chạy thuật toán matching cho một job cụ thể
   */
  async runMatching(req, res) {
    try {
      const { jobId } = req.params;
      const { candidateIds, limit } = req.body;

      console.log(' Starting matching for job:', jobId);

      
      const result = await matchingService.matchCandidatesForJob(jobId, {
        candidateIds,
        limit: limit || 100
      });

      
      res.json({
        success: true,
        message: 'Matching completed successfully',
        data: {
          job_id: parseInt(jobId),
          stats: {
            total_candidates: result.total_candidates,
            qualified_candidates: result.matches.filter(m => m.is_qualified).length,
            average_score: result.matches.length > 0 
              ? (result.matches.reduce((sum, m) => sum + m.total_score, 0) / result.matches.length).toFixed(2)
              : 0,
            max_score: result.matches.length > 0 
              ? Math.max(...result.matches.map(m => m.total_score)).toFixed(2)
              : 0,
            min_score: result.matches.length > 0 
              ? Math.min(...result.matches.map(m => m.total_score)).toFixed(2)
              : 0
          }
        }
      });
    } catch (error) {
      console.error(' Error running matching:', error);
      res.status(500).json({
        success: false,
        message: 'Error running matching algorithm',
        error: error.message
      });
    }
  }

  async getMatchedCandidates(req, res) {
    try {
      const { jobId } = req.params;
      const { 
        minScore = 60, 
        limit = 20, 
        offset = 0, 
        isQualified 
      } = req.query;

      const options = {
        minScore: parseFloat(minScore),
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      if (isQualified !== undefined) {
        options.qualifiedOnly = isQualified === 'true';
      }

      console.log(` Getting matched candidates for job ${jobId} with options:`, options);

     
      const candidates = await MatchingModel.getMatchingScores(jobId, options);
      
      console.log(`Found ${candidates.length} matched candidates`);

      if (candidates.length === 0) {
        return res.json({
          success: true,
          message: 'No matched candidates found. Please run matching algorithm first.',
          data: {
            job_id: parseInt(jobId),
            candidates: [],
            pagination: {
              total: 0,
              limit: parseInt(limit),
              offset: parseInt(offset)
            }
          }
        });
      }


const enrichedCandidates = await Promise.all(
  candidates.map(async (candidate) => {
   
    let skills = [];
    
    try {
      const skillsResult = await pool.query(`
        SELECT 
          sm.name as skill_name,
          sm.slug,
          cs.proficiency_level,
          cs.years_experience
        FROM candidate_skills cs
        INNER JOIN skills_master sm ON cs.skill_id = sm.id
        WHERE cs.user_id = $1
      `, [candidate.candidate_id]);
      
      skills = skillsResult.rows;
    } catch (err) {
      console.log(`  Could not fetch skills for candidate ${candidate.candidate_id}`);
    }
    
    
    if (skills.length === 0) {
      try {
        const cvSkillsResult = await pool.query(`
          SELECT skills
          FROM cv_parsed_data
          WHERE user_id = $1
          LIMIT 1
        `, [candidate.candidate_id]);
        
        if (cvSkillsResult.rows.length > 0 && cvSkillsResult.rows[0].skills) {
          const skillsData = cvSkillsResult.rows[0].skills;
          const skillsArray = typeof skillsData === 'string' 
            ? JSON.parse(skillsData) 
            : skillsData;
          
         
          skills = skillsArray.map(skill => ({
            skill_name: skill,
            slug: skill,
            proficiency_level: null,
            years_experience: null
          }));
        }
      } catch (err) {
        console.log(`  Could not fetch CV skills for candidate ${candidate.candidate_id}`);
      }
    }

    return {
      ...candidate,
      skills: skills
    };
  })
);

      res.json({
        success: true,
        data: {
          job_id: parseInt(jobId),
          candidates: enrichedCandidates,
          pagination: {
            total: enrichedCandidates.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
          }
        }
      });
    } catch (error) {
      console.error(' Error getting matched candidates:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving matched candidates',
        error: error.message
      });
    }
  }

  /**
   * GET /api/matching/candidates/:candidateId/matched-jobs
   * Lấy danh sách jobs đã được match với candidate
   */
  async getMatchedJobs(req, res) {
    try {
      const { candidateId } = req.params;
      const { 
        minScore = 60, 
        limit = 20, 
        offset = 0,
        location,
        isQualified
      } = req.query;

      
      if (req.user.role === 'candidate' && req.user.id !== parseInt(candidateId)) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own matched jobs'
        });
      }

      const options = {
        minScore: parseFloat(minScore),
        limit: parseInt(limit),
        offset: parseInt(offset)
      };

      
      let jobs = await MatchingModel.getCandidateMatchingScores(candidateId, options);

      
      if (location) {
        jobs = jobs.filter(job => 
          job.location && job.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      
      if (isQualified !== undefined) {
        jobs = jobs.filter(job => job.is_qualified === (isQualified === 'true'));
      }

     
      const enrichedJobs = await Promise.all(
        jobs.map(async (job) => {
          
          const skillsResult = await pool.query(`
            SELECT 
              sm.name as skill_name,
              sm.slug,
              js.is_required,
              js.required_level
            FROM job_skills js
            INNER JOIN skills_master sm ON js.skill_id = sm.id
            WHERE js.job_id = $1
            ORDER BY js.is_required DESC
          `, [job.job_id]);

          return {
            ...job,
            required_skills: skillsResult.rows
          };
        })
      );

      res.json({
        success: true,
        data: {
          candidate_id: parseInt(candidateId),
          jobs: enrichedJobs,
          pagination: {
            total: enrichedJobs.length,
            limit: parseInt(limit),
            offset: parseInt(offset)
          }
        }
      });
    } catch (error) {
      console.error('Error getting matched jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving matched jobs',
        error: error.message
      });
    }
  }

  /**
   * GET /api/matching/jobs/:jobId/matching-stats
   * Lấy thống kê matching cho một job
   */
  async getMatchingStats(req, res) {
    try {
      const { jobId } = req.params;

      
      const result = await pool.query(`
        SELECT 
          COUNT(*) as total_candidates,
          COUNT(*) FILTER (WHERE is_qualified = true) as qualified_candidates,
          AVG(total_score) as avg_score,
          MAX(total_score) as max_score,
          MIN(total_score) as min_score,
          AVG(skills_score) as avg_skills_score,
          AVG(experience_score) as avg_experience_score,
          AVG(education_score) as avg_education_score,
          AVG(location_score) as avg_location_score,
          AVG(salary_score) as avg_salary_score
        FROM matching_scores
        WHERE job_id = $1
      `, [jobId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No matching data found for this job'
        });
      }

      const stats = result.rows[0];

      
      const distributionResult = await pool.query(`
        SELECT 
          CASE 
            WHEN total_score >= 90 THEN '90-100'
            WHEN total_score >= 80 THEN '80-89'
            WHEN total_score >= 70 THEN '70-79'
            WHEN total_score >= 60 THEN '60-69'
            ELSE 'Below 60'
          END as score_range,
          COUNT(*) as count
        FROM matching_scores
        WHERE job_id = $1
        GROUP BY score_range
        ORDER BY score_range DESC
      `, [jobId]);

      res.json({
        success: true,
        data: {
          job_id: parseInt(jobId),
          total_candidates: parseInt(stats.total_candidates),
          qualified_candidates: parseInt(stats.qualified_candidates),
          average_scores: {
            total: parseFloat(stats.avg_score || 0).toFixed(2),
            skills: parseFloat(stats.avg_skills_score || 0).toFixed(2),
            experience: parseFloat(stats.avg_experience_score || 0).toFixed(2),
            education: parseFloat(stats.avg_education_score || 0).toFixed(2),
            location: parseFloat(stats.avg_location_score || 0).toFixed(2),
            salary: parseFloat(stats.avg_salary_score || 0).toFixed(2)
          },
          score_range: {
            max: parseFloat(stats.max_score || 0).toFixed(2),
            min: parseFloat(stats.min_score || 0).toFixed(2)
          },
          distribution: distributionResult.rows
        }
      });
    } catch (error) {
      console.error('Error getting matching stats:', error);
      res.status(500).json({
        success: false,
        message: 'Error retrieving matching statistics',
        error: error.message
      });
    }
  }

  

  /**
   * POST /api/matching/find-candidates
   * Tìm và match candidates cho một job (on-demand)
   */
  async findCandidatesForJob(req, res) {
    try {
      const { jobId, candidateIds, limit } = req.body;

      if (!jobId) {
        return res.status(400).json({
          success: false,
          message: 'Job ID is required'
        });
      }

      const result = await matchingService.matchCandidatesForJob(jobId, {
        candidateIds,
        limit: limit || 50
      });

      
      if (req.user && req.user.id) {
        await MatchingModel.updateEmployerMatchingUsage(
          req.user.id,
          jobId,
          result.total_candidates
        );
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error finding candidates:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * POST /api/matching/find-jobs
   * Tìm và match jobs cho một candidate (on-demand)
   */
  async findJobsForCandidate(req, res) {
    try {
      const { candidateId, filters, limit } = req.body;
      const userId = candidateId || req.user?.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'Candidate ID is required'
        });
      }

      const result = await matchingService.matchJobsForCandidate(userId, {
        filters,
        limit: limit || 20
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error finding jobs:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/matching/recommended-jobs/:candidateId
   * Lấy danh sách jobs được recommend (từ DB)
   */
  async getRecommendedJobs(req, res) {
    try {
      const { candidateId } = req.params;
      const { minScore, limit } = req.query;

      const jobs = await matchingService.getRecommendedJobs(candidateId, {
        minScore: minScore ? parseFloat(minScore) : 60,
        limit: limit ? parseInt(limit) : 20
      });

      res.json({
        success: true,
        data: jobs
      });
    } catch (error) {
      console.error('Error getting recommended jobs:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/matching/top-candidates/:jobId
   * Lấy danh sách top candidates (từ DB)
   */
  async getTopCandidates(req, res) {
    try {
      const { jobId } = req.params;
      const { minScore, limit, qualifiedOnly } = req.query;

      const candidates = await matchingService.getTopCandidates(jobId, {
        minScore: minScore ? parseFloat(minScore) : 60,
        limit: limit ? parseInt(limit) : 50,
        qualifiedOnly: qualifiedOnly !== 'false'
      });

      res.json({
        success: true,
        data: candidates
      });
    } catch (error) {
      console.error('Error getting top candidates:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/matching/score/:jobId/:candidateId
   * Lấy matching score cụ thể giữa job và candidate
   */
  async getMatchScore(req, res) {
    try {
      const { jobId, candidateId } = req.params;

      const query = `
        SELECT * FROM matching_scores 
        WHERE job_id = $1 AND candidate_id = $2
      `;
      
      const result = await pool.query(query, [jobId, candidateId]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Matching score not found'
        });
      }

      res.json({
        success: true,
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Error getting match score:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * GET /api/matching/usage/:employerId
   * Lấy thống kê usage của employer
   */
  async getEmployerUsage(req, res) {
    try {
      const { employerId } = req.params;
      const { startDate } = req.query;

      const usage = await MatchingModel.getEmployerMatchingUsage(
        employerId,
        startDate
      );

      res.json({
        success: true,
        data: usage
      });
    } catch (error) {
      console.error('Error getting employer usage:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new MatchingController();
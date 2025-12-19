const express = require('express');
const router = express.Router();


const { authMiddleware, optionalAuth, protect, authorize } = require('../middleware/auth');
const { validateIdParam, validatePagination } = require('../middleware/validateInput');
const { searchLimiter, generalLimiter } = require('../middleware/rateLimiter');
const employerController = require('../controllers/employerController');
const jobController = require('../controllers/jobController');
const Job = require('../models/Job');




router.get('/', generalLimiter, validatePagination, optionalAuth, jobController.getAllJobs);


router.get('/featured', jobController.getFeaturedJobs);


router.get('/trending', jobController.getTrendingJobs);


router.get('/latest', jobController.getLatestJobs);


router.get('/search', searchLimiter, validatePagination, jobController.searchJobs);


router.get('/category/:category', validatePagination, async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 0, limit = 10 } = req.query;
    
    const result = await Job.findByCategory(category, { page, limit });
    
    res.json({
      success: true,
      data: result.jobs,
      pagination: {
        page: result.page,
        limit: parseInt(limit),
        total: result.total,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    console.error('💥 Get jobs by category error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get jobs by category'
    });
  }
});




router.get('/stats', authMiddleware, jobController.getJobStats);


router.get('/saved', authMiddleware, jobController.getSavedJobs);


router.get('/applied', authMiddleware, jobController.getAppliedJobs);


router.post('/save/:id', authMiddleware, jobController.saveJob);


router.delete('/unsave/:id', authMiddleware, jobController.unsaveJob);


router.post('/apply', authMiddleware, jobController.applyJob);




router.post('/', authMiddleware, employerController.createJob);


router.patch('/:id/status', authMiddleware, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!['open', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "open" or "closed"'
      });
    }
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    
    const isAdmin = req.user?.role === 'admin';
    const isOwner = job.posted_by === req.user?.id; 
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this job'
      });
    }
    
    const updatedJob = await Job.updateStatus(jobId, status);
    
    res.json({
      success: true,
      message: 'Job status updated successfully',
      data: updatedJob
    });
    
  } catch (error) {
    console.error('💥 Update status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update job status'
    });
  }
});


router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    
    const isAdmin = req.user?.role === 'admin';
    const isOwner = job.posted_by === req.user?.id; 
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this job'
      });
    }
    
    const updatedJob = await Job.update(jobId, req.body);
    
    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
    
  } catch (error) {
    console.error('💥 Update job error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update job'
    });
  }
});



router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const jobId = parseInt(req.params.id);
    
    console.log('🗑️ DELETE /api/jobs/' + jobId);
    console.log('👤 User:', req.user?.id, req.user?.role);
    
    
    if (isNaN(jobId) || jobId <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID'
      });
    }
    
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      console.log('❌ Job not found:', jobId);
      return res.status(404).json({
        success: false,
        message: `Job with ID ${jobId} not found`
      });
    }
    
    console.log('📋 Found job:', job.title);
    console.log('📋 Job posted_by:', job.posted_by);
    
    
    const isAdmin = req.user?.role === 'admin';
    const isOwner = job.posted_by === req.user?.id; 
    
    console.log('🔐 Permissions:', { isAdmin, isOwner, jobPostedBy: job.posted_by, userId: req.user?.id });
    
    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this job'
      });
    }
    
    
    await Job.delete(jobId);
    
    console.log('✅ Job deleted:', jobId);
    
    res.json({
      success: true,
      message: 'Job deleted successfully',
      deletedJobId: jobId
    });
    
  } catch (error) {
    console.error('💥 Delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete job'
    });
  }
});

const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


async function parseJobWithAI(jobDescription) {
  try {
    console.log('🤖 Đang gọi Gemini API để parse Job...');

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Bạn là AI chuyên parse Job Description. Trích xuất thông tin và trả về JSON:
{
  "required_skills": ["skill1", "skill2"],
  "min_experience_years": 3,
  "required_education_level": "Đại học",
  "salary_min": 15000000,
  "salary_max": 25000000
}

Job Description:
${jobDescription}

Chỉ trả về JSON, không giải thích.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResponse = response.text().trim();

    
    if (aiResponse.startsWith('```')) {
      aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const parsedData = JSON.parse(aiResponse);
    
    console.log('✅ Parse Job thành công!');
    console.log('📊 Kết quả:', parsedData);

    return {
      required_skills: parsedData.required_skills || [],
      min_experience_years: parsedData.min_experience_years || 0,
      required_education_level: parsedData.required_education_level || null,
      salary_min: parsedData.salary_min || null,
      salary_max: parsedData.salary_max || null
    };

  } catch (error) {
    console.error('❌ Lỗi khi parse Job với Gemini:', error);
    throw new Error(`AI parsing failed: ${error.message}`);
  }
}


async function parseJobEndpoint(req, res, db) {
  try {
    const jobId = parseInt(req.params.job_id);
    
    console.log(`💼 Parse Job #${jobId}`);

    
    const jobQuery = 'SELECT * FROM jobs WHERE id = $1';
    const jobResult = await db.query(jobQuery, [jobId]);

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Job không tồn tại'
      });
    }

    const job = jobResult.rows[0];
    const jobDescription = job.description || job.requirements || '';

    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message: 'Job description quá ngắn hoặc không có nội dung'
      });
    }

    
    const parsedData = await parseJobWithAI(jobDescription);

    
    const insertQuery = `
      INSERT INTO job_parsed_data (
        job_id,
        required_skills,
        min_experience_years,
        required_education_level,
        salary_min,
        salary_max
      ) VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (job_id)
      DO UPDATE SET
        required_skills = EXCLUDED.required_skills,
        min_experience_years = EXCLUDED.min_experience_years,
        required_education_level = EXCLUDED.required_education_level,
        salary_min = EXCLUDED.salary_min,
        salary_max = EXCLUDED.salary_max,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const insertResult = await db.query(insertQuery, [
      jobId,
      JSON.stringify(parsedData.required_skills),
      parsedData.min_experience_years,
      parsedData.required_education_level,
      parsedData.salary_min,
      parsedData.salary_max
    ]);

    return res.status(200).json({
      success: true,
      message: 'Parse Job thành công!',
      data: insertResult.rows[0]
    });

  } catch (error) {
    console.error('💥 Lỗi parse Job:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi parse Job',
      error: error.message
    });
  }
}


async function parseBatchJobsEndpoint(req, res, db) {
  try {
    const { job_ids } = req.body;

    if (!Array.isArray(job_ids) || job_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp mảng job_ids'
      });
    }

    const results = [];
    const errors = [];

    for (const jobId of job_ids) {
      try {
        req.params.job_id = jobId;
        
        const mockRes = {
          status: (code) => ({
            json: (data) => {
              if (code === 200) {
                results.push({ jobId, success: true, data });
              } else {
                errors.push({ jobId, success: false, error: data.message });
              }
            }
          }),
          json: (data) => {
            results.push({ jobId, success: true, data });
          }
        };

        await parseJobEndpoint(req, mockRes, db);
        
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        errors.push({ jobId, success: false, error: error.message });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Hoàn thành parse ${results.length}/${job_ids.length} jobs`,
      results,
      errors
    });

  } catch (error) {
    console.error('💥 Lỗi batch parse:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi batch parse jobs',
      error: error.message
    });
  }
}


async function parseAllUnparsedJobsEndpoint(req, res, db) {
  try {
    const query = `
      SELECT j.id 
      FROM jobs j
      LEFT JOIN job_parsed_data jpd ON j.id = jpd.job_id
      WHERE jpd.id IS NULL AND j.status = 'open'
      LIMIT 50
    `;
    
    const result = await db.query(query);
    const jobIds = result.rows.map(row => row.id);

    if (jobIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Không có job nào cần parse'
      });
    }

    req.body.job_ids = jobIds;
    return await parseBatchJobsEndpoint(req, res, db);

  } catch (error) {
    console.error('💥 Lỗi parse all jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi parse all unparsed jobs',
      error: error.message
    });
  }
}







router.get('/:id', validateIdParam(), optionalAuth, jobController.getJobById);


router.get('/:id/related', validateIdParam(), jobController.getRelatedJobs);


module.exports = router;
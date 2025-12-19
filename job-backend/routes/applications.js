const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  applyJob,
  getMyApplications,
  getJobApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
  getEmployerApplicationStats,
  getUserApplicationStats,
  bulkUpdateStatus,
  checkApplication
} = require('../controllers/applicationController');

const { protect, authorize } = require('../middleware/auth');


const uploadDir = 'uploads/applications';


if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created directory:', uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'cv_' + uniqueSuffix + path.extname(file.originalname);
    console.log('Saving file as:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: function (req, file, cb) {
    console.log(' File filter check:', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype
    });
    
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      console.log('File accepted');
      return cb(null, true);
    } else {
      console.log('File rejected - invalid type');
      cb(new Error('Only PDF, DOC, DOCX files allowed'));
    }
  }
});



router.post('/apply/:jobId', 
  protect, 
  authorize('user'), 
  upload.single('cv'),  
  (req, res, next) => {
    
    console.log('\n APPLICATION REQUEST RECEIVED');
    console.log('  req.file:', req.file);
    console.log('  req.body.cv_id:', req.body.cv_id);
    console.log('  Has file?', !!req.file);
    console.log('  Has cv_id?', !!req.body.cv_id);
    next();
  },
  applyJob
);

router.get('/check/:jobId', protect, authorize('user'), checkApplication);
router.get('/my-applications', protect, authorize('user'), getMyApplications);
router.delete('/:id', protect, authorize('user'), withdrawApplication);
router.get('/stats/user', protect, authorize('user'), getUserApplicationStats);


router.get('/job/:jobId', protect, authorize('employer'), getJobApplications);
router.put('/:id/status', protect, authorize('employer'), updateApplicationStatus);
router.put('/bulk-update', protect, authorize('employer'), bulkUpdateStatus);
router.get('/stats/employer', protect, authorize('employer'), getEmployerApplicationStats);


router.get('/:id', protect, getApplicationById);

module.exports = router;
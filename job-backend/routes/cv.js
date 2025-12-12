const express = require('express');
const router = express.Router();

// Middleware
const { authMiddleware } = require('../middleware/auth');
const { 
  uploadResume, 
  uploadDocuments, 
  validateUploadedFile,
  requireFile 
} = require('../middleware/upload');

// Controller
const cvController = require('../controllers/cvController');

/* ==================== CV ROUTES ==================== */

// Get user's CVs
router.get('/list', authMiddleware, cvController.getCVList);

// Upload CV
router.post(
  '/upload', 
  authMiddleware, 
  uploadResume,           // Multer upload middleware
  validateUploadedFile,   // Add file URL & size
  requireFile('resume'),  // Validate file exists
  cvController.uploadCV
);

// Set default CV
router.put('/:id/set-default', authMiddleware, cvController.setDefaultCV);

// View CV
router.get('/:id/view', authMiddleware, cvController.viewCV);

// Download CV
router.get('/:id/download', authMiddleware, cvController.downloadCV);

// Delete CV
router.delete('/:id', authMiddleware, cvController.deleteCV);

/* ==================== COVER LETTER ROUTES ==================== */

// Get user's cover letters
router.get('/cover-letters', authMiddleware, cvController.getCoverLetterList);

// Upload cover letter
router.post(
  '/cover-letters/upload', 
  authMiddleware, 
  uploadDocuments,        // Multer upload middleware (supports multiple files)
  validateUploadedFile,   // Add file URL & size
  cvController.uploadCoverLetter
);

// Download cover letter
router.get('/cover-letters/:id/download', authMiddleware, cvController.downloadCoverLetter);

// Delete cover letter
router.delete('/cover-letters/:id', authMiddleware, cvController.deleteCoverLetter);

module.exports = router;
const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const { deleteFile } = require('../middleware/upload');

// @desc    Get all CVs of user
// @route   GET /api/cv/list
// @access  Private
exports.getCVList = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('📄 Getting CV list for user:', userId);

    const result = await pool.query(
      `SELECT 
        id, 
        file_name,
        file_name as original_name,
        file_path as file_url,
        file_size,
        upload_date as uploaded_at,
        is_default, 
        views, 
        downloads
      FROM user_cvs 
      WHERE user_id = $1 
      ORDER BY is_default DESC, upload_date DESC`,
      [userId]
    );

    console.log(`✅ Found ${result.rows.length} CVs`);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error getting CV list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get CV list',
      error: error.message
    });
  }
};

// @desc    Upload CV
// @route   POST /api/cv/upload
// @access  Private
exports.uploadCV = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('📤 Uploading CV for user:', userId);
    console.log('File info:', req.file);

    const { filename, originalname, size, mimetype, path: filePath } = req.file;
    const fileSize = `${(size / 1024).toFixed(2)} KB`;

    // Check if user already has a CV, if not set this as default
    const existingCVs = await pool.query(
      'SELECT COUNT(*) as count FROM user_cvs WHERE user_id = $1',
      [userId]
    );

    const isFirstCV = parseInt(existingCVs.rows[0].count) === 0;

    // Insert CV record
    const result = await pool.query(
      `INSERT INTO user_cvs 
        (user_id, file_name, file_path, file_size, is_default) 
       VALUES ($1, $2, $3, $4, $5)
       RETURNING 
         id,
         file_name,
         file_name as original_name,
         file_path as file_url,
         file_size,
         upload_date as uploaded_at,
         is_default,
         views,
         downloads`,
      [userId, originalname, filePath, fileSize, isFirstCV]
    );

    console.log('✅ CV uploaded successfully:', result.rows[0]);

    res.json({
      success: true,
      message: 'CV uploaded successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error uploading CV:', error);
    
    // Delete uploaded file if database insert fails
    if (req.file && req.file.path) {
      deleteFile(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload CV',
      error: error.message
    });
  }
};

// @desc    Set default CV
// @route   PUT /api/cv/:id/set-default
// @access  Private
exports.setDefaultCV = async (req, res) => {
  try {
    const userId = req.user.id;
    const cvId = req.params.id;

    console.log(`⭐ Setting CV ${cvId} as default for user ${userId}`);

    // Verify CV belongs to user
    const cvCheck = await pool.query(
      'SELECT id FROM user_cvs WHERE id = $1 AND user_id = $2',
      [cvId, userId]
    );

    if (cvCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    // Unset all defaults for this user
    await pool.query(
      'UPDATE user_cvs SET is_default = FALSE WHERE user_id = $1',
      [userId]
    );

    // Set new default
    await pool.query(
      'UPDATE user_cvs SET is_default = TRUE WHERE id = $1',
      [cvId]
    );

    console.log('✅ Default CV updated');

    res.json({
      success: true,
      message: 'Default CV updated successfully'
    });

  } catch (error) {
    console.error('❌ Error setting default CV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set default CV',
      error: error.message
    });
  }
};

// @desc    Delete CV
// @route   DELETE /api/cv/:id
// @access  Private
exports.deleteCV = async (req, res) => {
  try {
    const userId = req.user.id;
    const cvId = req.params.id;

    console.log(`🗑️ Deleting CV ${cvId} for user ${userId}`);

    // Get CV info
    const cvResult = await pool.query(
      'SELECT file_path, is_default FROM user_cvs WHERE id = $1 AND user_id = $2',
      [cvId, userId]
    );

    if (cvResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    const cv = cvResult.rows[0];

    // Delete file from filesystem
    deleteFile(cv.file_path);
    console.log('✅ File deleted from filesystem');

    // Delete from database
    await pool.query('DELETE FROM user_cvs WHERE id = $1', [cvId]);

    // If deleted CV was default, set another CV as default
    if (cv.is_default) {
      await pool.query(
        `UPDATE user_cvs 
         SET is_default = TRUE 
         WHERE user_id = $1 
         AND id = (SELECT id FROM user_cvs WHERE user_id = $1 ORDER BY upload_date DESC LIMIT 1)`,
        [userId]
      );
    }

    console.log('✅ CV deleted successfully');

    res.json({
      success: true,
      message: 'CV deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting CV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete CV',
      error: error.message
    });
  }
};

// @desc    Download CV
// @route   GET /api/cv/:id/download
// @access  Private
exports.downloadCV = async (req, res) => {
  try {
    const userId = req.user.id;
    const cvId = req.params.id;

    console.log(`⬇️ Downloading CV ${cvId} for user ${userId}`);

    // Get CV info
    const result = await pool.query(
      'SELECT file_path, file_name, downloads FROM user_cvs WHERE id = $1 AND user_id = $2',
      [cvId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    const cv = result.rows[0];

    if (!fs.existsSync(cv.file_path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment download count
    await pool.query(
      'UPDATE user_cvs SET downloads = downloads + 1 WHERE id = $1',
      [cvId]
    );

    console.log('✅ Sending file for download');

    res.download(cv.file_path, cv.file_name);

  } catch (error) {
    console.error('❌ Error downloading CV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download CV',
      error: error.message
    });
  }
};

// @desc    View CV (increment view count and serve file)
// @route   GET /api/cv/:id/view
// @access  Private
exports.viewCV = async (req, res) => {
  try {
    const userId = req.user.id;
    const cvId = req.params.id;

    console.log(`👁️ Viewing CV ${cvId} for user ${userId}`);

    // Get CV info
    const result = await pool.query(
      'SELECT file_path, file_name FROM user_cvs WHERE id = $1 AND user_id = $2',
      [cvId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV not found'
      });
    }

    const cv = result.rows[0];

    if (!fs.existsSync(cv.file_path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment view count
    await pool.query(
      'UPDATE user_cvs SET views = views + 1 WHERE id = $1',
      [cvId]
    );

    console.log('✅ Sending file for viewing');

    // Set proper content type
    res.contentType('application/pdf');
    res.sendFile(path.resolve(cv.file_path));

  } catch (error) {
    console.error('❌ Error viewing CV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to view CV',
      error: error.message
    });
  }
};

// ============================================
// COVER LETTER FUNCTIONS
// ============================================

// @desc    Get all cover letters of user
// @route   GET /api/cv/cover-letters
// @access  Private
exports.getCoverLetterList = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log('✉️ Getting cover letter list for user:', userId);

    const result = await pool.query(
      `SELECT 
        id, 
        file_name,
        file_name as original_name,
        file_path as file_url,
        file_size,
        upload_date as uploaded_at,
        views, 
        downloads
      FROM user_cover_letters 
      WHERE user_id = $1 
      ORDER BY upload_date DESC`,
      [userId]
    );

    console.log(`✅ Found ${result.rows.length} cover letters`);

    res.json({
      success: true,
      data: result.rows
    });

  } catch (error) {
    console.error('❌ Error getting cover letter list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cover letter list',
      error: error.message
    });
  }
};

// @desc    Upload cover letter
// @route   POST /api/cv/cover-letters/upload
// @access  Private
exports.uploadCoverLetter = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // uploadDocuments supports multiple files, take first one
    const file = req.files && req.files.length > 0 ? req.files[0] : req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('📤 Uploading cover letter for user:', userId);
    console.log('File info:', file);

    const { filename, originalname, size, mimetype, path: filePath } = file;
    const fileSize = `${(size / 1024).toFixed(2)} KB`;

    const result = await pool.query(
      `INSERT INTO user_cover_letters 
        (user_id, file_name, file_path, file_size) 
       VALUES ($1, $2, $3, $4)
       RETURNING 
         id,
         file_name,
         file_name as original_name,
         file_path as file_url,
         file_size,
         upload_date as uploaded_at,
         views,
         downloads`,
      [userId, originalname, filePath, fileSize]
    );

    console.log('✅ Cover letter uploaded successfully');

    res.json({
      success: true,
      message: 'Cover letter uploaded successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('❌ Error uploading cover letter:', error);
    
    // Delete uploaded file if database insert fails
    const file = req.files && req.files.length > 0 ? req.files[0] : req.file;
    if (file && file.path) {
      deleteFile(file.path);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to upload cover letter',
      error: error.message
    });
  }
};

// @desc    Download cover letter
// @route   GET /api/cv/cover-letters/:id/download
// @access  Private
exports.downloadCoverLetter = async (req, res) => {
  try {
    const userId = req.user.id;
    const letterId = req.params.id;

    console.log(`⬇️ Downloading cover letter ${letterId} for user ${userId}`);

    const result = await pool.query(
      'SELECT file_path, original_name FROM user_cover_letters WHERE id = $1 AND user_id = $2',
      [letterId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    const letter = result.rows[0];

    if (!fs.existsSync(letter.file_path)) {
      return res.status(404).json({
        success: false,
        message: 'File not found on server'
      });
    }

    // Increment download count
    await pool.query(
      'UPDATE user_cover_letters SET downloads = downloads + 1 WHERE id = $1',
      [letterId]
    );

    console.log('✅ Sending cover letter for download');

    res.download(letter.file_path, letter.original_name);

  } catch (error) {
    console.error('❌ Error downloading cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download cover letter',
      error: error.message
    });
  }
};

// @desc    Delete cover letter
// @route   DELETE /api/cv/cover-letters/:id
// @access  Private
exports.deleteCoverLetter = async (req, res) => {
  try {
    const userId = req.user.id;
    const letterId = req.params.id;

    console.log(`🗑️ Deleting cover letter ${letterId} for user ${userId}`);

    const result = await pool.query(
      'SELECT file_path FROM user_cover_letters WHERE id = $1 AND user_id = $2',
      [letterId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cover letter not found'
      });
    }

    const filePath = result.rows[0].file_path;

    // Delete file from filesystem
    deleteFile(filePath);

    // Delete from database
    await pool.query('DELETE FROM user_cover_letters WHERE id = $1', [letterId]);

    console.log('✅ Cover letter deleted successfully');

    res.json({
      success: true,
      message: 'Cover letter deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cover letter',
      error: error.message
    });
  }
};
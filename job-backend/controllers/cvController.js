const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const { deleteFile } = require('../middleware/upload');
const { parseCV } = require('../services/cvParser'); 

const getFileUrl = (filePath) => {
  
  const fileName = path.basename(filePath);
  
  return `/uploads/cvs/${fileName}`;
};


// @desc    Get all CVs of user
// @route   GET /api/cv/list
// @access  Private
exports.getCVList = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(' Getting CV list for user:', userId);

    const result = await pool.query(
      `SELECT 
        id, 
        file_name,
        file_name as original_name,
        file_path,
        file_size,
        file_type,
        upload_date as uploaded_at,
        is_default, 
        views, 
        downloads
      FROM user_cvs 
      WHERE user_id = $1 
      ORDER BY is_default DESC, upload_date DESC`,
      [userId]
    );

    
    const cvList = result.rows.map(cv => ({
      ...cv,
      file_url: getFileUrl(cv.file_path) 
    }));

    console.log(` Found ${cvList.length} CVs`);
    console.log('Sample CV URL:', cvList[0]?.file_url);

    res.json({
      success: true,
      data: cvList
    });

  } catch (error) {
    console.error(' Error getting CV list:', error);
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

    console.log(' Uploading CV for user:', userId);
    console.log('File info:', req.file);

    const { filename, originalname, size, mimetype, path: filePath } = req.file;
    const fileSize = `${(size / 1024).toFixed(2)} KB`;

    // Check if this is the first CV
    const existingCVs = await pool.query(
      'SELECT COUNT(*) as count FROM user_cvs WHERE user_id = $1',
      [userId]
    );

    const isFirstCV = parseInt(existingCVs.rows[0].count) === 0;

    // Insert CV
    const result = await pool.query(
      `INSERT INTO user_cvs 
        (user_id, file_name, file_path, file_size, file_type, is_default) 
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING 
         id,
         file_name,
         file_name as original_name,
         file_path as file_url,
         file_size,
         file_type,
         upload_date as uploaded_at,
         is_default,
         views,
         downloads`,
      [userId, originalname, filePath, fileSize, mimetype, isFirstCV]
    );

    const uploadedCV = result.rows[0];
    console.log(' CV uploaded successfully:', uploadedCV);

    
    try {
      console.log(' Auto-parsing CV...');
      await parseCV(uploadedCV.id, filePath);
      console.log(' CV parsed successfully');
    } catch (parseError) {
      console.error(' Parse error (non-fatal):', parseError.message);
      
    }

    res.json({
      success: true,
      message: 'CV uploaded successfully',
      data: uploadedCV
    });

  } catch (error) {
    console.error(' Error uploading CV:', error);
    
  
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

// @desc    Save custom CV from CV Builder as PDF
// @route   POST /api/cv/save-custom-cv
// @access  Private
exports.saveCustomCV = async (req, res) => {
  const puppeteer = require('puppeteer');
  const { generateCVHTML } = require('../utils/cvTemplate');
  
  try {
    const { cvData } = req.body;
    const userId = req.user.id;

    console.log(' Saving custom CV as PDF for user:', userId);
    console.log(' CV Data:', { fullName: cvData.fullName, position: cvData.position });

    // Validate input
    if (!cvData || !cvData.fullName) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu CV không hợp lệ. Vui lòng nhập ít nhất tên của bạn.'
      });
    }

    // Create UNIQUE filename
    const sanitizedName = cvData.fullName
      .trim()
      .normalize('NFD') // Tách dấu ra khỏi chữ
      .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu tiếng Việt
      .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Thay đ -> d
      .replace(/[^a-zA-Z0-9]/g, '_') // Chỉ giữ chữ cái và số
      .replace(/_+/g, '_'); // Gộp nhiều _ thành 1
    
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(7);
    const fileName = `CV_${sanitizedName}_${timestamp}_${randomStr}.pdf`;
    console.log(' Creating PDF file:', fileName);

    // Create uploads directory if not exists
    const uploadsDir = path.join(__dirname, '../uploads/cvs');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);

    // Generate HTML from CV data
    const htmlContent = generateCVHTML(cvData);

    // Convert HTML to PDF using Puppeteer
    console.log(' Converting HTML to PDF...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    });
    
    await browser.close();
    console.log(' PDF created successfully');

    // Also save JSON backup for editing
    const jsonFileName = fileName.replace('.pdf', '.json');
    const jsonFilePath = path.join(uploadsDir, jsonFileName);
    fs.writeFileSync(jsonFilePath, JSON.stringify(cvData, null, 2), 'utf8');
    console.log(' JSON backup saved');

    // Get file size
    const stats = fs.statSync(filePath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    const fileSize = fileSizeKB > 1024 
      ? `${(fileSizeKB / 1024).toFixed(2)} MB` 
      : `${fileSizeKB} KB`;

    console.log(` PDF file size: ${fileSize}`);

    // Check if user already has a default CV
    const checkDefaultQuery = 'SELECT id FROM user_cvs WHERE user_id = $1 AND is_default = TRUE';
    const defaultResult = await pool.query(checkDefaultQuery, [userId]);
    const isDefault = defaultResult.rows.length === 0;

    // Insert into database
    const insertQuery = `
      INSERT INTO user_cvs (
        user_id, 
        file_name, 
        file_path, 
        file_size, 
        file_type,
        is_default,
        json_backup_path
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      userId,
      fileName,
      filePath,
      fileSize,
      'application/pdf',
      isDefault,
      jsonFilePath
    ];

    const result = await pool.query(insertQuery, values);
    const savedCV = result.rows[0];

    console.log(' Custom CV saved successfully with ID:', savedCV.id);

    
    try {
      console.log('🔍 Auto-parsing custom CV from JSON...');
      await parseCV(savedCV.id, jsonFilePath); 
      console.log(' Custom CV parsed successfully');
    } catch (parseError) {
      console.error(' Parse error (non-fatal):', parseError.message);
      
    }

    console.log(' Total CVs for user:', (await pool.query('SELECT COUNT(*) FROM user_cvs WHERE user_id = $1', [userId])).rows[0].count);

    return res.status(201).json({
      success: true,
      message: isDefault 
        ? 'CV đã được lưu dạng PDF và đặt làm mặc định!' 
        : 'CV đã được lưu dạng PDF thành công!',
      data: {
        ...savedCV,
        original_name: savedCV.file_name,
        uploaded_at: savedCV.upload_date,
        file_url: getFileUrl(savedCV.file_path)
      }
    });

  } catch (error) {
    console.error(' Error saving custom CV as PDF:', error);
    console.error('Stack trace:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lưu CV. Vui lòng thử lại.',
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

    console.log(` Setting CV ${cvId} as default for user ${userId}`);

    
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

    
    await pool.query(
      'UPDATE user_cvs SET is_default = FALSE WHERE user_id = $1',
      [userId]
    );

    
    await pool.query(
      'UPDATE user_cvs SET is_default = TRUE WHERE id = $1',
      [cvId]
    );

    console.log(' Default CV updated');

    res.json({
      success: true,
      message: 'Default CV updated successfully'
    });

  } catch (error) {
    console.error(' Error setting default CV:', error);
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

    console.log(` Deleting CV ${cvId} for user ${userId}`);

   
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

    
    deleteFile(cv.file_path);
    console.log(' File deleted from filesystem');

    
    await pool.query('DELETE FROM user_cvs WHERE id = $1', [cvId]);

    
    if (cv.is_default) {
      await pool.query(
        `UPDATE user_cvs 
         SET is_default = TRUE 
         WHERE user_id = $1 
         AND id = (SELECT id FROM user_cvs WHERE user_id = $1 ORDER BY upload_date DESC LIMIT 1)`,
        [userId]
      );
    }

    console.log(' CV deleted successfully');

    res.json({
      success: true,
      message: 'CV deleted successfully'
    });

  } catch (error) {
    console.error(' Error deleting CV:', error);
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

    console.log(` Downloading CV ${cvId} for user ${userId}`);

    // Get CV info
    const result = await pool.query(
      'SELECT file_path, file_name, file_type, downloads FROM user_cvs WHERE id = $1 AND user_id = $2',
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

    console.log(' Sending file for download');

    // For JSON files, convert to readable text format
    if (cv.file_type === 'application/json') {
      const cvData = JSON.parse(fs.readFileSync(cv.file_path, 'utf8'));
      const txtContent = `
===========================================
           ${cvData.fullName}
           ${cvData.position}
===========================================

LIÊN HỆ:
-----------
📞 Điện thoại: ${cvData.phone}
📧 Email: ${cvData.email}
📍 Địa chỉ: ${cvData.address}
🎂 Ngày sinh: ${cvData.birthDate}
🌐 Website/Giới tính: ${cvData.website}

MỤC TIÊU NGHỀ NGHIỆP:
-----------
${cvData.objective}

KINH NGHIỆM LÀM VIỆC:
-----------
${cvData.experience.map((exp, i) => `
${i + 1}. ${exp.position} - ${exp.company}
   Thời gian: ${exp.period}
   ${exp.description}
`).join('\n')}

HỌC VẤN:
-----------
${cvData.education.map((edu, i) => `
${i + 1}. ${edu.degree} - ${edu.school}
   Thời gian: ${edu.period}
   ${edu.details}
`).join('\n')}

KỸ NĂNG:
-----------
${cvData.skills.map((skill) => `• ${skill}`).join('\n')}

SỞ THÍCH:
-----------
${cvData.hobbies}

===========================================
      `;
      
      const txtFileName = cv.file_name.replace('.json', '.txt');
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${txtFileName}"`);
      res.send(txtContent);
    } else {
      // For other file types, send as-is
      res.download(cv.file_path, cv.file_name);
    }

  } catch (error) {
    console.error(' Error downloading CV:', error);
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

    console.log(` Viewing CV ${cvId} for user ${userId}`);

    // Get CV info
    const result = await pool.query(
      'SELECT file_path, file_name, file_type, json_backup_path FROM user_cvs WHERE id = $1 AND user_id = $2',
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

    console.log(' Sending file for viewing');

    // If JSON backup exists, return JSON data for editing
    if (cv.json_backup_path && fs.existsSync(cv.json_backup_path)) {
      const cvData = JSON.parse(fs.readFileSync(cv.json_backup_path, 'utf8'));
      res.json({
        success: true,
        data: cvData,
        file_type: 'json',
        has_pdf: true,
        pdf_url: getFileUrl(cv.file_path)
      });
    } 
    // For JSON CVs
    else if (cv.file_type === 'application/json') {
      const cvData = JSON.parse(fs.readFileSync(cv.file_path, 'utf8'));
      res.json({
        success: true,
        data: cvData,
        file_type: 'json'
      });
    } 
    // For PDF/DOC files, send as file
    else {
      res.contentType(cv.file_type || 'application/pdf');
      res.sendFile(path.resolve(cv.file_path));
    }

  } catch (error) {
    console.error(' Error viewing CV:', error);
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
    console.log(' Getting cover letter list for user:', userId);

    const result = await pool.query(
      `SELECT 
        id, 
        file_name,
        file_name as original_name,
        file_path,
        file_size,
        upload_date as uploaded_at,
        views, 
        downloads
      FROM user_cover_letters 
      WHERE user_id = $1 
      ORDER BY upload_date DESC`,
      [userId]
    );

    
    const letterList = result.rows.map(letter => ({
      ...letter,
      file_url: getFileUrl(letter.file_path)
    }));

    console.log(` Found ${letterList.length} cover letters`);

    res.json({
      success: true,
      data: letterList
    });

  } catch (error) {
    console.error(' Error getting cover letter list:', error);
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
    
    
    const file = req.files && req.files.length > 0 ? req.files[0] : req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log(' Uploading cover letter for user:', userId);
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

    console.log(' Cover letter uploaded successfully');

    res.json({
      success: true,
      message: 'Cover letter uploaded successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error(' Error uploading cover letter:', error);
    
    // Clean up uploaded file on error
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

    console.log(` Downloading cover letter ${letterId} for user ${userId}`);

    const result = await pool.query(
      'SELECT file_path, file_name FROM user_cover_letters WHERE id = $1 AND user_id = $2',
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

    console.log(' Sending cover letter for download');

    res.download(letter.file_path, letter.file_name);

  } catch (error) {
    console.error(' Error downloading cover letter:', error);
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

    console.log(` Deleting cover letter ${letterId} for user ${userId}`);

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

    
    deleteFile(filePath);

    
    await pool.query('DELETE FROM user_cover_letters WHERE id = $1', [letterId]);

    console.log(' Cover letter deleted successfully');

    res.json({
      success: true,
      message: 'Cover letter deleted successfully'
    });

  } catch (error) {
    console.error(' Error deleting cover letter:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cover letter',
      error: error.message
    });
  }
};
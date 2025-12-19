const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;


const { authMiddleware } = require('../middleware/auth');
const { 
  uploadResume, 
  uploadDocuments, 
  validateUploadedFile,
  requireFile 
} = require('../middleware/upload');


const cvController = require('../controllers/cvController');




router.get('/list', authMiddleware, cvController.getCVList);

router.get('/my-cvs', authMiddleware, cvController.getCVList);

router.post(
  '/upload', 
  authMiddleware, 
  uploadResume,
  validateUploadedFile,
  requireFile('resume'),
  cvController.uploadCV
);


router.post('/save-custom-cv', authMiddleware, cvController.saveCustomCV);


router.post('/save-custom-cv-as-pdf', authMiddleware, async (req, res) => {
  let browser = null;
  
  try {
    const { cvData } = req.body;
    const userId = req.user.id;
    
    if (!cvData || !cvData.fullName) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu CV không hợp lệ'
      });
    }
    
    
    const htmlContent = generateCVHTML(cvData);
    
    
    const uploadDir = path.join(__dirname, '../uploads/cvs');
    await fs.mkdir(uploadDir, { recursive: true });
    
    
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    });
    
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const fileName = `CV_${cvData.fullName.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    
    await page.pdf({ 
      path: filePath, 
      format: 'A4',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });
    
    await browser.close();
    browser = null;
    
    
    const stats = await fs.stat(filePath);
    const fileSize = stats.size;
    
    
    const db = require('../config/db');
    
    
    const checkQuery = 'SELECT * FROM user_cvs WHERE user_id = $1 AND is_custom = true LIMIT 1';
    const existingCV = await db.query(checkQuery, [userId]);
    
    if (existingCV.rows.length > 0) {
      
      const oldFilePath = existingCV.rows[0].file_path;
      if (oldFilePath) {
        try {
          await fs.unlink(oldFilePath);
        } catch (err) {
          console.log('Không xóa được file cũ:', err.message);
        }
      }
      
      
      const updateQuery = `
        UPDATE user_cvs 
        SET file_path = $1, 
            file_url = $2, 
            file_name = $3,
            file_size = $4,
            cv_data = $5,
            upload_date = NOW()
        WHERE id = $6
        RETURNING *
      `;
      
      const result = await db.query(updateQuery, [
        filePath,
        `/uploads/cvs/${fileName}`,
        fileName,
        fileSize.toString(),
        JSON.stringify(cvData),
        existingCV.rows[0].id
      ]);
      
      return res.json({ 
        success: true, 
        message: 'CV PDF đã được cập nhật!',
        data: {
          id: result.rows[0].id,
          fileName: result.rows[0].file_name,
          fileUrl: result.rows[0].file_url,
          uploadDate: result.rows[0].upload_date
        }
      });
      
    } else {
      
      const insertQuery = `
        INSERT INTO user_cvs (
          user_id, 
          file_path, 
          file_url, 
          file_name, 
          file_size,
          cv_data, 
          is_custom,
          is_default,
          upload_date
        )
        VALUES ($1, $2, $3, $4, $5, $6, true, false, NOW())
        RETURNING *
      `;
      
      const result = await db.query(insertQuery, [
        userId,
        filePath,
        `/uploads/cvs/${fileName}`,
        fileName,
        fileSize.toString(),
        JSON.stringify(cvData)
      ]);
      
      return res.json({ 
        success: true, 
        message: 'CV PDF đã được tạo thành công!',
        data: {
          id: result.rows[0].id,
          fileName: result.rows[0].file_name,
          fileUrl: result.rows[0].file_url,
          uploadDate: result.rows[0].upload_date
        }
      });
    }
    
  } catch (error) {
    
    if (browser) {
      await browser.close().catch(err => console.log('Error closing browser:', err));
    }
    
    console.error('Error creating PDF:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi khi tạo PDF: ' + error.message 
    });
  }
});


router.put('/:id/set-default', authMiddleware, cvController.setDefaultCV);


router.get('/:id/view', authMiddleware, cvController.viewCV);


router.get('/:id/download', authMiddleware, cvController.downloadCV);


router.delete('/:id', authMiddleware, cvController.deleteCV);




router.get('/cover-letters', authMiddleware, cvController.getCoverLetterList);


router.post(
  '/cover-letters/upload', 
  authMiddleware, 
  uploadDocuments,
  validateUploadedFile,
  cvController.uploadCoverLetter
);


router.get('/cover-letters/:id/download', authMiddleware, cvController.downloadCoverLetter);


router.delete('/cover-letters/:id', authMiddleware, cvController.deleteCoverLetter);



const { parseCVEndpoint } = require('../services/cvParser');
const db = require('../config/db');


router.post('/parse/:id', authMiddleware, async (req, res) => {
  try {
    req.params.cv_id = req.params.id;
    await parseCVEndpoint(req, res, db);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi parse CV',
      error: error.message
    });
  }
});


router.get('/parsed/:id', authMiddleware, async (req, res) => {
  try {
    const cvId = parseInt(req.params.id);
    
    const query = 'SELECT * FROM cv_parsed_data WHERE cv_id = $1';
    const result = await db.query(query, [cvId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'CV chưa được phân tích. Vui lòng gọi POST /api/cv/parse/:id trước'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu CV đã parse',
      error: error.message
    });
  }
});



/**
 * Hàm tạo HTML từ CV data
 */
function generateCVHTML(cvData) {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>CV - ${cvData.fullName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Arial', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }
    .cv-container { display: flex; width: 100%; min-height: 100vh; }
    .cv-left {
      width: 35%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
    }
    .cv-avatar {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 5px solid white;
      margin: 0 auto 20px;
      display: block;
      object-fit: cover;
    }
    .cv-avatar-placeholder {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      border: 5px solid white;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.2);
      font-size: 60px;
    }
    .cv-name { text-align: center; margin-bottom: 30px; }
    .cv-name h1 {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cv-name h2 { font-size: 18px; font-weight: 400; opacity: 0.9; }
    .cv-section-left { margin-bottom: 30px; }
    .cv-section-title-left {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid rgba(255,255,255,0.5);
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cv-left p { margin-bottom: 10px; opacity: 0.95; line-height: 1.8; }
    .cv-skill-item {
      margin-bottom: 8px;
      padding-left: 20px;
      position: relative;
    }
    .cv-skill-item:before {
      content: "▪";
      position: absolute;
      left: 0;
      font-size: 18px;
    }
    .cv-right {
      width: 65%;
      padding: 40px;
      background: white;
    }
    .cv-section-right { margin-bottom: 35px; }
    .cv-section-title-right {
      font-size: 22px;
      font-weight: bold;
      color: #667eea;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 3px solid #667eea;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cv-objective {
      font-size: 14px;
      line-height: 1.8;
      text-align: justify;
      color: #555;
    }
    .cv-exp-item {
      margin-bottom: 25px;
      padding-left: 20px;
      border-left: 3px solid #667eea;
      position: relative;
    }
    .cv-exp-item:before {
      content: "";
      position: absolute;
      left: -8px;
      top: 5px;
      width: 13px;
      height: 13px;
      background: #667eea;
      border-radius: 50%;
      border: 3px solid white;
    }
    .cv-exp-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .cv-exp-position {
      font-size: 16px;
      font-weight: bold;
      color: #2c3e50;
    }
    .cv-exp-period {
      font-size: 13px;
      color: #888;
      font-style: italic;
      white-space: nowrap;
    }
    .cv-exp-company {
      font-size: 14px;
      color: #667eea;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .cv-exp-description {
      font-size: 13px;
      line-height: 1.8;
      color: #555;
      white-space: pre-line;
    }
    @page { size: A4; margin: 0; }
    @media print {
      .cv-container { page-break-inside: avoid; }
      .cv-section-right { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <div class="cv-left">
      ${cvData.avatar 
        ? `<img src="${cvData.avatar}" alt="Avatar" class="cv-avatar" />`
        : `<div class="cv-avatar-placeholder">📷</div>`
      }
      <div class="cv-name">
        <h1>${cvData.fullName || 'Họ và tên'}</h1>
        <h2>${cvData.position || 'Vị trí ứng tuyển'}</h2>
      </div>
      <div class="cv-section-left">
        <h3 class="cv-section-title-left">📞 Liên hệ</h3>
        ${cvData.phone ? `<p>📱 ${cvData.phone}</p>` : ''}
        ${cvData.email ? `<p>📧 ${cvData.email}</p>` : ''}
        ${cvData.address ? `<p>📍 ${cvData.address}</p>` : ''}
        ${cvData.birthDate ? `<p>🎂 ${cvData.birthDate}</p>` : ''}
        ${cvData.website ? `<p>🌐 ${cvData.website}</p>` : ''}
      </div>
      ${cvData.skills && cvData.skills.length > 0 && cvData.skills[0] ? `
      <div class="cv-section-left">
        <h3 class="cv-section-title-left">⚡ Kỹ năng</h3>
        ${cvData.skills.map(skill => 
          skill ? `<div class="cv-skill-item">${skill}</div>` : ''
        ).join('')}
      </div>
      ` : ''}
      ${cvData.hobbies ? `
      <div class="cv-section-left">
        <h3 class="cv-section-title-left">🎨 Sở thích</h3>
        <p style="white-space: pre-line;">${cvData.hobbies}</p>
      </div>
      ` : ''}
    </div>
    <div class="cv-right">
      ${cvData.objective ? `
      <div class="cv-section-right">
        <h3 class="cv-section-title-right">🎯 Mục tiêu nghề nghiệp</h3>
        <p class="cv-objective">${cvData.objective}</p>
      </div>
      ` : ''}
      ${cvData.experience && cvData.experience.length > 0 ? `
      <div class="cv-section-right">
        <h3 class="cv-section-title-right">💼 Kinh nghiệm làm việc</h3>
        ${cvData.experience.map(exp => `
          <div class="cv-exp-item">
            <div class="cv-exp-header">
              <span class="cv-exp-position">${exp.position || 'Vị trí'}</span>
              <span class="cv-exp-period">${exp.period || 'Thời gian'}</span>
            </div>
            <div class="cv-exp-company">${exp.company || 'Công ty'}</div>
            <div class="cv-exp-description">${exp.description || ''}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}
      ${cvData.education && cvData.education.length > 0 ? `
      <div class="cv-section-right">
        <h3 class="cv-section-title-right">🎓 Học vấn</h3>
        ${cvData.education.map(edu => `
          <div class="cv-exp-item">
            <div class="cv-exp-header">
              <span class="cv-exp-position">${edu.degree || 'Bằng cấp'}</span>
              <span class="cv-exp-period">${edu.period || 'Thời gian'}</span>
            </div>
            <div class="cv-exp-company">${edu.school || 'Trường học'}</div>
            <div class="cv-exp-description">${edu.details || ''}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `;
}

module.exports = router;
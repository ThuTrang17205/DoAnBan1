const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect, authorize } = require('../middleware/auth');

// ⭐ NEW ENDPOINT: Get candidate CV
router.get('/candidates/:candidateId/cv', 
  protect,  // ✅ Đổi thành protect
  authorize('employer', 'admin'),  // ✅ Đổi thành authorize
  async (req, res) => {
    try {
      const { candidateId } = req.params;
      
      console.log('📄 Fetching CV for candidate:', candidateId);
      
      const result = await pool.query(`
        SELECT 
          cpd.cv_id,
          cpd.cv_file,
          cpd.cv_file_path,
          u.id as user_id,
          u.name,
          u.email
        FROM cv_parsed_data cpd
        INNER JOIN users u ON cpd.user_id = u.id
        WHERE cpd.user_id = $1
        ORDER BY cpd.created_at DESC
        LIMIT 1
      `, [candidateId]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'CV không tìm thấy' 
        });
      }
      
      const cv = result.rows[0];
      const cvFile = cv.cv_file || cv.cv_file_path;
      
      if (!cvFile) {
        return res.status(404).json({
          success: false,
          message: 'Ứng viên chưa upload CV'
        });
      }
      
      res.json({ 
        success: true, 
        cv_file: cvFile,
        candidate: {
          id: cv.user_id,
          name: cv.name,
          email: cv.email
        }
      });
    } catch (error) {
      console.error('Error fetching CV:', error);
      res.status(500).json({ 
        success: false,
        message: error.message 
      });
    }
  }
);

module.exports = router;
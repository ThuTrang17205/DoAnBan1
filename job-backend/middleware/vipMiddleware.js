

const db = require('../config/db');

/**
 * Middleware kiểm tra quyền VIP
 */
exports.requireVIP = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    
    const result = await db.query(
      `SELECT * FROM companies 
       WHERE employer_id = $1 
       AND package_type != 'FREE'
       AND package_expired_at > NOW()
       LIMIT 1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Tính năng này chỉ dành cho tài khoản VIP',
        upgrade_required: true
      });
    }
    
    req.company = result.rows[0];
    next();
    
  } catch (error) {
    console.error('Error in requireVIP middleware:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Middleware kiểm tra giới hạn AI Match
 */
exports.checkAIMatchLimit = async (req, res, next) => {
  try {
    const company = req.company;
    
    if (!company) {
      return res.status(403).json({
        success: false,
        message: 'Không tìm thấy thông tin công ty'
      });
    }
    
    
    if (company.ai_match_limit === 999) {
      return next();
    }
    
    
    if (company.ai_match_used >= company.ai_match_limit) {
      return res.status(403).json({
        success: false,
        message: 'Đã hết lượt AI matching',
        current_usage: company.ai_match_used,
        limit: company.ai_match_limit,
        upgrade_required: true
      });
    }
    
    next();
    
  } catch (error) {
    console.error('Error in checkAIMatchLimit middleware:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

/**
 * Middleware kiểm tra giới hạn đăng tin
 */
exports.checkJobPostingLimit = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT * FROM companies WHERE employer_id = $1 LIMIT 1`,
      [userId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công ty'
      });
    }
    
    const company = result.rows[0];
    
    
    if (company.remaining_jobs === 999) {
      return next();
    }
    
    
    if (company.remaining_jobs <= 0) {
      return res.status(403).json({
        success: false,
        message: 'Đã hết lượt đăng tin',
        remaining: 0,
        upgrade_required: true
      });
    }
    
    req.company = company;
    next();
    
  } catch (error) {
    console.error('Error in checkJobPostingLimit middleware:', error);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};





const cron = require('node-cron');
const emailService = require('../services/emailService');

/**
 * Cron job kiểm tra package sắp hết hạn (chạy mỗi ngày lúc 9h sáng)
 */
exports.checkExpiringPackages = cron.schedule('0 9 * * *', async () => {
  console.log('🔍 Checking expiring VIP packages...');
  
  try {
    
    const result = await db.query(
      `SELECT c.*, u.email, u.full_name
       FROM companies c
       JOIN users u ON c.employer_id = u.id
       WHERE c.package_type != 'FREE'
         AND c.package_expired_at > NOW()
         AND c.package_expired_at <= NOW() + INTERVAL '7 days'
         AND c.expiry_reminder_sent = false`
    );
    
    for (const company of result.rows) {
      const daysLeft = Math.ceil(
        (new Date(company.package_expired_at) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      const employer = {
        email: company.email,
        full_name: company.full_name
      };
      
      
      await emailService.sendPackageExpiryReminder(employer, company, daysLeft);
      
      
      await db.query(
        'UPDATE companies SET expiry_reminder_sent = true WHERE id = $1',
        [company.id]
      );
      
      console.log(`✅ Sent expiry reminder to ${company.name} (${daysLeft} days left)`);
    }
    
    console.log(`✅ Checked ${result.rows.length} expiring packages`);
    
  } catch (error) {
    console.error('❌ Error checking expiring packages:', error);
  }
});

/**
 * Cron job xử lý package hết hạn (chạy mỗi ngày lúc 0h)
 */
exports.handleExpiredPackages = cron.schedule('0 0 * * *', async () => {
  console.log('🔍 Handling expired VIP packages...');
  
  try {
    
    const result = await db.query(
      `SELECT c.*, u.email, u.full_name
       FROM companies c
       JOIN users u ON c.employer_id = u.id
       WHERE c.package_type != 'FREE'
         AND c.package_expired_at <= NOW()
         AND c.expired_notification_sent = false`
    );
    
    for (const company of result.rows) {
      const employer = {
        email: company.email,
        full_name: company.full_name
      };
      
      
      await emailService.sendPackageExpiredNotification(employer, company);
      
      
      await db.query(
        'UPDATE companies SET expired_notification_sent = true WHERE id = $1',
        [company.id]
      );
      
      
      await db.query(
        `UPDATE jobs 
         SET status = 'inactive', 
             updated_at = NOW()
         WHERE company_id = $1 AND status = 'active'`,
        [company.id]
      );
      
      console.log(`✅ Handled expired package for ${company.name}`);
    }
    
    console.log(`✅ Handled ${result.rows.length} expired packages`);
    
  } catch (error) {
    console.error('❌ Error handling expired packages:', error);
  }
});

/**
 * Cron job tạo báo cáo thống kê hàng tháng (chạy vào ngày 1 hàng tháng lúc 8h sáng)
 */
exports.generateMonthlyReport = cron.schedule('0 8 1 * *', async () => {
  console.log('📊 Generating monthly VIP report...');
  
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    
    const revenueResult = await db.query(
      `SELECT 
        package_type,
        COUNT(*) as count,
        SUM(vp.price) as revenue
       FROM companies c
       JOIN vip_packages vp ON c.package_type = vp.name
       WHERE c.package_start_date >= DATE_TRUNC('month', $1)
         AND c.package_start_date < DATE_TRUNC('month', NOW())
       GROUP BY package_type`,
      [lastMonth]
    );
    
    
    const aiMatchResult = await db.query(
      `SELECT 
        COUNT(*) as total_matches,
        SUM(match_count) as total_cvs_matched
       FROM ai_match_history
       WHERE match_date >= DATE_TRUNC('month', $1)
         AND match_date < DATE_TRUNC('month', NOW())`,
      [lastMonth]
    );
    
    
    const renewalResult = await db.query(
      `SELECT 
        COUNT(*) as renewed,
        (SELECT COUNT(*) 
         FROM companies 
         WHERE package_expired_at >= DATE_TRUNC('month', $1)
           AND package_expired_at < DATE_TRUNC('month', NOW())
        ) as expired
       FROM companies
       WHERE package_start_date >= DATE_TRUNC('month', $1)
         AND package_start_date < DATE_TRUNC('month', NOW())
         AND package_type != 'FREE'`,
      [lastMonth]
    );
    
    const report = {
      month: lastMonth.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long' }),
      revenue: revenueResult.rows,
      ai_matching: aiMatchResult.rows[0],
      renewal: renewalResult.rows[0]
    };
    
    console.log('📊 Monthly Report:', JSON.stringify(report, null, 2));
    
    
    
  } catch (error) {
    console.error('❌ Error generating monthly report:', error);
  }
});

/**
 * Khởi động tất cả cron jobs
 */
exports.startCronJobs = () => {
  console.log('🚀 Starting VIP management cron jobs...');
  
  this.checkExpiringPackages.start();
  this.handleExpiredPackages.start();
  this.generateMonthlyReport.start();
  
  console.log('✅ All cron jobs started successfully');
};

module.exports = exports;
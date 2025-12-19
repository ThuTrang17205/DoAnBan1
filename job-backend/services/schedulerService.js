
const cron = require('node-cron');
const emailService = require('./emailService');
const db = require('../config/db');

/**
 * Kiểm tra và gửi email nhắc nhở package sắp hết hạn
 * Chạy mỗi ngày lúc 9h sáng
 */
const checkExpiringPackages = cron.schedule('0 9 * * *', async () => {
  try {
    console.log('[CRON] Checking for expiring packages...');
    
    
    const result = await db.query(`
      SELECT 
        c.*,
        u.email,
        u.name as full_name 
      FROM companies c
      JOIN users u ON c.employer_id = u.id
      WHERE c.package_type != 'Free'
        AND c.package_expired_at IS NOT NULL
        AND c.package_expired_at::date - CURRENT_DATE IN (7, 3, 1) 
    `);
    
    const expiringPackages = result.rows;  
    
    for (const pkg of expiringPackages) {
      const daysLeft = Math.ceil(
        (new Date(pkg.package_expired_at) - new Date()) / (1000 * 60 * 60 * 24)
      );
      
      await emailService.sendPackageExpiryReminder(
        { email: pkg.email, full_name: pkg.full_name },
        pkg,
        daysLeft
      );
    }
    
    console.log(`[CRON] Sent ${expiringPackages.length} expiry reminders`);
    
  } catch (error) {
    console.error('[CRON] Check expiring packages error:', error);
  }
}, {
  scheduled: false
});

/**
 * Kiểm tra và gửi email thông báo package đã hết hạn
 * Chạy mỗi ngày lúc 10h sáng
 */
const checkExpiredPackages = cron.schedule('0 10 * * *', async () => {
  try {
    console.log('[CRON] Checking for expired packages...');
    
    
    const result = await db.query(`
      SELECT 
        c.*,
        u.email,
        u.name as full_name 
      FROM companies c
      JOIN users u ON c.employer_id = u.id
      WHERE c.package_type != 'Free'
        AND c.package_expired_at IS NOT NULL
        AND c.package_expired_at::date = CURRENT_DATE 
    `);
    
    const expiredPackages = result.rows;  
    
    for (const pkg of expiredPackages) {
      
      await emailService.sendPackageExpiredNotification(
        { email: pkg.email, full_name: pkg.full_name },
        pkg
      );
      
      
      await db.query(
        `UPDATE companies 
         SET package_type = 'Free',
             ai_match_limit = 0,
             ai_match_used = 0
         WHERE id = $1`,
        [pkg.id]
      );
    }
    
    console.log(`[CRON] Processed ${expiredPackages.length} expired packages`);
    
  } catch (error) {
    console.error('[CRON] Check expired packages error:', error);
  }
}, {
  scheduled: false
});

/**
 * Khởi động tất cả cron jobs
 */
const startScheduler = () => {
  checkExpiringPackages.start();
  checkExpiredPackages.start();
  console.log('Scheduler service started');
};

/**
 * Dừng tất cả cron jobs
 */
const stopScheduler = () => {
  checkExpiringPackages.stop();
  checkExpiredPackages.stop();
  console.log('Scheduler service stopped');
};

module.exports = {
  startScheduler,
  stopScheduler
};
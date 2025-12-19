// services/emailService.js
const nodemailer = require('nodemailer');

// Cấu hình email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ============================================
// EMAIL SERVICE OBJECT
// ============================================

const emailService = {
  
  // ============================================
  // AUTHENTICATION & WELCOME EMAILS
  // ============================================
  
  /**
   * Gửi email chào mừng khi đăng ký
   */
  sendWelcomeEmail: async (userEmail, userName) => {
    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: ' Chào mừng bạn đến với Job Portal!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: linear-gradient(135deg, #00B14F 0%, #00913D 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
            .cta-button { display: inline-block; background: #00B14F; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .cta-button:hover { background: #00913D; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            .feature-box { background: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> Chào Mừng Đến Với Job Portal!</h1>
            </div>
            
            <div class="content">
              <h2 style="color: #00B14F;">Xin chào ${userName}!</h2>
              
              <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Job Portal</strong>. Chúng tôi rất vui được đồng hành cùng bạn trong hành trình tìm kiếm công việc mơ ước!</p>
              
              <div class="feature-box">
                <h3 style="margin-top: 0; color: #00B14F;"> Những gì bạn có thể làm:</h3>
                <ul style="line-height: 2;">
                  <li> Tìm kiếm hàng nghìn việc làm</li>
                  <li> Tạo và quản lý CV chuyên nghiệp</li>
                  <li> AI gợi ý việc làm phù hợp</li>
                  <li> Nhận thông báo việc làm mới</li>
                  <li> Ứng tuyển nhanh chóng</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="cta-button">
                  Đăng Nhập Ngay
                </a>
              </div>
              
              <p style="margin-top: 30px;">Nếu bạn cần hỗ trợ, đừng ngại liên hệ với chúng tôi!</p>
              
              <p>Chúc bạn thành công!<br>
              <strong>Job Portal Team</strong></p>
            </div>
            
            <div class="footer">
              <p>Email này được gửi tự động. Vui lòng không trả lời email này.</p>
              <p>© ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(' Welcome email sent to:', userEmail);
      return true;
    } catch (error) {
      console.error(' Error sending welcome email:', error.message);
      return false;
    }
  },

  /**
   * Gửi email reset password
   */
  sendPasswordResetEmail: async (userEmail, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: ' Yêu cầu đặt lại mật khẩu',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; }
            .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
            .cta-button { display: inline-block; background: #3498db; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> Đặt Lại Mật Khẩu</h1>
            </div>
            
            <div class="content">
              <p>Xin chào,</p>
              
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="cta-button">
                  Đặt Lại Mật Khẩu
                </a>
              </div>
              
              <div class="warning-box">
                <strong> Lưu ý:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li>Link này chỉ có hiệu lực trong <strong>1 giờ</strong></li>
                  <li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này</li>
                  <li>Không chia sẻ link này với bất kỳ ai</li>
                </ul>
              </div>
              
              <p>Nếu nút bấm không hoạt động, copy link sau vào trình duyệt:</p>
              <p style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all; font-size: 12px;">
                ${resetUrl}
              </p>
              
              <p>Trân trọng,<br>
              <strong>Job Portal Team</strong></p>
            </div>
            
            <div class="footer">
              <p>Email này được gửi tự động. Vui lòng không trả lời email này.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(' Password reset email sent to:', userEmail);
      return true;
    } catch (error) {
      console.error(' Error sending password reset email:', error.message);
      return false;
    }
  },

  // ============================================
  // JOB APPLICATION EMAILS
  // ============================================

  /**
   * Gửi email xác nhận ứng tuyển
   */
  sendApplicationConfirmation: async (candidateEmail, candidateName, job) => {
    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: candidateEmail,
      subject: ` Xác nhận ứng tuyển: ${job.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #27ae60 0%, #229954 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .job-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #27ae60; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> Ứng Tuyển Thành Công!</h1>
            </div>
            
            <div class="content">
              <p>Xin chào <strong>${candidateName}</strong>,</p>
              
              <p>Cảm ơn bạn đã ứng tuyển vị trí tại Job Portal!</p>
              
              <div class="job-box">
                <h3 style="margin-top: 0; color: #27ae60;">${job.title}</h3>
                <p><strong> Địa điểm:</strong> ${job.location || 'Chưa cập nhật'}</p>
                <p><strong> Công ty:</strong> ${job.company_name || 'Chưa cập nhật'}</p>
                <p><strong> Ngày ứng tuyển:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
              </div>
              
              <p><strong> Bước tiếp theo:</strong></p>
              <ul>
                <li>Nhà tuyển dụng sẽ xem xét hồ sơ của bạn</li>
                <li>Bạn sẽ nhận được thông báo qua email nếu được chọn</li>
                <li>Thời gian xử lý thường là 3-7 ngày làm việc</li>
              </ul>
              
              <p>Chúc bạn thành công!</p>
              
              <p>Trân trọng,<br>
              <strong>Job Portal Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(' Application confirmation sent to:', candidateEmail);
      return true;
    } catch (error) {
      console.error(' Error sending application confirmation:', error.message);
      return false;
    }
  },

  /**
   * Gửi email thông báo cho employer khi có ứng viên mới
   */
  sendNewApplicationNotification: async (employerEmail, candidateName, job) => {
    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: employerEmail,
      subject: ` Ứng viên mới cho vị trí: ${job.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3498db 0%, #2980b9 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .candidate-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3498db; }
            .cta-button { display: inline-block; background: #3498db; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> Ứng Viên Mới!</h1>
            </div>
            
            <div class="content">
              <p>Xin chào,</p>
              
              <p>Bạn có một ứng viên mới cho vị trí:</p>
              
              <div class="candidate-box">
                <h3 style="margin-top: 0; color: #3498db;">${job.title}</h3>
                <p><strong> Ứng viên:</strong> ${candidateName}</p>
                <p><strong> Ngày ứng tuyển:</strong> ${new Date().toLocaleDateString('vi-VN')}</p>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/employer/applications" class="cta-button">
                  Xem Hồ Sơ Ứng Viên
                </a>
              </div>
              
              <p>Trân trọng,<br>
              <strong>Job Portal Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(' New application notification sent to:', employerEmail);
      return true;
    } catch (error) {
      console.error(' Error sending new application notification:', error.message);
      return false;
    }
  },

  // ============================================
  // VIP PACKAGE EMAILS
  // ============================================

  /**
   * Gửi email mời ứng tuyển (VIP feature)
   */
  sendJobInvitation: async (candidateEmail, job, customMessage) => {
    try {
      const mailOptions = {
        from: `"Job Portal" <${process.env.EMAIL_USER}>`,
        to: candidateEmail,
        subject: ` Lời mời ứng tuyển: ${job.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .job-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
              .job-details h3 { margin: 0 0 15px 0; color: #667eea; }
              .job-info { margin: 10px 0; }
              .message-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
              .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1> Lời Mời Ứng Tuyển</h1>
                <p>Chúng tôi nghĩ bạn rất phù hợp với vị trí này!</p>
              </div>
              
              <div class="content">
                <p>Xin chào,</p>
                
                <p>Chúng tôi đã xem xét hồ sơ của bạn và rất ấn tượng với kinh nghiệm cũng như kỹ năng của bạn. Chúng tôi muốn mời bạn ứng tuyển cho vị trí sau:</p>
                
                <div class="job-details">
                  <h3>${job.title}</h3>
                  <div class="job-info"><strong> Địa điểm:</strong> ${job.location || 'Chưa cập nhật'}</div>
                  <div class="job-info"><strong> Mức lương:</strong> ${job.salary_min?.toLocaleString() || 'Thỏa thuận'} - ${job.salary_max?.toLocaleString() || 'Thỏa thuận'} VNĐ</div>
                  <div class="job-info"><strong> Kinh nghiệm:</strong> ${job.min_experience || 0}+ năm</div>
                  <div class="job-info"><strong> Trình độ:</strong> ${job.education_level || 'Đại học'}</div>
                </div>
                
                ${customMessage ? `
                  <div class="message-box">
                    <strong> Lời nhắn từ nhà tuyển dụng:</strong>
                    <p>${customMessage}</p>
                  </div>
                ` : ''}
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/jobs/${job.id}" class="cta-button">
                    Xem Chi Tiết & Ứng Tuyển
                  </a>
                </div>
                
                <p>Chúng tôi rất mong được làm việc cùng bạn!</p>
                
                <p>Trân trọng,<br>
                <strong>Job Portal Team</strong></p>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(` Job invitation sent to ${candidateEmail}`);
      return true;
      
    } catch (error) {
      console.error(' Error sending job invitation:', error);
      throw error;
    }
  },

  /**
   * Gửi email nhắc nhở package sắp hết hạn
   */
  sendPackageExpiryReminder: async (employer, company, daysLeft) => {
    try {
      const mailOptions = {
        from: `"Job Portal" <${process.env.EMAIL_USER}>`,
        to: employer.email,
        subject: ` Gói VIP của bạn sắp hết hạn trong ${daysLeft} ngày`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .package-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .cta-button { display: inline-block; background: #f5576c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
              .benefits { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .benefits ul { margin: 10px 0; padding-left: 20px; }
              .benefits li { margin: 8px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1> Thông Báo Quan Trọng</h1>
                <p>Gói VIP của bạn sắp hết hạn</p>
              </div>
              
              <div class="content">
                <p>Kính gửi <strong>${employer.full_name}</strong>,</p>
                
                <div class="warning-box">
                  <h3> Gói VIP của công ty <strong>${company.name}</strong> sẽ hết hạn trong <strong>${daysLeft} ngày</strong></h3>
                  <p>Ngày hết hạn: <strong>${new Date(company.package_expired_at).toLocaleDateString('vi-VN')}</strong></p>
                </div>
                
                <div class="package-info">
                  <h3> Thông tin gói hiện tại:</h3>
                  <p><strong>Gói:</strong> ${company.package_type}</p>
                  <p><strong>AI Match đã dùng:</strong> ${company.ai_match_used}/${company.ai_match_limit}</p>
                  <p><strong>Tin đăng hiện tại:</strong> ${company.current_jobs}</p>
                </div>
                
                <div class="benefits">
                  <h3> Gia hạn ngay để tiếp tục nhận:</h3>
                  <ul>
                    <li> Tiếp tục sử dụng AI Matching thông minh</li>
                    <li> Đăng tin tuyển dụng không giới hạn</li>
                    <li> Hỗ trợ ưu tiên 24/7</li>
                    <li> Logo nổi bật trên trang chủ</li>
                    <li> Tiếp cận hàng nghìn ứng viên chất lượng</li>
                  </ul>
                </div>
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/employer/packages" class="cta-button">
                    Gia Hạn Ngay
                  </a>
                </div>
                
                <p>Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với chúng tôi!</p>
                
                <p>Trân trọng,<br>
                <strong>Job Portal Team</strong></p>
              </div>
            </div>
          </body>
          </html>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(` Package expiry reminder sent to ${employer.email}`);
      return true;
      
    } catch (error) {
      console.error(' Error sending package expiry reminder:', error);
      throw error;
    }
  },

  /**
   * Gửi email thông báo package đã hết hạn
   */
  sendPackageExpiredNotification: async (employer, company) => {
    try {
      const mailOptions = {
        from: `"Job Portal" <${process.env.EMAIL_USER}>`,
        to: employer.email,
        subject: ` Gói VIP của bạn đã hết hạn`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #e74c3c; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .expired-box { background: #fee; border-left: 4px solid #e74c3c; padding: 20px; margin: 20px 0; border-radius: 5px; }
              .cta-button { display: inline-block; background: #e74c3c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1> Gói VIP Đã Hết Hạn</h1>
              </div>
              
              <div class="content">
                <p>Kính gửi <strong>${employer.full_name}</strong>,</p>
                
                <div class="expired-box">
                  <h3>Gói VIP của công ty <strong>${company.name}</strong> đã hết hạn</h3>
                  <p>Các tính năng VIP đã bị tạm ngưng. Vui lòng gia hạn để tiếp tục sử dụng.</p>
                </div>
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/employer/
        packages" class="cta-button">
                  Gia Hạn Ngay
                </a>
              </div>
              
              <p>Trân trọng,<br>
              <strong>Job Portal Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(` Package expired notification sent to ${employer.email}`);
    return true;
    
  } catch (error) {
    console.error(' Error sending package expired notification:', error);
    throw error;
  }
},

/**
 * Gửi email xác nhận upgrade package
 */
sendPackageUpgradeConfirmation: async (employer, company, oldPackage, newPackage) => {
  try {
    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: employer.email,
      subject: ` Nâng cấp VIP thành công!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .success-box { background: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .comparison { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .cta-button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1> Chúc Mừng!</h1>
              <p>Nâng cấp VIP thành công</p>
            </div>
            
            <div class="content">
              <p>Kính gửi <strong>${employer.full_name}</strong>,</p>
              
              <div class="success-box">
                <h3> Công ty <strong>${company.name}</strong> đã nâng cấp thành công!</h3>
                <p>Bạn đã nâng cấp từ <strong>${oldPackage}</strong> lên <strong>${newPackage}</strong></p>
              </div>
              
              <div class="comparison">
                <h3> Tính năng mới bạn được hưởng:</h3>
                <ul style="line-height: 2;">
                  ${newPackage === 'VIP Premium' ? `
                    <li> AI Matching không giới hạn</li>
                    <li> Tư vấn riêng 1-1</li>
                    <li> Hiển thị TOP ưu tiên</li>
                  ` : newPackage === 'VIP Pro' ? `
                    <li> AI Matching 200 lượt/tháng</li>
                    <li> Đăng tin không giới hạn</li>
                    <li> Logo nổi bật</li>
                  ` : `
                    <li> AI Matching 50 lượt/tháng</li>
                    <li> Đăng 20 tin/tháng</li>
                  `}
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/employer/dashboard" class="cta-button">
                  Khám Phá Tính Năng Mới
                </a>
              </div>
              
              <p>Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của chúng tôi!</p>
              
              <p>Trân trọng,<br>
              <strong>Job Portal Team</strong></p>
            </div>
            
            <div class="footer">
              <p>© ${new Date().getFullYear()} Job Portal. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(` Package upgrade confirmation sent to ${employer.email}`);
    return true;
    
  } catch (error) {
    console.error(' Error sending package upgrade confirmation:', error);
    throw error;
  }
},

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Kiểm tra email service đang hoạt động
 */
testConnection: async () => {
  try {
    await transporter.verify();
    console.log(' Email service is ready');
    return true;
  } catch (error) {
    console.error(' Email service error:', error);
    return false;
  }
},

/**
 * Gửi email custom (dùng cho admin gửi thông báo)
 */
sendCustomEmail: async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent
    };
    
    await transporter.sendMail(mailOptions);
    console.log(` Custom email sent to ${to}`);
    return true;
  } catch (error) {
    console.error(' Error sending custom email:', error);
    return false;
  }
}

}; // Đóng object emailService

module.exports = emailService;
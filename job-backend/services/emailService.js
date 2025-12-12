/**
 * Email Service
 * Handles email notifications using Nodemailer
 */

const nodemailer = require('nodemailer');

// Email configuration from environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = process.env.EMAIL_PORT || 587;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@jobportal.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Create transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send email
 */
const sendEmail = async (to, subject, html, text = '') => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `Job Portal <${EMAIL_FROM}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Email Templates
 */

// Welcome email for new users
const sendWelcomeEmail = async (userEmail, userName) => {
  const subject = 'Chào mừng bạn đến với Job Portal! 🎉';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .button { display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Chào mừng đến với Job Portal!</h1>
        </div>
        <div class="content">
          <h2>Xin chào ${userName}!</h2>
          <p>Cảm ơn bạn đã đăng ký tài khoản tại Job Portal. Chúng tôi rất vui mừng được đồng hành cùng bạn trong hành trình tìm kiếm việc làm.</p>
          <p>Với Job Portal, bạn có thể:</p>
          <ul>
            <li>✅ Tìm kiếm hàng ngàn công việc phù hợp</li>
            <li>✅ Nộp đơn ứng tuyển trực tuyến</li>
            <li>✅ Tạo CV chuyên nghiệp</li>
            <li>✅ Nhận thông báo về công việc mới</li>
          </ul>
          <a href="${FRONTEND_URL}" class="button">Khám phá ngay</a>
          <p>Chúc bạn tìm được công việc mơ ước!</p>
        </div>
        <div class="footer">
          <p>© 2024 Job Portal. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(userEmail, subject, html);
};

// Email verification
const sendVerificationEmail = async (userEmail, userName, verificationToken) => {
  const verificationUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
  
  const subject = 'Xác thực email của bạn';
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Xin chào ${userName}!</h2>
        <p>Vui lòng xác thực email của bạn bằng cách click vào nút bên dưới:</p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Xác thực Email
        </a>
        <p>Hoặc copy link sau vào trình duyệt:</p>
        <p style="word-break: break-all; background: #f4f4f4; padding: 10px;">${verificationUrl}</p>
        <p>Link này sẽ hết hạn sau 24 giờ.</p>
        <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(userEmail, subject, html);
};

// Password reset email
const sendPasswordResetEmail = async (userEmail, userName, resetToken) => {
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const subject = 'Đặt lại mật khẩu';
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Xin chào ${userName}!</h2>
        <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
        <p>Click vào nút bên dưới để đặt lại mật khẩu:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 30px; background: #dc3545; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Đặt lại mật khẩu
        </a>
        <p>Hoặc copy link sau vào trình duyệt:</p>
        <p style="word-break: break-all; background: #f4f4f4; padding: 10px;">${resetUrl}</p>
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
        <p><strong>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</strong></p>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(userEmail, subject, html);
};

// Application submitted notification (to user)
const sendApplicationSubmittedEmail = async (userEmail, userName, jobTitle, companyName) => {
  const subject = `Đơn ứng tuyển của bạn đã được gửi - ${jobTitle}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Xin chào ${userName}!</h2>
        <p>Đơn ứng tuyển của bạn đã được gửi thành công! ✅</p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <p><strong>Vị trí:</strong> ${jobTitle}</p>
          <p><strong>Công ty:</strong> ${companyName}</p>
          <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        </div>
        <p>Nhà tuyển dụng sẽ xem xét hồ sơ của bạn và liên hệ nếu phù hợp.</p>
        <p>Chúc bạn may mắn! 🍀</p>
        <a href="${FRONTEND_URL}/profile/applications" style="display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Xem đơn ứng tuyển
        </a>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(userEmail, subject, html);
};

// Application received notification (to employer)
const sendApplicationReceivedEmail = async (employerEmail, jobTitle, candidateName) => {
  const subject = `Nhận được đơn ứng tuyển mới - ${jobTitle}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Bạn có đơn ứng tuyển mới! 📩</h2>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #28a745; margin: 20px 0;">
          <p><strong>Vị trí:</strong> ${jobTitle}</p>
          <p><strong>Ứng viên:</strong> ${candidateName}</p>
          <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
        </div>
        <p>Vui lòng đăng nhập vào hệ thống để xem chi tiết hồ sơ ứng viên.</p>
        <a href="${FRONTEND_URL}/employer/applications" style="display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Xem đơn ứng tuyển
        </a>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(employerEmail, subject, html);
};

// Application status update (to user)
const sendApplicationStatusEmail = async (userEmail, userName, jobTitle, status, message = '') => {
  const statusMessages = {
    reviewed: { title: 'đang được xem xét', color: '#ffc107', icon: '👀' },
    interview: { title: 'được mời phỏng vấn', color: '#17a2b8', icon: '📅' },
    accepted: { title: 'được chấp nhận', color: '#28a745', icon: '🎉' },
    rejected: { title: 'không được chấp nhận', color: '#dc3545', icon: '😔' }
  };
  
  const statusInfo = statusMessages[status] || statusMessages.reviewed;
  
  const subject = `Cập nhật đơn ứng tuyển - ${jobTitle}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Xin chào ${userName}!</h2>
        <div style="background: #f9f9f9; padding: 20px; border-left: 4px solid ${statusInfo.color}; margin: 20px 0; text-align: center;">
          <h3 style="margin: 0; color: ${statusInfo.color};">
            ${statusInfo.icon} Đơn ứng tuyển của bạn ${statusInfo.title}
          </h3>
          <p style="margin: 10px 0;"><strong>${jobTitle}</strong></p>
        </div>
        ${message ? `<p>${message}</p>` : ''}
        <a href="${FRONTEND_URL}/profile/applications" style="display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Xem chi tiết
        </a>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(userEmail, subject, html);
};

// Interview schedule notification
const sendInterviewScheduleEmail = async (userEmail, userName, jobTitle, interviewDate, location, notes = '') => {
  const subject = `Lịch phỏng vấn - ${jobTitle}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Xin chào ${userName}! 🎉</h2>
        <p>Chúc mừng! Bạn đã được mời tham gia phỏng vấn.</p>
        <div style="background: #e7f3ff; padding: 20px; border-left: 4px solid #007bff; margin: 20px 0;">
          <p><strong>Vị trí:</strong> ${jobTitle}</p>
          <p><strong>📅 Thời gian:</strong> ${new Date(interviewDate).toLocaleString('vi-VN')}</p>
          <p><strong>📍 Địa điểm:</strong> ${location}</p>
          ${notes ? `<p><strong>📝 Ghi chú:</strong> ${notes}</p>` : ''}
        </div>
        <p><strong>Lưu ý:</strong></p>
        <ul>
          <li>Vui lòng có mặt đúng giờ</li>
          <li>Mang theo CV và các giấy tờ liên quan</li>
          <li>Ăn mặc lịch sự, chuyên nghiệp</li>
        </ul>
        <p>Chúc bạn phỏng vấn thành công! 🍀</p>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(userEmail, subject, html);
};

// Job alert notification
const sendJobAlertEmail = async (userEmail, userName, jobs) => {
  const subject = `Công việc mới phù hợp với bạn! 🔔`;
  
  const jobsHtml = jobs.map(job => `
    <div style="background: #f9f9f9; padding: 15px; margin: 10px 0; border-radius: 5px;">
      <h3 style="margin: 0 0 10px 0;">${job.title}</h3>
      <p style="margin: 5px 0; color: #666;">${job.company}</p>
      <p style="margin: 5px 0; color: #666;">📍 ${job.location}</p>
      <p style="margin: 5px 0; color: #28a745; font-weight: bold;">💰 ${job.salary || 'Thỏa thuận'}</p>
      <a href="${FRONTEND_URL}/job/${job.id}" style="display: inline-block; padding: 8px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        Xem chi tiết
      </a>
    </div>
  `).join('');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Xin chào ${userName}!</h2>
        <p>Chúng tôi có ${jobs.length} công việc mới phù hợp với tiêu chí của bạn:</p>
        ${jobsHtml}
        <p style="margin-top: 20px;">Đừng bỏ lỡ cơ hội này!</p>
        <a href="${FRONTEND_URL}/jobs" style="display: inline-block; padding: 12px 30px; background: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Xem tất cả công việc
        </a>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(userEmail, subject, html);
};

// Employer verification success
const sendEmployerVerifiedEmail = async (employerEmail, companyName) => {
  const subject = 'Tài khoản nhà tuyển dụng đã được xác thực ✅';
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Chúc mừng ${companyName}! 🎉</h2>
        <p>Tài khoản nhà tuyển dụng của bạn đã được xác thực thành công.</p>
        <p>Bây giờ bạn có thể:</p>
        <ul>
          <li>✅ Đăng tin tuyển dụng</li>
          <li>✅ Quản lý ứng viên</li>
          <li>✅ Xem thống kê tuyển dụng</li>
        </ul>
        <a href="${FRONTEND_URL}/employer-dashboard" style="display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Bắt đầu tuyển dụng
        </a>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(employerEmail, subject, html);
};

// Contact form notification (to admin)
const sendContactFormEmail = async (name, email, subject, message) => {
  const adminEmail = process.env.ADMIN_EMAIL || EMAIL_USER;
  
  const emailSubject = `[Contact Form] ${subject}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>New Contact Form Submission</h2>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #007bff; margin: 20px 0;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return await sendEmail(adminEmail, emailSubject, html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendApplicationSubmittedEmail,
  sendApplicationReceivedEmail,
  sendApplicationStatusEmail,
  sendInterviewScheduleEmail,
  sendJobAlertEmail,
  sendEmployerVerifiedEmail,
  sendContactFormEmail
};
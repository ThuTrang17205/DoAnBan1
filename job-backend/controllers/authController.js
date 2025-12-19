
console.log(' AUTH CONTROLLER LOADED ');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const pool = require('../config/db');
const emailService = require('../services/emailService');

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body; 

    console.log(' Login attempt:', { email });

    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng nhập email và mật khẩu' 
      });
    }

    const pool = require('../config/db');

    
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      console.log(' User not found:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    const user = result.rows[0];
    console.log(' User found:', { id: user.id, username: user.username, email: user.email, role: user.role });

    
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      console.log(' Password mismatch for user:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'Email hoặc mật khẩu không đúng' 
      });
    }

    console.log(' Password matched');

    
    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    console.log(' Token generated');

    res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error(' Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đăng nhập',
      error: error.message
    });
  }
};

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public

exports.register = async (req, res) => {
  try {
    const { username, email, password, name, phone, role } = req.body;

    console.log(' Register attempt:', { username, email, role });
    console.log(' Full request body:', req.body);

    
    if (!username || !email || !password) {
      console.log(' Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Vui lòng điền đầy đủ thông tin' 
      });
    }

    const pool = require('../config/db');

    console.log(' Checking if username exists...');
    
    const checkUsername = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (checkUsername.rows.length > 0) {
      console.log(' Username already exists:', username);
      return res.status(400).json({ 
        success: false, 
        message: 'Username đã được sử dụng' 
      });
    }

    console.log(' Checking if email exists...');
  
    const checkEmail = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (checkEmail.rows.length > 0) {
      console.log(' Email already exists:', email);
      return res.status(400).json({ 
        success: false, 
        message: 'Email đã được sử dụng' 
      });
    }

    console.log(' Hashing password...');
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log(' Inserting user into database...');
    
    const insertQuery = `
      INSERT INTO users (username, email, password, name, phone, role, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING id, username, email, name, phone, role
    `;

    const values = [
      username,
      email,
      hashedPassword,
      name || username,
      phone || null,
      role || 'user'
    ];

    console.log(' Insert values:', { username, email, name: name || username, phone: phone || null, role: role || 'user' });

    const result = await pool.query(insertQuery, values);

    const user = result.rows[0];

    console.log(' User inserted, generating token...');
    
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    console.log(' User registered successfully:', user.username);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    });

  } catch (error) {
    console.error(' Register erro');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error detail:', error.detail);
    console.error('Full error:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đăng ký',
      error: error.message,
      detail: error.detail,
      code: error.code
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const pool = require('../config/db');
    
    const query = 'SELECT id, username, email, name, phone, role, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Không tìm thấy người dùng' 
      });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error(' Get me error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server' 
    });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin'
      });
    }

    const pool = require('../config/db');

   
    const query = 'SELECT password FROM users WHERE id = $1';
    const result = await pool.query(query, [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const user = result.rows[0];

   
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Mật khẩu hiện tại không đúng' 
      });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

   
    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });

  } catch (error) {
    console.error(' Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đổi mật khẩu' 
    });
  }
};

// @desc    Logout user
// @route   POST /api/users/logout
// @access  Private
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Đăng xuất thành công'
  });
};


// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log(' forgotPassword called with email:', email);
    
    const pool = require('../config/db');
    
    // Tìm user
    const user = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    console.log(' User query result:', user.rows.length, 'users found');

    if (user.rows.length === 0) {
      console.log('❌ Email not found in database');
      return res.status(404).json({
        success: false,
        message: 'Email không tồn tại trong hệ thống'
      });
    }

    console.log(' User found:', user.rows[0].email);

    // Tạo reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    console.log(' Reset token generated:', resetToken.substring(0, 10) + '...');
    
    // Lưu token vào database
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 giờ
    
    console.log(' Attempting to save token to database...');
    
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3',
      [resetTokenHash, resetTokenExpiry, email]
    );

    console.log(' Token saved to database successfully');

    // Tạo reset URL đầy đủ
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    console.log('About to send email to:', email);
    console.log(' Reset URL:', resetUrl);
    
    // Gửi email với URL đầy đủ
    await emailService.sendPasswordResetEmail(email, resetUrl);
    
    console.log(' Email sent successfully!');
    
    res.json({
      success: true,
      message: 'Link reset mật khẩu đã được gửi đến email'
    });
    
  } catch (error) {
    console.error(' Forgot password error:', error);
    console.error(' Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi xử lý yêu cầu',
      error: error.message
    });
  }
};
// @desc    Reset password with token
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    console.log(' Reset password request');

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token và mật khẩu mới là bắt buộc'
      });
    }

    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    const pool = require('../config/db');

    
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    console.log(' Looking for user with token...');

   
    const result = await pool.query(
      `SELECT * FROM users 
       WHERE reset_token = $1 
       AND reset_token_expiry > NOW()`,
      [resetTokenHash]
    );

    if (result.rows.length === 0) {
      console.log(' Invalid or expired token');
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }

    const user = result.rows[0];
    console.log(' Valid token for user:', user.email);

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    console.log(' Updating password...');

    
    await pool.query(
      `UPDATE users 
       SET password = $1, 
           reset_token = NULL, 
           reset_token_expiry = NULL 
       WHERE id = $2`,
      [hashedPassword, user.id]
    );

    console.log(' Password reset successful for:', user.email);

  
    const authToken = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công',
      token: authToken, 
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error(' Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Lỗi server khi đặt lại mật khẩu',
      error: error.message
    });
  }
};
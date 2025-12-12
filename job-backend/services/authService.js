/**
 * Authentication Service
 * Handles authentication business logic
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { AppError } = require('../middleware/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

/**
 * Hash password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare password
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Generate JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Generate refresh token (longer expiry)
 */
const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

/**
 * Verify token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AppError('Token không hợp lệ hoặc đã hết hạn', 401);
  }
};

/**
 * Register new user
 */
const registerUser = async (userData) => {
  const { email, password, fullName, phone, role = 'user' } = userData;

  // Check if email already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError('Email đã được đăng ký', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Insert user
  const query = `
    INSERT INTO users (email, password, full_name, phone, role, is_active, created_at)
    VALUES ($1, $2, $3, $4, $5, true, NOW())
    RETURNING id, email, full_name, phone, role, created_at
  `;

  const values = [email, hashedPassword, fullName, phone || null, role];
  const result = await pool.query(query, values);
  const user = result.rows[0];

  // Create user profile
  await pool.query(
    `INSERT INTO user_profiles (user_id, created_at) VALUES ($1, NOW())`,
    [user.id]
  );

  // Generate tokens
  const token = generateToken({ 
    id: user.id, 
    email: user.email, 
    role: user.role 
  });

  const refreshToken = generateRefreshToken({ 
    id: user.id 
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: user.role,
      createdAt: user.created_at
    },
    token,
    refreshToken
  };
};

/**
 * Login user
 */
const loginUser = async (email, password) => {
  // Find user by email
  const query = `
    SELECT id, email, password, full_name, phone, role, is_active 
    FROM users 
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);

  if (result.rows.length === 0) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  const user = result.rows[0];

  // Check if user is active
  if (!user.is_active) {
    throw new AppError('Tài khoản đã bị vô hiệu hóa', 403);
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  // Update last login
  await pool.query(
    'UPDATE users SET last_login = NOW() WHERE id = $1',
    [user.id]
  );

  // Generate tokens
  const token = generateToken({ 
    id: user.id, 
    email: user.email, 
    role: user.role 
  });

  const refreshToken = generateRefreshToken({ 
    id: user.id 
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      phone: user.phone,
      role: user.role
    },
    token,
    refreshToken
  };
};

/**
 * Register employer
 */
const registerEmployer = async (employerData) => {
  const {
    email,
    password,
    companyName,
    phone,
    address,
    taxCode,
    website,
    description
  } = employerData;

  // Check if email already exists
  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new AppError('Email đã được đăng ký', 409);
  }

  // Check if tax code already exists
  const existingTaxCode = await pool.query(
    'SELECT id FROM employers WHERE tax_code = $1',
    [taxCode]
  );

  if (existingTaxCode.rows.length > 0) {
    throw new AppError('Mã số thuế đã được đăng ký', 409);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert user
    const userQuery = `
      INSERT INTO users (email, password, full_name, phone, role, is_active, created_at)
      VALUES ($1, $2, $3, $4, 'employer', true, NOW())
      RETURNING id, email, full_name, phone, role
    `;

    const userResult = await client.query(userQuery, [
      email,
      hashedPassword,
      companyName,
      phone
    ]);

    const user = userResult.rows[0];

    // Insert employer
    const employerQuery = `
      INSERT INTO employers (
        user_id, 
        company_name, 
        tax_code, 
        address, 
        phone, 
        website, 
        description,
        is_verified,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, NOW())
      RETURNING id
    `;

    const employerResult = await client.query(employerQuery, [
      user.id,
      companyName,
      taxCode,
      address,
      phone,
      website || null,
      description || null
    ]);

    await client.query('COMMIT');

    // Generate tokens
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role,
      employerId: employerResult.rows[0].id
    });

    const refreshToken = generateRefreshToken({ 
      id: user.id 
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        companyName: user.full_name,
        phone: user.phone,
        role: user.role,
        employerId: employerResult.rows[0].id
      },
      token,
      refreshToken
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Login employer
 */
const loginEmployer = async (email, password) => {
  // Find employer user
  const query = `
    SELECT 
      u.id, u.email, u.password, u.full_name, u.phone, u.role, u.is_active,
      e.id as employer_id, e.company_name, e.is_verified
    FROM users u
    LEFT JOIN employers e ON u.id = e.user_id
    WHERE u.email = $1 AND u.role = 'employer'
  `;

  const result = await pool.query(query, [email]);

  if (result.rows.length === 0) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  const user = result.rows[0];

  // Check if user is active
  if (!user.is_active) {
    throw new AppError('Tài khoản đã bị vô hiệu hóa', 403);
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }

  // Update last login
  await pool.query(
    'UPDATE users SET last_login = NOW() WHERE id = $1',
    [user.id]
  );

  // Generate tokens
  const token = generateToken({ 
    id: user.id, 
    email: user.email, 
    role: user.role,
    employerId: user.employer_id
  });

  const refreshToken = generateRefreshToken({ 
    id: user.id 
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      companyName: user.company_name,
      phone: user.phone,
      role: user.role,
      employerId: user.employer_id,
      isVerified: user.is_verified
    },
    token,
    refreshToken
  };
};

/**
 * Login admin
 */
const loginAdmin = async (username, password) => {
  // Find admin
  const query = `
    SELECT id, username, email, password, full_name, role, is_active
    FROM admin
    WHERE username = $1 OR email = $1
  `;

  const result = await pool.query(query, [username]);

  if (result.rows.length === 0) {
    throw new AppError('Tài khoản hoặc mật khẩu không đúng', 401);
  }

  const admin = result.rows[0];

  // Check if admin is active
  if (!admin.is_active) {
    throw new AppError('Tài khoản đã bị vô hiệu hóa', 403);
  }

  // Compare password
  const isPasswordValid = await comparePassword(password, admin.password);

  if (!isPasswordValid) {
    throw new AppError('Tài khoản hoặc mật khẩu không đúng', 401);
  }

  // Update last login
  await pool.query(
    'UPDATE admin SET last_login = NOW() WHERE id = $1',
    [admin.id]
  );

  // Generate token
  const token = generateToken({ 
    id: admin.id, 
    username: admin.username,
    email: admin.email, 
    role: admin.role 
  });

  return {
    admin: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      fullName: admin.full_name,
      role: admin.role
    },
    token
  };
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyToken(refreshToken);

  // Get user
  const result = await pool.query(
    'SELECT id, email, role FROM users WHERE id = $1 AND is_active = true',
    [decoded.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Người dùng không tồn tại hoặc đã bị vô hiệu hóa', 401);
  }

  const user = result.rows[0];

  // Generate new access token
  const newToken = generateToken({ 
    id: user.id, 
    email: user.email, 
    role: user.role 
  });

  return { token: newToken };
};

/**
 * Change password
 */
const changePassword = async (userId, oldPassword, newPassword) => {
  // Get user
  const result = await pool.query(
    'SELECT password FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('Người dùng không tồn tại', 404);
  }

  const user = result.rows[0];

  // Verify old password
  const isPasswordValid = await comparePassword(oldPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError('Mật khẩu cũ không đúng', 401);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  await pool.query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
    [hashedPassword, userId]
  );

  return { message: 'Đổi mật khẩu thành công' };
};

/**
 * Request password reset
 */
const requestPasswordReset = async (email) => {
  // Find user
  const result = await pool.query(
    'SELECT id, email, full_name FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    // Don't reveal if email exists
    return { message: 'Nếu email tồn tại, link reset đã được gửi' };
  }

  const user = result.rows[0];

  // Generate reset token (expires in 1 hour)
  const resetToken = jwt.sign(
    { id: user.id, email: user.email, type: 'reset' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // TODO: Send email with reset link
  // await emailService.sendPasswordResetEmail(user.email, resetToken);

  console.log(`Password reset token for ${user.email}: ${resetToken}`);

  return { 
    message: 'Link reset mật khẩu đã được gửi đến email',
    resetToken // Remove this in production
  };
};

/**
 * Reset password with token
 */
const resetPassword = async (token, newPassword) => {
  // Verify reset token
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
    
    if (decoded.type !== 'reset') {
      throw new Error('Invalid token type');
    }
  } catch (error) {
    throw new AppError('Token không hợp lệ hoặc đã hết hạn', 401);
  }

  // Hash new password
  const hashedPassword = await hashPassword(newPassword);

  // Update password
  const result = await pool.query(
    'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2 RETURNING id',
    [hashedPassword, decoded.id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Người dùng không tồn tại', 404);
  }

  return { message: 'Đặt lại mật khẩu thành công' };
};

/**
 * Verify email with token
 */
const verifyEmail = async (token) => {
  const decoded = verifyToken(token);

  await pool.query(
    'UPDATE users SET is_verified = true, updated_at = NOW() WHERE id = $1',
    [decoded.id]
  );

  return { message: 'Email đã được xác thực' };
};

/**
 * Get user by ID
 */
const getUserById = async (userId) => {
  const query = `
    SELECT id, email, full_name, phone, role, is_active, is_verified, created_at
    FROM users
    WHERE id = $1
  `;

  const result = await pool.query(query, [userId]);

  if (result.rows.length === 0) {
    throw new AppError('Người dùng không tồn tại', 404);
  }

  return result.rows[0];
};

module.exports = {
  // Password helpers
  hashPassword,
  comparePassword,

  // Token helpers
  generateToken,
  generateRefreshToken,
  verifyToken,

  // User auth
  registerUser,
  loginUser,

  // Employer auth
  registerEmployer,
  loginEmployer,

  // Admin auth
  loginAdmin,

  // Token management
  refreshAccessToken,

  // Password management
  changePassword,
  requestPasswordReset,
  resetPassword,

  // Email verification
  verifyEmail,

  // User management
  getUserById
};
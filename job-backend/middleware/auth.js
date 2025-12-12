/**
 * JWT Authentication Middleware
 * Verifies JWT tokens and attaches user info to request
 */

const jwt = require('jsonwebtoken');

// JWT Secret (nên đặt trong .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

/**
 * Middleware xác thực JWT token
 * Kiểm tra token trong header Authorization
 */
const authMiddleware = (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    console.log('=== AUTH MIDDLEWARE ===');
    console.log('Authorization Header:', authHeader);
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    // Token format: "Bearer <token>"
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    console.log('Token extracted:', token.substring(0, 20) + '...');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token decoded:', decoded);

    // Attach user info to request
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role || 'user',
      ...decoded
    };

    console.log('User attached to request:', req.user);
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực',
      error: error.message
    });
  }
};

// ✅ THÊM MỚI: Alias cho protect (tương thích với applicationRoutes.js)
const protect = authMiddleware;

// ✅ THÊM MỚI: Middleware kiểm tra role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Không có quyền truy cập. Vui lòng đăng nhập.'
      });
    }

    console.log('=== AUTHORIZE CHECK ===');
    console.log('Required roles:', roles);
    console.log('User role:', req.user.role);

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Vai trò '${req.user.role}' không có quyền truy cập. Yêu cầu: ${roles.join(', ')}`
      });
    }

    console.log('✅ Authorization passed');
    next();
  };
};

/**
 * Middleware kiểm tra quyền ADMIN
 */
const verifyAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    console.log('=== VERIFY ADMIN ===');
    console.log('Authorization Header:', authHeader);
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    console.log('Token:', token.substring(0, 20) + '...');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);

    // KIỂM TRA ROLE ADMIN
    if (decoded.role !== 'admin') {
      console.log('❌ User role is:', decoded.role, '(not admin)');
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập! Chỉ admin mới được phép.'
      });
    }

    // Attach admin info to request
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role,
      ...decoded
    };

    console.log('✅ Admin verified:', req.user);
    next();
  } catch (error) {
    console.error('Admin verification error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực admin',
      error: error.message
    });
  }
};

/**
 * Middleware xác thực tùy chọn
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      req.user = null;
      return next();
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.id || decoded.userId,
      email: decoded.email,
      username: decoded.username,
      role: decoded.role || 'user',
      ...decoded
    };

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Generate JWT token
 */
const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verify JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Decode JWT token without verification
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

// ✅ EXPORT ĐẦY ĐỦ
module.exports = {
  authMiddleware,
  protect,          // ← THÊM
  authorize,        // ← THÊM
  verifyAdmin,
  optionalAuth,
  generateToken,
  verifyToken,
  decodeToken
};
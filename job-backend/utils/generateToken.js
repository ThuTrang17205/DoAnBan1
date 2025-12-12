// ===================== JWT TOKEN GENERATION UTILITY =====================
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';

// Token expiry times
const ACCESS_TOKEN_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '7d';
const REFRESH_TOKEN_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '30d';

/**
 * Generate Access Token
 * @param {Object} payload - User data to encode (id, email, role, etc.)
 * @param {String} expiresIn - Token expiry time (default: 7d)
 * @returns {String} JWT access token
 */
const generateAccessToken = (payload, expiresIn = ACCESS_TOKEN_EXPIRY) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be an object');
    }

    const token = jwt.sign(
      payload,
      JWT_SECRET,
      {
        expiresIn,
        issuer: 'job-portal-api',
        audience: 'job-portal-users'
      }
    );

    return token;
  } catch (error) {
    console.error('❌ Error generating access token:', error.message);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate Refresh Token
 * @param {Object} payload - User data to encode
 * @param {String} expiresIn - Token expiry time (default: 30d)
 * @returns {String} JWT refresh token
 */
const generateRefreshToken = (payload, expiresIn = REFRESH_TOKEN_EXPIRY) => {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be an object');
    }

    const token = jwt.sign(
      payload,
      JWT_REFRESH_SECRET,
      {
        expiresIn,
        issuer: 'job-portal-api',
        audience: 'job-portal-users'
      }
    );

    return token;
  } catch (error) {
    console.error('❌ Error generating refresh token:', error.message);
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Generate both Access and Refresh tokens
 * @param {Object} payload - User data
 * @returns {Object} { accessToken, refreshToken }
 */
const generateTokenPair = (payload) => {
  try {
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload)
    };
  } catch (error) {
    console.error('❌ Error generating token pair:', error.message);
    throw error;
  }
};

/**
 * Verify Access Token
 * @param {String} token - JWT token to verify
 * @returns {Object} Decoded payload
 */
const verifyAccessToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'job-portal-api',
      audience: 'job-portal-users'
    });

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Verify Refresh Token
 * @param {String} token - JWT refresh token to verify
 * @returns {Object} Decoded payload
 */
const verifyRefreshToken = (token) => {
  try {
    if (!token) {
      throw new Error('Refresh token is required');
    }

    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'job-portal-api',
      audience: 'job-portal-users'
    });

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Refresh token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid refresh token');
    } else {
      throw new Error('Refresh token verification failed');
    }
  }
};

/**
 * Decode token without verification (for debugging)
 * @param {String} token - JWT token
 * @returns {Object} Decoded payload (without verification)
 */
const decodeToken = (token) => {
  try {
    if (!token) {
      throw new Error('Token is required');
    }

    return jwt.decode(token, { complete: true });
  } catch (error) {
    console.error('❌ Error decoding token:', error.message);
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value (Bearer token)
 * @returns {String|null} Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Extract token from request
 * @param {Object} req - Express request object
 * @returns {String|null} Extracted token or null
 */
const extractTokenFromRequest = (req) => {
  // Check Authorization header
  if (req.headers.authorization) {
    return extractTokenFromHeader(req.headers.authorization);
  }

  // Check query parameter
  if (req.query && req.query.token) {
    return req.query.token;
  }

  // Check cookies (if cookie-parser is used)
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

/**
 * Get token expiration date
 * @param {String} token - JWT token
 * @returns {Date|null} Expiration date or null
 */
const getTokenExpiration = (token) => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.payload || !decoded.payload.exp) {
      return null;
    }

    return new Date(decoded.payload.exp * 1000);
  } catch (error) {
    console.error('❌ Error getting token expiration:', error.message);
    return null;
  }
};

/**
 * Check if token is expired
 * @param {String} token - JWT token
 * @returns {Boolean} True if expired, false otherwise
 */
const isTokenExpired = (token) => {
  try {
    const expiration = getTokenExpiration(token);
    if (!expiration) {
      return true;
    }

    return expiration < new Date();
  } catch (error) {
    return true;
  }
};

/**
 * Refresh access token using refresh token
 * @param {String} refreshToken - Valid refresh token
 * @returns {String} New access token
 */
const refreshAccessToken = (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Generate new access token with same payload (without exp)
    const { exp, iat, ...payload } = decoded;
    return generateAccessToken(payload);
  } catch (error) {
    console.error('❌ Error refreshing access token:', error.message);
    throw error;
  }
};

/**
 * Generate token for specific user role
 * @param {Object} user - User object with id, email, role
 * @returns {String} JWT token
 */
const generateUserToken = (user) => {
  try {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      username: user.username || user.email
    };

    return generateAccessToken(payload);
  } catch (error) {
    console.error('❌ Error generating user token:', error.message);
    throw error;
  }
};

/**
 * Generate token for admin
 * @param {Object} admin - Admin object
 * @returns {String} JWT token
 */
const generateAdminToken = (admin) => {
  try {
    const payload = {
      id: admin.id,
      username: admin.username,
      role: 'admin',
      full_name: admin.full_name
    };

    return generateAccessToken(payload, '24h'); // Admin token expires in 24h
  } catch (error) {
    console.error('❌ Error generating admin token:', error.message);
    throw error;
  }
};

/**
 * Generate token for employer
 * @param {Object} employer - Employer object
 * @returns {String} JWT token
 */
const generateEmployerToken = (employer) => {
  try {
    const payload = {
      id: employer.id,
      email: employer.email,
      role: 'employer',
      company_name: employer.company_name
    };

    return generateAccessToken(payload);
  } catch (error) {
    console.error('❌ Error generating employer token:', error.message);
    throw error;
  }
};

// Export all functions
module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  extractTokenFromHeader,
  extractTokenFromRequest,
  getTokenExpiration,
  isTokenExpired,
  refreshAccessToken,
  generateUserToken,
  generateAdminToken,
  generateEmployerToken
};
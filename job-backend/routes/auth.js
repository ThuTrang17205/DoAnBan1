/**
 * Authentication Routes
 * Handles user authentication (login, register, password reset)1111
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
console.log(' AUTH ROUTES LOADED!');

// Controllers
const authController = require('../controllers/authController');

// Middleware
const { authMiddleware } = require('../middleware/auth');
const { 
  validateUserLogin,
  validateUserRegistration
} = require('../middleware/validateInput');
const { 
  authLimiter,
  passwordResetLimiter
} = require('../middleware/rateLimiter');

// Custom authenticateToken middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'No token provided' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  authLimiter,
  validateUserRegistration,
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    User login
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  validateUserLogin,
  authController.login
);

/**
 * @route   POST /api/auth/logout
 * @desc    User logout
 * @access  Private
 */
router.post('/logout', authMiddleware, authController.logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getMe);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change password (authenticated user)
 * @access  Private
 */
router.put('/change-password', authMiddleware, authController.changePassword);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', (req, res) => {
  // TODO: Implement refresh token logic
  res.json({
    success: true,
    message: 'Token refreshed',
    data: {
      token: 'new-token'
    }
  });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password with token
 * @access  Public
 */
router.post('/reset-password', passwordResetLimiter, authController.resetPassword);
/**
 * @route   POST /api/auth/verify-email
 * @desc    Verify email with token
 * @access  Public
 */
router.post('/verify-email', (req, res) => {
  // TODO: Implement email verification logic
  res.json({
    success: true,
    message: 'Email đã được xác thực'
  });
});

/**
 * @route   POST /api/auth/resend-verification
 * @desc    Resend email verification
 * @access  Private
 */
router.post('/resend-verification', authMiddleware, (req, res) => {
  // TODO: Implement resend verification logic
  res.json({
    success: true,
    message: 'Email xác thực đã được gửi lại'
  });
});

/**
 * @route   GET /api/auth/verify
 * @desc    Verify token validity
 * @access  Private
 */
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Token is valid',
    user: req.user
  });
});
const passport = require('../config/passport');
/**
 * @route   POST /api/auth/set-registration-role
 * @desc    Set role for Google OAuth registration
 * @access  Public
 */
router.post('/set-registration-role', (req, res) => {
  const { role } = req.body;
  
  console.log(' Setting registration role:', role);
  
  if (req.session) {
    req.session.registrationRole = role || 'user';
    console.log(' Role saved to session:', req.session.registrationRole);
    
    res.json({ 
      success: true, 
      message: 'Registration role set successfully',
      role: req.session.registrationRole
    });
  } else {
    console.error(' Session not available');
    res.status(500).json({ 
      success: false, 
      message: 'Session not available' 
    });
  }
});

/**
 * @route   GET /api/auth/google/register
 * @desc    Google OAuth register
 * @access  Public
 */
router.get(
  '/google/register',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);
/**
 * @route   GET /api/auth/google/login
 * @desc    Google OAuth login
 * @access  Public
 */
router.get(
  '/google/login',
  passport.authenticate('google', { 
    scope: ['profile', 'email'] 
  })
);

/**
 * @route   GET /api/auth/google/login
 * @desc    Google OAuth login
 * @access  Public
 */
/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:3000/login?error=google_auth_failed',
    session: false 
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { 
          id: req.user.id, 
          role: req.user.role,
          email: req.user.email 
        },
        process.env.JWT_SECRET || 'your-secret-key-change-this',
        { expiresIn: '7d' }
      );

      console.log(' JWT created for:', req.user.email);
      console.log(' Redirecting to homepage with token...');
      
      //  REDIRECT VỀ TRANG CHỦ VỚI TOKEN
      res.redirect(`http://localhost:3000/?token=${token}`);
    } catch (error) {
      console.error(' Error creating token:', error);
      res.redirect('http://localhost:3000/login?error=token_creation_failed');
    }
  }
);

/**
 * @route   GET /api/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
/**
 * @route   GET /api/auth/google/register/callback
 * @desc    Google OAuth register callback
 * @access  Public
 */
router.get(
  '/google/register/callback',
  passport.authenticate('google', { 
    failureRedirect: 'http://localhost:3000/register?error=google_register_failed',
    session: false 
  }),
  (req, res) => {
    try {
      const token = jwt.sign(
        { 
          id: req.user.id, 
          role: req.user.role,
          email: req.user.email 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      console.log(' Google register successful:', req.user.email);
      console.log(' Redirecting to homepage...');
      
      
      res.redirect(`http://localhost:3000/?token=${token}&register=success`);
    } catch (error) {
      console.error('Error creating token:', error);
      res.redirect('http://localhost:3000/register?error=token_creation_failed');
    }
  }
);

module.exports = router;
const rateLimit = require('express-rate-limit');

// ⭐ Kiểm tra environment
const isDevelopment = process.env.NODE_ENV !== 'production';

// ⭐ Helper function để skip rate limit cho localhost trong dev
const skipLocalhost = (req) => {
  if (isDevelopment) {
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '::1' || ip === '127.0.0.1' || ip === 'localhost' || ip === '::ffff:127.0.0.1';
  }
  return false;
};

// Rate limiter cho auth endpoints (đăng nhập, đăng ký)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 phút
  max: isDevelopment ? 1000 : 5,  // ⭐ Dev: 1000, Production: 5
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,  // ⭐ Skip cho localhost trong dev
  message: 'Too many authentication attempts, please try again after 15 minutes.'
});

// Rate limiter cho password reset
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 giờ
  max: isDevelopment ? 1000 : 3,  // ⭐ Dev: 1000, Production: 3
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many password reset attempts, please try again after 1 hour.'
});

// Rate limiter cho search
const searchLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 phút
  max: isDevelopment ? 1000 : 30,  // ⭐ Dev: 1000, Production: 30
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many search requests, please try again later.'
});

// Rate limiter cho job application
const jobApplicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 giờ
  max: isDevelopment ? 1000 : 10,  // ⭐ Dev: 1000, Production: 10
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many job applications, please try again after 1 hour.'
});

// Rate limiter cho job creation (employer tạo job)
const jobCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 giờ
  max: isDevelopment ? 1000 : 10,  // ⭐ Dev: 1000, Production: 10
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many job postings, please try again after 1 hour.'
});

// Rate limiter cho file upload
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 giờ
  max: isDevelopment ? 1000 : 20,  // ⭐ Dev: 1000, Production: 20
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many file uploads, please try again after 1 hour.'
});

// Rate limiter chung cho các API khác
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,       // 1 phút
  max: isDevelopment ? 1000 : 100,  // ⭐ Dev: 1000, Production: 100
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many requests, please try again later.'
});

// ⭐ Log khi rate limiter được load
if (isDevelopment) {
  console.log('🔓 Rate Limiter: Development mode - Limits relaxed for localhost');
} else {
  console.log('🔒 Rate Limiter: Production mode - Strict limits enabled');
}

module.exports = {
  authLimiter,
  passwordResetLimiter,
  searchLimiter,
  jobApplicationLimiter,
  jobCreationLimiter,
  uploadLimiter,
  generalLimiter
};
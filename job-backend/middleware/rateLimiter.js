const rateLimit = require('express-rate-limit');

const isDevelopment = process.env.NODE_ENV !== 'production';

const skipLocalhost = (req) => {
  if (isDevelopment) {
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '::1' || ip === '127.0.0.1' || ip === 'localhost' || ip === '::ffff:127.0.0.1';
  }
  return false;
};

// ========================================
// HELPER FUNCTION ĐỂ XỬ LÝ KEY AN TOÀN
// ========================================
const getKeyGenerator = () => {
  return (req) => {
    // Nếu có user, dùng user ID
    if (req.user?.id) {
      return `user:${req.user.id}`;
    }
    // Nếu không có user, KHÔNG dùng keyGenerator tự custom
    // Để express-rate-limit tự động xử lý IP (có hỗ trợ IPv6)
    return undefined;
  };
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: isDevelopment ? 1000 : 5,  
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,  
  message: 'Too many authentication attempts, please try again after 15 minutes.'
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: isDevelopment ? 1000 : 3,  
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many password reset attempts, please try again after 1 hour.'
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,       
  max: isDevelopment ? 1000 : 30,  
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many search requests, please try again later.'
});

const jobApplicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: isDevelopment ? 1000 : 10, 
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many job applications, please try again after 1 hour.'
});

const jobCreationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: isDevelopment ? 1000 : 10,  
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many job postings, please try again after 1 hour.'
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  
  max: isDevelopment ? 1000 : 20,  
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many file uploads, please try again after 1 hour.'
});

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,       
  max: isDevelopment ? 1000 : 100,  
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  message: 'Too many requests, please try again later.'
});

if (isDevelopment) {
  console.log('⚡ Rate Limiter: Development mode - Limits relaxed for localhost');
} else {
  console.log('🔒 Rate Limiter: Production mode - Strict limits enabled');
}

// MATCHING LIMITERS
const matchingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  keyGenerator: getKeyGenerator(), // ← Sửa ở đây
  message: 'Too many matching operations, please try again after 1 hour or upgrade to VIP for unlimited matching.'
});

const aiMatchingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  keyGenerator: getKeyGenerator(), // ← Sửa ở đây
  message: 'Too many AI matching requests, please upgrade to VIP for more matching operations.'
});

const saveCVLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: isDevelopment ? 1000 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  keyGenerator: getKeyGenerator(), // ← Sửa ở đây
  message: 'Too many CV save operations, please try again later.'
});

const matchingStatsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isDevelopment ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipLocalhost,
  keyGenerator: getKeyGenerator(), // ← Sửa ở đây
  message: 'Too many stats requests, please try again later.'
});

module.exports = {
  authLimiter,
  passwordResetLimiter,
  searchLimiter,
  jobApplicationLimiter,
  jobCreationLimiter,
  uploadLimiter,
  generalLimiter,
  matchingLimiter,
  aiMatchingLimiter,
  saveCVLimiter,
  matchingStatsLimiter
};
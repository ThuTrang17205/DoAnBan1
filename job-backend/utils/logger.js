// =============================================
// utils/logger.js
// WINSTON LOGGER FOR JOB PORTAL
// =============================================

const winston = require('winston');
const path = require('path');
const fs = require('fs');

// ============================================
// SETUP LOG DIRECTORY
// ============================================

const logsDir = path.join(__dirname, '../logs');

// Tạo thư mục logs nếu chưa có
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log('✅ Created logs directory:', logsDir);
}

// ============================================
// CUSTOM FORMATS
// ============================================

// Format cho file logs (JSON)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Format cho console (có màu sắc)
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    
    // Thêm metadata nếu có
    if (Object.keys(meta).length > 0) {
      msg += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return msg;
  })
);

// ============================================
// CREATE LOGGER
// ============================================

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: fileFormat,
  defaultMeta: { 
    service: 'job-portal-api',
    environment: process.env.NODE_ENV || 'development'
  },
  
  transports: [
    // ============================================
    // 1. ERROR LOG - Chỉ log lỗi
    // ============================================
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),

    // ============================================
    // 2. COMBINED LOG - Tất cả logs
    // ============================================
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),

    // ============================================
    // 3. DAILY LOG - Log theo ngày
    // ============================================
    new winston.transports.File({
      filename: path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`),
      maxsize: 5242880, // 5MB
      maxFiles: 7 // Giữ logs 7 ngày
    }),

    // ============================================
    // 4. INFO LOG - Chỉ info level
    // ============================================
    new winston.transports.File({
      filename: path.join(logsDir, 'info.log'),
      level: 'info',
      maxsize: 5242880, // 5MB
      maxFiles: 3
    })
  ],

  // ============================================
  // EXCEPTION HANDLERS
  // ============================================
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'exceptions.log')
    })
  ],

  // ============================================
  // REJECTION HANDLERS
  // ============================================
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, 'rejections.log')
    })
  ],

  // Không exit khi có uncaught exception
  exitOnError: false
});

// ============================================
// CONSOLE TRANSPORT (chỉ khi development)
// ============================================

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
  
  logger.info('🎨 Console logging enabled (development mode)');
}

// ============================================
// CUSTOM HELPER METHODS
// ============================================

/**
 * Log incoming HTTP request
 * @param {Object} req - Express request object
 */
logger.logRequest = (req) => {
  logger.info('📥 Incoming Request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    query: req.query,
    body: req.method === 'POST' || req.method === 'PUT' ? 
      { ...req.body, password: req.body.password ? '***' : undefined } : undefined
  });
};

/**
 * Log outgoing HTTP response
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Number} responseTime - Response time in ms
 */
logger.logResponse = (req, res, responseTime) => {
  const logLevel = res.statusCode >= 400 ? 'warn' : 'info';
  
  logger[logLevel]('📤 Outgoing Response', {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    statusMessage: res.statusMessage,
    responseTime: `${responseTime}ms`
  });
};

/**
 * Log errors with full stack trace
 * @param {Error} err - Error object
 * @param {Object} req - Express request object (optional)
 */
logger.logError = (err, req = null) => {
  const errorLog = {
    message: err.message,
    stack: err.stack,
    name: err.name,
    code: err.code
  };

  if (req) {
    errorLog.request = {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userId: req.user?.id
    };
  }

  logger.error('❌ Error Occurred', errorLog);
};

/**
 * Log authentication events
 * @param {String} action - Auth action (login, logout, register, etc.)
 * @param {Object} user - User object
 * @param {Object} details - Additional details
 */
logger.logAuth = (action, user, details = {}) => {
  logger.info('🔐 Auth Action', {
    action,
    userId: user?.id,
    email: user?.email,
    username: user?.username,
    role: user?.role,
    ...details
  });
};

/**
 * Log database operations
 * @param {String} operation - DB operation (create, read, update, delete)
 * @param {String} collection - Collection/Model name
 * @param {Object} details - Additional details
 */
logger.logDatabase = (operation, collection, details = {}) => {
  logger.debug('💾 Database Operation', {
    operation,
    collection,
    ...details
  });
};

/**
 * Log API calls to external services
 * @param {String} service - Service name
 * @param {String} endpoint - API endpoint
 * @param {Object} details - Additional details
 */
logger.logExternalAPI = (service, endpoint, details = {}) => {
  logger.info('🌐 External API Call', {
    service,
    endpoint,
    ...details
  });
};

/**
 * Log security events
 * @param {String} event - Security event type
 * @param {Object} details - Event details
 */
logger.logSecurity = (event, details = {}) => {
  logger.warn('🔒 Security Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Log performance metrics
 * @param {String} operation - Operation name
 * @param {Number} duration - Duration in ms
 * @param {Object} details - Additional details
 */
logger.logPerformance = (operation, duration, details = {}) => {
  const logLevel = duration > 1000 ? 'warn' : 'debug';
  
  logger[logLevel]('⚡ Performance', {
    operation,
    duration: `${duration}ms`,
    ...details
  });
};

/**
 * Log email sending
 * @param {String} to - Recipient email
 * @param {String} subject - Email subject
 * @param {Boolean} success - Whether email was sent successfully
 */
logger.logEmail = (to, subject, success = true) => {
  logger.info('📧 Email Sent', {
    to,
    subject,
    success,
    timestamp: new Date().toISOString()
  });
};

/**
 * Log scheduled jobs/cron tasks
 * @param {String} jobName - Job name
 * @param {String} status - Job status (started, completed, failed)
 * @param {Object} details - Additional details
 */
logger.logScheduledJob = (jobName, status, details = {}) => {
  logger.info('⏰ Scheduled Job', {
    jobName,
    status,
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Log file uploads
 * @param {String} filename - Uploaded filename
 * @param {String} type - File type (cv, avatar, logo)
 * @param {Number} size - File size in bytes
 */
logger.logFileUpload = (filename, type, size) => {
  logger.info('📎 File Upload', {
    filename,
    type,
    size: `${(size / 1024).toFixed(2)} KB`,
    timestamp: new Date().toISOString()
  });
};

// ============================================
// STREAM FOR MORGAN (HTTP logging)
// ============================================

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// ============================================
// LOGGER STARTUP INFO
// ============================================

logger.info('🚀 Logger initialized', {
  logLevel: logger.level,
  logsDirectory: logsDir,
  environment: process.env.NODE_ENV || 'development'
});

// ============================================
// EXPORT LOGGER
// ============================================

module.exports = logger;
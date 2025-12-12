/**
 * Global Error Handler Middleware
 * Handles all errors in the application
 */

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Handle Mongoose Validation Error
 */
const handleValidationError = (err) => {
  const errors = {};
  Object.keys(err.errors).forEach((key) => {
    errors[key] = err.errors[key].message;
  });

  return {
    statusCode: 400,
    message: 'Dữ liệu không hợp lệ',
    errors
  };
};

/**
 * Handle Mongoose Duplicate Key Error
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];

  let message = 'Dữ liệu đã tồn tại';
  if (field === 'email') {
    message = `Email "${value}" đã được đăng ký`;
  } else if (field === 'taxCode') {
    message = `Mã số thuế "${value}" đã được đăng ký`;
  } else if (field === 'phone') {
    message = `Số điện thoại "${value}" đã được đăng ký`;
  }

  return {
    statusCode: 409,
    message,
    field,
    value
  };
};

/**
 * Handle Mongoose Cast Error (Invalid ObjectId)
 */
const handleCastError = (err) => {
  return {
    statusCode: 400,
    message: `ID không hợp lệ: ${err.value}`
  };
};

/**
 * Handle JWT Error
 */
const handleJWTError = () => {
  return {
    statusCode: 401,
    message: 'Token không hợp lệ. Vui lòng đăng nhập lại'
  };
};

/**
 * Handle JWT Expired Error
 */
const handleJWTExpiredError = () => {
  return {
    statusCode: 401,
    message: 'Token đã hết hạn. Vui lòng đăng nhập lại'
  };
};

/**
 * Handle Multer Error (File Upload)
 */
const handleMulterError = (err) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return {
      statusCode: 400,
      message: 'File quá lớn. Kích thước tối đa là 5MB'
    };
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return {
      statusCode: 400,
      message: 'Quá nhiều file hoặc field name không đúng'
    };
  }
  return {
    statusCode: 400,
    message: 'Lỗi upload file'
  };
};

/**
 * Send Error Response in Development
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.name,
    message: err.message,
    stack: err.stack,
    errors: err.errors || undefined
  });
};

/**
 * Send Error Response in Production
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || undefined
    });
  } 
  // Programming or unknown error: don't leak error details
  else {
    console.error('💥 ERROR:', err);
    res.status(500).json({
      success: false,
      message: 'Đã xảy ra lỗi. Vui lòng thử lại sau'
    });
  }
};

/**
 * Not Found Error Handler
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Không tìm thấy - ${req.originalUrl}`, 404);
  next(error);
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development environment
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } 
  // Production environment
  else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
      const validationError = handleValidationError(err);
      error = new AppError(validationError.message, validationError.statusCode);
      error.errors = validationError.errors;
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
      const duplicateError = handleDuplicateKeyError(err);
      error = new AppError(duplicateError.message, duplicateError.statusCode);
    }

    // Mongoose Cast Error
    if (err.name === 'CastError') {
      const castError = handleCastError(err);
      error = new AppError(castError.message, castError.statusCode);
    }

    // JWT Error
    if (err.name === 'JsonWebTokenError') {
      const jwtError = handleJWTError();
      error = new AppError(jwtError.message, jwtError.statusCode);
    }

    // JWT Expired Error
    if (err.name === 'TokenExpiredError') {
      const jwtExpiredError = handleJWTExpiredError();
      error = new AppError(jwtExpiredError.message, jwtExpiredError.statusCode);
    }

    // Multer Error
    if (err.name === 'MulterError') {
      const multerError = handleMulterError(err);
      error = new AppError(multerError.message, multerError.statusCode);
    }

    sendErrorProd(error, res);
  }
};

/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Common Error Factories
 */
const errors = {
  notFound: (resource = 'Tài nguyên') => {
    return new AppError(`${resource} không tồn tại`, 404);
  },
  
  unauthorized: (message = 'Bạn cần đăng nhập để thực hiện hành động này') => {
    return new AppError(message, 401);
  },
  
  forbidden: (message = 'Bạn không có quyền truy cập') => {
    return new AppError(message, 403);
  },
  
  badRequest: (message = 'Dữ liệu không hợp lệ') => {
    return new AppError(message, 400);
  },
  
  conflict: (message = 'Dữ liệu đã tồn tại') => {
    return new AppError(message, 409);
  },
  
  internal: (message = 'Lỗi server') => {
    return new AppError(message, 500);
  },

  validation: (errors) => {
    const error = new AppError('Dữ liệu không hợp lệ', 400);
    error.errors = errors;
    return error;
  }
};

/**
 * Success Response Helper
 */
const successResponse = (res, statusCode = 200, message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Pagination Response Helper
 */
const paginationResponse = (res, data, page, limit, total) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
};

/**
 * Log Error (for external logging services)
 */
const logError = (err) => {
  // TODO: Send to external logging service (e.g., Sentry, LogRocket)
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  AppError,
  errorHandler,
  notFound,
  asyncHandler,
  errors,
  successResponse,
  paginationResponse,
  logError
};
/**
 * Role-Based Access Control Middleware
 * Kiểm tra quyền truy cập dựa trên role của user
 */

/**
 * Middleware kiểm tra role của user
 * @param {string|string[]} allowedRoles - Role hoặc danh sách các role được phép
 */
const roleCheck = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Kiểm tra xem user đã được xác thực chưa
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Bạn cần đăng nhập để thực hiện hành động này'
        });
      }

      // Chuyển allowedRoles thành array nếu là string
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // Kiểm tra role của user
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền truy cập tài nguyên này',
          requiredRole: roles,
          currentRole: req.user.role
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi kiểm tra quyền truy cập',
        error: error.message
      });
    }
  };
};

/**
 * Middleware kiểm tra user là Admin
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Bạn cần đăng nhập để thực hiện hành động này'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ Admin mới có quyền truy cập'
    });
  }

  next();
};

/**
 * Middleware kiểm tra user là Employer
 */
const isEmployer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Bạn cần đăng nhập để thực hiện hành động này'
    });
  }

  if (req.user.role !== 'employer') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ Nhà tuyển dụng mới có quyền truy cập'
    });
  }

  next();
};

/**
 * Middleware kiểm tra user là User thông thường (job seeker)
 */
const isUser = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Bạn cần đăng nhập để thực hiện hành động này'
    });
  }

  if (req.user.role !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'Chỉ Người tìm việc mới có quyền truy cập'
    });
  }

  next();
};

/**
 * Middleware kiểm tra user sở hữu resource
 * Cho phép user truy cập resource của chính họ hoặc admin
 */
const isOwnerOrAdmin = (resourceUserIdField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để thực hiện hành động này'
      });
    }

    // Admin có thể truy cập mọi resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Lấy ID từ params hoặc body
    const resourceUserId = req.params[resourceUserIdField] || 
                          req.body[resourceUserIdField] ||
                          req.params.id;

    // Kiểm tra user có phải là owner không
    if (req.user.id.toString() !== resourceUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này'
      });
    }

    next();
  };
};

/**
 * Middleware kiểm tra employer sở hữu job
 * Cho phép employer chỉ có thể thao tác với job của mình
 */
const isJobOwnerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để thực hiện hành động này'
      });
    }

    // Admin có thể truy cập mọi job
    if (req.user.role === 'admin') {
      return next();
    }

    // Employer phải sở hữu job
    if (req.user.role !== 'employer') {
      return res.status(403).json({
        success: false,
        message: 'Chỉ Nhà tuyển dụng mới có quyền thao tác với tin tuyển dụng'
      });
    }

    // Lấy jobId từ params
    const jobId = req.params.id || req.params.jobId;
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy ID tin tuyển dụng'
      });
    }

    // Kiểm tra job có thuộc về employer này không
    // (Cần import Job model - điều chỉnh theo cấu trúc của bạn)
    const Job = require('../models/Job');
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy tin tuyển dụng'
      });
    }

    if (job.employerId.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thao tác với tin tuyển dụng này'
      });
    }

    // Attach job to request for later use
    req.job = job;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi kiểm tra quyền sở hữu tin tuyển dụng',
      error: error.message
    });
  }
};

/**
 * Middleware cho phép nhiều role hoặc admin
 */
const isAdminOrRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Bạn cần đăng nhập để thực hiện hành động này'
      });
    }

    const allowedRoles = ['admin', ...roles];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập tài nguyên này'
      });
    }

    next();
  };
};

module.exports = {
  roleCheck,
  isAdmin,
  isEmployer,
  isUser,
  isOwnerOrAdmin,
  isJobOwnerOrAdmin,
  isAdminOrRoles
};
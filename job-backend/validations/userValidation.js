// ===================== USER VALIDATION =====================
const {
  VALIDATION_RULES,
  REGEX_PATTERNS
} = require('../utils/constants');
const {
  isValidEmail,
  isValidPhone
} = require('../utils/helpers');

/**
 * Validate user profile update
 * @param {Object} data - User profile data
 * @returns {Object} { isValid, errors }
 */
const validateUserProfile = (data) => {
  const errors = [];
  const { name, phone, bio, skills, location } = data;

  // Validate name
  if (name !== undefined) {
    if (!name || name.trim().length === 0) {
      errors.push('Họ tên không được để trống');
    } else if (name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
      errors.push(`Họ tên không được vượt quá ${VALIDATION_RULES.NAME_MAX_LENGTH} ký tự`);
    } else if (name.length < 2) {
      errors.push('Họ tên phải có ít nhất 2 ký tự');
    }
  }

  // Validate phone
  if (phone !== undefined && phone !== null && phone !== '') {
    if (!isValidPhone(phone)) {
      errors.push('Số điện thoại không hợp lệ (Ví dụ: 0912345678)');
    }
  }

  // Validate bio
  if (bio !== undefined && bio.length > 1000) {
    errors.push('Giới thiệu bản thân không được vượt quá 1000 ký tự');
  }

  // Validate skills
  if (skills !== undefined) {
    if (typeof skills === 'string' && skills.length > 500) {
      errors.push('Kỹ năng không được vượt quá 500 ký tự');
    }
  }

  // Validate location
  if (location !== undefined && location.length > 100) {
    errors.push('Địa chỉ không được vượt quá 100 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user CV/resume data
 * @param {Object} data - CV data
 * @returns {Object} { isValid, errors }
 */
const validateUserCV = (data) => {
  const errors = [];
  const { ky_nang, kinh_nghiem, hoc_van } = data;

  // Validate skills (ky_nang)
  if (ky_nang !== undefined) {
    if (typeof ky_nang !== 'string') {
      errors.push('Kỹ năng phải là chuỗi văn bản');
    } else if (ky_nang.length > 2000) {
      errors.push('Kỹ năng không được vượt quá 2000 ký tự');
    }
  }

  // Validate experience (kinh_nghiem)
  if (kinh_nghiem !== undefined) {
    if (typeof kinh_nghiem !== 'string') {
      errors.push('Kinh nghiệm phải là chuỗi văn bản');
    } else if (kinh_nghiem.length > 3000) {
      errors.push('Kinh nghiệm không được vượt quá 3000 ký tự');
    }
  }

  // Validate education (hoc_van)
  if (hoc_van !== undefined) {
    if (typeof hoc_van !== 'string') {
      errors.push('Học vấn phải là chuỗi văn bản');
    } else if (hoc_van.length > 2000) {
      errors.push('Học vấn không được vượt quá 2000 ký tự');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user search/filter params
 * @param {Object} params - Search params
 * @returns {Object} { isValid, errors }
 */
const validateUserSearch = (params) => {
  const errors = [];
  const { page, limit, search, role } = params;

  // Validate page
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 0) {
      errors.push('Số trang phải là số không âm');
    }
  }

  // Validate limit
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Số lượng kết quả phải từ 1 đến 100');
    }
  }

  // Validate search
  if (search !== undefined && search.length > 200) {
    errors.push('Từ khóa tìm kiếm không được vượt quá 200 ký tự');
  }

  // Validate role
  if (role !== undefined && !['user', 'employer', 'admin'].includes(role)) {
    errors.push('Role không hợp lệ');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user ID
 * @param {String|Number} id - User ID
 * @returns {Object} { isValid, errors }
 */
const validateUserId = (id) => {
  const errors = [];

  if (!id) {
    errors.push('ID người dùng là bắt buộc');
  } else {
    const userId = parseInt(id);
    if (isNaN(userId) || userId <= 0) {
      errors.push('ID người dùng không hợp lệ');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate save job data
 * @param {Object} data - Save job data
 * @returns {Object} { isValid, errors }
 */
const validateSaveJob = (data) => {
  const errors = [];
  const { job_id, job_title, company_name, location } = data;

  // Validate job_id
  if (!job_id) {
    errors.push('ID công việc là bắt buộc');
  } else {
    const jobId = parseInt(job_id);
    if (isNaN(jobId) || jobId <= 0) {
      errors.push('ID công việc không hợp lệ');
    }
  }

  // Validate job_title
  if (job_title && job_title.length > 200) {
    errors.push('Tiêu đề công việc không được vượt quá 200 ký tự');
  }

  // Validate company_name
  if (company_name && company_name.length > 200) {
    errors.push('Tên công ty không được vượt quá 200 ký tự');
  }

  // Validate location
  if (location && location.length > 100) {
    errors.push('Địa điểm không được vượt quá 100 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate apply job data
 * @param {Object} data - Apply job data
 * @returns {Object} { isValid, errors }
 */
const validateApplyJob = (data) => {
  const errors = [];
  const { job_id, cover_letter, cv_used } = data;

  // Validate job_id
  if (!job_id) {
    errors.push('ID công việc là bắt buộc');
  } else {
    const jobId = parseInt(job_id);
    if (isNaN(jobId) || jobId <= 0) {
      errors.push('ID công việc không hợp lệ');
    }
  }

  // Validate cover_letter
  if (cover_letter !== undefined) {
    if (cover_letter.length > 2000) {
      errors.push('Thư xin việc không được vượt quá 2000 ký tự');
    }
  }

  // Validate cv_used
  if (cv_used !== undefined && cv_used !== null) {
    if (typeof cv_used !== 'string') {
      errors.push('CV phải là đường dẫn file hợp lệ');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user avatar upload
 * @param {Object} file - Uploaded file
 * @returns {Object} { isValid, errors }
 */
const validateAvatarUpload = (file) => {
  const errors = [];

  if (!file) {
    errors.push('File ảnh là bắt buộc');
    return { isValid: false, errors };
  }

  // Validate file size (max 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    errors.push('Ảnh không được vượt quá 2MB');
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Chỉ chấp nhận file ảnh định dạng JPG, PNG, GIF, WEBP');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate CV file upload
 * @param {Object} file - Uploaded file
 * @returns {Object} { isValid, errors }
 */
const validateCVUpload = (file) => {
  const errors = [];

  if (!file) {
    errors.push('File CV là bắt buộc');
    return { isValid: false, errors };
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    errors.push('File CV không được vượt quá 5MB');
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (!allowedTypes.includes(file.mimetype)) {
    errors.push('Chỉ chấp nhận file CV định dạng PDF, DOC, DOCX');
  }

  // Validate filename
  if (file.originalname) {
    const filename = file.originalname.toLowerCase();
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const hasValidExtension = validExtensions.some(ext => filename.endsWith(ext));
    
    if (!hasValidExtension) {
      errors.push('File phải có đuôi .pdf, .doc hoặc .docx');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate user settings update
 * @param {Object} data - Settings data
 * @returns {Object} { isValid, errors }
 */
const validateUserSettings = (data) => {
  const errors = [];
  const { email_notifications, job_alerts, newsletter } = data;

  // Validate email_notifications
  if (email_notifications !== undefined && typeof email_notifications !== 'boolean') {
    errors.push('Cài đặt thông báo email phải là true hoặc false');
  }

  // Validate job_alerts
  if (job_alerts !== undefined && typeof job_alerts !== 'boolean') {
    errors.push('Cài đặt thông báo việc làm phải là true hoặc false');
  }

  // Validate newsletter
  if (newsletter !== undefined && typeof newsletter !== 'boolean') {
    errors.push('Cài đặt nhận bản tin phải là true hoặc false');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export all validation functions
module.exports = {
  validateUserProfile,
  validateUserCV,
  validateUserSearch,
  validateUserId,
  validateSaveJob,
  validateApplyJob,
  validateAvatarUpload,
  validateCVUpload,
  validateUserSettings
};
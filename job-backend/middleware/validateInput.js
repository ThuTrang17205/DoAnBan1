/**
 * Input Validation Middleware
 * Validates and sanitizes user input
 */

const validator = require('validator');

/**
 * Validate và sanitize string
 */
const sanitizeString = (str) => {
  if (!str) return '';
  return validator.trim(validator.escape(str));
};

/**
 * Validate email
 */
const validateEmail = (email) => {
  if (!email) {
    return { isValid: false, message: 'Email là bắt buộc' };
  }
  if (!validator.isEmail(email)) {
    return { isValid: false, message: 'Email không hợp lệ' };
  }
  return { isValid: true };
};

/**
 * Validate password
 */
const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, message: 'Mật khẩu là bắt buộc' };
  }
  if (password.length < 6) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  if (password.length > 50) {
    return { isValid: false, message: 'Mật khẩu không được vượt quá 50 ký tự' };
  }
  
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { isValid: false, message: 'Mật khẩu phải chứa cả chữ và số' };
  }
  return { isValid: true };
};

/**
 * Validate phone number (Vietnamese format)
 */
const validatePhone = (phone) => {
  if (!phone) {
    return { isValid: false, message: 'Số điện thoại là bắt buộc' };
  }
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { isValid: false, message: 'Số điện thoại không hợp lệ (VD: 0912345678)' };
  }
  return { isValid: true };
};

/**
 * Validate URL
 */
const validateURL = (url) => {
  if (!url) return { isValid: true };
  if (!validator.isURL(url, { require_protocol: false })) {
    return { isValid: false, message: 'URL không hợp lệ' };
  }
  return { isValid: true };
};

/**
 * Validate PostgreSQL ID
 * FIX: Parse ID to integer and validate range
 */
const validatePgId = (id) => {
  if (!id) {
    return { isValid: false, message: 'ID là bắt buộc' };
  }


  const idStr = id.toString();

  
  if (!/^[0-9]+$/.test(idStr)) {
    return { isValid: false, message: 'ID phải là số nguyên dương' };
  }


  const idNum = parseInt(idStr, 10);

  
  if (isNaN(idNum) || idNum < 1 || idNum > 2147483647) {
    return { isValid: false, message: 'ID không hợp lệ' };
  }

  return { isValid: true, id: idNum };
};

/**
 * Middleware: Validate User Registration
 */
const validateUserRegistration = (req, res, next) => {
  const errors = {};
  const { email, password, username, phone } = req.body;

  
  const emailCheck = validateEmail(email);
  if (!emailCheck.isValid) errors.email = emailCheck.message;

 
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.isValid) errors.password = passwordCheck.message;

  
  if (!username || username.trim().length < 2) {
    errors.username = 'Tên người dùng phải có ít nhất 2 ký tự';
  }


  if (phone) {
    const phoneCheck = validatePhone(phone);
    if (!phoneCheck.isValid) errors.phone = phoneCheck.message;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

 
  req.body.email = validator.normalizeEmail(email);
  req.body.username = sanitizeString(username);
  if (phone) req.body.phone = phone.replace(/\s/g, '');

  next();
};

/**
 * Middleware: Validate User Login
 */
const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Vui lòng nhập email và mật khẩu'
    });
  }

  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email hoặc mật khẩu không đúng'
    });
  }

  next();
};

/**
 * Middleware: Validate Employer Registration 
 * Chỉ validate các trường thực sự BẮT BUỘC
 */
const validateEmployerRegistration = (req, res, next) => {
  const errors = {};
  const { email, password, companyName, phone, address, taxCode, website } = req.body;

  // Email
  const emailCheck = validateEmail(email);
  if (!emailCheck.isValid) errors.email = emailCheck.message;

  // Password
  if (!password) {
    errors.password = 'Mật khẩu là bắt buộc';
  } else if (password.length < 6) {
    errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
  } else if (password.length > 50) {
    errors.password = 'Mật khẩu không được vượt quá 50 ký tự';
  }
  // ❌ BỎ VALIDATION CHỮ VÀ SỐ cho employer

  // Company Name
  if (!companyName || companyName.trim().length < 2) {
    errors.companyName = 'Tên công ty phải có ít nhất 2 ký tự';
  }

  // Phone - CHỈ VALIDATE NẾU CÓ NHẬP (KHÔNG BẮT BUỘC)
  if (phone && phone.trim() !== '') {  // ✅ THÊM ĐIỀU KIỆN NÀY
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      errors.phone = 'Số điện thoại không hợp lệ (VD: 0912345678)';
    }
  }

  // Address - KHÔNG BẮT BUỘC
  if (address && address.trim().length > 0 && address.trim().length < 5) {
    errors.address = 'Địa chỉ phải có ít nhất 5 ký tự';
  }

  // Tax Code - KHÔNG BẮT BUỘC
  if (taxCode && taxCode.trim() !== '' && !/^[0-9]{10}$|^[0-9]{13}$/.test(taxCode)) {
    errors.taxCode = 'Mã số thuế không hợp lệ (10 hoặc 13 chữ số)';
  }

  // Website - KHÔNG BẮT BUỘC
  if (website && website.trim() !== '') {
    const urlCheck = validateURL(website);
    if (!urlCheck.isValid) errors.website = urlCheck.message;
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  // Sanitize
  req.body.email = validator.normalizeEmail(email);
  req.body.companyName = sanitizeString(companyName);
  if (address) req.body.address = sanitizeString(address);
  if (phone) req.body.phone = phone.replace(/\s/g, '');
  if (taxCode) req.body.taxCode = taxCode.replace(/\s/g, '');
  if (website) req.body.website = validator.trim(website);

  next();
};

/**
 * Middleware: Validate Job Creation
 */

const validateJobCreation = (req, res, next) => {
  const errors = {};
  const {
    title,
    location,
    salary,
    job_type,        
    category,
    description,
    requirements,
    min_salary,     
    max_salary
  } = req.body;

 
  if (!title || title.trim().length < 5) {
    errors.title = 'Tiêu đề công việc phải có ít nhất 5 ký tự';
  }


  if (!location || location.trim().length < 2) {
    errors.location = 'Địa điểm phải có ít nhất 2 ký tự';
  }

  
  if (salary && !validator.isNumeric(salary.toString())) {
    errors.salary = 'Mức lương phải là số';
  }

 
  if (min_salary && !validator.isNumeric(min_salary.toString())) {
    errors.min_salary = 'Mức lương tối thiểu phải là số';
  }
  if (max_salary && !validator.isNumeric(max_salary.toString())) {
    errors.max_salary = 'Mức lương tối đa phải là số';
  }
  if (min_salary && max_salary && parseInt(min_salary) > parseInt(max_salary)) {
    errors.salary = 'Lương tối thiểu không được lớn hơn lương tối đa';
  }

 
  const validJobTypes = ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'remote'];
  if (job_type && !validJobTypes.includes(job_type)) {
    errors.job_type = 'Loại công việc không hợp lệ';
  }

 
  if (!category || category.trim().length < 2) {
    errors.category = 'Danh mục công việc là bắt buộc';
  }

 
  if (!description || description.trim().length < 50) {
    errors.description = 'Mô tả công việc phải có ít nhất 50 ký tự';
  }


  if (requirements && requirements.trim().length < 20) {
    errors.requirements = 'Yêu cầu công việc phải có ít nhất 20 ký tự';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }


  req.body.title = sanitizeString(title);
  req.body.location = sanitizeString(location);
  req.body.category = sanitizeString(category);
  req.body.description = sanitizeString(description);
  if (requirements) req.body.requirements = sanitizeString(requirements);

  next();
};
/**
 * Middleware: Validate Job Application
 */
const validateJobApplication = (req, res, next) => {
  const errors = {};
  const { jobId, coverLetter, resume } = req.body;

 
  const jobIdCheck = validatePgId(jobId);
  if (!jobIdCheck.isValid) {
    errors.jobId = jobIdCheck.message;
  } else {
 
    req.body.jobId = jobIdCheck.id;
  }

  
  if (!coverLetter || coverLetter.trim().length < 50) {
    errors.coverLetter = 'Thư xin việc phải có ít nhất 50 ký tự';
  }


  if (resume && resume.trim().length < 20) {
    errors.resume = 'CV phải có ít nhất 20 ký tự';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Dữ liệu không hợp lệ',
      errors
    });
  }

  next();
};

/**
 * Middleware: Validate ID parameter
 * FIX: Parse and attach validated ID to req object
 */
const validateIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    const idCheck = validatePgId(id);

    if (!idCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: idCheck.message
      });
    }

    
    req.params[paramName] = idCheck.id;

    next();
  };
};

/**
 * Middleware: Validate Pagination Query
 */
const validatePagination = (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;

  
  if (!validator.isInt(page.toString(), { min: 1 })) {
    return res.status(400).json({
      success: false,
      message: 'Số trang không hợp lệ'
    });
  }


  if (!validator.isInt(limit.toString(), { min: 1, max: 100 })) {
    return res.status(400).json({
      success: false,
      message: 'Số lượng items không hợp lệ (1-100)'
    });
  }

  req.pagination = {
    page: parseInt(page),
    limit: parseInt(limit)
  };

  next();
};

/**
 * Generic validation middleware
 */
const validate = (validationSchema) => {
  return (req, res, next) => {
    const errors = {};

    for (const [field, rules] of Object.entries(validationSchema)) {
      const value = req.body[field];

      for (const rule of rules) {
        const result = rule(value);
        if (!result.isValid) {
          errors[field] = result.message;
          break;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors
      });
    }

    next();
  };
};

module.exports = {

  validateEmail,
  validatePassword,
  validatePhone,
  validateURL,
  validatePgId,
  sanitizeString,

 
  validateUserRegistration,
  validateUserLogin,
  validateEmployerRegistration,
  validateJobCreation,
  validateJobApplication,
  validateIdParam,
  validatePagination,
  validate
};
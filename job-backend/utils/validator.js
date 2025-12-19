




const { body, param, query, validationResult } = require('express-validator');




exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};





exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên không được để trống')
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ\s]+$/).withMessage('Tên chỉ chứa chữ cái'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail()
    .toLowerCase(),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu phải có chữ hoa, chữ thường và số'),
  
  body('phone')
    .optional()
    .matches(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/)
    .withMessage('Số điện thoại không hợp lệ (VD: 0912345678)')
];

exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
];

exports.validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Mật khẩu hiện tại không được để trống'),
  
  body('newPassword')
    .notEmpty().withMessage('Mật khẩu mới không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu mới phải ít nhất 6 ký tự')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Mật khẩu mới phải có chữ hoa, chữ thường và số')
];





exports.validateCreateJob = [
  body('title')
    .trim()
    .notEmpty().withMessage('Tiêu đề công việc không được để trống')
    .isLength({ min: 5, max: 100 }).withMessage('Tiêu đề phải từ 5-100 ký tự'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Mô tả công việc không được để trống')
    .isLength({ min: 50 }).withMessage('Mô tả phải ít nhất 50 ký tự'),
  
  body('requirements')
    .optional()
    .isLength({ min: 20 }).withMessage('Yêu cầu phải ít nhất 20 ký tự'),
  
  body('benefits')
    .optional()
    .isLength({ min: 20 }).withMessage('Quyền lợi phải ít nhất 20 ký tự'),
  
  body('location')
    .trim()
    .notEmpty().withMessage('Địa điểm không được để trống'),
  
  body('salary')
    .optional()
    .isNumeric().withMessage('Lương phải là số')
    .isFloat({ min: 0 }).withMessage('Lương phải lớn hơn 0'),
  
  body('category')
    .notEmpty().withMessage('Danh mục không được để trống'),
  
  body('jobType')
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'remote'])
    .withMessage('Loại công việc không hợp lệ'),
  
  body('experience')
    .optional()
    .isIn(['internship', 'fresher', '1-2-years', '2-5-years', '5-years-plus'])
    .withMessage('Kinh nghiệm không hợp lệ'),
  
  body('education')
    .optional()
    .isIn(['high-school', 'associate', 'bachelor', 'master', 'phd'])
    .withMessage('Học vấn không hợp lệ'),
  
  body('numberOfPositions')
    .optional()
    .isInt({ min: 1 }).withMessage('Số lượng tuyển phải lớn hơn 0'),
  
  body('deadline')
    .optional()
    .isISO8601().withMessage('Ngày hết hạn không hợp lệ')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Ngày hết hạn phải sau ngày hiện tại');
      }
      return true;
    }),
  
  body('skills')
    .optional()
    .isArray().withMessage('Skills phải là array')
];

exports.validateUpdateJob = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 }).withMessage('Tiêu đề phải từ 5-100 ký tự'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50 }).withMessage('Mô tả phải ít nhất 50 ký tự'),
  
  body('salary')
    .optional()
    .isNumeric().withMessage('Lương phải là số'),
  
  body('status')
    .optional()
    .isIn(['active', 'closed', 'expired'])
    .withMessage('Trạng thái không hợp lệ')
];





exports.validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Tên phải từ 2-50 ký tự'),
  
  body('phone')
    .optional()
    .matches(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  
  body('bio')
    .optional()
    .isLength({ max: 500 }).withMessage('Bio không được quá 500 ký tự'),
  
  body('address')
    .optional()
    .isLength({ max: 200 }).withMessage('Địa chỉ không được quá 200 ký tự'),
  
  body('website')
    .optional()
    .isURL().withMessage('Website không hợp lệ'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601().withMessage('Ngày sinh không hợp lệ'),
  
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other'])
    .withMessage('Giới tính không hợp lệ')
];

exports.validateAddExperience = [
  body('title')
    .trim()
    .notEmpty().withMessage('Chức danh không được để trống'),
  
  body('company')
    .trim()
    .notEmpty().withMessage('Công ty không được để trống'),
  
  body('startDate')
    .notEmpty().withMessage('Ngày bắt đầu không được để trống')
    .isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),
  
  body('endDate')
    .optional()
    .isISO8601().withMessage('Ngày kết thúc không hợp lệ'),
  
  body('current')
    .optional()
    .isBoolean().withMessage('Current phải là boolean'),
  
  body('description')
    .optional()
    .isLength({ max: 1000 }).withMessage('Mô tả không được quá 1000 ký tự')
];

exports.validateAddEducation = [
  body('school')
    .trim()
    .notEmpty().withMessage('Tên trường không được để trống'),
  
  body('degree')
    .trim()
    .notEmpty().withMessage('Bằng cấp không được để trống'),
  
  body('fieldOfStudy')
    .trim()
    .notEmpty().withMessage('Chuyên ngành không được để trống'),
  
  body('startDate')
    .notEmpty().withMessage('Ngày bắt đầu không được để trống')
    .isISO8601().withMessage('Ngày bắt đầu không hợp lệ'),
  
  body('endDate')
    .optional()
    .isISO8601().withMessage('Ngày kết thúc không hợp lệ'),
  
  body('current')
    .optional()
    .isBoolean().withMessage('Current phải là boolean')
];





exports.validateEmployerRegister = [
  body('companyName')
    .trim()
    .notEmpty().withMessage('Tên công ty không được để trống')
    .isLength({ min: 3, max: 100 }).withMessage('Tên công ty phải từ 3-100 ký tự'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email không được để trống')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Mật khẩu không được để trống')
    .isLength({ min: 6 }).withMessage('Mật khẩu phải ít nhất 6 ký tự'),
  
  body('contactPerson')
    .trim()
    .notEmpty().withMessage('Người liên hệ không được để trống'),
  
  body('phone')
    .matches(/^(0|\+84)(3|5|7|8|9)[0-9]{8}$/)
    .withMessage('Số điện thoại không hợp lệ'),
  
  body('website')
    .optional()
    .isURL().withMessage('Website không hợp lệ'),
  
  body('address')
    .optional()
    .isLength({ max: 200 }).withMessage('Địa chỉ không được quá 200 ký tự')
];

exports.validateUpdateEmployerProfile = [
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('Tên công ty phải từ 3-100 ký tự'),
  
  body('description')
    .optional()
    .isLength({ max: 2000 }).withMessage('Mô tả không được quá 2000 ký tự'),
  
  body('industry')
    .optional()
    .trim()
    .notEmpty().withMessage('Ngành nghề không được để trống'),
  
  body('companySize')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '500+'])
    .withMessage('Quy mô công ty không hợp lệ'),
  
  body('foundedYear')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Năm thành lập không hợp lệ')
];





exports.validateApplyJob = [
  body('coverLetter')
    .trim()
    .notEmpty().withMessage('Thư xin việc không được để trống')
    .isLength({ min: 50, max: 1000 }).withMessage('Thư xin việc phải từ 50-1000 ký tự'),
  
  body('resume')
    .optional()
    .isURL().withMessage('Link CV không hợp lệ')
];

exports.validateUpdateApplicationStatus = [
  body('status')
    .isIn(['pending', 'accepted', 'rejected', 'interviewing'])
    .withMessage('Trạng thái không hợp lệ'),
  
  body('note')
    .optional()
    .isLength({ max: 500 }).withMessage('Ghi chú không được quá 500 ký tự')
];





exports.validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Tên danh mục không được để trống')
    .isLength({ min: 2, max: 50 }).withMessage('Tên danh mục phải từ 2-50 ký tự'),
  
  body('slug')
    .trim()
    .notEmpty().withMessage('Slug không được để trống')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  
  body('description')
    .optional()
    .isLength({ max: 200 }).withMessage('Mô tả không được quá 200 ký tự'),
  
  body('icon')
    .optional()
    .trim(),
  
  body('order')
    .optional()
    .isInt({ min: 0 }).withMessage('Order phải là số nguyên dương')
];

exports.validateUpdateCategory = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Tên danh mục phải từ 2-50 ký tự'),
  
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/).withMessage('Slug chỉ chứa chữ thường, số và dấu gạch ngang'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive phải là boolean')
];





exports.validatePostgresId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID không hợp lệ')
    .toInt() 
];

exports.validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page phải là số nguyên dương'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit phải từ 1-100')
];

exports.validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('Từ khóa tìm kiếm phải ít nhất 2 ký tự')
];

exports.validateStatus = [
  body('status')
    .isIn(['active', 'inactive', 'pending', 'accepted', 'rejected', 'closed'])
    .withMessage('Trạng thái không hợp lệ')
];





exports.isEmailExists = async (email, { req }) => {
  const User = require('../models/User');
  const user = await User.findOne({ email });
  if (user) {
    throw new Error('Email đã được sử dụng');
  }
  return true;
};

exports.isVietnamesePhone = (value) => {
  const vnPhoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
  if (!vnPhoneRegex.test(value)) {
    throw new Error('Số điện thoại Việt Nam không hợp lệ');
  }
  return true;
};

exports.isStrongPassword = (value) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPasswordRegex.test(value)) {
    throw new Error('Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt');
  }
  return true;
};

exports.sanitizeHTML = (value) => {
  
  return value.replace(/<[^>]*>/g, '');
};








exports.validateGetMatchedCandidates = [
  param('jobId')
    .isInt({ min: 1 }).withMessage('Job ID không hợp lệ')
    .toInt(),
  
  query('minScore')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('minScore phải từ 0-100')
    .toFloat(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit phải từ 1-100')
    .toInt(),
  
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('offset phải >= 0')
    .toInt(),
  
  query('isQualified')
    .optional()
    .isIn(['true', 'false']).withMessage('isQualified phải là true hoặc false')
];

exports.validateGetMatchedJobs = [
  param('candidateId')
    .isInt({ min: 1 }).withMessage('Candidate ID không hợp lệ')
    .toInt(),
  
  query('minScore')
    .optional()
    .isFloat({ min: 0, max: 100 }).withMessage('minScore phải từ 0-100')
    .toFloat(),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('limit phải từ 1-100')
    .toInt(),
  
  query('offset')
    .optional()
    .isInt({ min: 0 }).withMessage('offset phải >= 0')
    .toInt(),
  
  query('isQualified')
    .optional()
    .isIn(['true', 'false']).withMessage('isQualified phải là true hoặc false'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ min: 2 }).withMessage('location phải ít nhất 2 ký tự')
];

exports.validateRunMatching = [
  param('jobId')
    .isInt({ min: 1 }).withMessage('Job ID không hợp lệ')
    .toInt()
];

exports.validateGetMatchingStats = [
  param('jobId')
    .isInt({ min: 1 }).withMessage('Job ID không hợp lệ')
    .toInt()
];
module.exports = exports;
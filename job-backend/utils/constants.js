// ===================== APPLICATION CONSTANTS =====================

// ==================== USER ROLES ====================
const USER_ROLES = {
  USER: 'user',
  EMPLOYER: 'employer',
  ADMIN: 'admin'
};

// ==================== JOB STATUS ====================
const JOB_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  PENDING: 'pending',
  EXPIRED: 'expired'
};

// ==================== APPLICATION STATUS ====================
const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn'
};

// ==================== EXPERIENCE LEVELS ====================
const EXPERIENCE_LEVELS = {
  INTERN: 'Thực tập',
  ENTRY: '0-1 năm',
  JUNIOR: '1-2 năm',
  MIDDLE: '2-4 năm',
  SENIOR: '4-6 năm',
  EXPERT: '6+ năm',
  LEAD: 'Trưởng nhóm',
  MANAGER: 'Quản lý'
};

// ==================== COMPANY SIZES ====================
const COMPANY_SIZES = {
  STARTUP: '1-10 nhân viên',
  SMALL: '10-50 nhân viên',
  MEDIUM: '50-200 nhân viên',
  LARGE: '200-1000 nhân viên',
  ENTERPRISE: '1000+ nhân viên'
};

// ==================== JOB CATEGORIES ====================
const JOB_CATEGORIES = {
  IT: 'Công nghệ thông tin',
  FINANCE: 'Kế toán - Tài chính - Ngân hàng',
  SALES: 'Kinh doanh - Bán hàng',
  MARKETING: 'Marketing - Truyền thông',
  HR: 'Nhân sự - Hành chính',
  DESIGN: 'Thiết kế - Đồ hoạ',
  ENGINEERING: 'Kỹ thuật - Xây dựng',
  EDUCATION: 'Giáo dục - Đào tạo',
  REAL_ESTATE: 'Bất động sản',
  LABOR: 'Lao động phổ thông',
  HOSPITALITY: 'Nhà hàng - Khách sạn',
  CUSTOMER_SERVICE: 'Dịch vụ - Khách hàng',
  MANAGEMENT: 'Quản lý / Cấp cao',
  OTHER: 'Khác'
};

// ==================== CATEGORY SLUGS ====================
const CATEGORY_SLUGS = {
  'cong-nghe-thong-tin': 'Công nghệ thông tin',
  'ke-toan-tai-chinh': 'Kế toán - Tài chính - Ngân hàng',
  'kinh-doanh-ban-hang': 'Kinh doanh - Bán hàng',
  'marketing-truyen-thong': 'Marketing - Truyền thông',
  'nhan-su-hanh-chinh': 'Nhân sự - Hành chính',
  'thiet-ke-do-hoa': 'Thiết kế - Đồ hoạ',
  'ky-thuat-xay-dung': 'Kỹ thuật - Xây dựng',
  'giao-duc-dao-tao': 'Giáo dục - Đào tạo',
  'bat-dong-san': 'Bất động sản',
  'lao-dong-pho-thong': 'Lao động phổ thông',
  'nha-hang-khach-san': 'Nhà hàng - Khách sạn',
  'dich-vu-khach-hang': 'Dịch vụ - Khách hàng',
  'quan-ly-cap-cao': 'Quản lý / Cấp cao',
  'khac': 'Khác'
};

// ==================== VIETNAMESE CITIES ====================
const VIETNAM_CITIES = [
  'Hà Nội',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hải Phòng',
  'Cần Thơ',
  'Biên Hòa',
  'Nha Trang',
  'Huế',
  'Buôn Ma Thuột',
  'Quy Nhơn',
  'Vũng Tàu',
  'Nam Định',
  'Thái Nguyên',
  'Vinh',
  'Rạch Giá',
  'Việt Trì',
  'Hạ Long',
  'Remote'
];

// ==================== SALARY RANGES (VND) ====================
const SALARY_RANGES = {
  UNDER_10M: { min: 0, max: 10000000, label: 'Dưới 10 triệu' },
  FROM_10_TO_15M: { min: 10000000, max: 15000000, label: '10-15 triệu' },
  FROM_15_TO_20M: { min: 15000000, max: 20000000, label: '15-20 triệu' },
  FROM_20_TO_30M: { min: 20000000, max: 30000000, label: '20-30 triệu' },
  FROM_30_TO_50M: { min: 30000000, max: 50000000, label: '30-50 triệu' },
  OVER_50M: { min: 50000000, max: null, label: 'Trên 50 triệu' },
  NEGOTIABLE: { min: null, max: null, label: 'Thỏa thuận' }
};

// ==================== CURRENCY ====================
const CURRENCY = {
  VND: 'VND',
  USD: 'USD'
};

// ==================== PAGINATION ====================
const PAGINATION = {
  DEFAULT_PAGE: 0,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
};

// ==================== HTTP STATUS CODES ====================
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

// ==================== ERROR MESSAGES ====================
const ERROR_MESSAGES = {
  // Authentication
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  EMAIL_ALREADY_EXISTS: 'Email đã tồn tại',
  USERNAME_ALREADY_EXISTS: 'Username đã tồn tại',
  UNAUTHORIZED: 'Bạn cần đăng nhập để thực hiện thao tác này',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này',
  TOKEN_EXPIRED: 'Token đã hết hạn',
  INVALID_TOKEN: 'Token không hợp lệ',
  
  // User
  USER_NOT_FOUND: 'Không tìm thấy người dùng',
  INVALID_USER_DATA: 'Dữ liệu người dùng không hợp lệ',
  
  // Job
  JOB_NOT_FOUND: 'Không tìm thấy công việc',
  JOB_ALREADY_APPLIED: 'Bạn đã ứng tuyển công việc này rồi',
  JOB_EXPIRED: 'Công việc đã hết hạn',
  
  // Application
  APPLICATION_NOT_FOUND: 'Không tìm thấy đơn ứng tuyển',
  ALREADY_APPLIED: 'Bạn đã ứng tuyển công việc này',
  
  // Employer
  EMPLOYER_NOT_FOUND: 'Không tìm thấy nhà tuyển dụng',
  NOT_EMPLOYER: 'Chỉ nhà tuyển dụng mới có thể thực hiện thao tác này',
  
  // Admin
  NOT_ADMIN: 'Chỉ admin mới có thể thực hiện thao tác này',
  
  // General
  INTERNAL_ERROR: 'Lỗi hệ thống, vui lòng thử lại sau',
  VALIDATION_ERROR: 'Dữ liệu không hợp lệ',
  REQUIRED_FIELDS: 'Vui lòng điền đầy đủ thông tin bắt buộc',
  INVALID_ID: 'ID không hợp lệ'
};

// ==================== SUCCESS MESSAGES ====================
const SUCCESS_MESSAGES = {
  // Authentication
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  REGISTER_SUCCESS: 'Đăng ký thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  PASSWORD_CHANGED: 'Đổi mật khẩu thành công',
  
  // User
  PROFILE_UPDATED: 'Cập nhật profile thành công',
  USER_CREATED: 'Tạo người dùng thành công',
  USER_DELETED: 'Xóa người dùng thành công',
  
  // Job
  JOB_CREATED: 'Đăng tin tuyển dụng thành công',
  JOB_UPDATED: 'Cập nhật tin tuyển dụng thành công',
  JOB_DELETED: 'Xóa tin tuyển dụng thành công',
  JOB_SAVED: 'Lưu công việc thành công',
  JOB_UNSAVED: 'Bỏ lưu công việc thành công',
  
  // Application
  APPLICATION_SUBMITTED: 'Ứng tuyển thành công',
  APPLICATION_UPDATED: 'Cập nhật đơn ứng tuyển thành công',
  APPLICATION_WITHDRAWN: 'Rút đơn ứng tuyển thành công',
  
  // General
  OPERATION_SUCCESS: 'Thao tác thành công'
};

// ==================== VALIDATION RULES ====================
const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 72,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 255,
  NAME_MAX_LENGTH: 100,
  PHONE_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 5000,
  TITLE_MAX_LENGTH: 200
};

// ==================== DATE FORMATS ====================
const DATE_FORMATS = {
  DEFAULT: 'DD/MM/YYYY',
  WITH_TIME: 'DD/MM/YYYY HH:mm',
  FULL: 'DD/MM/YYYY HH:mm:ss',
  ISO: 'YYYY-MM-DD',
  MONTH_YEAR: 'MM/YYYY'
};

// ==================== FILE UPLOAD ====================
const FILE_UPLOAD = {
  MAX_SIZE_CV: 5 * 1024 * 1024, // 5MB
  MAX_SIZE_IMAGE: 2 * 1024 * 1024, // 2MB
  ALLOWED_CV_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  CV_FOLDER: 'job-portal/cvs',
  AVATAR_FOLDER: 'job-portal/avatars',
  LOGO_FOLDER: 'job-portal/logos'
};

// ==================== EMAIL TEMPLATES ====================
const EMAIL_TYPES = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  APPLICATION_RECEIVED: 'application_received',
  APPLICATION_ACCEPTED: 'application_accepted',
  APPLICATION_REJECTED: 'application_rejected',
  JOB_ALERT: 'job_alert'
};

// ==================== INDUSTRIES ====================
const INDUSTRIES = [
  'Công nghệ thông tin',
  'Tài chính - Ngân hàng',
  'Bất động sản',
  'Sản xuất',
  'Bán lẻ',
  'Giáo dục',
  'Y tế',
  'Du lịch - Khách sạn',
  'Xây dựng',
  'Logistics',
  'F&B',
  'Media - Quảng cáo',
  'Viễn thông',
  'Năng lượng',
  'Nông nghiệp',
  'Khác'
];

// ==================== NOTIFICATION TYPES ====================
const NOTIFICATION_TYPES = {
  APPLICATION_STATUS: 'application_status',
  NEW_JOB: 'new_job',
  JOB_MATCH: 'job_match',
  MESSAGE: 'message',
  SYSTEM: 'system'
};

// ==================== RATE LIMITING ====================
const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 attempts per 15 minutes
  REGISTER: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 attempts per hour
  API: { windowMs: 15 * 60 * 1000, max: 100 }, // 100 requests per 15 minutes
  FILE_UPLOAD: { windowMs: 60 * 60 * 1000, max: 10 } // 10 uploads per hour
};

// ==================== REGEX PATTERNS ====================
const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^(0|\+84)[0-9]{9}$/,
  USERNAME: /^[a-zA-Z0-9_]{3,50}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9-]+$/
};

// ==================== EXPORT ALL CONSTANTS ====================
module.exports = {
  USER_ROLES,
  JOB_STATUS,
  APPLICATION_STATUS,
  EXPERIENCE_LEVELS,
  COMPANY_SIZES,
  JOB_CATEGORIES,
  CATEGORY_SLUGS,
  VIETNAM_CITIES,
  SALARY_RANGES,
  CURRENCY,
  PAGINATION,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  DATE_FORMATS,
  FILE_UPLOAD,
  EMAIL_TYPES,
  INDUSTRIES,
  NOTIFICATION_TYPES,
  RATE_LIMITS,
  REGEX_PATTERNS
};
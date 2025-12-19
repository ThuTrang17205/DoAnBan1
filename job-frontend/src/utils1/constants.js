
export const API_BASE_URL = 'http://localhost:5000/api';
export const API_JOBS_URL = `${API_BASE_URL}/jobs`;
export const API_AUTH_URL = `${API_BASE_URL}/auth`;
export const API_ADMIN_URL = `${API_BASE_URL}/admin`;
export const API_EMPLOYER_URL = `${API_BASE_URL}/employer`;


export const JOB_CATEGORIES = [
  { 
    name: 'IT - Phần mềm',
    slug: 'cong-nghe-thong-tin',
    value: 'Công nghệ thông tin',
    color: '#667eea'
  },
  { 
    name: 'Marketing',
    slug: 'marketing-truyen-thong',
    value: 'Marketing - Truyền thông',
    color: '#f093fb'
  },
  { 
    name: 'Kinh doanh',
    slug: 'kinh-doanh-ban-hang',
    value: 'Kinh doanh - Bán hàng',
    color: '#4facfe'
  },
  { 
    name: 'Thiết kế',
    slug: 'thiet-ke-do-hoa',
    value: 'Thiết kế - Đồ hoạ',
    color: '#fa709a'
  },
  { 
    name: 'Tài chính',
    slug: 'ke-toan-tai-chinh',
    value: 'Kế toán - Tài chính - Ngân hàng',
    color: '#30cfd0'
  },
  { 
    name: 'Nhân sự',
    slug: 'nhan-su-hanh-chinh',
    value: 'Nhân sự - Hành chính',
    color: '#a8edea'
  },
  { 
    name: 'Giáo dục',
    slug: 'giao-duc-dao-tao',
    value: 'Giáo dục - Đào tạo',
    color: '#fbc2eb'
  },
  { 
    name: 'Y tế',
    slug: 'y-te',
    value: 'Y tế',
    color: '#92fe9d'
  }
];


export const JOB_TYPES = [
  { value: 'fulltime', label: 'Full-time' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'remote', label: 'Remote' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'contract', label: 'Hợp đồng' },
  { value: 'internship', label: 'Thực tập' }
];


export const EXPERIENCE_LEVELS = [
  { value: 'fresher', label: 'Fresher (Chưa có kinh nghiệm)' },
  { value: 'junior', label: 'Junior (1-2 năm)' },
  { value: 'middle', label: 'Middle (3-5 năm)' },
  { value: 'senior', label: 'Senior (5+ năm)' },
  { value: 'leader', label: 'Team Leader' },
  { value: 'manager', label: 'Manager' }
];


export const SALARY_RANGES = [
  { value: 'all', label: 'Tất cả' },
  { value: 'negotiate', label: 'Thỏa thuận' },
  { value: 'under10', label: 'Dưới 10 triệu' },
  { value: 'under15', label: 'Dưới 15 triệu' },
  { value: '10to15', label: '10 - 15 triệu' },
  { value: '15to20', label: '15 - 20 triệu' },
  { value: '15to30', label: '15 - 30 triệu' },
  { value: '20to30', label: '20 - 30 triệu' },
  { value: '30to50', label: '30 - 50 triệu' },
  { value: 'over30', label: 'Trên 30 triệu' },
  { value: 'over50', label: 'Trên 50 triệu' }
];


export const LOCATIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'Hà Nội', label: 'Hà Nội' },
  { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
  { value: 'Đà Nẵng', label: 'Đà Nẵng' },
  { value: 'Hải Phòng', label: 'Hải Phòng' },
  { value: 'Cần Thơ', label: 'Cần Thơ' },
  { value: 'Biên Hòa', label: 'Biên Hòa' },
  { value: 'Nha Trang', label: 'Nha Trang' },
  { value: 'Huế', label: 'Huế' },
  { value: 'Vũng Tàu', label: 'Vũng Tàu' },
  { value: 'Other', label: 'Khác' }
];


export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWING: 'reviewing',
  SHORTLISTED: 'shortlisted',
  INTERVIEW: 'interview',
  OFFERED: 'offered',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
  WITHDRAWN: 'withdrawn'
};

export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.PENDING]: 'Chờ xét duyệt',
  [APPLICATION_STATUS.REVIEWING]: 'Đang xem xét',
  [APPLICATION_STATUS.SHORTLISTED]: 'Đã chọn',
  [APPLICATION_STATUS.INTERVIEW]: 'Mời phỏng vấn',
  [APPLICATION_STATUS.OFFERED]: 'Đã offer',
  [APPLICATION_STATUS.REJECTED]: 'Từ chối',
  [APPLICATION_STATUS.ACCEPTED]: 'Chấp nhận',
  [APPLICATION_STATUS.WITHDRAWN]: 'Đã rút'
};

export const APPLICATION_STATUS_COLORS = {
  [APPLICATION_STATUS.PENDING]: '#fbbf24',
  [APPLICATION_STATUS.REVIEWING]: '#3b82f6',
  [APPLICATION_STATUS.SHORTLISTED]: '#8b5cf6',
  [APPLICATION_STATUS.INTERVIEW]: '#06b6d4',
  [APPLICATION_STATUS.OFFERED]: '#10b981',
  [APPLICATION_STATUS.REJECTED]: '#ef4444',
  [APPLICATION_STATUS.ACCEPTED]: '#22c55e',
  [APPLICATION_STATUS.WITHDRAWN]: '#6b7280'
};


export const JOB_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ACTIVE: 'active',
  CLOSED: 'closed',
  REJECTED: 'rejected'
};

export const JOB_STATUS_LABELS = {
  [JOB_STATUS.DRAFT]: 'Nháp',
  [JOB_STATUS.PENDING]: 'Chờ duyệt',
  [JOB_STATUS.ACTIVE]: 'Đang tuyển',
  [JOB_STATUS.CLOSED]: 'Đã đóng',
  [JOB_STATUS.REJECTED]: 'Bị từ chối'
};


export const ITEMS_PER_PAGE = {
  JOBS: 12,
  APPLICATIONS: 10,
  USERS: 15
};


export const STORAGE_KEYS = {
  TOKEN: 'token',
  ADMIN_TOKEN: 'adminToken',
  EMPLOYER_TOKEN: 'employerToken',
  USER: 'user',
  SAVED_JOBS: 'savedJobs',
  RECENT_VIEWS: 'recentViews',
  SEARCH_HISTORY: 'searchHistory'
};


export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /(84|0[3|5|7|8|9])+([0-9]{8})\b/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  COMPANY_NAME_MIN_LENGTH: 3,
  JOB_TITLE_MIN_LENGTH: 5,
  DESCRIPTION_MIN_LENGTH: 50
};


export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: {
    CV: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    IMAGE: ['image/jpeg', 'image/png', 'image/jpg', 'image/gif']
  }
};


export const DATE_FORMATS = {
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD MMMM, YYYY',
  INPUT: 'YYYY-MM-DD',
  DISPLAY: 'DD/MM/YYYY HH:mm'
};


export const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Đăng nhập thành công!',
    REGISTER: 'Đăng ký thành công!',
    UPDATE: 'Cập nhật thành công!',
    DELETE: 'Xóa thành công!',
    APPLY: 'Ứng tuyển thành công!',
    SAVE: 'Lưu thành công!'
  },
  ERROR: {
    LOGIN: 'Đăng nhập thất bại!',
    REGISTER: 'Đăng ký thất bại!',
    UPDATE: 'Cập nhật thất bại!',
    DELETE: 'Xóa thất bại!',
    NETWORK: 'Lỗi kết nối mạng!',
    SERVER: 'Lỗi máy chủ!',
    UNKNOWN: 'Đã có lỗi xảy ra!'
  }
};

export default {
  API_BASE_URL,
  API_JOBS_URL,
  API_AUTH_URL,
  API_ADMIN_URL,
  API_EMPLOYER_URL,
  JOB_CATEGORIES,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  SALARY_RANGES,
  LOCATIONS,
  APPLICATION_STATUS,
  APPLICATION_STATUS_LABELS,
  APPLICATION_STATUS_COLORS,
  JOB_STATUS,
  JOB_STATUS_LABELS,
  ITEMS_PER_PAGE,
  STORAGE_KEYS,
  VALIDATION,
  FILE_UPLOAD,
  DATE_FORMATS,
  MESSAGES
};
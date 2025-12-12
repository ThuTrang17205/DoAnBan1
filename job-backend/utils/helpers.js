// ===================== HELPER FUNCTIONS =====================

const { SALARY_RANGES, DATE_FORMATS } = require('./constants');

// ==================== DATE & TIME HELPERS ====================

/**
 * Format date to Vietnamese format
 * @param {Date|String} date - Date to format
 * @param {String} format - Format string (default: DD/MM/YYYY)
 * @returns {String} Formatted date
 */
const formatDate = (date, format = 'DD/MM/YYYY') => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'N/A';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    switch (format) {
      case 'DD/MM/YYYY':
        return `${day}/${month}/${year}`;
      case 'DD/MM/YYYY HH:mm':
        return `${day}/${month}/${year} ${hours}:${minutes}`;
      case 'DD/MM/YYYY HH:mm:ss':
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
      case 'YYYY-MM-DD':
        return `${year}-${month}-${day}`;
      case 'MM/YYYY':
        return `${month}/${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  } catch (error) {
    console.error('Error formatting date:', error.message);
    return 'N/A';
  }
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {Date|String} date - Date to calculate from
 * @returns {String} Relative time string
 */
const getRelativeTime = (date) => {
  try {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);

    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 30) return `${diffDay} ngày trước`;
    if (diffMonth < 12) return `${diffMonth} tháng trước`;
    return `${diffYear} năm trước`;
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Check if date is expired
 * @param {Date|String} date - Date to check
 * @returns {Boolean} True if expired
 */
const isExpired = (date) => {
  try {
    const d = new Date(date);
    return d < new Date();
  } catch (error) {
    return true;
  }
};

/**
 * Get days until date
 * @param {Date|String} date - Target date
 * @returns {Number} Days until date
 */
const getDaysUntil = (date) => {
  try {
    const d = new Date(date);
    const now = new Date();
    const diffMs = d - now;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
};

// ==================== STRING HELPERS ====================

/**
 * Slugify string (convert to URL-friendly format)
 * @param {String} str - String to slugify
 * @returns {String} Slugified string
 */
const slugify = (str) => {
  if (!str) return '';
  
  // Vietnamese character map
  const vietnameseMap = {
    'á': 'a', 'à': 'a', 'ả': 'a', 'ã': 'a', 'ạ': 'a',
    'ă': 'a', 'ắ': 'a', 'ằ': 'a', 'ẳ': 'a', 'ẵ': 'a', 'ặ': 'a',
    'â': 'a', 'ấ': 'a', 'ầ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ậ': 'a',
    'é': 'e', 'è': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ẹ': 'e',
    'ê': 'e', 'ế': 'e', 'ề': 'e', 'ể': 'e', 'ễ': 'e', 'ệ': 'e',
    'í': 'i', 'ì': 'i', 'ỉ': 'i', 'ĩ': 'i', 'ị': 'i',
    'ó': 'o', 'ò': 'o', 'ỏ': 'o', 'õ': 'o', 'ọ': 'o',
    'ô': 'o', 'ố': 'o', 'ồ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ộ': 'o',
    'ơ': 'o', 'ớ': 'o', 'ờ': 'o', 'ở': 'o', 'ỡ': 'o', 'ợ': 'o',
    'ú': 'u', 'ù': 'u', 'ủ': 'u', 'ũ': 'u', 'ụ': 'u',
    'ư': 'u', 'ứ': 'u', 'ừ': 'u', 'ử': 'u', 'ữ': 'u', 'ự': 'u',
    'ý': 'y', 'ỳ': 'y', 'ỷ': 'y', 'ỹ': 'y', 'ỵ': 'y',
    'đ': 'd',
    'Đ': 'D'
  };

  return str
    .toLowerCase()
    .split('')
    .map(char => vietnameseMap[char] || char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Truncate string with ellipsis
 * @param {String} str - String to truncate
 * @param {Number} maxLength - Maximum length
 * @returns {String} Truncated string
 */
const truncate = (str, maxLength = 100) => {
  if (!str || str.length <= maxLength) return str;
  return str.substring(0, maxLength) + '...';
};

/**
 * Capitalize first letter
 * @param {String} str - String to capitalize
 * @returns {String} Capitalized string
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert to title case
 * @param {String} str - String to convert
 * @returns {String} Title case string
 */
const toTitleCase = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// ==================== NUMBER HELPERS ====================

/**
 * Format number to Vietnamese currency
 * @param {Number} number - Number to format
 * @param {String} currency - Currency code (VND, USD)
 * @returns {String} Formatted currency string
 */
const formatCurrency = (number, currency = 'VND') => {
  if (number === null || number === undefined) return 'Thỏa thuận';
  
  try {
    const formatted = new Intl.NumberFormat('vi-VN').format(number);
    
    switch (currency) {
      case 'VND':
        return `${formatted}đ`;
      case 'USD':
        return `$${formatted}`;
      default:
        return formatted;
    }
  } catch (error) {
    return number.toString();
  }
};

/**
 * Format salary range
 * @param {Number} minSalary - Minimum salary
 * @param {Number} maxSalary - Maximum salary
 * @param {String} currency - Currency code
 * @returns {String} Formatted salary range
 */
const formatSalaryRange = (minSalary, maxSalary, currency = 'VND') => {
  if (!minSalary && !maxSalary) return 'Thỏa thuận';
  if (minSalary && !maxSalary) return `Từ ${formatCurrency(minSalary, currency)}`;
  if (!minSalary && maxSalary) return `Đến ${formatCurrency(maxSalary, currency)}`;
  return `${formatCurrency(minSalary, currency)} - ${formatCurrency(maxSalary, currency)}`;
};

/**
 * Format large number (1000 -> 1K)
 * @param {Number} num - Number to format
 * @returns {String} Formatted number
 */
const formatCompactNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

/**
 * Generate random number in range
 * @param {Number} min - Minimum value
 * @param {Number} max - Maximum value
 * @returns {Number} Random number
 */
const randomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// ==================== VALIDATION HELPERS ====================

/**
 * Validate email
 * @param {String} email - Email to validate
 * @returns {Boolean} True if valid
 */
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 * @param {String} phone - Phone to validate
 * @returns {Boolean} True if valid
 */
const isValidPhone = (phone) => {
  const regex = /^(0|\+84)[0-9]{9}$/;
  return regex.test(phone);
};

/**
 * Validate URL
 * @param {String} url - URL to validate
 * @returns {Boolean} True if valid
 */
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Sanitize HTML
 * @param {String} html - HTML string
 * @returns {String} Sanitized HTML
 */
const sanitizeHtml = (html) => {
  if (!html) return '';
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// ==================== ARRAY HELPERS ====================

/**
 * Remove duplicates from array
 * @param {Array} arr - Array with duplicates
 * @returns {Array} Array without duplicates
 */
const removeDuplicates = (arr) => {
  return [...new Set(arr)];
};

/**
 * Shuffle array
 * @param {Array} arr - Array to shuffle
 * @returns {Array} Shuffled array
 */
const shuffleArray = (arr) => {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

/**
 * Chunk array into smaller arrays
 * @param {Array} arr - Array to chunk
 * @param {Number} size - Chunk size
 * @returns {Array} Array of chunks
 */
const chunkArray = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

/**
 * Group array by key
 * @param {Array} arr - Array to group
 * @param {String} key - Key to group by
 * @returns {Object} Grouped object
 */
const groupBy = (arr, key) => {
  return arr.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

// ==================== OBJECT HELPERS ====================

/**
 * Remove null/undefined values from object
 * @param {Object} obj - Object to clean
 * @returns {Object} Cleaned object
 */
const removeNullValues = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== null && value !== undefined)
  );
};

/**
 * Deep clone object
 * @param {Object} obj - Object to clone
 * @returns {Object} Cloned object
 */
const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Check if object is empty
 * @param {Object} obj - Object to check
 * @returns {Boolean} True if empty
 */
const isEmptyObject = (obj) => {
  return Object.keys(obj).length === 0;
};

// ==================== PAGINATION HELPERS ====================

/**
 * Calculate pagination info
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items
 * @returns {Object} Pagination info
 */
const getPaginationInfo = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages - 1;
  const hasPrev = page > 0;
  
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total,
    totalPages,
    hasNext,
    hasPrev,
    offset: page * limit
  };
};

// ==================== RESPONSE HELPERS ====================

/**
 * Create success response
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @returns {Object} Response object
 */
const successResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

/**
 * Create error response
 * @param {String} message - Error message
 * @param {Number} code - Error code
 * @returns {Object} Response object
 */
const errorResponse = (message, code = 400) => {
  return {
    success: false,
    error: message,
    code
  };
};

// ==================== FILE HELPERS ====================

/**
 * Get file extension
 * @param {String} filename - Filename
 * @returns {String} File extension
 */
const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

/**
 * Format file size
 * @param {Number} bytes - Size in bytes
 * @returns {String} Formatted size
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// ==================== EXPORT ALL HELPERS ====================
module.exports = {
  // Date & Time
  formatDate,
  getRelativeTime,
  isExpired,
  getDaysUntil,
  
  // String
  slugify,
  truncate,
  capitalize,
  toTitleCase,
  
  // Number
  formatCurrency,
  formatSalaryRange,
  formatCompactNumber,
  randomNumber,
  
  // Validation
  isValidEmail,
  isValidPhone,
  isValidUrl,
  sanitizeHtml,
  
  // Array
  removeDuplicates,
  shuffleArray,
  chunkArray,
  groupBy,
  
  // Object
  removeNullValues,
  deepClone,
  isEmptyObject,
  
  // Pagination
  getPaginationInfo,
  
  // Response
  successResponse,
  errorResponse,
  
  // File
  getFileExtension,
  formatFileSize
};
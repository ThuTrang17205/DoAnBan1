// ===================== UTILS INDEX - EXPORT ALL UTILITIES =====================
// Import tất cả utility files

const tokenUtils = require('./generateToken');
const passwordUtils = require('./hashPassword');
const constants = require('./constants');
const helpers = require('./helpers');

// ==================== EXPORT ALL ====================
module.exports = {
  // ========== TOKEN UTILITIES (from generateToken.js) ==========
  generateAccessToken: tokenUtils.generateAccessToken,
  generateRefreshToken: tokenUtils.generateRefreshToken,
  generateTokenPair: tokenUtils.generateTokenPair,
  verifyAccessToken: tokenUtils.verifyAccessToken,
  verifyRefreshToken: tokenUtils.verifyRefreshToken,
  decodeToken: tokenUtils.decodeToken,
  extractTokenFromHeader: tokenUtils.extractTokenFromHeader,
  extractTokenFromRequest: tokenUtils.extractTokenFromRequest,
  getTokenExpiration: tokenUtils.getTokenExpiration,
  isTokenExpired: tokenUtils.isTokenExpired,
  refreshAccessToken: tokenUtils.refreshAccessToken,
  generateUserToken: tokenUtils.generateUserToken,
  generateAdminToken: tokenUtils.generateAdminToken,
  generateEmployerToken: tokenUtils.generateEmployerToken,
  
  // ========== PASSWORD UTILITIES (from hashPassword.js) ==========
  hashPassword: passwordUtils.hashPassword,
  comparePassword: passwordUtils.comparePassword,
  verifyPasswordStrength: passwordUtils.verifyPasswordStrength,
  generateRandomPassword: passwordUtils.generateRandomPassword,
  hashMultiplePasswords: passwordUtils.hashMultiplePasswords,
  isPasswordHashed: passwordUtils.isPasswordHashed,
  getHashInfo: passwordUtils.getHashInfo,
  rehashPasswordIfNeeded: passwordUtils.rehashPasswordIfNeeded,
  DEFAULT_SALT_ROUNDS: passwordUtils.DEFAULT_SALT_ROUNDS,
  
  // ========== CONSTANTS (from constants.js) ==========
  USER_ROLES: constants.USER_ROLES,
  JOB_STATUS: constants.JOB_STATUS,
  APPLICATION_STATUS: constants.APPLICATION_STATUS,
  EXPERIENCE_LEVELS: constants.EXPERIENCE_LEVELS,
  COMPANY_SIZES: constants.COMPANY_SIZES,
  JOB_CATEGORIES: constants.JOB_CATEGORIES,
  CATEGORY_SLUGS: constants.CATEGORY_SLUGS,
  VIETNAM_CITIES: constants.VIETNAM_CITIES,
  SALARY_RANGES: constants.SALARY_RANGES,
  CURRENCY: constants.CURRENCY,
  PAGINATION: constants.PAGINATION,
  HTTP_STATUS: constants.HTTP_STATUS,
  ERROR_MESSAGES: constants.ERROR_MESSAGES,
  SUCCESS_MESSAGES: constants.SUCCESS_MESSAGES,
  VALIDATION_RULES: constants.VALIDATION_RULES,
  DATE_FORMATS: constants.DATE_FORMATS,
  FILE_UPLOAD: constants.FILE_UPLOAD,
  EMAIL_TYPES: constants.EMAIL_TYPES,
  INDUSTRIES: constants.INDUSTRIES,
  NOTIFICATION_TYPES: constants.NOTIFICATION_TYPES,
  RATE_LIMITS: constants.RATE_LIMITS,
  REGEX_PATTERNS: constants.REGEX_PATTERNS,
  
  // ========== HELPERS (from helpers.js) ==========
  // Date & Time
  formatDate: helpers.formatDate,
  getRelativeTime: helpers.getRelativeTime,
  isExpired: helpers.isExpired,
  getDaysUntil: helpers.getDaysUntil,
  
  // String
  slugify: helpers.slugify,
  truncate: helpers.truncate,
  capitalize: helpers.capitalize,
  toTitleCase: helpers.toTitleCase,
  
  // Number
  formatCurrency: helpers.formatCurrency,
  formatSalaryRange: helpers.formatSalaryRange,
  formatCompactNumber: helpers.formatCompactNumber,
  randomNumber: helpers.randomNumber,
  
  // Validation
  isValidEmail: helpers.isValidEmail,
  isValidPhone: helpers.isValidPhone,
  isValidUrl: helpers.isValidUrl,
  sanitizeHtml: helpers.sanitizeHtml,
  
  // Array
  removeDuplicates: helpers.removeDuplicates,
  shuffleArray: helpers.shuffleArray,
  chunkArray: helpers.chunkArray,
  groupBy: helpers.groupBy,
  
  // Object
  removeNullValues: helpers.removeNullValues,
  deepClone: helpers.deepClone,
  isEmptyObject: helpers.isEmptyObject,
  
  // Pagination
  getPaginationInfo: helpers.getPaginationInfo,
  
  // Response
  successResponse: helpers.successResponse,
  errorResponse: helpers.errorResponse,
  
  // File
  getFileExtension: helpers.getFileExtension,
  formatFileSize: helpers.formatFileSize,
  
  // ========== GROUPED EXPORTS (for easier access) ==========
  token: tokenUtils,
  password: passwordUtils,
  constants: constants,
  helpers: helpers
};
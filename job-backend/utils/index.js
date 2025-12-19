


const tokenUtils = require('./generateToken');
const passwordUtils = require('./hashPassword');
const constants = require('./constants');
const helpers = require('./helpers');


module.exports = {
  
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
  
  
  hashPassword: passwordUtils.hashPassword,
  comparePassword: passwordUtils.comparePassword,
  verifyPasswordStrength: passwordUtils.verifyPasswordStrength,
  generateRandomPassword: passwordUtils.generateRandomPassword,
  hashMultiplePasswords: passwordUtils.hashMultiplePasswords,
  isPasswordHashed: passwordUtils.isPasswordHashed,
  getHashInfo: passwordUtils.getHashInfo,
  rehashPasswordIfNeeded: passwordUtils.rehashPasswordIfNeeded,
  DEFAULT_SALT_ROUNDS: passwordUtils.DEFAULT_SALT_ROUNDS,
  
  
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
  
  
  
  formatDate: helpers.formatDate,
  getRelativeTime: helpers.getRelativeTime,
  isExpired: helpers.isExpired,
  getDaysUntil: helpers.getDaysUntil,
  
  
  slugify: helpers.slugify,
  truncate: helpers.truncate,
  capitalize: helpers.capitalize,
  toTitleCase: helpers.toTitleCase,
  
  
  formatCurrency: helpers.formatCurrency,
  formatSalaryRange: helpers.formatSalaryRange,
  formatCompactNumber: helpers.formatCompactNumber,
  randomNumber: helpers.randomNumber,
  
  
  isValidEmail: helpers.isValidEmail,
  isValidPhone: helpers.isValidPhone,
  isValidUrl: helpers.isValidUrl,
  sanitizeHtml: helpers.sanitizeHtml,
  
  
  removeDuplicates: helpers.removeDuplicates,
  shuffleArray: helpers.shuffleArray,
  chunkArray: helpers.chunkArray,
  groupBy: helpers.groupBy,
  
  
  removeNullValues: helpers.removeNullValues,
  deepClone: helpers.deepClone,
  isEmptyObject: helpers.isEmptyObject,
  
  
  getPaginationInfo: helpers.getPaginationInfo,
  
  
  successResponse: helpers.successResponse,
  errorResponse: helpers.errorResponse,
  
  
  getFileExtension: helpers.getFileExtension,
  formatFileSize: helpers.formatFileSize,
  
  
  token: tokenUtils,
  password: passwordUtils,
  constants: constants,
  helpers: helpers
};
// ===================== PASSWORD HASHING UTILITY =====================
const bcrypt = require('bcrypt');

// Default salt rounds (higher = more secure but slower)
const DEFAULT_SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;

/**
 * Hash a plain text password
 * @param {String} plainPassword - Plain text password
 * @param {Number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<String>} Hashed password
 */
const hashPassword = async (plainPassword, saltRounds = DEFAULT_SALT_ROUNDS) => {
  try {
    if (!plainPassword) {
      throw new Error('Password is required');
    }

    if (typeof plainPassword !== 'string') {
      throw new Error('Password must be a string');
    }

    // Validate password length
    if (plainPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    if (plainPassword.length > 72) {
      throw new Error('Password must be less than 72 characters (bcrypt limit)');
    }

    // Generate salt and hash password
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    console.log(` Password hashed successfully (${saltRounds} rounds)`);
    return hashedPassword;
  } catch (error) {
    console.error(' Error hashing password:', error.message);
    throw error;
  }
};

/**
 * Compare plain password with hashed password
 * @param {String} plainPassword - Plain text password
 * @param {String} hashedPassword - Hashed password from database
 * @returns {Promise<Boolean>} True if password matches, false otherwise
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    if (!plainPassword || !hashedPassword) {
      throw new Error('Both passwords are required for comparison');
    }

    // Check if hashedPassword is actually hashed (starts with $2b$ or $2a$)
    if (!hashedPassword.startsWith('$2b$') && !hashedPassword.startsWith('$2a$')) {
      console.warn(' Password does not appear to be hashed (plaintext comparison)');
      // For backwards compatibility with plaintext passwords (NOT RECOMMENDED)
      return plainPassword === hashedPassword;
    }

    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    
    if (isMatch) {
      console.log(' Password verification successful');
    } else {
      console.log(' Password verification failed');
    }

    return isMatch;
  } catch (error) {
    console.error(' Error comparing passwords:', error.message);
    return false;
  }
};

/**
 * Verify password strength
 * @param {String} password - Password to verify
 * @returns {Object} { isStrong, issues, score }
 */
const verifyPasswordStrength = (password) => {
  const issues = [];
  let score = 0;

  if (!password) {
    return { isStrong: false, issues: ['Password is required'], score: 0 };
  }

  // Length check
  if (password.length < 6) {
    issues.push('Password must be at least 6 characters');
  } else if (password.length >= 6 && password.length < 8) {
    score += 1;
    issues.push('Password should be at least 8 characters for better security');
  } else if (password.length >= 8 && password.length < 12) {
    score += 2;
  } else if (password.length >= 12) {
    score += 3;
  }

  // Contains lowercase
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    issues.push('Password should contain lowercase letters');
  }

  // Contains uppercase
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    issues.push('Password should contain uppercase letters');
  }

  // Contains numbers
  if (/\d/.test(password)) {
    score += 1;
  } else {
    issues.push('Password should contain numbers');
  }

  // Contains special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 2;
  } else {
    issues.push('Password should contain special characters');
  }

  // Check for common patterns
  const commonPatterns = ['123456', 'password', 'qwerty', 'abc123', '111111'];
  const lowercasePassword = password.toLowerCase();
  
  for (const pattern of commonPatterns) {
    if (lowercasePassword.includes(pattern)) {
      issues.push(`Password contains common pattern: ${pattern}`);
      score = Math.max(0, score - 2);
      break;
    }
  }

  const isStrong = score >= 5 && issues.length === 0;

  return {
    isStrong,
    issues,
    score,
    strength: score >= 7 ? 'Strong' : score >= 5 ? 'Medium' : score >= 3 ? 'Weak' : 'Very Weak'
  };
};

/**
 * Generate a random password
 * @param {Number} length - Password length (default: 12)
 * @param {Object} options - Options for password generation
 * @returns {String} Generated password
 */
const generateRandomPassword = (length = 12, options = {}) => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecialChars = true
  } = options;

  let charset = '';
  
  if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
  if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (includeNumbers) charset += '0123456789';
  if (includeSpecialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

  if (charset.length === 0) {
    throw new Error('At least one character type must be included');
  }

  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};

/**
 * Hash multiple passwords at once
 * @param {Array<String>} passwords - Array of plain passwords
 * @param {Number} saltRounds - Salt rounds
 * @returns {Promise<Array<String>>} Array of hashed passwords
 */
const hashMultiplePasswords = async (passwords, saltRounds = DEFAULT_SALT_ROUNDS) => {
  try {
    const hashedPasswords = await Promise.all(
      passwords.map(password => hashPassword(password, saltRounds))
    );
    return hashedPasswords;
  } catch (error) {
    console.error(' Error hashing multiple passwords:', error.message);
    throw error;
  }
};

/**
 * Check if a string is already hashed
 * @param {String} password - Password to check
 * @returns {Boolean} True if hashed, false otherwise
 */
const isPasswordHashed = (password) => {
  if (!password || typeof password !== 'string') {
    return false;
  }

  // bcrypt hashes start with $2a$, $2b$, or $2y$
  return /^\$2[aby]\$\d{2}\$/.test(password);
};

/**
 * Get hash info (salt rounds, algorithm)
 * @param {String} hashedPassword - Hashed password
 * @returns {Object|null} Hash info or null
 */
const getHashInfo = (hashedPassword) => {
  try {
    if (!isPasswordHashed(hashedPassword)) {
      return null;
    }

    const parts = hashedPassword.split('$');
    
    return {
      algorithm: parts[1], // 2a, 2b, or 2y
      saltRounds: parseInt(parts[2]),
      salt: parts[3],
      isValid: parts.length === 4
    };
  } catch (error) {
    console.error(' Error getting hash info:', error.message);
    return null;
  }
};

/**
 * Rehash password with new salt rounds (if needed)
 * @param {String} plainPassword - Plain password
 * @param {String} currentHash - Current hashed password
 * @param {Number} newSaltRounds - New salt rounds
 * @returns {Promise<String|null>} New hash if rehashed, null if not needed
 */
const rehashPasswordIfNeeded = async (plainPassword, currentHash, newSaltRounds = DEFAULT_SALT_ROUNDS) => {
  try {
    const hashInfo = getHashInfo(currentHash);
    
    if (!hashInfo) {
      console.log(' Current password is not hashed, creating new hash');
      return await hashPassword(plainPassword, newSaltRounds);
    }

    if (hashInfo.saltRounds < newSaltRounds) {
      console.log(` Rehashing password from ${hashInfo.saltRounds} to ${newSaltRounds} rounds`);
      return await hashPassword(plainPassword, newSaltRounds);
    }

    console.log(' Password hash is up to date');
    return null; // No rehashing needed
  } catch (error) {
    console.error(' Error rehashing password:', error.message);
    throw error;
  }
};

// Export all functions
module.exports = {
  hashPassword,
  comparePassword,
  verifyPasswordStrength,
  generateRandomPassword,
  hashMultiplePasswords,
  isPasswordHashed,
  getHashInfo,
  rehashPasswordIfNeeded,
  DEFAULT_SALT_ROUNDS
};
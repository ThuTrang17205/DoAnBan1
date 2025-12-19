/**
 * Upload Service
 * Handles file upload, storage, and management
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); 
const { AppError } = require('../middleware/errorHandler');


const UPLOAD_DIRS = {
  RESUMES: 'uploads/resumes',
  AVATARS: 'uploads/avatars',
  COMPANY_LOGOS: 'uploads/company-logos',
  DOCUMENTS: 'uploads/documents',
  TEMP: 'uploads/temp'
};


const SIZE_LIMITS = {
  AVATAR: 2 * 1024 * 1024, 
  RESUME: 5 * 1024 * 1024, 
  DOCUMENT: 5 * 1024 * 1024, 
  IMAGE: 2 * 1024 * 1024 
};

// Allowed file types
const ALLOWED_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  RESUMES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

/**
 * Ensure directory exists
 */
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Initialize upload directories
 */
const initializeDirectories = () => {
  Object.values(UPLOAD_DIRS).forEach(dir => {
    ensureDirectoryExists(dir);
  });
  console.log(' Upload directories initialized');
};

/**
 * Validate file type
 */
const validateFileType = (file, allowedTypes) => {
  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`, 400);
  }
  return true;
};

/**
 * Validate file size
 */
const validateFileSize = (file, maxSize) => {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    throw new AppError(`File too large. Maximum size: ${maxSizeMB}MB`, 400);
  }
  return true;
};

/**
 * Generate unique filename
 */
const generateUniqueFilename = (originalFilename) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const ext = path.extname(originalFilename);
  const nameWithoutExt = path.basename(originalFilename, ext).replace(/[^a-zA-Z0-9]/g, '_');
  return `${nameWithoutExt}-${timestamp}-${randomString}${ext}`;
};

/**
 * Get file URL
 */
const getFileUrl = (req, filePath) => {
  if (!filePath) return null;
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};

/**
 * Delete file
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(` Deleted file: ${filePath}`);
      return true;
    }
    console.log(`File not found: ${filePath}`);
    return false;
  } catch (error) {
    console.error(' Error deleting file:', error);
    return false;
  }
};

/**
 * Process and save avatar image
 */
const processAvatar = async (file, userId) => {
  try {
    validateFileType(file, ALLOWED_TYPES.IMAGES);
    validateFileSize(file, SIZE_LIMITS.AVATAR);

    const filename = `avatar-${userId}-${Date.now()}.jpg`;
    const outputPath = path.join(UPLOAD_DIRS.AVATARS, filename);

    // Resize and optimize image
    await sharp(file.path)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

 
    if (file.path !== outputPath) {
      deleteFile(file.path);
    }

    return {
      filename,
      path: outputPath,
      size: fs.statSync(outputPath).size,
      mimetype: 'image/jpeg'
    };
  } catch (error) {
   
    if (file.path) deleteFile(file.path);
    throw error;
  }
};

/**
 * Process and save company logo
 */
const processCompanyLogo = async (file, employerId) => {
  try {
    validateFileType(file, ALLOWED_TYPES.IMAGES);
    validateFileSize(file, SIZE_LIMITS.IMAGE);

    const filename = `logo-${employerId}-${Date.now()}.jpg`;
    const outputPath = path.join(UPLOAD_DIRS.COMPANY_LOGOS, filename);

    
    await sharp(file.path)
      .resize(400, 400, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    
    if (file.path !== outputPath) {
      deleteFile(file.path);
    }

    return {
      filename,
      path: outputPath,
      size: fs.statSync(outputPath).size,
      mimetype: 'image/jpeg'
    };
  } catch (error) {
    if (file.path) deleteFile(file.path);
    throw error;
  }
};

/**
 * Save resume/CV
 */
const saveResume = async (file, userId) => {
  try {
    validateFileType(file, ALLOWED_TYPES.RESUMES);
    validateFileSize(file, SIZE_LIMITS.RESUME);

    const filename = generateUniqueFilename(file.originalname);
    const outputPath = path.join(UPLOAD_DIRS.RESUMES, filename);

    
    fs.renameSync(file.path, outputPath);

    return {
      filename,
      path: outputPath,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    if (file.path) deleteFile(file.path);
    throw error;
  }
};

/**
 * Save document
 */
const saveDocument = async (file, userId) => {
  try {
    validateFileType(file, ALLOWED_TYPES.DOCUMENTS);
    validateFileSize(file, SIZE_LIMITS.DOCUMENT);

    const filename = generateUniqueFilename(file.originalname);
    const outputPath = path.join(UPLOAD_DIRS.DOCUMENTS, filename);

    
    fs.renameSync(file.path, outputPath);

    return {
      filename,
      path: outputPath,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    if (file.path) deleteFile(file.path);
    throw error;
  }
};

/**
 * Save multiple documents
 */
const saveMultipleDocuments = async (files, userId) => {
  const savedFiles = [];
  const errors = [];

  for (const file of files) {
    try {
      const savedFile = await saveDocument(file, userId);
      savedFiles.push(savedFile);
    } catch (error) {
      errors.push({
        filename: file.originalname,
        error: error.message
      });
    }
  }

  return { savedFiles, errors };
};

/**
 * Get file info
 */
const getFileInfo = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath);
    
    return {
      path: filePath,
      filename: path.basename(filePath),
      size: stats.size,
      sizeInMB: (stats.size / (1024 * 1024)).toFixed(2),
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime,
      extension: ext
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    return null;
  }
};

/**
 * Clean old files (older than specified days)
 */
const cleanOldFiles = async (directory, days = 30) => {
  try {
    const files = fs.readdirSync(directory);
    const now = Date.now();
    const maxAge = days * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`🗑️ Deleted old file: ${filePath}`);
      }
    }

    console.log(` Cleaned ${deletedCount} old files from ${directory}`);
    return deletedCount;
  } catch (error) {
    console.error(' Error cleaning old files:', error);
    return 0;
  }
};

/**
 * Clean temp directory
 */
const cleanTempDirectory = async () => {
  return await cleanOldFiles(UPLOAD_DIRS.TEMP, 1);
};

/**
 * Get directory size
 */
const getDirectorySize = (directory) => {
  try {
    let totalSize = 0;
    const files = fs.readdirSync(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }

    return {
      bytes: totalSize,
      mb: (totalSize / (1024 * 1024)).toFixed(2),
      gb: (totalSize / (1024 * 1024 * 1024)).toFixed(2)
    };
  } catch (error) {
    console.error('Error getting directory size:', error);
    return { bytes: 0, mb: 0, gb: 0 };
  }
};

/**
 * Get storage statistics
 */
const getStorageStatistics = () => {
  const stats = {};

  for (const [key, dir] of Object.entries(UPLOAD_DIRS)) {
    try {
      const files = fs.readdirSync(dir);
      const size = getDirectorySize(dir);

      stats[key] = {
        directory: dir,
        fileCount: files.length,
        size: size
      };
    } catch (error) {
      stats[key] = {
        directory: dir,
        fileCount: 0,
        size: { bytes: 0, mb: 0, gb: 0 },
        error: error.message
      };
    }
  }

  return stats;
};

/**
 * Validate and sanitize filename
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

/**
 * Check if file exists
 */
const fileExists = (filePath) => {
  return fs.existsSync(filePath);
};

/**
 * Copy file
 */
const copyFile = (sourcePath, destinationPath) => {
  try {
    const destDir = path.dirname(destinationPath);
    ensureDirectoryExists(destDir);
    fs.copyFileSync(sourcePath, destinationPath);
    return true;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
};

/**
 * Move file
 */
const moveFile = (sourcePath, destinationPath) => {
  try {
    const destDir = path.dirname(destinationPath);
    ensureDirectoryExists(destDir);
    fs.renameSync(sourcePath, destinationPath);
    return true;
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
};

/**
 * Get file extension
 */
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Check if file is image
 */
const isImageFile = (filename) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  return imageExtensions.includes(getFileExtension(filename));
};

/**
 * Check if file is document
 */
const isDocumentFile = (filename) => {
  const docExtensions = ['.pdf', '.doc', '.docx', '.txt'];
  return docExtensions.includes(getFileExtension(filename));
};

module.exports = {
  // Initialization
  initializeDirectories,
  ensureDirectoryExists,

  // File processing
  processAvatar,
  processCompanyLogo,
  saveResume,
  saveDocument,
  saveMultipleDocuments,

  // File management
  deleteFile,
  getFileInfo,
  getFileUrl,
  fileExists,
  copyFile,
  moveFile,

  // Validation
  validateFileType,
  validateFileSize,
  sanitizeFilename,
  isImageFile,
  isDocumentFile,

  // Utilities
  generateUniqueFilename,
  getFileExtension,

  // Cleanup
  cleanOldFiles,
  cleanTempDirectory,

  // Statistics
  getDirectorySize,
  getStorageStatistics,

  // Constants
  UPLOAD_DIRS,
  SIZE_LIMITS,
  ALLOWED_TYPES
};
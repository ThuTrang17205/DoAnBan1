/**
 * Multer File Upload Middleware
 * Handles file uploads with validation
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Upload directories
const UPLOAD_DIRS = {
  RESUMES: 'uploads/resumes',
  AVATARS: 'uploads/avatars',
  COMPANY_LOGOS: 'uploads/company-logos',
  DOCUMENTS: 'uploads/documents',
  TEMP: 'uploads/temp'
};

// Create all directories
Object.values(UPLOAD_DIRS).forEach(ensureDirectoryExists);

/**
 * Storage configuration for different file types
 */
const createStorage = (destination) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      ensureDirectoryExists(destination);
      cb(null, destination);
    },
    filename: (req, file, cb) => {
      // Generate unique filename: timestamp-randomstring-originalname
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const nameWithoutExt = path.basename(file.originalname, ext);
      const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
      cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    }
  });
};

/**
 * File filter for images
 */
const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, JPG, PNG, GIF, WEBP)'));
  }
};

/**
 * File filter for documents (PDF, DOC, DOCX)
 */
const documentFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)|text\/plain/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file PDF, DOC, DOCX, TXT'));
  }
};

/**
 * File filter for CV/Resume (PDF, DOC, DOCX)
 */
const resumeFileFilter = (req, file, cb) => {
  const allowedTypes = /pdf|doc|docx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('CV chỉ chấp nhận file PDF, DOC, DOCX'));
  }
};

/**
 * Upload Avatar (Single image, max 2MB)
 */
const uploadAvatar = multer({
  storage: createStorage(UPLOAD_DIRS.AVATARS),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: imageFileFilter
}).single('avatar');

/**
 * Upload Company Logo (Single image, max 2MB)
 */
const uploadCompanyLogo = multer({
  storage: createStorage(UPLOAD_DIRS.COMPANY_LOGOS),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: imageFileFilter
}).single('logo');

/**
 * Upload Resume/CV (Single document, max 5MB)
 */
const uploadResume = multer({
  storage: createStorage(UPLOAD_DIRS.RESUMES),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: resumeFileFilter
}).single('resume');

/**
 * Upload Multiple Documents (Max 5 files, 5MB each)
 */
const uploadDocuments = multer({
  storage: createStorage(UPLOAD_DIRS.DOCUMENTS),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5 // Maximum 5 files
  },
  fileFilter: documentFileFilter
}).array('documents', 5);

/**
 * Upload Multiple Images (Max 10 images, 2MB each)
 */
const uploadImages = multer({
  storage: createStorage(UPLOAD_DIRS.TEMP),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB per file
    files: 10 // Maximum 10 images
  },
  fileFilter: imageFileFilter
}).array('images', 10);

/**
 * Generic file upload with custom options
 */
const createUploadMiddleware = (options = {}) => {
  const {
    destination = UPLOAD_DIRS.TEMP,
    maxSize = 5 * 1024 * 1024, // 5MB default
    maxFiles = 1,
    allowedTypes = /jpeg|jpg|png|pdf|doc|docx/,
    fieldName = 'file'
  } = options;

  const fileFilter = (req, file, cb) => {
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('File không hợp lệ'));
    }
  };

  const upload = multer({
    storage: createStorage(destination),
    limits: {
      fileSize: maxSize,
      files: maxFiles
    },
    fileFilter
  });

  return maxFiles === 1 ? upload.single(fieldName) : upload.array(fieldName, maxFiles);
};

/**
 * Middleware wrapper for error handling
 */
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'File quá lớn'
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            message: 'Quá số lượng file cho phép'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            message: 'Tên field không đúng hoặc quá nhiều file'
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Lỗi upload file',
          error: err.message
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }
      next();
    });
  };
};

/**
 * Delete uploaded file
 */
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

/**
 * Delete multiple files
 */
const deleteFiles = (filePaths) => {
  return filePaths.map(filePath => deleteFile(filePath));
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
 * Validate file exists
 */
const validateFileExists = (filePath) => {
  return fs.existsSync(filePath);
};

/**
 * Get file size in MB
 */
const getFileSize = (filePath) => {
  try {
    const stats = fs.statSync(filePath);
    return (stats.size / (1024 * 1024)).toFixed(2);
  } catch (error) {
    return null;
  }
};

/**
 * Clean old files (older than specified days)
 */
const cleanOldFiles = (directory, days = 30) => {
  try {
    const files = fs.readdirSync(directory);
    const now = Date.now();
    const maxAge = days * 24 * 60 * 60 * 1000; // Convert days to milliseconds

    files.forEach(file => {
      const filePath = path.join(directory, file);
      const stats = fs.statSync(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old file: ${filePath}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning old files:', error);
  }
};

/**
 * Middleware: Ensure file uploaded
 */
const requireFile = (fieldName = 'file') => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: `File "${fieldName}" là bắt buộc`
      });
    }
    next();
  };
};

/**
 * Middleware: Validate uploaded file
 */
const validateUploadedFile = (req, res, next) => {
  if (req.file) {
    req.file.url = getFileUrl(req, req.file.path);
    req.file.sizeInMB = getFileSize(req.file.path);
  }

  if (req.files && Array.isArray(req.files)) {
    req.files = req.files.map(file => ({
      ...file,
      url: getFileUrl(req, file.path),
      sizeInMB: getFileSize(file.path)
    }));
  }

  next();
};

module.exports = {
  // Upload middlewares
  uploadAvatar: handleUpload(uploadAvatar),
  uploadCompanyLogo: handleUpload(uploadCompanyLogo),
  uploadResume: handleUpload(uploadResume),
  uploadDocuments: handleUpload(uploadDocuments),
  uploadImages: handleUpload(uploadImages),
  
  // Custom upload
  createUploadMiddleware,
  handleUpload,

  // File management
  deleteFile,
  deleteFiles,
  getFileUrl,
  validateFileExists,
  getFileSize,
  cleanOldFiles,

  // Validation middleware
  requireFile,
  validateUploadedFile,

  // Constants
  UPLOAD_DIRS
};
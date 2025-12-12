// ===================== JOB VALIDATION =====================
const {
  VALIDATION_RULES,
  JOB_CATEGORIES,
  VIETNAM_CITIES,
  EXPERIENCE_LEVELS,
  JOB_STATUS
} = require('../utils/constants');

/**
 * Validate create job data
 * @param {Object} data - Job data
 * @returns {Object} { isValid, errors }
 */
const validateCreateJob = (data) => {
  const errors = [];
  const {
    title,
    description,
    requirements,
    benefits,
    location,
    category,
    experience,
    deadline,
    salary,
    minSalary,
    maxSalary
  } = data;

  // Validate title
  if (!title) {
    errors.push('Tiêu đề công việc là bắt buộc');
  } else if (title.length < 10) {
    errors.push('Tiêu đề phải có ít nhất 10 ký tự');
  } else if (title.length > VALIDATION_RULES.TITLE_MAX_LENGTH) {
    errors.push(`Tiêu đề không được vượt quá ${VALIDATION_RULES.TITLE_MAX_LENGTH} ký tự`);
  }

  // Validate description
  if (!description) {
    errors.push('Mô tả công việc là bắt buộc');
  } else if (description.length < 50) {
    errors.push('Mô tả phải có ít nhất 50 ký tự');
  } else if (description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Mô tả không được vượt quá ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} ký tự`);
  }

  // Validate requirements
  if (requirements && requirements.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Yêu cầu không được vượt quá ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} ký tự`);
  }

  // Validate benefits
  if (benefits && benefits.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Quyền lợi không được vượt quá ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} ký tự`);
  }

  // Validate location
  if (!location) {
    errors.push('Địa điểm làm việc là bắt buộc');
  } else if (!VIETNAM_CITIES.includes(location)) {
    errors.push('Địa điểm không hợp lệ. Vui lòng chọn từ danh sách có sẵn');
  }

  // Validate category
  if (!category) {
    errors.push('Danh mục công việc là bắt buộc');
  } else {
    const validCategories = Object.values(JOB_CATEGORIES);
    if (!validCategories.includes(category)) {
      errors.push('Danh mục không hợp lệ. Vui lòng chọn từ danh sách có sẵn');
    }
  }

  // Validate experience
  if (experience) {
    const validExperiences = Object.values(EXPERIENCE_LEVELS);
    if (!validExperiences.includes(experience)) {
      errors.push('Yêu cầu kinh nghiệm không hợp lệ');
    }
  }

  // Validate deadline
  if (deadline) {
    const deadlineDate = new Date(deadline);
    const today = new Date();
    
    if (isNaN(deadlineDate.getTime())) {
      errors.push('Hạn nộp hồ sơ không hợp lệ');
    } else if (deadlineDate <= today) {
      errors.push('Hạn nộp hồ sơ phải sau ngày hiện tại');
    } else {
      // Check if deadline is too far in the future (e.g., more than 1 year)
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      
      if (deadlineDate > oneYearFromNow) {
        errors.push('Hạn nộp hồ sơ không được quá 1 năm kể từ hôm nay');
      }
    }
  }

  // Validate salary
  if (salary) {
    // Parse salary format "10000000 - 20000000"
    const salaryMatch = salary.match(/(\d+)\s*-\s*(\d+)/);
    if (!salaryMatch) {
      errors.push('Định dạng mức lương không hợp lệ (Ví dụ: "10000000 - 20000000")');
    } else {
      const min = parseInt(salaryMatch[1]);
      const max = parseInt(salaryMatch[2]);
      
      if (min < 0 || max < 0) {
        errors.push('Mức lương phải là số dương');
      } else if (min >= max) {
        errors.push('Lương tối thiểu phải nhỏ hơn lương tối đa');
      } else if (min < 1000000) {
        errors.push('Lương tối thiểu phải ít nhất 1.000.000 VNĐ');
      } else if (max > 1000000000) {
        errors.push('Lương tối đa không được vượt quá 1.000.000.000 VNĐ');
      }
    }
  }

  // Validate minSalary and maxSalary (if provided separately)
  if (minSalary !== undefined || maxSalary !== undefined) {
    if (minSalary !== undefined && minSalary < 0) {
      errors.push('Lương tối thiểu phải là số dương');
    }
    
    if (maxSalary !== undefined && maxSalary < 0) {
      errors.push('Lương tối đa phải là số dương');
    }
    
    if (minSalary !== undefined && maxSalary !== undefined) {
      if (minSalary >= maxSalary) {
        errors.push('Lương tối thiểu phải nhỏ hơn lương tối đa');
      }
    }
    
    if (minSalary !== undefined && minSalary < 1000000) {
      errors.push('Lương tối thiểu phải ít nhất 1.000.000 VNĐ');
    }
    
    if (maxSalary !== undefined && maxSalary > 1000000000) {
      errors.push('Lương tối đa không được vượt quá 1.000.000.000 VNĐ');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate update job data
 * @param {Object} data - Job data to update
 * @returns {Object} { isValid, errors }
 */
const validateUpdateJob = (data) => {
  // Use same validation as create, but all fields are optional
  const errors = [];
  const {
    title,
    description,
    requirements,
    benefits,
    location,
    category,
    experience,
    deadline,
    status,
    salary,
    minSalary,
    maxSalary
  } = data;

  // Validate title (if provided)
  if (title !== undefined) {
    if (title.length < 10) {
      errors.push('Tiêu đề phải có ít nhất 10 ký tự');
    } else if (title.length > VALIDATION_RULES.TITLE_MAX_LENGTH) {
      errors.push(`Tiêu đề không được vượt quá ${VALIDATION_RULES.TITLE_MAX_LENGTH} ký tự`);
    }
  }

  // Validate description (if provided)
  if (description !== undefined) {
    if (description.length < 50) {
      errors.push('Mô tả phải có ít nhất 50 ký tự');
    } else if (description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
      errors.push(`Mô tả không được vượt quá ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} ký tự`);
    }
  }

  // Validate requirements (if provided)
  if (requirements !== undefined && requirements.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Yêu cầu không được vượt quá ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} ký tự`);
  }

  // Validate benefits (if provided)
  if (benefits !== undefined && benefits.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    errors.push(`Quyền lợi không được vượt quá ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} ký tự`);
  }

  // Validate location (if provided)
  if (location !== undefined && !VIETNAM_CITIES.includes(location)) {
    errors.push('Địa điểm không hợp lệ');
  }

  // Validate category (if provided)
  if (category !== undefined) {
    const validCategories = Object.values(JOB_CATEGORIES);
    if (!validCategories.includes(category)) {
      errors.push('Danh mục không hợp lệ');
    }
  }

  // Validate experience (if provided)
  if (experience !== undefined) {
    const validExperiences = Object.values(EXPERIENCE_LEVELS);
    if (!validExperiences.includes(experience)) {
      errors.push('Yêu cầu kinh nghiệm không hợp lệ');
    }
  }

  // Validate status (if provided)
  if (status !== undefined) {
    const validStatuses = Object.values(JOB_STATUS);
    if (!validStatuses.includes(status)) {
      errors.push('Trạng thái không hợp lệ');
    }
  }

  // Validate deadline (if provided)
  if (deadline !== undefined) {
    const deadlineDate = new Date(deadline);
    
    if (isNaN(deadlineDate.getTime())) {
      errors.push('Hạn nộp hồ sơ không hợp lệ');
    }
  }

  // Validate salary (if provided)
  if (salary !== undefined) {
    const salaryMatch = salary.match(/(\d+)\s*-\s*(\d+)/);
    if (!salaryMatch) {
      errors.push('Định dạng mức lương không hợp lệ');
    } else {
      const min = parseInt(salaryMatch[1]);
      const max = parseInt(salaryMatch[2]);
      
      if (min >= max) {
        errors.push('Lương tối thiểu phải nhỏ hơn lương tối đa');
      }
    }
  }

  // Validate minSalary and maxSalary (if provided)
  if ((minSalary !== undefined || maxSalary !== undefined) && 
      minSalary !== undefined && maxSalary !== undefined) {
    if (minSalary >= maxSalary) {
      errors.push('Lương tối thiểu phải nhỏ hơn lương tối đa');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate job search/filter params
 * @param {Object} params - Search params
 * @returns {Object} { isValid, errors }
 */
const validateJobSearch = (params) => {
  const errors = [];
  const { page, limit, search, location, category, minSalary, maxSalary } = params;

  // Validate page
  if (page !== undefined) {
    const pageNum = parseInt(page);
    if (isNaN(pageNum) || pageNum < 0) {
      errors.push('Số trang phải là số không âm');
    }
  }

  // Validate limit
  if (limit !== undefined) {
    const limitNum = parseInt(limit);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      errors.push('Số lượng kết quả phải từ 1 đến 100');
    }
  }

  // Validate search (if provided)
  if (search !== undefined && search.length > 200) {
    errors.push('Từ khóa tìm kiếm không được vượt quá 200 ký tự');
  }

  // Validate location (if provided)
  if (location !== undefined && location !== '' && !VIETNAM_CITIES.includes(location)) {
    errors.push('Địa điểm không hợp lệ');
  }

  // Validate category (if provided)
  if (category !== undefined && category !== '') {
    const validCategories = Object.values(JOB_CATEGORIES);
    if (!validCategories.includes(category)) {
      errors.push('Danh mục không hợp lệ');
    }
  }

  // Validate salary range (if provided)
  if (minSalary !== undefined) {
    const min = parseInt(minSalary);
    if (isNaN(min) || min < 0) {
      errors.push('Lương tối thiểu phải là số không âm');
    }
  }

  if (maxSalary !== undefined) {
    const max = parseInt(maxSalary);
    if (isNaN(max) || max < 0) {
      errors.push('Lương tối đa phải là số không âm');
    }
  }

  if (minSalary !== undefined && maxSalary !== undefined) {
    const min = parseInt(minSalary);
    const max = parseInt(maxSalary);
    if (!isNaN(min) && !isNaN(max) && min >= max) {
      errors.push('Lương tối thiểu phải nhỏ hơn lương tối đa');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate job ID
 * @param {String|Number} id - Job ID
 * @returns {Object} { isValid, errors }
 */
const validateJobId = (id) => {
  const errors = [];

  if (!id) {
    errors.push('ID công việc là bắt buộc');
  } else {
    const jobId = parseInt(id);
    if (isNaN(jobId) || jobId <= 0) {
      errors.push('ID công việc không hợp lệ');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Export all validation functions
module.exports = {
  validateCreateJob,
  validateUpdateJob,
  validateJobSearch,
  validateJobId
};
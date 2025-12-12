/**
 * Format Salary Utilities
 * Các hàm xử lý và format mức lương
 */

// Format số thành dạng có dấu phẩy (1000000 -> 1,000,000)
export const formatNumber = (number) => {
  if (!number && number !== 0) return '0';
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format salary thành dạng "10 - 15 triệu VND"
export const formatSalary = (minSalary, maxSalary, currency = 'VND') => {
  if (!minSalary && !maxSalary) {
    return 'Thỏa thuận';
  }
  
  if (!maxSalary) {
    return `Từ ${formatSalaryValue(minSalary)} ${currency}`;
  }
  
  if (!minSalary) {
    return `Lên đến ${formatSalaryValue(maxSalary)} ${currency}`;
  }
  
  const minFormatted = formatSalaryValue(minSalary);
  const maxFormatted = formatSalaryValue(maxSalary);
  
  return `${minFormatted} - ${maxFormatted} ${currency}`;
};

// Format giá trị salary (10000000 -> "10 triệu")
export const formatSalaryValue = (salary) => {
  if (!salary && salary !== 0) return '0';
  
  const million = 1000000;
  const billion = 1000000000;
  
  if (salary >= billion) {
    const value = salary / billion;
    return `${value % 1 === 0 ? value : value.toFixed(1)} tỷ`;
  }
  
  if (salary >= million) {
    const value = salary / million;
    return `${value % 1 === 0 ? value : value.toFixed(1)} triệu`;
  }
  
  return formatNumber(salary);
};

// Format salary ngắn gọn cho card (10000000 -> "10M")
export const formatSalaryShort = (minSalary, maxSalary, currency = 'VND') => {
  if (!minSalary && !maxSalary) {
    return 'Thỏa thuận';
  }
  
  const formatShortValue = (salary) => {
    const million = 1000000;
    if (salary >= million) {
      return `${(salary / million).toFixed(0)}M`;
    }
    return `${(salary / 1000).toFixed(0)}K`;
  };
  
  if (!maxSalary) {
    return `Từ ${formatShortValue(minSalary)}`;
  }
  
  if (!minSalary) {
    return `Đến ${formatShortValue(maxSalary)}`;
  }
  
  return `${formatShortValue(minSalary)} - ${formatShortValue(maxSalary)}`;
};

// Parse salary string về số (input từ user)
export const parseSalary = (salaryString) => {
  if (!salaryString) return 0;
  
  // Xóa hết ký tự không phải số
  const numStr = salaryString.toString().replace(/[^\d]/g, '');
  return parseInt(numStr) || 0;
};

// Validate salary range
export const validateSalaryRange = (minSalary, maxSalary) => {
  const min = parseSalary(minSalary);
  const max = parseSalary(maxSalary);
  
  if (min < 0 || max < 0) {
    return { valid: false, error: 'Mức lương không được âm' };
  }
  
  if (max > 0 && min > max) {
    return { valid: false, error: 'Mức lương tối thiểu không được lớn hơn tối đa' };
  }
  
  return { valid: true };
};

// Get salary range label cho filter
export const getSalaryRangeLabel = (range) => {
  const ranges = {
    'all': 'Tất cả',
    'negotiate': 'Thỏa thuận',
    'under10': 'Dưới 10 triệu',
    'under15': 'Dưới 15 triệu',
    '10to15': '10 - 15 triệu',
    '15to20': '15 - 20 triệu',
    '15to30': '15 - 30 triệu',
    '20to30': '20 - 30 triệu',
    '30to50': '30 - 50 triệu',
    'over30': 'Trên 30 triệu',
    'over50': 'Trên 50 triệu'
  };
  
  return ranges[range] || 'Không xác định';
};

// Format salary cho API request
export const formatSalaryForAPI = (salary) => {
  return parseSalary(salary);
};

// Tính mức lương trung bình
export const calculateAverageSalary = (minSalary, maxSalary) => {
  const min = parseSalary(minSalary);
  const max = parseSalary(maxSalary);
  
  if (!min && !max) return 0;
  if (!max) return min;
  if (!min) return max;
  
  return Math.floor((min + max) / 2);
};

export default {
  formatNumber,
  formatSalary,
  formatSalaryValue,
  formatSalaryShort,
  parseSalary,
  validateSalaryRange,
  getSalaryRangeLabel,
  formatSalaryForAPI,
  calculateAverageSalary
};
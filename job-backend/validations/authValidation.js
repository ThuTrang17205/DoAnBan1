
const {
  VALIDATION_RULES,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  USER_ROLES
} = require('../utils/constants');
const {
  isValidEmail,
  isValidPhone
} = require('../utils/helpers');
const {
  verifyPasswordStrength
} = require('../utils/hashPassword');

const validateRegister = (data) => {
  const errors = [];
  const { email, password, confirmPassword, name, username, role, phone } = data;

  
  if (!email) {
    errors.push('Email là bắt buộc');
  } else if (!isValidEmail(email)) {
    errors.push('Email không hợp lệ');
  } else if (email.length > VALIDATION_RULES.EMAIL_MAX_LENGTH) {
    errors.push(`Email không được vượt quá ${VALIDATION_RULES.EMAIL_MAX_LENGTH} ký tự`);
  }

  
  if (!password) {
    errors.push('Mật khẩu là bắt buộc');
  } else if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    errors.push(`Mật khẩu phải có ít nhất ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} ký tự`);
  } else if (password.length > VALIDATION_RULES.PASSWORD_MAX_LENGTH) {
    errors.push(`Mật khẩu không được vượt quá ${VALIDATION_RULES.PASSWORD_MAX_LENGTH} ký tự`);
  } else {
    
    const strength = verifyPasswordStrength(password);
    if (!strength.isStrong && strength.score < 3) {
      errors.push('Mật khẩu quá yếu');
      errors.push(...strength.issues);
    }
  }

  
  if (!confirmPassword) {
    errors.push('Xác nhận mật khẩu là bắt buộc');
  } else if (password !== confirmPassword) {
    errors.push('Mật khẩu xác nhận không khớp');
  }

  
  if (!name) {
    errors.push('Họ tên là bắt buộc');
  } else if (name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    errors.push(`Họ tên không được vượt quá ${VALIDATION_RULES.NAME_MAX_LENGTH} ký tự`);
  }

  
  if (username) {
    if (username.length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
      errors.push(`Username phải có ít nhất ${VALIDATION_RULES.USERNAME_MIN_LENGTH} ký tự`);
    } else if (username.length > VALIDATION_RULES.USERNAME_MAX_LENGTH) {
      errors.push(`Username không được vượt quá ${VALIDATION_RULES.USERNAME_MAX_LENGTH} ký tự`);
    } else if (!REGEX_PATTERNS.USERNAME.test(username)) {
      errors.push('Username chỉ được chứa chữ cái, số và dấu gạch dưới');
    }
  }

  
  if (role && !Object.values(USER_ROLES).includes(role)) {
    errors.push('Role không hợp lệ');
  }

  
  if (phone && !isValidPhone(phone)) {
    errors.push('Số điện thoại không hợp lệ');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateLogin = (data) => {
  const errors = [];
  const { email, password } = data;

  
  if (!email) {
    errors.push('Email là bắt buộc');
  } else if (!isValidEmail(email)) {
    errors.push('Email không hợp lệ');
  }

  
  if (!password) {
    errors.push('Mật khẩu là bắt buộc');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateChangePassword = (data) => {
  const errors = [];
  const { currentPassword, newPassword, confirmNewPassword } = data;

  
  if (!currentPassword) {
    errors.push('Mật khẩu hiện tại là bắt buộc');
  }

  
  if (!newPassword) {
    errors.push('Mật khẩu mới là bắt buộc');
  } else if (newPassword.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    errors.push(`Mật khẩu mới phải có ít nhất ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} ký tự`);
  } else if (newPassword === currentPassword) {
    errors.push('Mật khẩu mới phải khác mật khẩu hiện tại');
  } else {
    
    const strength = verifyPasswordStrength(newPassword);
    if (!strength.isStrong && strength.score < 3) {
      errors.push('Mật khẩu mới quá yếu');
      errors.push(...strength.issues);
    }
  }

  
  if (!confirmNewPassword) {
    errors.push('Xác nhận mật khẩu mới là bắt buộc');
  } else if (newPassword !== confirmNewPassword) {
    errors.push('Xác nhận mật khẩu mới không khớp');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateEmail = (email) => {
  const errors = [];

  if (!email) {
    errors.push('Email là bắt buộc');
  } else if (!isValidEmail(email)) {
    errors.push('Email không hợp lệ');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateUpdateProfile = (data) => {
  const errors = [];
  const { name, phone, username } = data;

  
  if (name) {
    if (name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
      errors.push(`Họ tên không được vượt quá ${VALIDATION_RULES.NAME_MAX_LENGTH} ký tự`);
    }
  }

  
  if (username) {
    if (username.length < VALIDATION_RULES.USERNAME_MIN_LENGTH) {
      errors.push(`Username phải có ít nhất ${VALIDATION_RULES.USERNAME_MIN_LENGTH} ký tự`);
    } else if (username.length > VALIDATION_RULES.USERNAME_MAX_LENGTH) {
      errors.push(`Username không được vượt quá ${VALIDATION_RULES.USERNAME_MAX_LENGTH} ký tự`);
    } else if (!REGEX_PATTERNS.USERNAME.test(username)) {
      errors.push('Username chỉ được chứa chữ cái, số và dấu gạch dưới');
    }
  }

  
  if (phone && !isValidPhone(phone)) {
    errors.push('Số điện thoại không hợp lệ');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateEmployerRegister = (data) => {
  const errors = [];
  const {
    email,
    password,
    confirmPassword,
    name,
    companyName,
    contactPerson,
    phone,
    companySize,
    industry
  } = data;

  
  const basicValidation = validateRegister({
    email,
    password,
    confirmPassword,
    name,
    role: USER_ROLES.EMPLOYER
  });

  if (!basicValidation.isValid) {
    errors.push(...basicValidation.errors);
  }

  
  if (!companyName) {
    errors.push('Tên công ty là bắt buộc');
  } else if (companyName.length < 3) {
    errors.push('Tên công ty phải có ít nhất 3 ký tự');
  } else if (companyName.length > 200) {
    errors.push('Tên công ty không được vượt quá 200 ký tự');
  }

  
  if (contactPerson && contactPerson.length > 100) {
    errors.push('Người liên hệ không được vượt quá 100 ký tự');
  }

  
  if (!phone) {
    errors.push('Số điện thoại là bắt buộc');
  } else if (!isValidPhone(phone)) {
    errors.push('Số điện thoại không hợp lệ');
  }

  
  if (companySize && !['STARTUP', 'SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'].includes(companySize)) {
    errors.push('Quy mô công ty không hợp lệ');
  }

  
  if (industry && industry.length > 100) {
    errors.push('Ngành nghề không được vượt quá 100 ký tự');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateAdminLogin = (data) => {
  const errors = [];
  const { username, password } = data;

  
  if (!username) {
    errors.push('Username là bắt buộc');
  } else if (username.length < 3) {
    errors.push('Username phải có ít nhất 3 ký tự');
  }

  
  if (!password) {
    errors.push('Mật khẩu là bắt buộc');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};


module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateEmail,
  validateUpdateProfile,
  validateEmployerRegister,
  validateAdminLogin
};
/**
 * Employer Validation Module
 * Validates employer registration and login data
 */

// Email validation
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email là bắt buộc' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Email không hợp lệ' };
  }
  
  return { isValid: true };
};

// Company name validation
export const validateCompanyName = (companyName) => {
  if (!companyName || companyName.trim() === '') {
    return { isValid: false, error: 'Tên công ty là bắt buộc' };
  }
  
  if (companyName.trim().length < 2) {
    return { isValid: false, error: 'Tên công ty phải có ít nhất 2 ký tự' };
  }
  
  if (companyName.length > 100) {
    return { isValid: false, error: 'Tên công ty không được vượt quá 100 ký tự' };
  }
  
  return { isValid: true };
};

// Phone validation
export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Số điện thoại là bắt buộc' };
  }
  
  // Vietnamese phone number format: 10 digits, starting with 0
  const phoneRegex = /^(0|\+84)[0-9]{9}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { isValid: false, error: 'Số điện thoại không hợp lệ (VD: 0912345678)' };
  }
  
  return { isValid: true };
};

// Password validation
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, error: 'Mật khẩu là bắt buộc' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }
  
  if (password.length > 50) {
    return { isValid: false, error: 'Mật khẩu không được vượt quá 50 ký tự' };
  }
  
  // Check for at least one letter and one number
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { isValid: false, error: 'Mật khẩu phải chứa cả chữ và số' };
  }
  
  return { isValid: true };
};

// Confirm password validation
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword || confirmPassword.trim() === '') {
    return { isValid: false, error: 'Xác nhận mật khẩu là bắt buộc' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, error: 'Mật khẩu xác nhận không khớp' };
  }
  
  return { isValid: true };
};

// Address validation
export const validateAddress = (address) => {
  if (!address || address.trim() === '') {
    return { isValid: false, error: 'Địa chỉ là bắt buộc' };
  }
  
  if (address.trim().length < 5) {
    return { isValid: false, error: 'Địa chỉ phải có ít nhất 5 ký tự' };
  }
  
  if (address.length > 200) {
    return { isValid: false, error: 'Địa chỉ không được vượt quá 200 ký tự' };
  }
  
  return { isValid: true };
};

// Company description validation (optional)
export const validateDescription = (description) => {
  if (!description || description.trim() === '') {
    return { isValid: true }; // Optional field
  }
  
  if (description.length > 1000) {
    return { isValid: false, error: 'Mô tả không được vượt quá 1000 ký tự' };
  }
  
  return { isValid: true };
};

// Website validation (optional)
export const validateWebsite = (website) => {
  if (!website || website.trim() === '') {
    return { isValid: true }; // Optional field
  }
  
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!urlRegex.test(website)) {
    return { isValid: false, error: 'Website không hợp lệ (VD: https://example.com)' };
  }
  
  return { isValid: true };
};

// Tax code validation (Vietnamese company tax code: 10 or 13 digits)
export const validateTaxCode = (taxCode) => {
  if (!taxCode || taxCode.trim() === '') {
    return { isValid: false, error: 'Mã số thuế là bắt buộc' };
  }
  
  const taxCodeRegex = /^[0-9]{10}$|^[0-9]{13}$/;
  if (!taxCodeRegex.test(taxCode)) {
    return { isValid: false, error: 'Mã số thuế không hợp lệ (10 hoặc 13 chữ số)' };
  }
  
  return { isValid: true };
};

// Full registration form validation
export const validateEmployerRegistration = (formData) => {
  const errors = {};
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  // Validate company name
  const companyNameValidation = validateCompanyName(formData.companyName);
  if (!companyNameValidation.isValid) {
    errors.companyName = companyNameValidation.error;
  }
  
  // Validate phone
  const phoneValidation = validatePhone(formData.phone);
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.error;
  }
  
  // Validate password
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
  }
  
  // Validate confirm password
  const confirmPasswordValidation = validateConfirmPassword(
    formData.password,
    formData.confirmPassword
  );
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.error;
  }
  
  // Validate address
  const addressValidation = validateAddress(formData.address);
  if (!addressValidation.isValid) {
    errors.address = addressValidation.error;
  }
  
  // Validate tax code
  const taxCodeValidation = validateTaxCode(formData.taxCode);
  if (!taxCodeValidation.isValid) {
    errors.taxCode = taxCodeValidation.error;
  }
  
  // Validate website (optional)
  if (formData.website) {
    const websiteValidation = validateWebsite(formData.website);
    if (!websiteValidation.isValid) {
      errors.website = websiteValidation.error;
    }
  }
  
  // Validate description (optional)
  if (formData.description) {
    const descriptionValidation = validateDescription(formData.description);
    if (!descriptionValidation.isValid) {
      errors.description = descriptionValidation.error;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Login form validation
export const validateEmployerLogin = (formData) => {
  const errors = {};
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
  }
  
  // Validate password
  if (!formData.password || formData.password.trim() === '') {
    errors.password = 'Mật khẩu là bắt buộc';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Export all validators as default
export default {
  validateEmail,
  validateCompanyName,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
  validateAddress,
  validateDescription,
  validateWebsite,
  validateTaxCode,
  validateEmployerRegistration,
  validateEmployerLogin
};
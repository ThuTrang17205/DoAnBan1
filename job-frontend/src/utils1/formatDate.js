/**
 * Format Date Utilities
 * Các hàm xử lý và format ngày tháng
 */

// Format date thành dạng "DD/MM/YYYY"
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Format date thành dạng "DD Tháng MM, YYYY"
export const formatDateLong = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('vi-VN', { month: 'long' });
    const year = date.getFullYear();
    
    return `${day} ${month}, ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

// Format thành dạng "5 phút trước", "3 giờ trước", "2 ngày trước"
export const formatTimeAgo = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);
    
    if (diffSeconds < 60) {
      return 'Vừa xong';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays < 30) {
      return `${diffDays} ngày trước`;
    } else if (diffMonths < 12) {
      return `${diffMonths} tháng trước`;
    } else {
      return `${diffYears} năm trước`;
    }
  } catch (error) {
    console.error('Error formatting time ago:', error);
    return 'Invalid date';
  }
};

// Kiểm tra xem job có còn mới không (trong vòng 7 ngày)
export const isNewJob = (dateString) => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    return diffDays <= 7;
  } catch (error) {
    return false;
  }
};

// Kiểm tra xem deadline còn bao lâu
export const getDaysUntilDeadline = (deadlineString) => {
  if (!deadlineString) return null;
  
  try {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffMs = deadline - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (error) {
    return null;
  }
};

// Format deadline còn bao lâu
export const formatDeadline = (deadlineString) => {
  if (!deadlineString) return 'Không xác định';
  
  const daysLeft = getDaysUntilDeadline(deadlineString);
  
  if (daysLeft === null) return 'Không xác định';
  if (daysLeft < 0) return 'Đã hết hạn';
  if (daysLeft === 0) return 'Hết hạn hôm nay';
  if (daysLeft === 1) return 'Còn 1 ngày';
  if (daysLeft <= 7) return `Còn ${daysLeft} ngày`;
  
  return formatDate(deadlineString);
};

// Format date cho input type="date" (YYYY-MM-DD)
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    return '';
  }
};

// Lấy ngày hiện tại dạng YYYY-MM-DD
export const getTodayForInput = () => {
  return formatDateForInput(new Date());
};

export default {
  formatDate,
  formatDateLong,
  formatTimeAgo,
  isNewJob,
  getDaysUntilDeadline,
  formatDeadline,
  formatDateForInput,
  getTodayForInput
};
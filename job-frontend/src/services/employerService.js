import axios from 'axios';

const API_URL = 'http://localhost:5000/api/employer';


const employerService = {
 
  register: async (employerData) => {
    try {
      const response = await axios.post(`${API_URL}/register`, employerData);
      if (response.data.token) {
        localStorage.setItem('employerToken', response.data.token);
      }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Employer registration error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng ký thất bại'
      };
    }
  },

 
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('employerToken', response.data.token);
      }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Employer login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng nhập thất bại'
      };
    }
  },

 
  logout: () => {
    localStorage.removeItem('employerToken');
    return { success: true };
  },

 
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('employerToken');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const response = await axios.get(`${API_URL}/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Token verification error:', error);
      localStorage.removeItem('employerToken');
      return {
        success: false,
        error: 'Invalid token'
      };
    }
  },

  
  getProfile: async () => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await axios.get(`${API_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tải thông tin profile'
      };
    }
  },

 
  updateProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await axios.put(
        `${API_URL}/profile`,
        profileData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating profile:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể cập nhật profile'
      };
    }
  },

  
  createJob: async (jobData) => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await axios.post(
        `${API_URL}/jobs`,
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error creating job:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tạo việc làm'
      };
    }
  },

  
  getMyJobs: async (params = {}) => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await axios.get(`${API_URL}/jobs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tải danh sách việc làm'
      };
    }
  },

  updateJob: async (jobId, jobData) => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await axios.put(
        `${API_URL}/jobs/${jobId}`,
        jobData,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating job:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể cập nhật việc làm'
      };
    }
  },

  
  deleteJob: async (jobId) => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await axios.delete(`${API_URL}/jobs/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting job:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể xóa việc làm'
      };
    }
  },

 
  getJobApplications: async (jobId) => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await axios.get(`${API_URL}/jobs/${jobId}/applications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching applications:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tải danh sách ứng viên'
      };
    }
  },

  
  updateApplicationStatus: async (applicationId, status) => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await axios.patch(
        `${API_URL}/applications/${applicationId}`,
        { status },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error updating application:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể cập nhật trạng thái ứng viên'
      };
    }
  },


  getDashboardStats: async () => {
    try {
      const token = localStorage.getItem('employerToken');
      const response = await axios.get(`${API_URL}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tải thống kê'
      };
    }
  }
};

export default employerService;
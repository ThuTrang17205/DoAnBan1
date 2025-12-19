import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';


const adminService = {
  
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
      }
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Admin login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng nhập thất bại'
      };
    }
  },

  
  logout: () => {
    localStorage.removeItem('adminToken');
    return { success: true };
  },

  
  verifyToken: async () => {
    try {
      const token = localStorage.getItem('adminToken');
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
      localStorage.removeItem('adminToken');
      return {
        success: false,
        error: 'Invalid token'
      };
    }
  },


  getDashboardStats: async () => {
    try {
      const token = localStorage.getItem('adminToken');
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
  },

  
  getAllUsers: async (params = {}) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/users`, {
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
      console.error('Error fetching users:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tải danh sách người dùng'
      };
    }
  },

 
  deleteUser: async (userId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể xóa người dùng'
      };
    }
  },

 
  getAllJobsAdmin: async (params = {}) => {
    try {
      const token = localStorage.getItem('adminToken');
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


  approveJob: async (jobId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/jobs/${jobId}/approve`,
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
      console.error('Error approving job:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể duyệt việc làm'
      };
    }
  },

  
  deleteJob: async (jobId) => {
    try {
      const token = localStorage.getItem('adminToken');
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

 
  getAllEmployers: async (params = {}) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/employers`, {
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
      console.error('Error fetching employers:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tải danh sách nhà tuyển dụng'
      };
    }
  },

  
  approveEmployer: async (employerId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.patch(
        `${API_URL}/employers/${employerId}/approve`,
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
      console.error('Error approving employer:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể duyệt nhà tuyển dụng'
      };
    }
  }
};

export default adminService;
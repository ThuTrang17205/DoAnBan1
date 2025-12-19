import api from './api';


const jobService = {
 
  getLatestJobs: async () => {
    try {
      const response = await api.get('/jobs/latest');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  
  getAllJobs: async (params = {}) => {
    try {
      const response = await api.get('/jobs', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  
  getJobById: async (id) => {
    try {
      const response = await api.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  
  searchJobs: async (searchParams) => {
    try {
      const response = await api.get('/jobs/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  
  getJobsByCategory: async (categoryId) => {
    try {
      const response = await api.get(`/jobs/category/${categoryId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default jobService;
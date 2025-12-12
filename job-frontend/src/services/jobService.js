import api from './api';

/**
 * Job API Services
 */
const jobService = {
  /**
   * Get latest jobs
   */
  getLatestJobs: async () => {
    try {
      const response = await api.get('/jobs/latest');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all jobs with filters
   */
  getAllJobs: async (params = {}) => {
    try {
      const response = await api.get('/jobs', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get job by ID
   */
  getJobById: async (id) => {
    try {
      const response = await api.get(`/jobs/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Search jobs
   */
  searchJobs: async (searchParams) => {
    try {
      const response = await api.get('/jobs/search', { params: searchParams });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get jobs by category
   */
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
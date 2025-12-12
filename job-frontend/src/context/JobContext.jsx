import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

/**
 * JobContext - Global jobs state management
 * 
 * Usage:
 * import { useJobs } from './context/JobContext';
 * 
 * const { jobs, filteredJobs, loading, fetchJobs, searchJobs } = useJobs();
 */

const JobContext = createContext(null);

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [recentViews, setRecentViews] = useState([]);

  // Filters state
  const [filters, setFilters] = useState({
    location: 'all',
    salary: 'all',
    experience: 'all',
    jobType: 'all',
    category: 'all',
    searchQuery: ''
  });

  // Sort state
  const [sortBy, setSortBy] = useState('newest');

  // Load saved jobs from localStorage on mount
  useEffect(() => {
    loadSavedJobs();
    loadRecentViews();
  }, []);

  // Apply filters when jobs or filters change
  useEffect(() => {
    applyFiltersAndSort();
  }, [jobs, filters, sortBy]);

  const loadSavedJobs = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('savedJobs') || '[]');
      setSavedJobs(saved);
    } catch (err) {
      console.error('Error loading saved jobs:', err);
    }
  };

  const loadRecentViews = () => {
    try {
      const recent = JSON.parse(localStorage.getItem('recentViews') || '[]');
      setRecentViews(recent);
    } catch (err) {
      console.error('Error loading recent views:', err);
    }
  };

 // Thay thế function fetchJobs trong JobContext.jsx

// ✅ Thay thế function fetchJobs trong JobContext.jsx

const fetchJobs = async (options = {}) => {
  try {
    setLoading(true);
    setError(null);

    let allJobs = [];
    let currentPage = 1;
    let totalPages = 1;

    // 🔄 Fetch tất cả các trang
    do {
      const params = new URLSearchParams();
      if (options.category) params.append('category', options.category);
      if (options.search) params.append('search', options.search);
      if (options.location) params.append('location', options.location);
      
      // ✅ Lấy 100 jobs mỗi lần (max allowed)
      params.append('limit', '100');
      params.append('page', currentPage);

      const url = `http://localhost:5000/api/jobs?${params.toString()}`;
      console.log(`📡 Fetching page ${currentPage}...`);
      
      const response = await axios.get(url);

      const jobsData = Array.isArray(response.data.data) 
        ? response.data.data 
        : [];
      
      allJobs = [...allJobs, ...jobsData];

      // Lấy thông tin pagination từ backend
      const pagination = response.data.pagination;
      if (pagination) {
        totalPages = pagination.totalPages || pagination.total_pages || 1;
        console.log(`📄 Page ${currentPage}/${totalPages} - Got ${jobsData.length} jobs`);
      }

      currentPage++;

      // Dừng khi không còn data hoặc đã fetch hết pages
    } while (currentPage <= totalPages && allJobs.length > 0);

    console.log("✅ Total fetched jobs:", allJobs.length);

    setJobs(allJobs);
    setFilteredJobs(allJobs);

    return { success: true, data: allJobs };

  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    setError(err.response?.data?.message || "Không thể tải danh sách việc làm");
    return { success: false };
  } finally {
    setLoading(false);
  }
};

  const getJobById = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`http://localhost:5000/api/jobs/${id}`);
      
      // Handle nested data structure if exists
      const jobData = response.data.data || response.data;
      
      // Add to recent views
      addToRecentViews(jobData);

      return { success: true, data: jobData };

    } catch (err) {
      console.error('Error fetching job:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tải thông tin việc làm';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const searchJobs = async (query) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`http://localhost:5000/api/jobs/search?q=${query}`);
      
      // Handle nested data structure
      const jobsData = response.data.data || response.data;

      setJobs(jobsData);
      setFilteredJobs(jobsData);

      return { success: true, data: jobsData };

    } catch (err) {
      console.error('Error searching jobs:', err);
      const errorMessage = err.response?.data?.message || 'Không thể tìm kiếm việc làm';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...jobs];

    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(job =>
        job.title?.toLowerCase().includes(query) ||
        job.company_name?.toLowerCase().includes(query) ||
        job.description?.toLowerCase().includes(query)
      );
    }

    // Apply location filter
    if (filters.location !== 'all') {
      result = result.filter(job =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply salary filter
    if (filters.salary !== 'all') {
      result = result.filter(job => {
        const salary = job.salary?.toLowerCase() || '';
        if (filters.salary === 'negotiate') return salary.includes('thỏa thuận');
        if (filters.salary === 'under15') return salary.includes('10') || salary.includes('15');
        if (filters.salary === '15to30') return salary.includes('15') || salary.includes('20') || salary.includes('30');
        if (filters.salary === 'over30') return parseInt(salary) >= 30;
        return true;
      });
    }

    // Apply experience filter
    if (filters.experience !== 'all') {
      result = result.filter(job =>
        job.experience?.toLowerCase().includes(filters.experience)
      );
    }

    // Apply job type filter
    if (filters.jobType !== 'all') {
      result = result.filter(job =>
        job.job_type?.toLowerCase() === filters.jobType.toLowerCase()
      );
    }

    // Apply category filter
    if (filters.category !== 'all') {
      result = result.filter(job =>
        job.category?.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Apply sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.posted_at || b.created_at) - new Date(a.posted_at || a.created_at);
      }
      if (sortBy === 'oldest') {
        return new Date(a.posted_at || a.created_at) - new Date(b.posted_at || b.created_at);
      }
      if (sortBy === 'salary_high') {
        return (b.salary || '').localeCompare(a.salary || '');
      }
      if (sortBy === 'salary_low') {
        return (a.salary || '').localeCompare(b.salary || '');
      }
      return 0;
    });

    setFilteredJobs(result);
  };

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      location: 'all',
      salary: 'all',
      experience: 'all',
      jobType: 'all',
      category: 'all',
      searchQuery: ''
    });
  };

  const updateSort = (newSort) => {
    setSortBy(newSort);
  };

  // Saved Jobs Management
  const saveJob = (job) => {
    try {
      const updated = [...savedJobs];
      const exists = updated.find(j => j.id === job.id);
      
      if (!exists) {
        updated.push({ ...job, savedAt: new Date().toISOString() });
        setSavedJobs(updated);
        localStorage.setItem('savedJobs', JSON.stringify(updated));
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error saving job:', err);
      return { success: false };
    }
  };

  const unsaveJob = (jobId) => {
    try {
      const updated = savedJobs.filter(job => job.id !== jobId);
      setSavedJobs(updated);
      localStorage.setItem('savedJobs', JSON.stringify(updated));
      return { success: true };
    } catch (err) {
      console.error('Error unsaving job:', err);
      return { success: false };
    }
  };

  const isJobSaved = (jobId) => {
    return savedJobs.some(job => job.id === jobId);
  };

  const clearSavedJobs = () => {
    setSavedJobs([]);
    localStorage.removeItem('savedJobs');
  };

  // Recent Views Management
  const addToRecentViews = (job) => {
    try {
      let updated = [...recentViews];
      
      // Remove if already exists
      updated = updated.filter(j => j.id !== job.id);
      
      // Add to beginning
      updated.unshift({ ...job, viewedAt: new Date().toISOString() });
      
      // Keep only last 10
      updated = updated.slice(0, 10);
      
      setRecentViews(updated);
      localStorage.setItem('recentViews', JSON.stringify(updated));
    } catch (err) {
      console.error('Error adding to recent views:', err);
    }
  };

  const clearRecentViews = () => {
    setRecentViews([]);
    localStorage.removeItem('recentViews');
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    jobs,
    filteredJobs,
    loading,
    error,
    savedJobs,
    recentViews,
    filters,
    sortBy,
    fetchJobs,
    getJobById,
    searchJobs,
    updateFilters,
    resetFilters,
    updateSort,
    saveJob,
    unsaveJob,
    isJobSaved,
    clearSavedJobs,
    addToRecentViews,
    clearRecentViews,
    clearError
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};

// Custom hook to use job context
export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within JobProvider');
  }
  return context;
};

export default JobContext;
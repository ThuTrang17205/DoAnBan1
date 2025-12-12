import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JobCard from './JobCard';
import JobFilters from './JobFilters';
import LoadingSpinner from '../common/LoadingSpinner';
import './JobList.css';

/**
 * JobList Component
 * Hiển thị danh sách jobs với filters và pagination
 * 
 * Usage:
 * <JobList />
 * <JobList category="IT" />
 * <JobList searchQuery="developer" />
 */

function JobList({ 
  category = null,
  searchQuery = null,
  showFilters = true,
  showHero = false,
  itemsPerPage = 12
}) {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filter states
  const [filters, setFilters] = useState({
    location: 'all',
    salary: 'all',
    experience: 'all',
    jobType: 'all',
    category: category || 'all'
  });
  
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Fetch jobs
  useEffect(() => {
    fetchJobs();
  }, [category, searchQuery]);

  // Apply filters and sort
  useEffect(() => {
    applyFiltersAndSort();
  }, [jobs, filters, sortBy]);

const fetchJobs = async (options = {}) => {
  try {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (options.category) params.append('category', options.category);
    if (options.search) params.append('search', options.search);
    if (options.location) params.append('location', options.location);

    const url = `http://localhost:5000/api/jobs${params.toString() ? '?' + params.toString() : ''}`;
    const response = await axios.get(url);

    // BACKEND TRẢ VỀ:
    // { success, message, data: [...], pagination }
    const jobsData = Array.isArray(response.data.data)
      ? response.data.data
      : [];

    console.log("Fetched jobs:", jobsData.length);

    setJobs(jobsData);
    setFilteredJobs(jobsData);

    return { success: true, data: jobsData };

  } catch (err) {
    console.error("❌ Error fetching jobs:", err);
    setError(err.response?.data?.message || "Không thể tải danh sách việc làm");
    return { success: false };
  } finally {
    setLoading(false);
  }
};


  const applyFiltersAndSort = () => {
    let result = [...jobs];

    // Apply filters
    if (filters.location !== 'all') {
      result = result.filter(job => 
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.salary !== 'all') {
      result = result.filter(job => {
        const salary = job.salary?.toLowerCase() || '';
        if (filters.salary === 'negotiate') return salary.includes('thỏa thuận');
        if (filters.salary === 'under15') return salary.includes('10') || salary.includes('12') || salary.includes('15');
        if (filters.salary === '15to30') return salary.includes('15') || salary.includes('20') || salary.includes('25') || salary.includes('30');
        if (filters.salary === 'over30') return parseInt(salary) >= 30;
        return true;
      });
    }

    if (filters.experience !== 'all') {
      result = result.filter(job =>
        job.experience?.toLowerCase().includes(filters.experience)
      );
    }

    if (filters.jobType !== 'all') {
      result = result.filter(job =>
        job.job_type?.toLowerCase() === filters.jobType.toLowerCase()
      );
    }

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
    setCurrentPage(1); // Reset về page 1 khi filter
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleResetFilters = () => {
    setFilters({
      location: 'all',
      salary: 'all',
      experience: 'all',
      jobType: 'all',
      category: category || 'all'
    });
  };

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = filteredJobs.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading state
  if (loading) {
    return (
      <div className="job-list-container">
        <LoadingSpinner text="Đang tải danh sách việc làm..." />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="job-list-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Có lỗi xảy ra</h3>
          <p>{error}</p>
          <button onClick={fetchJobs} className="retry-btn">
            🔄 Thử lại
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (filteredJobs.length === 0) {
    return (
      <div className="job-list-container">
        {showFilters && (
          <JobFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />
        )}
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>Không tìm thấy việc làm phù hợp</h3>
          <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          <button onClick={handleResetFilters} className="reset-btn">
            🔄 Xóa bộ lọc
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="job-list-container">
      {/* Header */}
      <div className="job-list-header">
        <div className="header-info">
          <h2 className="job-list-title">
            {category ? `Việc làm ${category}` : 'Danh sách việc làm'}
          </h2>
          <p className="job-count">
            Tìm thấy <strong>{filteredJobs.length}</strong> việc làm
            {category && ` trong lĩnh vực ${category}`}
          </p>
        </div>

        <div className="header-controls">
          {/* Sort */}
          <select 
            value={sortBy} 
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="salary_high">Lương cao → thấp</option>
            <option value="salary_low">Lương thấp → cao</option>
          </select>

          {/* View mode toggle */}
          <div className="view-toggle">
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Xem dạng lưới"
            >
              ⊞
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Xem dạng danh sách"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <div className="job-list-content">
        {/* Filters Sidebar */}
        {showFilters && (
          <aside className="filters-sidebar">
            <JobFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </aside>
        )}

        {/* Jobs Grid/List */}
        <main className="jobs-main">
          <div className={`jobs-${viewMode}`}>
            {currentJobs.map(job => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                // Chỉ hiển thị 5 pages xung quanh current page
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 2 && page <= currentPage + 2)
                ) {
                  return (
                    <button
                      key={page}
                      className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 3 || page === currentPage + 3) {
                  return <span key={page} className="pagination-dots">...</span>;
                }
                return null;
              })}

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Sau →
              </button>
            </div>
          )}

          {/* Results info */}
          <div className="results-info">
            Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredJobs.length)} / {filteredJobs.length} việc làm
          </div>
        </main>
      </div>
    </div>
  );
}

export default JobList;
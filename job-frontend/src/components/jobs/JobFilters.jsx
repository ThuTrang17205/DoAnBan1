import React, { useState } from 'react';
import './JobFilters.css';

/**
 * JobFilters Component
 * Bộ lọc cho danh sách jobs
 * 
 * Usage:
 * <JobFilters
 *   filters={filters}
 *   onFilterChange={handleFilterChange}
 *   onReset={handleReset}
 * />
 */

function JobFilters({ filters, onFilterChange, onReset }) {
  const [isCollapsed, setIsCollapsed] = useState({
    location: false,
    salary: false,
    experience: false,
    jobType: false,
    category: false
  });

  const toggleSection = (section) => {
    setIsCollapsed(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Filter options
  const locations = [
    { value: 'all', label: 'Tất cả địa điểm' },
    { value: 'hà nội', label: 'Hà Nội' },
    { value: 'hồ chí minh', label: 'TP. Hồ Chí Minh' },
    { value: 'đà nẵng', label: 'Đà Nẵng' },
    { value: 'hải phòng', label: 'Hải Phòng' },
    { value: 'cần thơ', label: 'Cần Thơ' }
  ];

  const salaryRanges = [
    { value: 'all', label: 'Tất cả mức lương' },
    { value: 'negotiate', label: 'Thỏa thuận' },
    { value: 'under15', label: 'Dưới 15 triệu' },
    { value: '15to30', label: '15 - 30 triệu' },
    { value: 'over30', label: 'Trên 30 triệu' }
  ];

  const experienceLevels = [
    { value: 'all', label: 'Tất cả kinh nghiệm' },
    { value: 'intern', label: 'Thực tập sinh' },
    { value: '0-1', label: '0-1 năm' },
    { value: '1-3', label: '1-3 năm' },
    { value: '3-5', label: '3-5 năm' },
    { value: '5+', label: 'Trên 5 năm' }
  ];

  const jobTypes = [
    { value: 'all', label: 'Tất cả loại hình' },
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'remote', label: 'Remote' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'contract', label: 'Contract' }
  ];

  const categories = [
    { value: 'all', label: 'Tất cả lĩnh vực' },
    { value: 'IT', label: '💻 IT - Phần mềm' },
    { value: 'marketing', label: '📱 Marketing' },
    { value: 'sales', label: '💼 Kinh doanh' },
    { value: 'design', label: '🎨 Thiết kế' },
    { value: 'finance', label: '💰 Tài chính' },
    { value: 'hr', label: '👥 Nhân sự' },
    { value: 'education', label: '📚 Giáo dục' },
    { value: 'healthcare', label: '⚕️ Y tế' }
  ];

  const handleFilterSelect = (filterType, value) => {
    onFilterChange({ [filterType]: value });
  };

  // Check if any filter is active
  const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

  return (
    <div className="job-filters">
      {/* Header */}
      <div className="filters-header">
        <h3 className="filters-title">🔍 Bộ lọc</h3>
        {hasActiveFilters && (
          <button onClick={onReset} className="reset-all-btn">
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Location Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('location')}
        >
          <span className="section-title">📍 Địa điểm</span>
          <span className={`collapse-icon ${isCollapsed.location ? 'collapsed' : ''}`}>
            ▼
          </span>
        </button>
        {!isCollapsed.location && (
          <div className="filter-options">
            {locations.map(location => (
              <label key={location.value} className="filter-option">
                <input
                  type="radio"
                  name="location"
                  value={location.value}
                  checked={filters.location === location.value}
                  onChange={() => handleFilterSelect('location', location.value)}
                />
                <span className="option-label">{location.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Salary Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('salary')}
        >
          <span className="section-title">💰 Mức lương</span>
          <span className={`collapse-icon ${isCollapsed.salary ? 'collapsed' : ''}`}>
            ▼
          </span>
        </button>
        {!isCollapsed.salary && (
          <div className="filter-options">
            {salaryRanges.map(range => (
              <label key={range.value} className="filter-option">
                <input
                  type="radio"
                  name="salary"
                  value={range.value}
                  checked={filters.salary === range.value}
                  onChange={() => handleFilterSelect('salary', range.value)}
                />
                <span className="option-label">{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Experience Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('experience')}
        >
          <span className="section-title">💼 Kinh nghiệm</span>
          <span className={`collapse-icon ${isCollapsed.experience ? 'collapsed' : ''}`}>
            ▼
          </span>
        </button>
        {!isCollapsed.experience && (
          <div className="filter-options">
            {experienceLevels.map(level => (
              <label key={level.value} className="filter-option">
                <input
                  type="radio"
                  name="experience"
                  value={level.value}
                  checked={filters.experience === level.value}
                  onChange={() => handleFilterSelect('experience', level.value)}
                />
                <span className="option-label">{level.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Job Type Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('jobType')}
        >
          <span className="section-title">⏰ Loại hình công việc</span>
          <span className={`collapse-icon ${isCollapsed.jobType ? 'collapsed' : ''}`}>
            ▼
          </span>
        </button>
        {!isCollapsed.jobType && (
          <div className="filter-options">
            {jobTypes.map(type => (
              <label key={type.value} className="filter-option">
                <input
                  type="radio"
                  name="jobType"
                  value={type.value}
                  checked={filters.jobType === type.value}
                  onChange={() => handleFilterSelect('jobType', type.value)}
                />
                <span className="option-label">{type.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="filter-section">
        <button
          className="filter-section-header"
          onClick={() => toggleSection('category')}
        >
          <span className="section-title">📁 Lĩnh vực</span>
          <span className={`collapse-icon ${isCollapsed.category ? 'collapsed' : ''}`}>
            ▼
          </span>
        </button>
        {!isCollapsed.category && (
          <div className="filter-options">
            {categories.map(cat => (
              <label key={cat.value} className="filter-option">
                <input
                  type="radio"
                  name="category"
                  value={cat.value}
                  checked={filters.category === cat.value}
                  onChange={() => handleFilterSelect('category', cat.value)}
                />
                <span className="option-label">{cat.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="active-filters">
          <div className="active-filters-title">Đang lọc:</div>
          <div className="active-filters-tags">
            {Object.entries(filters).map(([key, value]) => {
              if (value === 'all') return null;

              let label = value;
              // Get readable label from options
              const optionMap = {
                location: locations,
                salary: salaryRanges,
                experience: experienceLevels,
                jobType: jobTypes,
                category: categories
              };
              const option = optionMap[key]?.find(opt => opt.value === value);
              if (option) label = option.label;

              return (
                <span key={key} className="active-tag">
                  {label}
                  <button
                    onClick={() => handleFilterSelect(key, 'all')}
                    className="tag-remove"
                  >
                    ×
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default JobFilters;
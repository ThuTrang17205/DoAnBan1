import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import JobCard from '../../components/jobs/JobCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function JobListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { 
    filteredJobs, 
    loading, 
    fetchJobs, 
    updateFilters,
    filters,
    resetFilters 
  } = useJobs();

  const [localSearch, setLocalSearch] = useState('');
  const [localLocation, setLocalLocation] = useState('');

  useEffect(() => {
    const loadAndFilter = async () => {
   
      const queryParam = searchParams.get('q') || '';
      const locationParam = searchParams.get('location') || '';
      const categoryParam = searchParams.get('category') || '';

      console.log(' URL Params:', { queryParam, locationParam, categoryParam });

      
      setLocalSearch(queryParam);
      setLocalLocation(locationParam);

      
      await fetchJobs();

      
      const filterUpdate = {
        searchQuery: queryParam,
        location: locationParam || 'all'
      };

      
      if (categoryParam) {
        
        const categoryMap = {
          'IT - Phần mềm': 'Công nghệ thông tin',
          'Marketing': 'Marketing - Truyền thông',
          'Kinh doanh': 'Kinh doanh - Bán hàng',
          'Thiết kế': 'Thiết kế - Đồ hoạ',
          'Tài chính': 'Kế toán - Tài chính - Ngân hàng',
          'Nhân sự': 'Nhân sự - Hành chính',
          'Giáo dục': 'Giáo dục - Đào tạo',
          'Y tế': 'Y tế'
        };

        const mappedCategory = categoryMap[categoryParam] || categoryParam;
        filterUpdate.category = mappedCategory;
        
        console.log(' Mapped category:', categoryParam, '→', mappedCategory);
      } else {
        filterUpdate.category = 'all';
      }

      updateFilters(filterUpdate);
    };

    loadAndFilter();
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    
    const params = new URLSearchParams();
    if (localSearch) params.append('q', localSearch);
    if (localLocation) params.append('location', localLocation);
    
    navigate(`/jobs?${params.toString()}`);
  };

  const handleFilterChange = (filterType, value) => {
    updateFilters({ [filterType]: value });
  };

  const handleResetFilters = () => {
    setLocalSearch('');
    setLocalLocation('');
    navigate('/jobs');
    resetFilters();
  };

  return (
    <div className="job-list-page">
      {}
      <section className="search-hero" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '60px 20px',
        color: 'white'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '10px', fontSize: '36px' }}>
            Tìm việc làm, Tuyển dụng hiệu quả
          </h1>
          <p style={{ marginBottom: '30px', opacity: 0.9 }}>
            {filteredJobs.length} việc làm phù hợp với bạn
          </p>

          {}
          <form onSubmit={handleSearch} style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '50px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <input
              type="text"
              placeholder="Vị trí tuyển dụng, tên công ty"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              style={{
                flex: 2,
                padding: '15px 25px',
                border: 'none',
                borderRadius: '25px',
                fontSize: '16px',
                outline: 'none',
                color: '#333'
              }}
            />
            <input
              type="text"
              placeholder="Địa điểm"
              value={localLocation}
              onChange={(e) => setLocalLocation(e.target.value)}
              style={{
                flex: 1,
                padding: '15px 25px',
                border: 'none',
                borderRadius: '25px',
                fontSize: '16px',
                outline: 'none',
                color: '#333'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '15px 40px',
                backgroundColor: '#5a67d8',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#4c51bf'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#5a67d8'}
            >
               Tìm kiếm
            </button>
          </form>
        </div>
      </section>

      {/* Filters & Results Section */}
      <section className="jobs-content" style={{ padding: '40px 20px' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* Active Filters */}
          {(filters.searchQuery || filters.location !== 'all' || filters.category !== 'all') && (
            <div style={{
              padding: '15px',
              backgroundColor: '#f7fafc',
              borderRadius: '10px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}>
              <span style={{ fontWeight: 'bold', color: '#4a5568' }}>Đang lọc:</span>
              
              {filters.searchQuery && (
                <span style={{
                  padding: '5px 15px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  "{filters.searchQuery}"
                </span>
              )}
              
              {filters.location !== 'all' && (
                <span style={{
                  padding: '5px 15px',
                  backgroundColor: '#48bb78',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  📍 {filters.location}
                </span>
              )}

              {filters.category !== 'all' && (
                <span style={{
                  padding: '5px 15px',
                  backgroundColor: '#ed8936',
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                   {filters.category}
                </span>
              )}
              
              <button
                onClick={handleResetFilters}
                style={{
                  padding: '5px 15px',
                  backgroundColor: '#fc8181',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginLeft: 'auto'
                }}
              >
                Xóa bộ lọc
              </button>
            </div>
          )}

          {/* Filter Sidebar & Jobs Grid */}
          <div style={{ display: 'flex', gap: '30px' }}>
            
            {/* Sidebar Filters */}
            <aside style={{
              width: '280px',
              flexShrink: 0
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                position: 'sticky',
                top: '20px'
              }}>
                <h3 style={{ marginBottom: '20px' }}>Bộ lọc</h3>

                {/* Location Filter */}
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    Địa điểm
                  </label>
                  <select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    Ngành nghề
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="Marketing - Truyền thông">Marketing</option>
                    <option value="Kinh doanh - Bán hàng">Kinh doanh</option>
                    <option value="Thiết kế - Đồ hoạ">Thiết kế</option>
                    <option value="Kế toán - Tài chính - Ngân hàng">Tài chính</option>
                    <option value="Nhân sự - Hành chính">Nhân sự</option>
                    <option value="Giáo dục - Đào tạo">Giáo dục</option>
                  </select>
                </div>

                {/* Salary Filter */}
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    Mức lương
                  </label>
                  <select
                    value={filters.salary}
                    onChange={(e) => handleFilterChange('salary', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="negotiate">Thỏa thuận</option>
                    <option value="under15">Dưới 15 triệu</option>
                    <option value="15to30">15-30 triệu</option>
                    <option value="over30">Trên 30 triệu</option>
                  </select>
                </div>

                {/* Experience Filter */}
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                    Kinh nghiệm
                  </label>
                  <select
                    value={filters.experience}
                    onChange={(e) => handleFilterChange('experience', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="fresher">Fresher</option>
                    <option value="junior">Junior (1-2 năm)</option>
                    <option value="middle">Middle (3-5 năm)</option>
                    <option value="senior">Senior (5+ năm)</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* Jobs Grid */}
            <div style={{ flex: 1 }}>
              {loading ? (
                <LoadingSpinner text="Đang tải việc làm..." />
              ) : filteredJobs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 20px',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>😔</div>
                  <h3 style={{ marginBottom: '10px', color: '#2d3748' }}>
                    Không tìm thấy việc làm phù hợp
                  </h3>
                  <p style={{ color: '#718096', marginBottom: '20px' }}>
                    Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
                  </p>
                  <button
                    onClick={handleResetFilters}
                    style={{
                      padding: '12px 30px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px'
                    }}
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '20px'
                }}>
                  {filteredJobs.map(job => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default JobListPage;
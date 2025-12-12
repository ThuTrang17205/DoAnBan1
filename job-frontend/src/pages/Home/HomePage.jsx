import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../../context/JobContext';
import JobCard from '../../components/jobs/JobCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Briefcase, Building2, Users, Star } from 'lucide-react';
import './HomePage.css';

/**
 * HomePage Component
 * Trang chủ với hero section, search, statistics, categories, và trending jobs
 */

function HomePage() {
  const navigate = useNavigate();
  const { fetchJobs, filteredJobs, loading, error } = useJobs();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [trendingJobs, setTrendingJobs] = useState([]);
  
  // Statistics state
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalCompanies: 0,
    totalCandidates: 0,
    satisfactionRate: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Fetch statistics from API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/statistics');
        
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        
        const data = await response.json();
        
        setStats({
          totalJobs: data.totalJobs || 0,
          totalCompanies: data.totalCompanies || 0,
          totalCandidates: data.totalCandidates || 0,
          satisfactionRate: data.satisfactionRate || 0
        });
        setStatsLoading(false);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Fallback to 0 if API fails
        setStats({
          totalJobs: 0,
          totalCompanies: 0,
          totalCandidates: 0,
          satisfactionRate: 0
        });
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    console.log(' HomePage mounted, loading jobs...');
    loadJobs();
  }, []);

  const loadJobs = async () => {
    console.log(' Calling fetchJobs...');
    const result = await fetchJobs();
    console.log(' fetchJobs result:', result);
    
    if (result.success) {
      console.log(' Jobs loaded successfully:', result.data.length, 'jobs');
    } else {
      console.error(' Failed to load jobs:', result.error);
    }
  };

  useEffect(() => {
    console.log(' filteredJobs updated:', filteredJobs.length, 'jobs');
    
    if (filteredJobs.length > 0) {
      const trending = filteredJobs.slice(0, 6);
      console.log(' Setting trending jobs:', trending.length);
      setTrendingJobs(trending);
    } else {
      console.warn(' No filtered jobs available');
    }
  }, [filteredJobs]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchQuery) params.append('q', searchQuery);
    if (searchLocation) params.append('location', searchLocation);
    
    navigate(`/jobs?${params.toString()}`);
  };

  const popularSearches = [
    'Frontend Developer',
    'Backend Developer',
    'Marketing Manager',
    'UI/UX Designer',
    'Data Analyst',
    'Project Manager'
  ];

  const categories = [
    { name: 'IT - Phần mềm', count: 1250, color: '#667eea' },
    { name: 'Marketing', count: 890, color: '#f093fb' },
    { name: 'Kinh doanh', count: 756, color: '#4facfe' },
    { name: 'Thiết kế', count: 543, color: '#fa709a' },
    { name: 'Tài chính', count: 432, color: '#30cfd0' },
    { name: 'Nhân sự', count: 321, color: '#a8edea' },
    { name: 'Giáo dục', count: 298, color: '#fbc2eb' },
    { name: 'Y tế', count: 267, color: '#92fe9d' }
  ];

  // Statistics display with real data
  const statsDisplay = [
    {
      icon: <Briefcase className="stat-icon-lucide" />,
      value: statsLoading ? '...' : `${stats.totalJobs.toLocaleString()}+`,
      label: "Việc làm",
      bgColor: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    {
      icon: <Building2 className="stat-icon-lucide" />,
      value: statsLoading ? '...' : `${stats.totalCompanies.toLocaleString()}+`,
      label: "Công ty",
      bgColor: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
    },
    {
      icon: <Users className="stat-icon-lucide" />,
      value: statsLoading ? '...' : `${stats.totalCandidates.toLocaleString()}+`,
      label: "Ứng viên",
      bgColor: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
    },
    {
      icon: <Star className="stat-icon-lucide" />,
      value: statsLoading ? '...' : `${stats.satisfactionRate}%`,
      label: "Hài lòng",
      bgColor: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)"
    }
  ];

  useEffect(() => {
    if (error) {
      console.error(' Error from JobContext:', error);
    }
  }, [error]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Tìm công việc <span className="highlight">mơ ước</span> của bạn
            </h1>
            <p className="hero-subtitle">
              Hơn 10,000+ việc làm từ các công ty hàng đầu đang chờ đón bạn
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="hero-search">
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Vị trí, công ty, kỹ năng..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="search-input-wrapper">
                <span className="search-icon">📍</span>
                <input
                  type="text"
                  placeholder="Địa điểm"
                  className="search-input"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <button type="submit" className="search-button">
                Tìm kiếm
              </button>
            </form>

            {/* Popular Searches */}
            <div className="popular-searches">
              <span className="popular-label">Phổ biến:</span>
              {popularSearches.map((search, index) => (
                <button
                  key={index}
                  className="popular-tag"
                  onClick={() => {
                    setSearchQuery(search);
                    navigate(`/jobs?q=${search}`);
                  }}
                >
                  {search}
                </button>
              ))}
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="hero-image">
            <div className="hero-illustration">
              <div className="floating-card card-1">
                <span>Frontend Dev</span>
              </div>
              <div className="floating-card card-2">
                <span>UI Designer</span>
              </div>
              <div className="floating-card card-3">
                <span>Marketing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - REAL DATA */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {statsDisplay.map((stat, index) => (
              <div 
                key={index} 
                className="stat-card"
                style={{ background: stat.bgColor }}
              >
                <div className="stat-icon">{stat.icon}</div>
                <div className={`stat-value ${statsLoading ? 'stat-loading' : ''}`}>
                  {stat.value}
                </div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Khám phá theo ngành nghề</h2>
            <p className="section-subtitle">
              Tìm công việc phù hợp với chuyên môn của bạn
            </p>
          </div>

          <div className="categories-grid">
            {categories.map((category, index) => (
              <div
                key={index}
                className="category-card"
                onClick={() => navigate(`/jobs?category=${category.name}`)}
                style={{ '--category-color': category.color }}
              >
                <div className="category-icon">{category.icon}</div>
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-count">{category.count} việc làm</p>
                </div>
                <div className="category-arrow">→</div>
              </div>
            ))}
          </div>

          <div className="section-action">
            <button
              className="btn-secondary"
              onClick={() => navigate('/jobs')}
            >
              Xem tất cả ngành nghề
            </button>
          </div>
        </div>
      </section>

      {/* Trending Jobs Section */}
      <section className="trending-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Việc làm nổi bật</h2>
            <p className="section-subtitle">
              Những cơ hội việc làm được quan tâm nhất
            </p>
          </div>

          {error && (
            <div style={{
              padding: '20px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              color: '#c00',
              marginBottom: '20px'
            }}>
               Lỗi: {error}
            </div>
          )}

          {loading ? (
            <div style={{ padding: '40px 0' }}>
              <LoadingSpinner text="Đang tải việc làm..." />
            </div>
          ) : trendingJobs.length > 0 ? (
            <>
              <div className="jobs-grid">
                {trendingJobs.map(job => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              <div className="section-action">
                <button
                  className="btn-primary"
                  onClick={() => navigate('/jobs')}
                >
                  Xem tất cả việc làm 
                </button>
              </div>
            </>
          ) : (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              color: '#666'
            }}>
              <p> Không có việc làm nào được tải về</p>
              <button 
                onClick={loadJobs}
                style={{
                  marginTop: '20px',
                  padding: '10px 20px',
                  background: '#667eea',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                 Thử lại
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Cách thức hoạt động</h2>
            <p className="section-subtitle">
              3 bước đơn giản để tìm việc làm mơ ước
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 className="step-title">Tìm kiếm việc làm</h3>
              <p className="step-description">
                Duyệt qua hàng ngàn việc làm từ các công ty uy tín
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3 className="step-title">Nộp đơn ứng tuyển</h3>
              <p className="step-description">
                Gửi CV và thư xin việc trực tiếp cho nhà tuyển dụng
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3 className="step-title">Nhận việc mơ ước</h3>
              <p className="step-description">
                Chuẩn bị cho hành trình sự nghiệp mới của bạn
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">Sẵn sàng bắt đầu hành trình mới?</h2>
            <p className="cta-subtitle">
              Tạo tài khoản ngay hôm nay và khám phá hàng ngàn cơ hội việc làm
            </p>
            <div className="cta-buttons">
              <button
                className="btn-primary large"
                onClick={() => navigate('/register')}
              >
                Đăng ký ngay
              </button>
              <button
                className="btn-secondary large"
                onClick={() => navigate('/jobs')}
              >
                Xem việc làm
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
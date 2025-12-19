import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './EmployerDashboard.css';

export default function EmployerDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/employer-login';
        return;
      }

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      }

      
      try {
        const profileResponse = await fetch('http://localhost:5000/api/employers/me/profile', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success && profileData.employer) {
            setUser(profileData.employer);
            setEmployer(profileData.employer.profile);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }

      
      try {
        const jobsResponse = await fetch('http://localhost:5000/api/employers/me/jobs', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          const jobsList = jobsData.jobs || jobsData.data || [];
          setJobs(jobsList);

         
          try {
            const appsResponse = await fetch('http://localhost:5000 /api/employers/me/applications', {
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (appsResponse.ok) {
              const appsData = await appsResponse.json();
              const appsList = appsData.applications || appsData.data || [];
              setApplications(appsList);

             
              calculateStats(jobsList, appsList);
            }
          } catch (error) {
            console.error('Error fetching applications:', error);
            calculateStats(jobsList, []);
          }
        } else {
          setJobs([]);
          calculateStats([], []);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setJobs([]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const calculateStats = (jobsList, appsList) => {
    const totalJobs = jobsList.length;
    const activeJobs = jobsList.filter(j => j.status === 'open' || j.status === 'active').length;
    const totalApplications = appsList.length;
    const pendingApplications = appsList.filter(a => a.status === 'pending').length;
    const approvedApplications = appsList.filter(a => a.status === 'approved' || a.status === 'accepted').length;
    const rejectedApplications = appsList.filter(a => a.status === 'rejected').length;
    const totalViews = jobsList.reduce((sum, job) => sum + (job.views || 0), 0);

    setStats({
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalViews
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    window.location.href = '/employer';
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <div>Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="employer-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Job Portal - Nhà tuyển dụng</h1>
          <p className="company-name">
            {employer?.company || user?.company_name || user?.companyName || 'Công ty'}
          </p>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-name">
              {user?.name || user?.contact_person || user?.contactPerson || 'Employer'}
            </div>
            <div className="user-email">{user?.email}</div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <div className="dashboard-container">
        {/* Stats Cards */}
        <div className="stats-grid">
          <StatCard
          
            title="Tổng số tin tuyển dụng"
            value={stats.totalJobs}
            color="#2563eb"
            subtitle={`Đang tuyển: ${stats.activeJobs}`}
          />
          <StatCard
           
            title="Tin đang tuyển"
            value={stats.activeJobs}
            color="#10b981"
            subtitle={`${stats.totalJobs > 0 ? Math.round((stats.activeJobs / stats.totalJobs) * 100) : 0}% tổng số`}
          />
          <StatCard
           
            title="Tổng ứng viên"
            value={stats.totalApplications}
            color="#f59e0b"
            subtitle={`TB: ${stats.totalJobs > 0 ? (stats.totalApplications / stats.totalJobs).toFixed(1) : 0}/tin`}
          />
          <StatCard
            icon="⏳"
            title="Chờ xét duyệt"
            value={stats.pendingApplications}
            color="#8b5cf6"
            subtitle={`${stats.totalApplications > 0 ? Math.round((stats.pendingApplications / stats.totalApplications) * 100) : 0}% tổng số`}
          />
        </div>

        {/* Tabs */}
        <div className="dashboard-tabs">
          <div className="tabs-header">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            >
               Tổng quan
            </TabButton>
            <TabButton
              active={activeTab === 'statistics'}
              onClick={() => setActiveTab('statistics')}
            >
               Thống kê
            </TabButton>
            <TabButton
              active={activeTab === 'jobs'}
              onClick={() => setActiveTab('jobs')}
            >
               Công việc đã đăng
            </TabButton>
          
            <TabButton
              active={activeTab === 'company'}
              onClick={() => setActiveTab('company')}
            >
               Thông tin công ty
            </TabButton>
          </div>

          <div className="tabs-content">
            {activeTab === 'overview' && (
              <OverviewTab jobs={jobs} stats={stats} navigate={navigate} />
            )}
            {activeTab === 'statistics' && (
              <StatisticsTab jobs={jobs} applications={applications} stats={stats} />
            )}
            {activeTab === 'jobs' && (
              <JobsTab jobs={jobs} onRefresh={fetchDashboardData} navigate={navigate} />
            )}
            {activeTab === 'company' && (
              <CompanyTab user={user} employer={employer} navigate={navigate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color, subtitle }) {
  return (
    <div className="stat-card" style={{ borderLeftColor: color }}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-title">{title}</div>
        <div className="stat-value" style={{ color }}>{value}</div>
        {subtitle && <div className="stat-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`tab-button ${active ? 'active' : ''}`}
    >
      {children}
    </button>
  );
}

function OverviewTab({ jobs, stats, navigate }) {
  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="overview-tab">
      <h2>Tổng quan hoạt động</h2>
      
      <div className="quick-stats">
        <h3> Thống kê nhanh</h3>
        <div className="quick-stats-grid">
          <div className="quick-stat-item">
            <span className="label">Tỷ lệ tin đang tuyển:</span>
            <strong className="value green">
              {stats.totalJobs > 0 ? Math.round((stats.activeJobs / stats.totalJobs) * 100) : 0}%
            </strong>
          </div>
          <div className="quick-stat-item">
            <span className="label">TB ứng viên/tin:</span>
            <strong className="value orange">
              {stats.totalJobs > 0 ? (stats.totalApplications / stats.totalJobs).toFixed(1) : 0}
            </strong>
          </div>
        </div>
      </div>

      <h3> Tin tuyển dụng gần đây</h3>
      {recentJobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"></div>
          <p>Chưa có tin tuyển dụng nào</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/employer/jobs/create')}
          >
            Đăng tin ngay
          </button>
        </div>
      ) : (
        <div className="jobs-list">
          {recentJobs.map(job => (
            <JobCard key={job.id} job={job} compact navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatisticsTab({ jobs, applications, stats }) {
  // Tính toán thống kê chi tiết
  const jobStats = jobs.map(job => ({
    name: job.title,
    applications: applications.filter(a => a.job_id === job.id).length,
    views: job.views || 0
  })).sort((a, b) => b.applications - a.applications).slice(0, 10);

  const maxApplications = Math.max(...jobStats.map(j => j.applications), 1);
  const maxViews = Math.max(...jobStats.map(j => j.views), 1);

  // Xu hướng 7 ngày
  const last7Days = getLast7DaysTrend(applications);
  const maxTrendValue = Math.max(...last7Days.map(d => d.count), 1);

  // Phân bố trạng thái
  const statusData = [
    { label: 'Chờ xét duyệt', value: stats.pendingApplications, color: '#8b5cf6' },
    { label: 'Đã chấp nhận', value: stats.approvedApplications, color: '#10b981' },
    { label: 'Đã từ chối', value: stats.rejectedApplications, color: '#ef4444' }
  ];

  const totalStatus = statusData.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="statistics-tab">
      <h2> Thống kê chi tiết</h2>

      {/* Extended Stats Cards */}
      <div className="extended-stats">
        <div className="extended-stat-card">
          <div className="stat-header">
            <span className="stat-label">Đã chấp nhận</span>
          </div>
          <div className="stat-number">{stats.approvedApplications}</div>
          <div className="stat-percentage">
            {stats.totalApplications > 0 
              ? `${Math.round((stats.approvedApplications / stats.totalApplications) * 100)}% tổng số`
              : '0%'}
          </div>
        </div>

        <div className="extended-stat-card">
          <div className="stat-header">
            <span className="stat-label">Đã từ chối</span>
          </div>
          <div className="stat-number">{stats.rejectedApplications}</div>
          <div className="stat-percentage">
            {stats.totalApplications > 0 
              ? `${Math.round((stats.rejectedApplications / stats.totalApplications) * 100)}% tổng số`
              : '0%'}
          </div>
        </div>

        <div className="extended-stat-card">
          <div className="stat-header">
            <span className="stat-label">Tổng lượt xem</span>
          </div>
          <div className="stat-number">{stats.totalViews}</div>
          <div className="stat-percentage">
            TB: {stats.totalJobs > 0 ? Math.round(stats.totalViews / stats.totalJobs) : 0} lượt/tin
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="chart-section">
        <h3> Xu hướng ứng tuyển (7 ngày gần nhất)</h3>
        <div className="line-chart">
          {last7Days.map((day, index) => (
            <div key={index} className="chart-bar">
              <div 
                className="bar-fill"
                style={{ 
                  height: `${(day.count / maxTrendValue) * 100}%`,
                  background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)'
                }}
              >
                <span className="bar-value">{day.count}</span>
              </div>
              <div className="bar-label">{day.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Jobs */}
      <div className="chart-section">
        <h3> Top 10 công việc có nhiều ứng viên nhất</h3>
        <div className="horizontal-chart">
          {jobStats.map((job, index) => (
            <div key={index} className="chart-row">
              <div className="chart-row-label">
                <span className="rank">#{index + 1}</span>
                <span className="job-name" title={job.name}>
                  {job.name.length > 30 ? job.name.substring(0, 30) + '...' : job.name}
                </span>
              </div>
              <div className="chart-row-bars">
                <div className="bar-container">
                  <div 
                    className="bar-fill applications"
                    style={{ width: `${(job.applications / maxApplications) * 100}%` }}
                  >
                    <span className="bar-text">{job.applications} ứng viên</span>
                  </div>
                </div>
                <div className="bar-container">
                  <div 
                    className="bar-fill views"
                    style={{ width: `${(job.views / maxViews) * 100}%` }}
                  >
                    <span className="bar-text">{job.views} lượt xem</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status Distribution */}
      {totalStatus > 0 && (
        <div className="chart-section">
          <h3> Phân bố trạng thái hồ sơ</h3>
          <div className="donut-chart">
            <div className="donut-segments">
              {statusData.map((item, index) => (
                <div 
                  key={index}
                  className="donut-segment"
                  style={{ 
                    width: `${(item.value / totalStatus) * 100}%`,
                    background: item.color
                  }}
                />
              ))}
            </div>
            <div className="donut-legend">
              {statusData.map((item, index) => (
                <div key={index} className="legend-item">
                  <span 
                    className="legend-color"
                    style={{ background: item.color }}
                  />
                  <span className="legend-label">{item.label}</span>
                  <span className="legend-value">
                    {item.value} ({Math.round((item.value / totalStatus) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Insights */}
      <div className="insights-section">
        <h3> Nhận xét & Đề xuất</h3>
        <div className="insights-grid">
          {stats.totalApplications / stats.totalJobs < 5 && stats.totalJobs > 0 && (
            <div className="insight-card warning">
          
              <div>
                <h4>Số lượng ứng viên thấp</h4>
                <p>Trung bình mỗi tin chỉ có {(stats.totalApplications / stats.totalJobs).toFixed(1)} ứng viên. Hãy cải thiện mô tả công việc và mức lương để thu hút thêm ứng viên.</p>
              </div>
            </div>
          )}

          {stats.pendingApplications > stats.totalApplications * 0.5 && stats.totalApplications > 0 && (
            <div className="insight-card info">
              <div>
                <h4>Nhiều hồ sơ chờ xét duyệt</h4>
                <p>Có {stats.pendingApplications} hồ sơ đang chờ. Hãy xem xét sớm để không bỏ lỡ ứng viên tiềm năng!</p>
              </div>
            </div>
          )}

          {stats.activeJobs === 0 && stats.totalJobs > 0 && (
            <div className="insight-card danger">
        
              <div>
                <h4>Không có tin tuyển dụng hoạt động</h4>
                <p>Hiện tại bạn không có tin tuyển dụng nào đang hoạt động. Hãy đăng tin mới để tiếp tục tuyển dụng!</p>
              </div>
            </div>
          )}

          {stats.approvedApplications / stats.totalApplications > 0.7 && stats.totalApplications > 10 && (
            <div className="insight-card success">
            
              <div>
                <h4>Tỷ lệ chấp nhận cao</h4>
                <p>Tuyệt vời! Bạn đang chấp nhận {Math.round((stats.approvedApplications / stats.totalApplications) * 100)}% ứng viên. Tiếp tục duy trì chất lượng tuyển dụng!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getLast7DaysTrend(applications) {
  const today = new Date();
  const last7Days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const count = applications.filter(app => {
      const appDate = new Date(app.created_at).toISOString().split('T')[0];
      return appDate === dateStr;
    }).length;

    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][date.getDay()];
    last7Days.push({
      label: `${dayName} ${date.getDate()}/${date.getMonth() + 1}`,
      count
    });
  }

  return last7Days;
}

function JobsTab({ jobs, onRefresh, navigate }) {
  const [filter, setFilter] = useState('all');

  const filteredJobs = jobs.filter(job => {
    if (filter === 'all') return true;
    if (filter === 'open') return job.status === 'open' || job.status === 'active';
    return job.status === filter;
  });

  return (
    <div className="jobs-tab">
      <div className="jobs-header">
        <h2>Quản lý tin tuyển dụng</h2>
        <button 
          className="btn-primary"
          onClick={() => navigate('/employer/jobs/create')}
        >
          + Đăng tin mới
        </button>
      </div>

      <div className="filter-buttons">
        <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
          Tất cả ({jobs.length})
        </FilterButton>
        <FilterButton active={filter === 'open'} onClick={() => setFilter('open')}>
          Đang tuyển ({jobs.filter(j => j.status === 'open' || j.status === 'active').length})
        </FilterButton>
        <FilterButton active={filter === 'closed'} onClick={() => setFilter('closed')}>
          Đã đóng ({jobs.filter(j => j.status === 'closed').length})
        </FilterButton>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="empty-state">Không có tin tuyển dụng nào</div>
      ) : (
        <div className="jobs-list">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} onRefresh={onRefresh} navigate={navigate} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ job, compact, onRefresh, navigate }) {
  return (
    <div className="job-card">
      <div className="job-card-content">
        <div className="job-details">
          <h3>{job.title}</h3>
          <div className="job-meta">
            <span>📍 {job.location}</span>
            <span> {job.min_salary && job.max_salary ? `${job.min_salary}-${job.max_salary} ${job.currency || 'VND'}` : 'Thỏa thuận'}</span>
            <span> {job.applicationCount || job.application_count || 0} ứng viên</span>
          </div>
          {!compact && job.category && (
            <span className="job-category">{job.category}</span>
          )}
        </div>
        <div className="job-status">
          <span className={`status-badge ${(job.status === 'open' || job.status === 'active') ? 'active' : 'closed'}`}>
            {(job.status === 'open' || job.status === 'active') ? '✅ Đang tuyển' : '❌ Đã đóng'}
          </span>
        </div>
      </div>
      {!compact && (
        <div className="job-actions">
          <button 
            className="btn-primary-outline"
            onClick={() => navigate('/employer/applications')}
          >
            Xem ứng viên
          </button>
          <button 
            className="btn-secondary-outline"
            onClick={() => navigate(`/employer/jobs/${job.id}/edit`)}
          >
            Chỉnh sửa
          </button>
        </div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`filter-button ${active ? 'active' : ''}`}
    >
      {children}
    </button>
  );
}

function CompanyTab({ user, employer, navigate }) {
  return (
    <div className="company-tab">
      <h2>Thông tin công ty</h2>
      
      <div className="info-grid">
        <InfoField label="Tên công ty" value={employer?.company || user?.company_name || user?.companyName} />
        <InfoField label="Người liên hệ" value={user?.contact_person || user?.contactPerson} />
        <InfoField label="Email" value={user?.email} />
        <InfoField label="Số điện thoại" value={user?.phone} />
        <InfoField label="Quy mô" value={user?.company_size || user?.companySize} />
        <InfoField label="Ngành nghề" value={user?.industry} />
      </div>

      {employer?.description && (
        <div className="company-description">
          <h3>Mô tả công ty</h3>
          <div className="description-box">
            {employer.description}
          </div>
        </div>
      )}

      <button 
        className="btn-primary"
        onClick={() => navigate('/employer/profile')}
      >
         Chỉnh sửa thông tin
      </button>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div className="info-field">
      <div className="info-label">{label}</div>
      <div className="info-value">{value || '-'}</div>
    </div>
  );
}
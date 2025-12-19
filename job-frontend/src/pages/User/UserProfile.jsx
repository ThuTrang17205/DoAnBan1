import React, { useState, useEffect } from 'react';
import './UserProfile.css';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState('jobs');
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);

  useEffect(() => {
    fetchUserData();
    loadJobStats();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log(' No token found, redirecting to login...');
        window.location.href = '/login';
        return;
      }

      console.log(' Fetching user data from API...');
      const response = await fetch('http://localhost:5000/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(' User data received:', JSON.stringify(data, null, 2));
        
        const userData = data.user || data;
        
        setUser({
          id: userData.id,
          name: userData.name || userData.username || userData.email?.split('@')[0] || 'User',
          email: userData.email,
          username: userData.username,
          avatar: userData.avatar_url || 'https://www.topcv.vn/images/avatar-default.jpg',
          verified: true,
          isPro: false,
          cvCount: 2
        });
      } else if (response.status === 401 || response.status === 403) {
        console.log(' Token invalid, clearing and redirecting...');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } catch (error) {
      console.error(' Error fetching user data:', error);
    }
  };

  const loadJobStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/jobs/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setSavedJobsCount(data.saved || 0);
        setAppliedJobsCount(data.applied || 0);
        console.log(' Job stats loaded from API:', data);
      } else {
        console.log(' Stats API returned:', response.status);
        setSavedJobsCount(0);
        setAppliedJobsCount(0);
      }
    } catch (error) {
      console.error(' Error loading job stats:', error);
      setSavedJobsCount(0);
      setAppliedJobsCount(0);
    }
  };

  const handleLogout = () => {
    console.log(' Logging out...');
    localStorage.removeItem('token');
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!user) return <div className="loading">Đang tải...</div>;

  return (
    <div className="profile-container">
      <aside className="profile-sidebar">
        <div className="user-card">
          <div className="avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <span className="avatar-icon"></span>
            )}
          </div>
          <h2>{user.name}</h2>
          <p className="user-status">Tài khoản đã xác thực</p>
          <p className="user-id">ID: {user.id}</p>
          <p className="user-email">{user.email}</p>
          {user.username && <p className="user-username">@{user.username}</p>}
        </div>

        <nav className="profile-menu">
          <button className={`menu-item ${activeSection === 'jobs' ? 'active' : ''}`} onClick={() => setActiveSection('jobs')}>
            <span> Quản lý tìm việc</span>
            <span className="arrow">›</span>
          </button>
          <button className={`menu-item ${activeSection === 'cv' ? 'active' : ''}`} onClick={() => setActiveSection('cv')}>
            <span> Quản lý CV & Cover letter</span>
            <span className="arrow">›</span>
          </button>
          <button className={`menu-item ${activeSection === 'email' ? 'active' : ''}`} onClick={() => setActiveSection('email')}>
            <span> Cài đặt email & thông báo</span>
            <span className="arrow">›</span>
          </button>
          <button className={`menu-item ${activeSection === 'security' ? 'active' : ''}`} onClick={() => setActiveSection('security')}>
            <span> Cá nhân & Bảo mật</span>
            <span className="arrow">›</span>
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}> Đăng xuất</button>
      </aside>

      <main className="profile-content">
        {activeSection === 'jobs' && <JobsSection savedJobsCount={savedJobsCount} appliedJobsCount={appliedJobsCount} onRefresh={loadJobStats} />}
        {activeSection === 'cv' && <CVSection user={user} />}
        {activeSection === 'email' && <EmailSection />}
        {activeSection === 'security' && <SecuritySection user={user} />}
      </main>
    </div>
  );
}

function JobsSection({ savedJobsCount, appliedJobsCount, onRefresh }) {
  const [activeTab, setActiveTab] = useState('saved');
  const [savedJobs, setSavedJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { 
    loadJobs(); 
  }, [activeTab]);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) { 
        setLoading(false); 
        setError('Chưa đăng nhập');
        return; 
      }

      if (activeTab === 'saved') {
        
        console.log(' Loading saved jobs...');
        const response = await fetch(`http://localhost:5000/api/jobs/saved`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error(`Saved jobs API error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log(' Saved jobs response:', data);
        
        const jobs = Array.isArray(data) ? data : (data.data || data.jobs || []);
        console.log(` Loaded ${jobs.length} saved jobs`);
        setSavedJobs(jobs);
        
      } else {
        
        console.log(' Loading applied jobs from multiple sources...');
        
        let allApplications = [];
        
        
        try {
          console.log(' Fetching internal applications...');
          const internalResponse = await fetch(
            `http://localhost:5000/api/applications/my-applications?limit=1000`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          if (internalResponse.ok) {
            const internalData = await internalResponse.json();
            console.log(' Internal API response:', internalData);
            
            const internal = internalData.applications || internalData.data || [];
            console.log(` Internal applications: ${internal.length}`);
            allApplications = [...allApplications, ...internal];
          } else {
            console.warn(` Internal API returned: ${internalResponse.status}`);
          }
        } catch (err) {
          console.error(' Internal API error:', err);
        }
        
       
        try {
          console.log(' Fetching external applications...');
          const externalResponse = await fetch(
            `http://localhost:5000/api/jobs/applied?limit=1000`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          
          if (externalResponse.ok) {
            const externalData = await externalResponse.json();
            console.log(' External API response:', externalData);
            
            const external = externalData.data || externalData.applications || externalData.jobs || [];
            console.log(` External applications: ${external.length}`);
            allApplications = [...allApplications, ...external];
          } else {
            console.warn(` External API returned: ${externalResponse.status}`);
            
          }
        } catch (err) {
          console.error(' External API error:', err);
          
        }

        
        console.log(` Total raw applications: ${allApplications.length}`);
        
        allApplications = allApplications.filter(job => {
          const isValid = job && (job.job_title || job.title) && (job.job_id || job.id);
          if (!isValid) {
            console.warn(' Invalid job entry:', job);
          }
          return isValid;
        });
        
        console.log(` Valid applications after filtering: ${allApplications.length}`);

        
        allApplications = allApplications.map(job => ({
          id: job.id || job.job_id,
          job_id: job.job_id || job.id,
          job_title: job.job_title || job.title || 'Không có tiêu đề',
          company_name: job.company_name || job.company || 'Không rõ công ty',
          company_logo: job.company_logo || job.logo || null,
          location: job.location || 'Không rõ địa điểm',
          salary: job.salary || 'Thỏa thuận',
          applied_date: job.applied_date || job.created_at || new Date().toISOString(),
          status: job.status || 'pending',
          cv_used: job.cv_used || null
        }));

        
        allApplications.sort((a, b) => 
          new Date(b.applied_date) - new Date(a.applied_date)
        );

        console.log(' Final applications to display:', allApplications.length);
        console.log(' Sample application:', allApplications[0]);
        
        setAppliedJobs(allApplications);
      }
    } catch (error) {
      console.error(` Error loading ${activeTab} jobs:`, error);
      setError(`Không thể tải dữ liệu: ${error.message}`);
      activeTab === 'saved' ? setSavedJobs([]) : setAppliedJobs([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUnsaveJob = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/jobs/unsave/${jobId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setSavedJobs(savedJobs.filter(job => job.job_id !== jobId));
        onRefresh();
        alert(' Đã bỏ lưu công việc!');
      }
    } catch (error) {
      console.error(' Error unsaving job:', error);
      alert(' Có lỗi xảy ra!');
    }
  };

  const handleApplyFromSaved = async (job) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/jobs/apply', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_id: job.job_id, 
          job_title: job.job_title, 
          company_name: job.company_name,
          company_logo: job.company_logo, 
          location: job.location, 
          salary: job.salary, 
          cv_used: null
        })
      });
      if (response.ok) {
        onRefresh(); 
        loadJobs();
        alert(' Đã thêm vào danh sách ứng tuyển!');
      } else {
        const error = await response.json();
        alert(error.error || ' Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error(' Error applying:', error);
      alert(' Có lỗi xảy ra!');
    }
  };

  const filterAndSortJobs = (jobs) => {
    console.log(` Filtering ${jobs.length} jobs with search term: "${searchTerm}"`);
    
    let filtered = jobs.filter(job => {
      const titleMatch = (job.job_title || '').toLowerCase().includes(searchTerm.toLowerCase());
      const companyMatch = (job.company_name || '').toLowerCase().includes(searchTerm.toLowerCase());
      return titleMatch || companyMatch;
    });
    
    console.log(` ${filtered.length} jobs after filtering`);
    
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.saved_date || b.applied_date) - new Date(a.saved_date || a.applied_date));
    } else {
      filtered.sort((a, b) => new Date(a.saved_date || a.applied_date) - new Date(b.saved_date || b.applied_date));
    }
    
    return filtered;
  };

  const currentJobs = activeTab === 'saved' ? savedJobs : appliedJobs;
  const displayJobs = filterAndSortJobs(currentJobs);

  
  console.log(' Render state:', {
    activeTab,
    currentJobsLength: currentJobs.length,
    displayJobsLength: displayJobs.length,
    searchTerm,
    sortBy,
    loading,
    error
  });

  return (
    <div className="section">
      <h1 className="section-title">Quản lý tìm việc</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div>
            <h3>{savedJobsCount}</h3>
            <p>Việc làm đã lưu</p>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <h3>{appliedJobsCount}</h3>
            <p>Việc làm đã ứng tuyển</p>
          </div>
        </div>
        <div className="stat-card">
          <div>
            <h3>12</h3>
            <p>Việc làm phù hợp với bạn</p>
          </div>
        </div>
      </div>

      <div className="jobs-tabs">
        <button 
          className={`tab-btn ${activeTab === 'saved' ? 'active' : ''}`} 
          onClick={() => setActiveTab('saved')}
        >
           Việc làm đã lưu ({savedJobsCount})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'applied' ? 'active' : ''}`} 
          onClick={() => setActiveTab('applied')}
        >
          Việc làm đã ứng tuyển ({appliedJobsCount})
        </button>
      </div>

      <div className="jobs-controls">
        <input 
          type="text" 
          placeholder=" Tìm kiếm công việc, công ty..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
          className="search-input" 
        />
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)} 
          className="sort-select"
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
        <button 
          className="refresh-btn" 
          onClick={() => { loadJobs(); onRefresh(); }}
          disabled={loading}
        >
           Làm mới
        </button>
      </div>

      {error && (
        <div className="error-message" style={{
          padding: '1rem',
          background: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c00',
          marginBottom: '1rem'
        }}>
           {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Đang tải...</p>
        </div>
      ) : (
        <div className="jobs-table">
          {displayJobs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Chưa có công việc nào</h3>
              <p>
                {searchTerm ? (
                  `Không tìm thấy công việc với từ khóa "${searchTerm}"`
                ) : activeTab === 'saved' ? (
                  'Hãy lưu các công việc yêu thích để xem lại sau'
                ) : (
                  'Bạn chưa ứng tuyển công việc nào'
                )}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{ 
                marginBottom: '1rem', 
                padding: '0.75rem', 
                background: '#f0f9ff', 
                borderRadius: '6px',
                fontSize: '0.9rem',
                color: '#0369a1'
              }}>
                Hiển thị {displayJobs.length} / {currentJobs.length} công việc
              </div>
              
 {displayJobs.map(job => (
                <div key={job.id || job.job_id} className="job-card">
                  <div className="job-info">
                  </div>
                  <div className="job-info">
                    <h3 className="job-title">{job.job_title || 'Tên công việc'}</h3>
                    <p className="job-company">{job.company_name || 'Tên công ty'}</p>
                    <div className="job-details">
                      <span>📍 {job.location || 'Hồ Chí Minh'}</span>
                      <span> {job.salary || 'Thỏa thuận'}</span>
                      <span>📅 {new Date(job.saved_date || job.applied_date).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {activeTab === 'applied' && (
                      <span className={`status-badge ${job.status || 'pending'}`}>
                        {job.status === 'pending' ? ' Đang chờ' : 
                         job.status === 'reviewing' ? ' Đang xem xét' : 
                         ' Đã phản hồi'}
                      </span>
                    )}
                  </div>
                  <div className="job-actions">
                    {activeTab === 'saved' ? (
                      <>
                        <button 
                          className="btn-apply" 
                          onClick={() => handleApplyFromSaved(job)}
                        >
                           Ứng tuyển ngay
                        </button>
                        <button 
                          className="btn-unsave" 
                          onClick={() => handleUnsaveJob(job.job_id)}
                        >
                           Bỏ lưu
                        </button>
                      </>
                    ) : (
                      <button 
                        className="btn-view" 
                        onClick={() => window.open(`/jobs/${job.job_id}`, '_blank')}
                      >
                         Xem chi tiết
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ... (rest of the component code remains the same - CVSection, EmailSection, SecuritySection)

function CVSection({ user }) {
  const [cvList, setCvList] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [activeTab, setActiveTab] = useState('cv');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadCVs(); loadCoverLetters(); }, []);

  const loadCVs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cv/list', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        console.log(' CVs loaded:', data.data);
        setCvList(data.data);
      }
    } catch (error) {
      console.error(' Error loading CVs:', error);
      setCvList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCoverLetters = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cv/cover-letters', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        console.log(' Cover letters loaded:', data.data);
        setCoverLetters(data.data);
      }
    } catch (error) {
      console.error(' Error loading cover letters:', error);
      setCoverLetters([]);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!validTypes.includes(file.type)) { alert(' Chỉ chấp nhận file PDF, DOC, DOCX'); return; }
    if (file.size > 5 * 1024 * 1024) { alert(' File không được vượt quá 5MB'); return; }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) { alert(' Vui lòng chọn file'); return; }
    const token = localStorage.getItem('token');
    if (!token) { alert(' Bạn chưa đăng nhập'); return; }
    try {
      setUploading(true);
      const formData = new FormData();
      activeTab === 'cv' ? formData.append('resume', selectedFile) : formData.append('documents', selectedFile);
      const endpoint = activeTab === 'cv' ? 'http://localhost:5000/api/cv/upload' : 'http://localhost:5000/api/cv/cover-letters/upload';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        alert(` Tải lên ${activeTab === 'cv' ? 'CV' : 'Cover letter'} thành công!`);
        setShowUploadModal(false);
        setSelectedFile(null);
        activeTab === 'cv' ? loadCVs() : loadCoverLetters();
      } else {
        alert(data.message || ' Upload thất bại');
      }
    } catch (error) {
      console.error(' Upload error:', error);
      alert(' Có lỗi xảy ra');
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (cvId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/cv/${cvId}/set-default`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) { alert(' Đã đặt làm CV mặc định!'); loadCVs(); }
    } catch (error) {
      console.error(' Error:', error);
      alert(' Có lỗi xảy ra');
    }
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Bạn có chắc muốn xóa file này?')) return;
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'cv' ? `http://localhost:5000/api/cv/${id}` : `http://localhost:5000/api/cv/cover-letters/${id}`;
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        alert(' Đã xóa file!');
        type === 'cv' ? loadCVs() : loadCoverLetters();
      }
    } catch (error) {
      console.error(' Delete error:', error);
      alert(' Có lỗi xảy ra');
    }
  };

  return (
    <div className="section">
      <h1 className="section-title">Quản lý CV & Cover letter</h1>
      <div className="cv-stats">
        <div className="cv-stat-card"><span className="stat-icon">📄</span><div><h3>{cvList.length}</h3><p>CV đã tải lên</p></div></div>
        <div className="cv-stat-card"><span className="stat-icon">✉️</span><div><h3>{coverLetters.length}</h3><p>Cover letter</p></div></div>
        <div className="cv-stat-card"><span className="stat-icon"></span><div><h3>0</h3><p>Lượt xem CV</p></div></div>
      </div>
      <div className="cv-tabs">
        <button className={`tab-btn ${activeTab === 'cv' ? 'active' : ''}`} onClick={() => setActiveTab('cv')}>📄 CV của tôi ({cvList.length})</button>
        <button className={`tab-btn ${activeTab === 'cover' ? 'active' : ''}`} onClick={() => setActiveTab('cover')}>✉️ Cover letter ({coverLetters.length})</button>
      </div>
      <div className="cv-actions-bar">
        <button className="btn-upload-cv" onClick={() => setShowUploadModal(true)}> Tải lên {activeTab === 'cv' ? 'CV mới' : 'Cover letter mới'}</button>
        <button className="btn-create-cv" onClick={() => window.location.href = '/create-cv'}>
           Tạo CV 
        </button>
        <button className="btn-create-cv" onClick={() => window.location.href = '/cover-letter'}>
           Tạo Cover Letter 
        </button>
      </div>
      {activeTab === 'cv' ? (
        <div className="cv-list">
          {loading ? (
            <div className="loading-state"><div className="spinner"></div><p>Đang tải...</p></div>
          ) : cvList.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📄</div><h3>Chưa có CV nào</h3><p>Tải lên CV của bạn để ứng tuyển nhanh hơn</p>
              <button className="btn-upload-cv" onClick={() => setShowUploadModal(true)}>Tải lên CV đầu tiên</button>
            </div>
          ) : (
            cvList.map(cv => (
              <div key={cv.id} className="cv-item">
                <div className="cv-icon"><span>📄</span></div>
                <div className="cv-details">
                  <div className="cv-header">
                    <h3>{cv.file_name}</h3>
                    {cv.is_default && <span className="badge-default">⭐ Mặc định</span>}
                  </div>
                  <div className="cv-meta">
                    <span>📅 {new Date(cv.uploaded_at).toLocaleDateString('vi-VN')}</span>
                    <span> {cv.file_size}</span>
                  </div>
                </div>
                <div className="cv-actions">
                  <button className="btn-text" title="Xem CV" onClick={() => window.open(cv.file_url, '_blank')}>Xem</button>
                  <button className="btn-text" title="Tải xuống" onClick={() => { 
                    const link = document.createElement('a');
                    link.href = cv.file_url;
                    link.download = cv.file_name;
                    link.click();
                  }}>Tải xuống</button>
                  {!cv.is_default && <button className="btn-text btn-default" title="Đặt làm mặc định" onClick={() => handleSetDefault(cv.id)}>Đặt mặc định</button>}
                  <button className="btn-text btn-delete" title="Xóa" onClick={() => handleDelete(cv.id, 'cv')}>Xóa</button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="cv-list">
          {loading ? (
            <div className="loading-state"><div className="spinner"></div><p>Đang tải...</p></div>
          ) : coverLetters.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✉️</div><h3>Chưa có Cover letter nào</h3><p>Tải lên Cover letter để tăng cơ hội được tuyển dụng</p>
              <button className="btn-upload-cv" onClick={() => setShowUploadModal(true)}> Tải lên Cover letter đầu tiên</button>
            </div>
          ) : (
            coverLetters.map(letter => (
              <div key={letter.id} className="cv-item">
                <div className="cv-icon"><span>✉️</span></div>
                <div className="cv-details">
                  <h3>{letter.file_name}</h3>
                  <div className="cv-meta">
                    <span>📅 {new Date(letter.uploaded_at).toLocaleDateString('vi-VN')}</span>
                    <span> {letter.file_size}</span>
                  </div>
                </div>
                <div className="cv-actions">
                  <button className="btn-icon" title="Xem CoverLetter " onClick={() => window.open(letter.file_url, '_blank')}>Xem</button>
                  <button className="btn-icon" title="Tải xuống" onClick={() => {
                    const link = document.createElement('a');
                    link.href = letter.file_url;
                    link.download = letter.file_name;
                    link.click();
                  }}>Tải xuống</button>
                  {! letter.is_default && <button className="btn-text btn-default" title="Đặt làm mặc định" onClick={() => handleSetDefault(letter.id)}>Đặt mặc định</button>}
                  <button className="btn-icon btn-delete" title="Xóa" onClick={() => handleDelete(letter.id, 'cover')}>Xóa</button>

                </div>
              </div>
            ))
          )}
        </div>
      )}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⬆ Tải lên {activeTab === 'cv' ? 'CV' : 'Cover letter'}</h2>
              <button className="btn-close" onClick={() => setShowUploadModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="upload-area">
                <div className="upload-icon">📁</div>
                <h3>Chọn file để tải lên</h3>
                <input type="file" id="fileInput" accept=".pdf,.doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
                <button className="btn-browse" onClick={() => document.getElementById('fileInput').click()} disabled={uploading}>📂 Chọn file từ máy tính</button>
                {selectedFile && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'white', borderRadius: '8px', textAlign: 'center' }}>
                    <p style={{ marginBottom: '1rem', color: '#10b981', fontWeight: 600 }}> Đã chọn: {selectedFile.name}</p>
                    <button 
                      onClick={handleUpload} 
                      disabled={uploading}
                      style={{ 
                        padding: '0.75rem 2rem', background: uploading ? '#d1d5db' : '#10b981', color: 'white', 
                        border: 'none', borderRadius: '8px', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 600
                      }}
                    >
                      {uploading ? ' Đang tải lên...' : '⬆Xác nhận tải lên'}
                    </button>
                  </div>
                )}
                <p className="upload-note">Hỗ trợ: PDF, DOC, DOCX (tối đa 5MB)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmailSection() {
  const [emailSettings, setEmailSettings] = useState({
    jobAlerts: true,
    applicationUpdates: true,
    companyNews: false,
    weeklyDigest: true,
    promotions: false,
    systemNotifications: true
  });
  const [notificationFrequency, setNotificationFrequency] = useState('instant');
  const [saving, setSaving] = useState(false);

  const handleToggle = (key) => {
    setEmailSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert(' Đã lưu cài đặt thông báo!');
    }, 1000);
  };

  return (
    <div className="section">
      <h1 className="section-title">Cài đặt email & thông báo</h1>
      
      <div className="settings-section">
        <h2 className="settings-subtitle"> Thông báo qua Email</h2>
        <p className="settings-description">Chọn các loại email bạn muốn nhận từ Job Portal</p>
        
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <h3> Thông báo việc làm mới</h3>
              <p>Nhận email khi có việc làm phù hợp với hồ sơ của bạn</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={emailSettings.jobAlerts} onChange={() => handleToggle('jobAlerts')} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3> Cập nhật đơn ứng tuyển</h3>
              <p>Thông báo khi nhà tuyển dụng xem hoặc phản hồi đơn của bạn</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={emailSettings.applicationUpdates} onChange={() => handleToggle('applicationUpdates')} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3> Tin tức từ công ty</h3>
              <p>Nhận thông tin về các công ty bạn quan tâm</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={emailSettings.companyNews} onChange={() => handleToggle('companyNews')} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3> Bản tin tuần</h3>
              <p>Tổng hợp các việc làm và tin tức hàng tuần</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={emailSettings.weeklyDigest} onChange={() => handleToggle('weeklyDigest')} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3> Khuyến mãi & Ưu đãi</h3>
              <p>Nhận thông tin về các chương trình khuyến mãi</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={emailSettings.promotions} onChange={() => handleToggle('promotions')} />
              <span className="toggle-slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h3> Thông báo hệ thống</h3>
              <p>Email quan trọng về tài khoản và bảo mật</p>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={emailSettings.systemNotifications} onChange={() => handleToggle('systemNotifications')} disabled />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h2 className="settings-subtitle"> Tần suất thông báo</h2>
        <div className="frequency-options">
          <label className="frequency-option">
            <input type="radio" name="frequency" value="instant" checked={notificationFrequency === 'instant'} onChange={(e) => setNotificationFrequency(e.target.value)} />
            <div className="frequency-content">
              <h3> Ngay lập tức</h3>
              <p>Nhận thông báo ngay khi có cập nhật</p>
            </div>
          </label>

          <label className="frequency-option">
            <input type="radio" name="frequency" value="daily" checked={notificationFrequency === 'daily'} onChange={(e) => setNotificationFrequency(e.target.value)} />
            <div className="frequency-content">
              <h3> Hàng ngày</h3>
              <p>Tổng hợp 1 lần mỗi ngày vào 9h sáng</p>
            </div>
          </label>

          <label className="frequency-option">
            <input type="radio" name="frequency" value="weekly" checked={notificationFrequency === 'weekly'} onChange={(e) => setNotificationFrequency(e.target.value)} />
            <div className="frequency-content">
              <h3> Hàng tuần</h3>
              <p>Tổng hợp 1 lần mỗi tuần vào thứ 2</p>
            </div>
          </label>
        </div>
      </div>

      <div className="settings-actions">
        <button className="btn-save" onClick={handleSave} disabled={saving}>
          {saving ? ' Đang lưu...' : ' Lưu thay đổi'}
        </button>
        <button className="btn-cancel" onClick={() => window.location.reload()}>
           Hủy bỏ
        </button>
      </div>
    </div>
  );
}

function SecuritySection({ user }) {
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert(' Mật khẩu mới không khớp!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert(' Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    alert(' Đổi mật khẩu thành công!');
    setShowChangePassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="section">
      <h1 className="section-title">Cá nhân & Bảo mật</h1>
      
      <div className="security-card">
        <div className="security-card-header">
          <h2> Thông tin cá nhân</h2>
          <button className="btn-edit-profile"> Chỉnh sửa</button>
        </div>
        <div className="security-info-grid">
          <div className="security-info-item">
            <span className="info-label">Email</span>
            <span className="info-value">{user.email}</span>
          </div>
          {user.username && (
            <div className="security-info-item">
              <span className="info-label">Username</span>
              <span className="info-value">@{user.username}</span>
            </div>
          )}
          <div className="security-info-item">
            <span className="info-label">User ID</span>
            <span className="info-value">{user.id}</span>
          </div>
          <div className="security-info-item">
            <span className="info-label">Họ và tên</span>
            <span className="info-value">{user.name}</span>
          </div>
        </div>
      </div>

      <div className="security-card">
        <div className="security-card-header">
          <h2> Bảo mật tài khoản</h2>
        </div>
        
        <div className="security-options">
          <div className="security-option">
            <div className="security-option-info">
              <h3> Mật khẩu</h3>
              <p>Thay đổi mật khẩu của bạn để bảo mật tài khoản</p>
            </div>
            <button className="btn-change-password" onClick={() => setShowChangePassword(!showChangePassword)}>
              {showChangePassword ? ' Hủy' : ' Đổi mật khẩu'}
            </button>
          </div>

          {showChangePassword && (
            <div className="password-change-form">
              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input 
                  type="password" 
                  placeholder="Nhập mật khẩu hiện tại"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input 
                  type="password" 
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input 
                  type="password" 
                  placeholder="Nhập lại mật khẩu mới"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  className="form-input"
                />
              </div>
              <button className="btn-save-password" onClick={handlePasswordChange}>
                 Lưu mật khẩu mới
              </button>
            </div>
          )}

          <div className="security-option">
            <div className="security-option-info">
              <h3> Xác thực 2 bước</h3>
              <p>Tăng cường bảo mật với xác thực qua email</p>
              <span className="badge-inactive">Chưa kích hoạt</span>
            </div>
            <button className="btn-enable"> Bật</button>
          </div>

          <div className="security-option">
            <div className="security-option-info">
              <h3> Thiết bị đăng nhập</h3>
              <p>Quản lý các thiết bị đã đăng nhập tài khoản</p>
            </div>
            <button className="btn-manage"> Quản lý</button>
          </div>

          <div className="security-option security-option-danger">
            <div className="security-option-info">
              <h3> Xóa tài khoản</h3>
              <p>Xóa vĩnh viễn tài khoản và toàn bộ dữ liệu của bạn</p>
            </div>
            <button className="btn-delete-account" onClick={() => {
              if (window.confirm(' Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!')) {
                alert('Tính năng đang phát triển');
              }
            }}>
               Xóa tài khoản
            </button>
          </div>
        </div>
      </div>

      <div className="security-card">
        <div className="security-card-header">
          <h2> Lịch sử hoạt động</h2>
        </div>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-info">
              <h4>Đăng nhập thành công</h4>
              <p>Chrome trên Windows • Hanoi, Vietnam</p>
              <span className="activity-time">Hôm nay, 14:30</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-info">
              <h4>Tải lên CV mới</h4>
              <p>CV_TranTuyetLy_2024.pdf</p>
              <span className="activity-time">Hôm qua, 09:15</span>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-info">
              <h4>Ứng tuyển công việc</h4>
              <p>Senior Frontend Developer tại FPT Software</p>
              <span className="activity-time">3 ngày trước</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
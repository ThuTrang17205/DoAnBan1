// src/pages/Jobs/JobDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './JobDetailPage.css';

function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    selectedCV: null,
    cvMode: 'select', // 'select' hoặc 'upload'
    coverLetter: '',
    expectedSalary: '',
    availableFrom: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Thêm log vào useEffect
useEffect(() => {
  const fetchJob = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log(' Fetching job with ID:', id); // ← THÊM
      
      const response = await axios.get(`http://localhost:5000/api/jobs/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      console.log(' Full response:', response.data); // ← THÊM
      console.log(' Job data:', response.data.data); // ← THÊM
      console.log(' Job ID:', response.data.data?.id); // ← THÊM
      
      if (response.data.success) {
        setJob(response.data.data);
        setIsSaved(response.data.data.isSaved || false);
      }
    } catch (err) {
      console.error('Error fetching job:', err);
      setError(err.response?.data?.message || 'Không thể tải thông tin công việc');
      
      if (err.response?.status === 404) {
        setTimeout(() => navigate('/jobs'), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  if (id) {
    fetchJob();
  }
}, [id, navigate]);

  const handleSaveJob = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Vui lòng đăng nhập để lưu công việc!');
      navigate('/login');
      return;
    }

    try {
      setSaving(true);

      if (isSaved) {
        const response = await axios.delete(
          `http://localhost:5000/api/jobs/unsave/${id}`,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          setIsSaved(false);
          alert('✓ Đã bỏ lưu công việc!');
        }
      } else {
        const response = await axios.post(
          `http://localhost:5000/api/jobs/save/${id}`,
          {},
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        if (response.data.success) {
          setIsSaved(true);
          alert(' Đã lưu công việc thành công!');
        }
      }
    } catch (error) {
      console.error('Error saving job:', error);
      
      if (error.response?.status === 401) {
        alert('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
        navigate('/login');
      } else if (error.response?.data?.error === 'Job already saved') {
        setIsSaved(true);
        alert(' Công việc đã được lưu trước đó!');
      } else {
        alert(' Có lỗi xảy ra: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setSaving(false);
    }
  };


  const handleApplyJob = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      alert('Vui lòng đăng nhập để ứng tuyển!');
      navigate('/login');
      return;
    }


    let jobUrl = job.url || job.originalUrl || job.original_url;
    

    if (!jobUrl && job.description) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(job.description, 'text/html');
      const link = doc.querySelector('a[href]');
      if (link) {
        jobUrl = link.getAttribute('href');
      }
    }
    
    if (jobUrl) {
      
      if (!jobUrl.startsWith('http://') && !jobUrl.startsWith('https://')) {
        jobUrl = 'https://' + jobUrl;
      }

      try {
       
        const response = await axios.post(
          'http://localhost:5000/api/jobs/apply',
          {
            job_id: String(job.id || id),
            job_title: job.title,
            company_name: job.companyName, 
            company_logo: job.companyLogo || null,
            location: job.location,
            salary: formatSalary(),
            cv_used: null
          },
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          console.log(' Application saved successfully');
          window.open(jobUrl, '_blank');
          alert('✓ Đã lưu thông tin ứng tuyển và mở trang ứng tuyển!');
        }
      } catch (error) {
        console.error(' Error saving application:', error);
        
        if (error.response?.status === 401) {
          alert(' Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
          navigate('/login');
          return;
        }
        
        const userConfirm = window.confirm(
          'Không thể lưu thông tin ứng tuyển. Bạn vẫn muốn mở trang ứng tuyển?'
        );
        if (userConfirm) {
          window.open(jobUrl, '_blank');
        }
      }
    } 
    
    else {
      
      setShowApplyModal(true);
    }
  };

  
 const handleSubmitApplication = async () => {
  
  if (!applyForm.selectedCV) {
    alert('❌ Vui lòng chọn CV!');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Vui lòng đăng nhập!');
    navigate('/login');
    return;
  }

  try {
    setSubmitting(true);

    const jobId = parseInt(id); 
    
    console.log('🔍 DEBUG INFO:');
    console.log('  URL param id:', id);
    console.log('  job state:', job);
    console.log('  job.id:', job?.id);
    console.log('  Using jobId:', jobId);
    
    if (!jobId || isNaN(jobId)) {
      console.error('❌ Invalid job ID:', jobId);
      alert('❌ Lỗi: Không tìm thấy ID công việc. Vui lòng tải lại trang!');
      setSubmitting(false);
      return;
    }
    
    const formData = new FormData();
    
    // QUAN TRỌNG: Không cần thêm jobId vào formData
    // vì nó đã có trong URL rồi!
    
    if (applyForm.selectedCV instanceof File) {
      formData.append('resume', applyForm.selectedCV);
    } else {
      formData.append('cvFile', applyForm.selectedCV);
    }
    
    if (applyForm.coverLetter) {
      formData.append('coverLetter', applyForm.coverLetter);
    }
    if (applyForm.expectedSalary) {
      formData.append('expectedSalary', parseInt(applyForm.expectedSalary));
    }
    if (applyForm.availableFrom) {
      formData.append('availableFrom', applyForm.availableFrom);
    }

    console.log('📤 Sending FormData:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    // ✅ SỬA Ở ĐÂY - Thêm /apply/${jobId} vào URL
    const response = await axios.post(
      `http://localhost:5000/api/applications/apply/${jobId}`,  // ← THAY ĐỔI DUY NHẤT
      formData,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log('✅ Application response:', response.data);

    if (response.data.success) {
      alert('✅ Ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.');
      setShowApplyModal(false);
      setApplyForm({
        selectedCV: null,
        cvMode: 'select',
        coverLetter: '',
        expectedSalary: '',
        availableFrom: ''
      });
    }
  } catch (error) {
    console.error('❌ Error submitting application:', error);
    console.error('❌ Error response:', error.response?.data);
    
    if (error.response?.status === 401) {
      alert('❌ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      navigate('/login');
    } else if (error.response?.status === 400) {
      const errorMsg = error.response.data?.message || 'Dữ liệu không hợp lệ';
      alert('❌ ' + errorMsg);
    } else if (error.response?.status === 409) {
      alert('⚠️ Bạn đã ứng tuyển công việc này rồi!');
    } else if (error.response?.status === 404) {
      alert('❌ Không tìm thấy công việc này!');
    } else if (error.response?.status === 500) {
      console.error('💥 Server Error Details:', {
        message: error.response.data?.message,
        error: error.response.data?.error,
        stack: error.response.data?.stack
      });
      alert('❌ Lỗi server: ' + (error.response.data?.message || 'Vui lòng thử lại sau'));
    } else {
      alert('❌ Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  } finally {
    setSubmitting(false);
  }
};

  const formatSalary = () => {
    if (job.salary) return job.salary;
    if (job.minSalary && job.maxSalary) {
      const min = parseInt(job.minSalary).toLocaleString('vi-VN');
      const max = parseInt(job.maxSalary).toLocaleString('vi-VN');
      return `${min} - ${max} VNĐ`;
    }
    return 'Thỏa thuận';
  };

  const parseJobSections = () => {
    if (job.job_description || job.job_requirements || job.job_benefits) {
      return {
        description: job.job_description || job.description || '',
        requirements: job.job_requirements || '',
        benefits: job.job_benefits || ''
      };
    }
    
    if (!job.description) return { description: '', requirements: '', benefits: '' };
    
    const parser = new DOMParser();
    const doc = parser.parseFromString(job.description, 'text/html');
    
    const sections = {
      description: '',
      requirements: '',
      benefits: ''
    };

   
    const requirementKeywords = ['yêu cầu', 'requirements', 'qualification', 'kỹ năng', 'yêu cầu ứng viên'];
    const benefitKeywords = ['quyền lợi', 'benefits', 'chế độ', 'đãi ngộ', 'phúc lợi'];
    
    const lines = job.description.split(/<\/p>|<br\s*\/?>/i);
    let currentSection = 'description';
    
    lines.forEach(line => {
      const cleanLine = line.replace(/<[^>]*>/g, '').trim().toLowerCase();
      
      if (requirementKeywords.some(keyword => cleanLine.includes(keyword))) {
        currentSection = 'requirements';
        return;
      }
      if (benefitKeywords.some(keyword => cleanLine.includes(keyword))) {
        currentSection = 'benefits';
        return;
      }
      
      if (line.trim()) {
        sections[currentSection] += line + '</p>';
      }
    });

    
    if (!sections.requirements && !sections.benefits) {
      sections.description = job.description;
    }

    return sections;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải thông tin công việc...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>⚠ {error}</h2>
          <p>Đang chuyển hướng về trang danh sách việc làm...</p>
          <button onClick={() => navigate('/jobs')} className="btn-primary">
            Quay lại danh sách việc làm
          </button>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="error-container">
        <div className="error-box">
          <h2>Không tìm thấy công việc</h2>
          <button onClick={() => navigate('/jobs')} className="btn-primary">
            Quay lại danh sách việc làm
          </button>
        </div>
      </div>
    );
  }

  const sections = parseJobSections();

  return (
    <div className="job-detail-page">
      <div className="container">
        {/* Job Header */}
        <div className="job-header">
          <div className="job-header-content">
            <div className="company-logo">
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.companyName} />
              ) : job.companyName ? (
                <div className="logo-placeholder">
                  {job.companyName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <div className="logo-placeholder">C</div>
              )}
            </div>
            <div className="job-title-section">
              <h1 className="job-title">{job.title}</h1>
              <div className="job-meta">
                <span className="company-name">{job.companyName || 'Công ty chưa cập nhật'}</span>
                <span className="separator">•</span>
                <span className="location">📍 {job.location}</span>
              </div>
              <div className="job-stats">
                <span>📅 Đăng: {new Date(job.postedAt || job.created_at).toLocaleDateString('vi-VN')}</span>
                <span>🏷 {job.category}</span>
              </div>
            </div>
          </div>
          <div className="job-actions">
            <button 
              onClick={handleApplyJob}
              className="btn-apply"
            >
              Ứng tuyển ngay
            </button>
            <button 
              onClick={handleSaveJob}
              className={`btn-save ${isSaved ? 'saved' : ''}`}
              disabled={saving}
            >
              {saving ? '⏳' : isSaved ? ' Đã lưu' : ' Lưu tin'}
            </button>
          </div>
        </div>

        {/* Quick Info */}
        <div className="quick-info">
          <div className="info-item">
            <span className="info-label"> Mức lương</span>
            <span className="info-value">{formatSalary()}</span>
          </div>
          <div className="info-item">
            <span className="info-label"> Loại công việc</span>
            <span className="info-value">{job.jobType || job.job_type || 'Chưa cập nhật'}</span>
          </div>
          <div className="info-item">
            <span className="info-label"> Kinh nghiệm</span>
            <span className="info-value">{job.experience || 'Không yêu cầu'}</span>
          </div>
          <div className="info-item">
            <span className="info-label"> Danh mục</span>
            <span className="info-value">{job.category}</span>
          </div>
          <div className="info-item">
            <span className="info-label">📍 Địa điểm</span>
            <span className="info-value">{job.location}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="job-content">
          {/* Left Column */}
          <div className="job-main">
            {/* Description */}
            <section className="job-section">
              <h2 className="section-title">📋 Mô tả công việc</h2>
              {sections.description ? (
                <div 
                  className="section-content"
                  dangerouslySetInnerHTML={{ __html: sections.description }}
                />
              ) : (
                <p className="text-muted">Chưa có mô tả chi tiết</p>
              )}
            </section>

            {/* Requirements */}
            {sections.requirements && (
              <section className="job-section">
                <h2 className="section-title"> Yêu cầu ứng viên</h2>
                <div 
                  className="section-content"
                  dangerouslySetInnerHTML={{ __html: sections.requirements }}
                />
              </section>
            )}

            {/* Benefits */}
            {sections.benefits && (
              <section className="job-section">
                <h2 className="section-title"> Quyền lợi</h2>
                <div 
                  className="section-content"
                  dangerouslySetInnerHTML={{ __html: sections.benefits }}
                />
              </section>
            )}

            {/* Company Info */}
            {job.companyName && (
              <section className="job-section">
                <h2 className="section-title"> Thông tin công ty</h2>
                <div className="section-content">
                  <h4>{job.companyName}</h4>
                  <p>📍 {job.location}</p>
                  {job.companyWebsite && (
                    <p> <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer">{job.companyWebsite}</a></p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="job-sidebar">
            {/* Apply CTA */}
            <div className="sidebar-card cta-card">
              <h3>Sẵn sàng ứng tuyển?</h3>
              <p>Gửi hồ sơ của bạn ngay hôm nay!</p>
              <button 
                onClick={handleApplyJob}
                className="btn-apply-sidebar"
              >
                Ứng tuyển ngay
              </button>
            </div>

            {/* Job Details */}
            <div className="sidebar-card">
              <h3>📄 Chi tiết công việc</h3>
              <div className="job-details">
                <div className="detail-row">
                  <span className="detail-label">Công ty:</span>
                  <span className="detail-value">{job.companyName || 'Chưa cập nhật'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Mức lương:</span>
                  <span className="detail-value">{formatSalary()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Loại hình:</span>
                  <span className="detail-value">{job.jobType || job.job_type || 'Chưa cập nhật'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Kinh nghiệm:</span>
                  <span className="detail-value">{job.experience || 'Không yêu cầu'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Danh mục:</span>
                  <span className="detail-value">{job.category}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Địa điểm:</span>
                  <span className="detail-value">{job.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Trạng thái:</span>
                  <span className="detail-value badge-open">{job.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal - CHỈ CHO JOB NỘI BỘ */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2> Ứng tuyển: {job.title}</h2>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Chọn CV <span style={{color: 'red'}}>*</span></label>
                
                {/* Tab chọn CV có sẵn hoặc upload mới */}
                <div className="cv-selection-tabs" style={{marginBottom: '10px'}}>
                  <button 
                    type="button"
                    className={`tab-btn ${applyForm.cvMode !== 'upload' ? 'active' : ''}`}
                    onClick={() => setApplyForm({...applyForm, cvMode: 'select', selectedCV: null})}
                    style={{
                      padding: '8px 16px',
                      marginRight: '8px',
                      border: '1px solid #ddd',
                      background: applyForm.cvMode !== 'upload' ? '#007bff' : '#fff',
                      color: applyForm.cvMode !== 'upload' ? '#fff' : '#333',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    CV có sẵn
                  </button>
                  <button 
                    type="button"
                    className={`tab-btn ${applyForm.cvMode === 'upload' ? 'active' : ''}`}
                    onClick={() => setApplyForm({...applyForm, cvMode: 'upload', selectedCV: null})}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #ddd',
                      background: applyForm.cvMode === 'upload' ? '#007bff' : '#fff',
                      color: applyForm.cvMode === 'upload' ? '#fff' : '#333',
                      cursor: 'pointer',
                      borderRadius: '4px'
                    }}
                  >
                    Upload CV mới
                  </button>
                </div>

                {/* Chọn CV có sẵn */}
                {applyForm.cvMode !== 'upload' && (
                  <>
                    <select 
                      value={typeof applyForm.selectedCV === 'string' ? applyForm.selectedCV : ''} 
                      onChange={(e) => setApplyForm({...applyForm, selectedCV: e.target.value})}
                      className="form-control"
                      required
                    >
                      <option value="">-- Chọn CV --</option>
                      <option value="/uploads/cvs/cv1.pdf">CV Tiếng Việt</option>
                      <option value="/uploads/cvs/cv2.pdf">CV Tiếng Anh</option>
                      <option value="/uploads/cvs/cv3.pdf">CV Fullstack Developer</option>
                    </select>
                    <small className="form-hint">
                      Chưa có CV? <a href="/create-cv" target="_blank" rel="noopener noreferrer">Tạo CV ngay</a>
                    </small>
                  </>
                )}

                {/* Upload CV mới */}
                {applyForm.cvMode === 'upload' && (
                  <>
                    <input 
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File quá lớn! Vui lòng chọn file dưới 5MB');
                            e.target.value = '';
                            return;
                          }
                          setApplyForm({...applyForm, selectedCV: file});
                        }
                      }}
                      className="form-control"
                      required
                    />
                    <small className="form-hint">
                      Chấp nhận: PDF, DOC, DOCX (tối đa 5MB)
                      {applyForm.selectedCV instanceof File && (
                        <span style={{color: 'green', marginLeft: '10px'}}>
                          ✓ {applyForm.selectedCV.name}
                        </span>
                      )}
                    </small>
                  </>
                )}
              </div>

              <div className="form-group">
                <label>Thư giới thiệu (tùy chọn)</label>
                <textarea 
                  value={applyForm.coverLetter}
                  onChange={(e) => setApplyForm({...applyForm, coverLetter: e.target.value})}
                  placeholder="Giới thiệu ngắn gọn về bản thân và lý do bạn phù hợp với vị trí này..."
                  rows="6"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Mức lương mong muốn (VNĐ)</label>
                <input 
                  type="number"
                  value={applyForm.expectedSalary}
                  onChange={(e) => setApplyForm({...applyForm, expectedSalary: e.target.value})}
                  placeholder="VD: 15000000"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label>Có thể bắt đầu từ ngày</label>
                <input 
                  type="date"
                  value={applyForm.availableFrom}
                  onChange={(e) => setApplyForm({...applyForm, availableFrom: e.target.value})}
                  className="form-control"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowApplyModal(false)}
                disabled={submitting}
              >
                Hủy
              </button>
              <button 
                className="btn-primary" 
                onClick={handleSubmitApplication}
                disabled={submitting || !applyForm.selectedCV}
              >
                {submitting ? '⏳ Đang gửi...' : 'Gửi hồ sơ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetailPage;
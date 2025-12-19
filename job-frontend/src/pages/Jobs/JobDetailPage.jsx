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
    cvMode: 'select', 
    coverLetter: '',
    expectedSalary: '',
    availableFrom: ''
  });
  const [userCVs, setUserCVs] = useState([]); 
  const [loadingCVs, setLoadingCVs] = useState(false); 
  const [submitting, setSubmitting] = useState(false);

  
useEffect(() => {
  const fetchJob = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      console.log(' Fetching job with ID:', id); 
      const response = await axios.get(`http://localhost:5000/api/jobs/${id}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      
      console.log(' Full response:', response.data); 
      console.log(' Job data:', response.data.data); 
      console.log(' Job ID:', response.data.data?.id); 
      
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

  
  useEffect(() => {
    const fetchUserCVs = async () => {
      if (!showApplyModal) return;
      
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setLoadingCVs(true);
        const response = await axios.get('http://localhost:5000/api/cvs/my-cvs', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log(' User CVs fetched:', response.data);
        
        if (response.data.success) {
          setUserCVs(response.data.data || []);
        }
      } catch (error) {
        console.error(' Error fetching user CVs:', error);
        
        setUserCVs([]);
      } finally {
        setLoadingCVs(false);
      }
    };

    fetchUserCVs();
  }, [showApplyModal]);

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
          alert(' Đã bỏ lưu công việc!');
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
          alert(' Đã lưu thông tin ứng tuyển và mở trang ứng tuyển!');
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
    alert('⚠ Vui lòng chọn CV!');
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

      let cvToSave = null;
      
      if (applyForm.selectedCV instanceof File) {
        cvToSave = applyForm.selectedCV.name;
      } else if (typeof applyForm.selectedCV === 'number') {
        const selectedCv = userCVs.find(cv => cv.id === applyForm.selectedCV);
        cvToSave = selectedCv?.file_path || selectedCv?.file_name || `CV_ID_${applyForm.selectedCV}`;
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
            cv_used: cvToSave,
            cover_letter: applyForm.coverLetter || null,
            expected_salary: applyForm.expectedSalary ? parseInt(applyForm.expectedSalary) : null,
            available_from: applyForm.availableFrom || null
          },
          {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          console.log(' Application saved for external job');
          setShowApplyModal(false);
          setApplyForm({
            selectedCV: null,
            cvMode: 'select',
            coverLetter: '',
            expectedSalary: '',
            availableFrom: ''
          });
          
          window.open(jobUrl, '_blank');
          alert(' Đã lưu thông tin ứng tuyển và mở trang ứng tuyển!');
        }
      } catch (error) {
        console.error(' Error saving external job application:', error);
        
        if (error.response?.status === 401) {
          alert('⚠ Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
          navigate('/login');
          return;
        }
        
        const userConfirm = window.confirm(
          'Không thể lưu thông tin ứng tuyển. Bạn vẫn muốn mở trang ứng tuyển?'
        );
        if (userConfirm) {
          window.open(jobUrl, '_blank');
          setShowApplyModal(false);
        }
      }
      
      return;
    }

    //  INTERNAL JOB: Fixed CV upload
    const jobId = parseInt(id); 
    
    console.log(' DEBUG INFO:');
    console.log('  URL param id:', id);
    console.log('  job.id:', job?.id);
    console.log('  Using jobId:', jobId);
    
    if (!jobId || isNaN(jobId)) {
      console.error(' Invalid job ID:', jobId);
      alert(' Lỗi: Không tìm thấy ID công việc. Vui lòng tải lại trang!');
      setSubmitting(false);
      return;
    }
    
    const formData = new FormData();
    
    //  FIXED: Handle CV properly
    if (applyForm.selectedCV instanceof File) {
      // New file upload - MUST use 'cv' as field name (matching backend multer)
      console.log(' Uploading new CV file:', applyForm.selectedCV.name);
      console.log(' File size:', (applyForm.selectedCV.size / 1024).toFixed(2), 'KB');
      console.log(' File type:', applyForm.selectedCV.type);
      
      //  CRITICAL FIX: Changed from 'cv_file' to 'cv'
      formData.append('cv', applyForm.selectedCV);
    } 
    else if (typeof applyForm.selectedCV === 'number') {
      // Existing CV ID from database
      console.log(' Using existing CV ID:', applyForm.selectedCV);
      formData.append('cv_id', applyForm.selectedCV);
    } 
    else {
      console.error(' Invalid CV selection type:', typeof applyForm.selectedCV);
      alert(' Lỗi: CV không hợp lệ. Vui lòng chọn lại!');
      setSubmitting(false);
      return;
    }
    
    // Add other fields
    if (applyForm.coverLetter) {
      formData.append('cover_letter', applyForm.coverLetter);
    }
    if (applyForm.expectedSalary) {
      formData.append('expected_salary', parseInt(applyForm.expectedSalary));
    }
    formData.append('salary_currency', 'VND');
    if (applyForm.availableFrom) {
      formData.append('available_from', applyForm.availableFrom);
    }

    // Log FormData for debugging
    console.log(' Sending FormData:');
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${(value.size / 1024).toFixed(2)} KB)`);
      } else {
        console.log(`  ${key}:`, value);
      }
    }

    // Send application for internal job
    const response = await axios.post(
      `http://localhost:5000/api/applications/apply/${jobId}`,  
      formData,
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    console.log(' Application response:', response.data);

    if (response.data.success) {
      alert(' Ứng tuyển thành công! Nhà tuyển dụng sẽ xem xét hồ sơ của bạn.');
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
    console.error(' Error submitting application:', error);
    console.error(' Error response:', error.response?.data);
    
    if (error.response?.status === 401) {
      alert(' Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!');
      navigate('/login');
    } else if (error.response?.status === 400) {
      const errorMsg = error.response.data?.message || 'Dữ liệu không hợp lệ';
      alert('' + errorMsg);
    } else if (error.response?.status === 409) {
      alert(' Bạn đã ứng tuyển công việc này rồi!');
    } else if (error.response?.status === 404) {
      alert(' Không tìm thấy công việc này!');
    } else if (error.response?.status === 500) {
      console.error('Server Error:', {
        message: error.response.data?.message,
        error: error.response.data?.error
      });
      alert(' Lỗi server: ' + (error.response.data?.message || 'Vui lòng thử lại sau'));
    } else {
      alert(' Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
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
    //  Ưu tiên các trường riêng biệt từ CreateJob (employer-created jobs)
    if (job.requirements || job.benefits) {
      return {
        description: job.description || '',
        requirements: job.requirements || '',
        benefits: job.benefits || ''
      };
    }
    
    //  Xử lý các trường từ database với nhiều định dạng tên khác nhau
    if (job.job_description || job.job_requirements || job.job_benefits) {
      return {
        description: job.job_description || job.description || '',
        requirements: job.job_requirements || '',
        benefits: job.job_benefits || ''
      };
    }
    
    // ✅ Xử lý jobs crawled từ web (có HTML trong description)
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

        {/* Quick Info Bar */}
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
          {/* Main Details */}
          <div className="job-main">
            {/* Job Description */}
            <section className="job-section">
              <h2 className="section-title"> Mô tả công việc</h2>
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

          {/* Sidebar */}
          <div className="job-sidebar">
            {/* CTA Card */}
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

            {/* Job Details Card */}
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

      {/*  FIXED: Application Modal with proper CV handling */}
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
                
                {/* CV Selection Tabs */}
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

                {/*   Select existing CV from database */}
                {applyForm.cvMode !== 'upload' && (
                  <>
                    {loadingCVs ? (
                      <div style={{padding: '20px', textAlign: 'center'}}>
                        <div className="spinner"></div>
                        <p>Đang tải danh sách CV...</p>
                      </div>
                    ) : userCVs.length > 0 ? (
                      <>
                        <select 
                          value={typeof applyForm.selectedCV === 'number' ? applyForm.selectedCV : ''} 
                          onChange={(e) => {
                            const cvId = parseInt(e.target.value);
                            console.log('📎 Selected CV ID:', cvId);
                            setApplyForm({...applyForm, selectedCV: cvId});
                          }}
                          className="form-control"
                          required
                        >
                          <option value="">-- Chọn CV --</option>
                          {userCVs.map(cv => (
                            <option key={cv.id} value={cv.id}>
                              {cv.file_name} 
                              {cv.is_default && ' (Mặc định)'}
                              {' - Tải lên: ' + new Date(cv.upload_date).toLocaleDateString('vi-VN')}
                            </option>
                          ))}
                        </select>
                        <small className="form-hint">
                          Chưa có CV phù hợp? <a href="/create-cv" target="_blank" rel="noopener noreferrer">Tạo CV ngay</a>
                        </small>
                      </>
                    ) : (
                      <div style={{padding: '20px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px'}}>
                        <p>Bạn chưa có CV nào. Vui lòng upload CV hoặc <a href="/create-cv" target="_blank" rel="noopener noreferrer">tạo CV mới</a>.</p>
                        <button 
                          type="button"
                          onClick={() => setApplyForm({...applyForm, cvMode: 'upload', selectedCV: null})}
                          style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            background: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Upload CV ngay
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Upload new CV */}
                {applyForm.cvMode === 'upload' && (
                  <>
                    <input 
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Validate file size
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File quá lớn! Vui lòng chọn file dưới 5MB');
                            e.target.value = '';
                            return;
                          }
                          console.log(' New CV file selected:', file.name);
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
                {submitting ? '⏳ Đang gửi...' : ' Gửi hồ sơ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetailPage;
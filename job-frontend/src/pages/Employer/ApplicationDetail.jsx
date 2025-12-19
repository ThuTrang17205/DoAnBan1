import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './JobApplications.css';

export default function JobApplications() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [matchedCandidates, setMatchedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [matchingLoading, setMatchingLoading] = useState(false);

  useEffect(() => {
    fetchJobAndApplications();
  }, [id]);

const fetchJobAndApplications = async () => {
  try {
    const token = localStorage.getItem('token');
    console.log(' Token exists:', !!token);
    
    if (!token) {
      navigate('/employer-login');
      return;
    }

    console.log(' Fetching applications for job ID:', id);

   
    const jobUrl = `http://localhost:5000/api/employers/me/jobs/${id}`;
    console.log(' Calling job API:', jobUrl);
    
    const jobResponse = await fetch(jobUrl, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(' Job response status:', jobResponse.status);

    if (jobResponse.ok) {
      const jobData = await jobResponse.json();
      console.log(' Job data:', jobData);
      setJob(jobData.job);
    } else {
      const errorText = await jobResponse.text();
      console.error(' Job error:', errorText);
    }

    
    const appsUrl = `http://localhost:5000/api/applications/job/${id}`;
    console.log(' Calling applications API:', appsUrl);
    
    const appsResponse = await fetch(appsUrl, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log(' Applications response status:', appsResponse.status);

    if (appsResponse.ok) {
      const appsData = await appsResponse.json();
      console.log(' Applications data:', appsData);
      console.log(' Total applications:', appsData.applications?.length);
      console.log(' Applications array:', appsData.applications);
      
      
      appsData.applications?.forEach((app, index) => {
        console.log(` Application ${index + 1} - CV:`, app.cv_file);
      });
      
      setApplications(appsData.applications || []);
    } else {
      const errorText = await appsResponse.text();
      console.error(' Applications error:', errorText);
    }

    setLoading(false);
  } catch (error) {
    console.error(' Error fetching data:', error);
    setLoading(false);
  }
};

  const runMatching = async () => {
    if (!window.confirm(' Bạn có muốn chạy Matching Tự Động cho công việc này?')) {
      return;
    }

    setMatchingLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      console.log(' Running Matching for job:', id);
      
      const response = await fetch(`http://localhost:5000/api/matching/jobs/${id}/run-matching`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Matching response:', data);

      if (response.ok) {
        const stats = data.data.stats;
        alert(
          ` Matching thành công!\n\n` +
          ` Tìm thấy ${stats.total_candidates} ứng viên\n` +
          ` ${stats.qualified_candidates} ứng viên phù hợp\n` +
          ` Điểm trung bình: ${stats.average_score}`
        );
        
        
        fetchMatchedCandidates();
        setFilter('ai-matching');
      } else {
        alert(` Lỗi: ${data.message || 'Không thể chạy matching'}`);
      }
    } catch (error) {
      console.error(' Error running matching:', error);
      alert(' Có lỗi xảy ra khi chạy matching. Vui lòng thử lại.');
    } finally {
      setMatchingLoading(false);
    }
  };

  const fetchMatchedCandidates = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log(' Fetching matched candidates...');
      
      const response = await fetch(
        `http://localhost:5000/api/matching/jobs/${id}/matched-candidates?minScore=60&limit=50`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      console.log('Matched candidates response:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log(' Matched candidates:', data);
        setMatchedCandidates(data.data.candidates || []);
      } else {
        const error = await response.json();
        console.log('ℹ No matched candidates:', error.message);
        setMatchedCandidates([]);
      }
    } catch (error) {
      console.error(' Error fetching matched candidates:', error);
      setMatchedCandidates([]);
    }
  };

  const handleSaveCV = async (candidateId) => {
  try {
    const token = localStorage.getItem('token');
    console.log(' Saving CV for candidate:', candidateId);
    
    const payload = {
      candidate_id: candidateId,
      job_id: parseInt(id),
      note: `Lưu từ AI Matching - Job ${id}`
    };
    
    console.log(' Sending payload:', payload);
    
    const response = await fetch(`http://localhost:5000/api/matching/saved-cvs`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log(' Response:', data);

    if (response.ok) {
      alert(' Đã lưu CV thành công!');
    } else {
      alert(` ${data.message || 'Không thể lưu CV'}`);
    }
  } catch (error) {
    console.error(' Error saving CV:', error);
    alert('Có lỗi xảy ra khi lưu CV');
  }
};

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert(`✓ Đã ${newStatus === 'approved' ? 'chấp nhận' : 'từ chối'} ứng viên`);
        fetchJobAndApplications();
      } else {
        alert('✗ Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('✗ Có lỗi xảy ra');
    }
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    if (filter === 'ai-matching') return false; // AI matching shows different content
    return app.status === filter;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="job-applications-page">
      <header className="page-header">
        <div>
          <h1>{filter === 'ai-matching' ? '🤖 Matching Tự Động ' : 'Danh sách ứng viên'}</h1>
          {job && <p className="job-title">Tin tuyển dụng: {job.title}</p>}
        </div>
        
        {filter === 'ai-matching' && (
          <button 
            className="btn-run-matching"
            onClick={runMatching}
            disabled={matchingLoading}
            style={{
              padding: '12px 24px',
              background: matchingLoading ? '#95a5a6' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: matchingLoading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              marginTop: '10px'
            }}
          >
            {matchingLoading ? '⏳ Đang xử lý...' : ' Chạy Matching'}
          </button>
        )}
      </header>

      <div className="applications-container">
        
        <div className="filter-section">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tất cả ({applications.length})
          </button>
          
          
          <button 
            className={`filter-btn ${filter === 'ai-matching' ? 'active' : ''}`}
            onClick={() => {
              setFilter('ai-matching');
              if (matchedCandidates.length === 0) {
                fetchMatchedCandidates();
              }
            }}
            style={{
              background: filter === 'ai-matching' ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '',
              color: filter === 'ai-matching' ? 'white' : ''
            }}
          >
            🤖 Matching Tự Động({matchedCandidates.length})
          </button>
          
          <button 
            className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Chờ duyệt ({applications.filter(a => a.status === 'pending').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Đã chấp nhận ({applications.filter(a => a.status === 'approved' || a.status === 'accepted').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Đã từ chối ({applications.filter(a => a.status === 'rejected').length})
          </button>
        </div>

        {/* Applications List OR AI Matching Results */}
        {filter === 'ai-matching' ? (
          // AI Matching View
          matchedCandidates.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>🤖</div>
              <p>Chưa có kết quả AI Matching</p>
              <p style={{ fontSize: '14px', color: '#7f8c8d' }}>Nhấn "Chạy Matching" để tìm ứng viên phù hợp</p>
            </div>
          ) : (
            <div className="applications-list">
              {matchedCandidates.map(candidate => (
                <MatchedCandidateCard 
                  key={candidate.id}
                  candidate={candidate}
                  onSave={handleSaveCV}
                />
              ))}
            </div>
          )
        ) : (
         
          filteredApplications.length === 0 ? (
            <div className="empty-state">
              <p>Chưa có ứng viên nào</p>
            </div>
          ) : (
            <div className="applications-list">
              {filteredApplications.map(app => (
                <ApplicationCard 
                  key={app.id} 
                  application={app}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ApplicationCard({ application, onStatusChange }) {
   console.log(' Application data:', application);
  console.log(' CV file:', application.cv_file);
  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: ' Chờ duyệt', class: 'pending' },
      approved: { text: ' Đã chấp nhận', class: 'approved' },
      accepted: { text: ' Đã chấp nhận', class: 'approved' },
      rejected: { text: ' Đã từ chối', class: 'rejected' }
    };
    return badges[status] || badges.pending;
  };

  const badge = getStatusBadge(application.status);

  return (
    <div className="application-card">
      <div className="app-header">
        <div className="candidate-info">
          <h3>{application.user_name || 'Ứng viên'}</h3>
          <p className="email">✉ {application.user_email}</p>
          {application.user_phone && <p className="phone"> {application.user_phone}</p>}
        </div>
        <span className={`status-badge ${badge.class}`}>{badge.text}</span>
      </div>

      {application.cover_letter && (
        <div className="cover-letter">
          <h4>Thư xin việc:</h4>
          <p>{application.cover_letter}</p>
        </div>
      )}

      <div className="app-meta">
        <span> Ứng tuyển: {new Date(application.created_at).toLocaleDateString('vi-VN')}</span>
        
        
        {application.expected_salary && (
          <span style={{ marginLeft: '15px' }}>
             Lương mong muốn: {application.expected_salary.toLocaleString()} {application.salary_currency || 'VND'}
          </span>
        )}
        {application.available_from && (
          <span style={{ marginLeft: '15px' }}>
            📆 Có thể bắt đầu: {new Date(application.available_from).toLocaleDateString('vi-VN')}
          </span>
        )}
      </div>


      {application.cv_file && (
        <div style={{ marginTop: '15px' }}>
          <a 
            href={`http://localhost:5000/${application.cv_file.replace(/\\/g, '/')}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-view-cv"
            style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: '#3498db',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'background 0.3s'
            }}
            onMouseOver={(e) => e.target.style.background = '#2980b9'}
            onMouseOut={(e) => e.target.style.background = '#3498db'}
          >
             Xem CV
          </a>
        </div>
      )}

      {application.status === 'pending' && (
        <div className="app-actions">
          <button 
            className="btn-approve"
            onClick={() => onStatusChange(application.id, 'approved')}
          >
             Chấp nhận
          </button>
          <button 
            className="btn-reject"
            onClick={() => onStatusChange(application.id, 'rejected')}
          >
             Từ chối
          </button>
        </div>
      )}
    </div>
  );
}


function MatchedCandidateCard({ candidate, onSave }) {
  const [loadingCV, setLoadingCV] = useState(false);
  
  console.log('📋 Candidate object:', candidate);
  
  const getScoreColor = (score) => {
    if (score >= 90) return '#27ae60';
    if (score >= 80) return '#2ecc71';
    if (score >= 70) return '#f39c12';
    if (score >= 60) return '#e67e22';
    return '#e74c3c';
  };

 
  const handleViewCV = async () => {
    setLoadingCV(true);
    
    try {
      
      if (candidate.cv_file) {
        console.log(' CV file found in candidate data:', candidate.cv_file);
        const cvUrl = `http://localhost:5000/${candidate.cv_file.replace(/\\/g, '/')}`;
        window.open(cvUrl, '_blank');
        setLoadingCV(false);
        return;
      }
      
      
      console.log(' CV file not in data, fetching from API...');
      const token = localStorage.getItem('token');
      const candidateId = candidate.candidate_id || candidate.user_id || candidate.id;
      
      const response = await fetch(
        `http://localhost:5000/api/candidates/${candidateId}/cv`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log(' CV fetched from API:', data);
        
        if (data.cv_file) {
          const cvUrl = `http://localhost:5000/${data.cv_file.replace(/\\/g, '/')}`;
          window.open(cvUrl, '_blank');
        } else {
          alert(' Ứng viên chưa có CV trong hệ thống');
        }
      } else {
        const error = await response.json();
        console.error(' API error:', error);
        alert(` ${error.message || 'Không thể tải CV'}`);
      }
    } catch (error) {
      console.error(' Error fetching CV:', error);
      alert(' Có lỗi xảy ra khi tải CV. Vui lòng thử lại.');
    } finally {
      setLoadingCV(false);
    }
  };

  return (
    <div className="application-card" style={{ borderLeft: `5px solid ${getScoreColor(candidate.total_score)}` }}>
      <div className="app-header">
        <div className="candidate-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h3>{candidate.candidate_name || candidate.name || 'Ứng viên'}</h3>
            <span style={{ 
              padding: '4px 12px', 
              background: getScoreColor(candidate.total_score), 
              color: 'white', 
              borderRadius: '20px', 
              fontSize: '12px', 
              fontWeight: '600' 
            }}>
              {Math.round(candidate.total_score)}% Match
            </span>
          </div>
          <p className="email">✉ {candidate.candidate_email || candidate.email}</p>
          <p className="phone"> {candidate.current_position || 'Chưa cập nhật'}</p>
          {candidate.total_experience_years && (
            <p className="phone"> {candidate.total_experience_years} năm kinh nghiệm</p>
          )}
        </div>
      </div>

      {/* Skills */}
      {candidate.skills && Array.isArray(candidate.skills) && candidate.skills.length > 0 && (
        <div style={{ margin: '15px 0' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '10px' }}> Kỹ năng:</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {candidate.skills.slice(0, 8).map((skill, idx) => (
              <span key={idx} style={{ 
                padding: '4px 10px', 
                background: '#e3f2fd', 
                color: '#2196f3', 
                borderRadius: '6px', 
                fontSize: '12px',
                border: '1px solid #2196f3'
              }}>
                {typeof skill === 'string' ? skill : skill.name || skill.slug}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Score Breakdown */}
      <div style={{ 
        background: '#f8f9fa', 
        padding: '15px', 
        borderRadius: '8px', 
        margin: '15px 0' 
      }}>
        <h4 style={{ fontSize: '14px', marginBottom: '10px' }}> Chi tiết điểm:</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
          <ScoreItem label="Kỹ năng" score={candidate.skills_score} />
          <ScoreItem label="Kinh nghiệm" score={candidate.experience_score} />
          <ScoreItem label="Học vấn" score={candidate.education_score} />
          <ScoreItem label="Địa điểm" score={candidate.location_score} />
        </div>
      </div>

      
      <div className="app-actions" style={{ display: 'flex', gap: '10px' }}>
        
        <button
          onClick={handleViewCV}
          disabled={loadingCV}
          style={{
            flex: 1,
            padding: '10px 20px',
            background: loadingCV ? '#95a5a6' : '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loadingCV ? 'not-allowed' : 'pointer',
            transition: 'background 0.3s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}
          onMouseOver={(e) => {
            if (!loadingCV) e.target.style.background = '#2980b9';
          }}
          onMouseOut={(e) => {
            if (!loadingCV) e.target.style.background = '#3498db';
          }}
        >
          {loadingCV ? (
            <>
              <span className="spinner" style={{
                width: '12px',
                height: '12px',
                border: '2px solid #fff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite'
              }}></span>
              Đang tải...
            </>
          ) : (
            ' Xem CV'
          )}
        </button>
        
        {/* NÚT GỬI LỜI MỜI */}
        <button 
          style={{ 
            flex: 1,
            background: '#27ae60',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background 0.3s'
          }}
          onClick={() => alert('Tính năng gửi lời mời sẽ được phát triển')}
          onMouseOver={(e) => e.target.style.background = '#229954'}
          onMouseOut={(e) => e.target.style.background = '#27ae60'}
        >
           Gửi lời mời
        </button>
      </div>
    </div>
  );
}


function ScoreItem({ label, score }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '12px' }}>
        <span>{label}</span>
        <span style={{ fontWeight: '600' }}>{Math.round(score)}%</span>
      </div>
      <div style={{ width: '100%', height: '6px', background: '#ecf0f1', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{ 
          width: `${score}%`, 
          height: '100%', 
          background: score >= 70 ? '#27ae60' : score >= 50 ? '#f39c12' : '#e74c3c',
          borderRadius: '3px',
          transition: 'width 0.3s ease'
        }}></div>
      </div>
    </div>
  );
}
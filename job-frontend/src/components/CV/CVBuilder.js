import React, { useState, useEffect } from 'react';
import './CVBuilder.css';

function CVBuilder() {
  const [cvData, setCvData] = useState({
    fullName: '', position: '', phone: '', email: '', address: '', website: '',
    birthDate: '', objective: '', avatar: '',
    experience: [{ company: '', position: '', period: '', description: '' }],
    education: [{ school: '', degree: '', period: '' }],
    skills: [''], hobbies: ''
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.storage) {
      setStorageAvailable(true);
      loadCVData();
    }
  }, []);

  useEffect(() => {
    if (!storageAvailable) return;
    const timer = setTimeout(() => {
      if (cvData.fullName || cvData.email) saveCVData();
    }, 1000);
    return () => clearTimeout(timer);
  }, [cvData, storageAvailable]);

  const loadCVData = async () => {
    try {
      const result = await window.storage.get('cv-data');
      if (result?.value) {
        setCvData(JSON.parse(result.value));
        setSaveStatus('✓ Đã tải');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (e) {}
  };

  const saveCVData = async () => {
    try {
      await window.storage.set('cv-data', JSON.stringify(cvData));
      setSaveStatus(' Đã lưu');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) {
      setSaveStatus(' Lỗi');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  const clearCVData = async () => {
    if (window.confirm('Xóa toàn bộ?')) {
      if (storageAvailable) await window.storage.delete('cv-data').catch(() => {});
      setCvData({
        fullName: '', position: '', phone: '', email: '', address: '', website: '',
        birthDate: '', objective: '', avatar: '',
        experience: [{ company: '', position: '', period: '', description: '' }],
        education: [{ school: '', degree: '', period: '' }],
        skills: [''], hobbies: ''
      });
    }
  };

  const handleInputChange = (f, v) => setCvData({ ...cvData, [f]: v });

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setCvData({ ...cvData, avatar: r.result });
      r.readAsDataURL(file);
    }
  };

  const addExperience = () => setCvData({ ...cvData, experience: [...cvData.experience, { company: '', position: '', period: '', description: '' }] });
  const updateExperience = (i, f, v) => {
    const n = [...cvData.experience];
    n[i][f] = v;
    setCvData({ ...cvData, experience: n });
  };
  const removeExperience = (i) => cvData.experience.length > 1 && setCvData({ ...cvData, experience: cvData.experience.filter((_, x) => x !== i) });

  const addEducation = () => setCvData({ ...cvData, education: [...cvData.education, { school: '', degree: '', period: '' }] });
  const updateEducation = (i, f, v) => {
    const n = [...cvData.education];
    n[i][f] = v;
    setCvData({ ...cvData, education: n });
  };
  const removeEducation = (i) => cvData.education.length > 1 && setCvData({ ...cvData, education: cvData.education.filter((_, x) => x !== i) });

  const addSkill = () => setCvData({ ...cvData, skills: [...cvData.skills, ''] });
  const updateSkill = (i, v) => {
    const n = [...cvData.skills];
    n[i] = v;
    setCvData({ ...cvData, skills: n });
  };
  const removeSkill = (i) => cvData.skills.length > 1 && setCvData({ ...cvData, skills: cvData.skills.filter((_, x) => x !== i) });

  return (
    <div className="cv-builder-container">
      <div className="cv-header">
        <h1 className="cv-title">📄 Tạo CV Chuyên Nghiệp</h1>
        <p className="cv-subtitle">Tạo CV ấn tượng - {storageAvailable ? 'Tự động lưu' : 'Chỉ lưu trong phiên'}</p>
        {saveStatus && <div className="save-status">{saveStatus}</div>}
      </div>

      <div className="cv-main-content">
        <div className="cv-column">
          <div className="cv-card">
            <h2 className="section-title"> Thông tin cá nhân</h2>
            
            <div className="avatar-section">
              <div className="avatar-preview">
                {cvData.avatar ? (
                  <img src={cvData.avatar} alt="Avatar" className="avatar-img" />
                ) : (
                  <div className="avatar-placeholder"></div>
                )}
              </div>
              <div>
                <label className="upload-btn">
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="file-input" />
                   Tải ảnh
                </label>
                {cvData.avatar && (
                  <button onClick={() => setCvData({...cvData, avatar: ''})} className="remove-avatar-btn">
                     Xóa
                  </button>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Họ tên *</label>
              <input type="text" className="form-input" placeholder="Nguyễn Văn A" value={cvData.fullName} onChange={(e) => handleInputChange('fullName', e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Vị trí *</label>
              <input type="text" className="form-input" placeholder="Senior Digital Marketing" value={cvData.position} onChange={(e) => handleInputChange('position', e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">SĐT</label>
                <input type="tel" className="form-input" placeholder="0123456789" value={cvData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="email@example.com" value={cvData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ</label>
              <input type="text" className="form-input" placeholder="Hà Nội" value={cvData.address} onChange={(e) => handleInputChange('address', e.target.value)} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Website</label>
                <input type="text" className="form-input" placeholder="portfolio.com" value={cvData.website} onChange={(e) => handleInputChange('website', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Ngày sinh</label>
                <input type="date" className="form-input" value={cvData.birthDate} onChange={(e) => handleInputChange('birthDate', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="cv-card">
            <h2 className="section-title"> Mục tiêu</h2>
            <textarea className="form-textarea" placeholder="Mô tả mục tiêu..." rows="4" value={cvData.objective} onChange={(e) => handleInputChange('objective', e.target.value)} />
          </div>

          <div className="cv-card">
            <h2 className="section-title"> Kinh nghiệm</h2>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="experience-item">
                <div className="item-header">
                  <span className="item-number">Kinh nghiệm #{i + 1}</span>
                  {cvData.experience.length > 1 && (
                    <button onClick={() => removeExperience(i)} className="remove-btn-circle">✕</button>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Công ty</label>
                  <input type="text" className="form-input" placeholder="Công ty ABC" value={exp.company} onChange={(e) => updateExperience(i, 'company', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Vị trí</label>
                    <input type="text" className="form-input" placeholder="Manager" value={exp.position} onChange={(e) => updateExperience(i, 'position', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thời gian</label>
                    <input type="text" className="form-input" placeholder="01/2021 - 06/2023" value={exp.period} onChange={(e) => updateExperience(i, 'period', e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Mô tả</label>
                  <textarea className="form-textarea" placeholder="Mô tả..." rows="3" value={exp.description} onChange={(e) => updateExperience(i, 'description', e.target.value)} />
                </div>
              </div>
            ))}
            <button onClick={addExperience} className="add-btn">+ Thêm</button>
          </div>

          <div className="cv-card">
            <h2 className="section-title"> Học vấn</h2>
            {cvData.education.map((edu, i) => (
              <div key={i} className="experience-item">
                <div className="item-header">
                  <span className="item-number">Học vấn #{i + 1}</span>
                  {cvData.education.length > 1 && (
                    <button onClick={() => removeEducation(i)} className="remove-btn-circle">✕</button>
                  )}
                </div>
                <div className="form-group">
                  <label className="form-label">Trường</label>
                  <input type="text" className="form-input" placeholder="ĐH Bách Khoa" value={edu.school} onChange={(e) => updateEducation(i, 'school', e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Bằng cấp</label>
                    <input type="text" className="form-input" placeholder="Cử nhân CNTT" value={edu.degree} onChange={(e) => updateEducation(i, 'degree', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Thời gian</label>
                    <input type="text" className="form-input" placeholder="2015 - 2019" value={edu.period} onChange={(e) => updateEducation(i, 'period', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addEducation} className="add-btn">+ Thêm</button>
          </div>

          <div className="cv-card">
            <h2 className="section-title"> Kỹ năng</h2>
            {cvData.skills.map((skill, i) => (
              <div key={i} className="skill-item">
                <input type="text" className="form-input" placeholder="Kỹ năng..." value={skill} onChange={(e) => updateSkill(i, e.target.value)} />
                {cvData.skills.length > 1 && (
                  <button onClick={() => removeSkill(i)} className="remove-btn-square">✕</button>
                )}
              </div>
            ))}
            <button onClick={addSkill} className="add-btn">+ Thêm</button>
          </div>

          <div className="cv-card">
            <h2 className="section-title"> Sở thích</h2>
            <textarea className="form-textarea" placeholder="Sở thích..." rows="2" value={cvData.hobbies} onChange={(e) => handleInputChange('hobbies', e.target.value)} />
          </div>

          <div className="action-buttons">
            <button onClick={clearCVData} className="clear-btn"> Xóa</button>
            <button onClick={() => window.print()} className="print-btn"> In CV</button>
          </div>
        </div>

        <div className="cv-column">
          <div className="cv-print-area">
            <div className="cv-left">
              <div className="cv-avatar-section">
                {cvData.avatar ? (
                  <img src={cvData.avatar} alt="Avatar" className="cv-avatar-img" />
                ) : (
                  <div className="cv-avatar-placeholder"></div>
                )}
              </div>
              
              <div className="cv-section">
                <h4 className="cv-section-title">THÔNG TIN</h4>
                {cvData.phone && <div className="cv-info-item">📞 {cvData.phone}</div>}
                {cvData.email && <div className="cv-info-item">📧 {cvData.email}</div>}
                {cvData.address && <div className="cv-info-item">📍 {cvData.address}</div>}
                {cvData.website && <div className="cv-info-item">🌐 {cvData.website}</div>}
                {cvData.birthDate && <div className="cv-info-item">🎂 {cvData.birthDate}</div>}
              </div>

              {cvData.skills.filter(s => s).length > 0 && (
                <div className="cv-section">
                  <h4 className="cv-section-title">KỸ NĂNG</h4>
                  {cvData.skills.filter(s => s).map((skill, i) => (
                    <div key={i} className="cv-skill-item">• {skill}</div>
                  ))}
                </div>
              )}

              {cvData.hobbies && (
                <div className="cv-section">
                  <h4 className="cv-section-title">SỞ THÍCH</h4>
                  <p className="cv-text">{cvData.hobbies}</p>
                </div>
              )}
            </div>

            <div className="cv-right">
              <div className="cv-name-section">
                <h2 className="cv-name">{cvData.fullName || 'HỌ VÀ TÊN'}</h2>
                <p className="cv-position">{cvData.position || 'Vị trí ứng tuyển'}</p>
              </div>

              {cvData.objective && (
                <div className="cv-section">
                  <h4 className="cv-section-title-right">MỤC TIÊU</h4>
                  <p className="cv-text">{cvData.objective}</p>
                </div>
              )}

              {cvData.experience.filter(e => e.company).length > 0 && (
                <div className="cv-section">
                  <h4 className="cv-section-title-right">KINH NGHIỆM</h4>
                  {cvData.experience.filter(e => e.company).map((exp, i) => (
                    <div key={i} className="cv-exp-item">
                      <div className="cv-exp-header">
                        <strong>{exp.position}</strong>
                        <span className="cv-exp-period">{exp.period}</span>
                      </div>
                      <div className="cv-exp-company">{exp.company}</div>
                      {exp.description && <p className="cv-exp-desc">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {cvData.education.filter(e => e.school).length > 0 && (
                <div className="cv-section">
                  <h4 className="cv-section-title-right">HỌC VẤN</h4>
                  {cvData.education.filter(e => e.school).map((edu, i) => (
                    <div key={i} className="cv-exp-item">
                      <div className="cv-exp-header">
                        <strong>{edu.degree}</strong>
                        <span className="cv-exp-period">{edu.period}</span>
                      </div>
                      <div className="cv-exp-company">{edu.school}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CVBuilder;
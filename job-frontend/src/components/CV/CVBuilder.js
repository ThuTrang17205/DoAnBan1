import React, { useState, useEffect } from 'react';
import './CVBuilder.css';

function CVBuilder() {
  const [cvData, setCvData] = useState({
    fullName: 'Lê Chiến',
    position: 'Lập trình viên',
    phone: '(024) 6580 6588',
    email: 'lechienhust@gmail.com',
    address: 'Quận Đống Đa, Hà Nội',
    birthDate: '24/09/1997',
    website: 'Nam',
    objective: 'Vận dụng kiến thức đã học tại trường, trách nghiệm thực tế để nâng cao vị trí trong các bộ môn khác nhau. Tôi muốn trở thành một lập trình viên chuyên nghiệp, công việc linh động, nhiều thử thách để vận dụng những kỹ năng chuyên môn mạnh mẽ tự bản thân để đóng góp cho tổ chức những giá trị thiết thực nhất. Không ngừng nâng cao kỹ năng chuyên môn và sử dụng các công cụ lưu về ý nghĩa thực tế nhất.',
    avatar: '',
    experience: [
      {
        company: 'Công ty TNHH MTV SVT',
        position: 'Front End Developer',
        period: '2021 - 2024',
        description: '• Quản lý các dự án phát triển giao diện trang web từ thiết kế ban đầu cho đến hoàn thiện, tối ưu mọi khả năng tương thích trên nhiều thiết bị quyết và nền tảng.\n• Tham gia đánh giá và thử nghiệm các tính năng mới để đảm bảo web hoạt động ổn định và mang lại trải nghiệm tốt nhất cho người dùng.\n• Hợp tác chặt chẽ với các lập trình viên và thiết kế để đạp ứng các yêu cầu, mục tiêu và khác thay phong thước dữ liệu độc ưu ái.\n• Phát triển và tích hợp các chức để tùy chỉnh và WordPress, PHP- Fusion và GorentoCS.\n• Tiến hành đào tạo cho không hàng và cách xử lý hệ thống quản lý nội dung hàng web.\n• Xây dựng và duy trì các phần mềm client-side bằng cách sử dụng HTML để dự tòa hoạt tần cho các phần tử trên nền web.\n• Nội triển khai, phát triển và chờ nghiệm một số ứng dụng xây dựng các tên phần dịch vụ một.\n• Lấu các cứu hoạt, kiến thích trong nhóm với các chức nơi phụ tạp, tham gia nhóm xét, đónh gỡ source code của các thành viên trong nhóm'
      },
      {
        company: 'Công ty CP công nghệ NDS',
        position: 'React Developer',
        period: '2019 - 2021',
        description: '• Phát triển và cước thành viên trong danh thực hiện lập trình và phát triển các ổn phẩm trên nền tảng web, desktop và thiện hoại dựa trên JavaScript, HTML, CSS...\n• Quản lý và duy trì các hệ thống cũ để đảm bảo hoạt động tối ưu.\n• Cùng với các cô thành viên khác tự dụy logic, dựa tao các ổi phẩm tìm vấn đề trong lập trình.\n• Sửa lỗi phát sinh và cải thiện hiệu suất hoạt động của ứng dụng.\n• Chưa toàn phương pháp và các tính năng thêm vào dỡch hư cấu liệu.\n• Quyết định phương pháp lập trình và cách thức xử lý trong gia trình phật trình viền, cấm trước là xác định các tính năng để ngược phân tần điều cho.'
      },
      {
        company: 'Công ty CP TopCV',
        position: 'Web Developer',
        period: '2017 - 2019',
        description: '• Phát triển các phần mềm trung thân thiết kể người dùng gia tăng lưu lượng truy cập, luật viền trang và trái nghiệm người dùng trên tốt.\n• Thực hiện bảo trì và cập nhật cho các trang web thách thức nhân lực tại.\n• Thực hiện thiết kế layout website, cắt HTML & CSS các sản phảm marketing.\n• Viết và tỉa trường lực liên phần mềm và tương số kỹ thuật.\n• Làm việc họp nhóm trực tuyến và offline.'
      }
    ],
    education: [
      {
        school: 'Đại học TopCV',
        degree: 'Công nghệ thông tin',
        period: '2014 - 2017',
        details: '• Tốt nghiệp loại Giỏi\n• Đạt học bổng 2016 và 2017\n• Đạt giải nhì nghiệm cứu khoa học công nghệ'
      }
    ],
    skills: [
      'Kỹ năng giao tiếp',
      'Kỹ năng đồm phù',
      'Kỹ năng thuyết trình'
    ],
    hobbies: 'Đọc sách\nNấu ăn'
  });

  const [saveStatus, setSaveStatus] = useState('');
  const [storageAvailable, setStorageAvailable] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.storage) {
      setStorageAvailable(true);
      loadCVData();
    }
  }, []);

  const saveCVData = async () => {
    try {
      await window.storage.set('cv-data-inline', JSON.stringify(cvData));
      setSaveStatus('✓ Đã lưu');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (e) {
      setSaveStatus('✗ Lỗi');
      setTimeout(() => setSaveStatus(''), 2000);
    }
  };

  useEffect(() => {
    if (!storageAvailable) return;
    const timer = setTimeout(() => {
      if (cvData.fullName || cvData.email) saveCVData();
    }, 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvData, storageAvailable]);

  const loadCVData = async () => {
    try {
      const result = await window.storage.get('cv-data-inline');
      if (result?.value) {
        setCvData(JSON.parse(result.value));
        setSaveStatus('✓ Đã tải');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch (e) {}
  };

  const clearCVData = async () => {
    if (window.confirm('Xóa toàn bộ dữ liệu CV?')) {
      if (storageAvailable) await window.storage.delete('cv-data-inline').catch(() => {});
      setCvData({
        fullName: '', position: '', phone: '', email: '', address: '', website: '',
        birthDate: '', objective: '', avatar: '',
        experience: [{ company: '', position: '', period: '', description: '' }],
        education: [{ school: '', degree: '', period: '', details: '' }],
        skills: [''], hobbies: ''
      });
    }
  };

  const handleSaveAndRedirect = async () => {
    try {
      setSaveStatus(' Đang lưu...');
      
      // Lưu vào storage local
      if (storageAvailable) {
        await window.storage.set('cv-data-inline', JSON.stringify(cvData));
      }
      
      // Lưu lên server
      const token = localStorage.getItem('token');
      if (token) {
        const response = await fetch('http://localhost:5000/api/cv/save-custom-cv', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ cvData })
        });
        
        const data = await response.json();
        
        if (data.success) {
          setSaveStatus('✓ Đã lưu thành công!');
          alert('✅ CV đã được lưu vào hồ sơ của bạn!');
          
          // Chuyển hướng sau 1 giây
          setTimeout(() => {
            window.location.href = '/profile';
          }, 1000);
        } else {
          throw new Error(data.message || 'Lỗi khi lưu CV');
        }
      } else {
        // Nếu chưa đăng nhập, chỉ lưu local
        setSaveStatus('✓ Đã lưu local!');
        alert('⚠️ Bạn chưa đăng nhập. CV chỉ được lưu tạm thời trên trình duyệt.');
        
        setTimeout(() => {
          if (window.confirm('Bạn có muốn đăng nhập để lưu CV vào hồ sơ không?')) {
            window.location.href = '/login';
          }
        }, 500);
      }
    } catch (e) {
      setSaveStatus('✗ Lỗi khi lưu');
      console.error('Error saving CV:', e);
      alert('❌ Có lỗi xảy ra: ' + e.message);
    }
  };

  const handleDownloadCV = () => {
    // Tạo nội dung CV dạng text để tải xuống
    const cvContent = `
===========================================
           ${cvData.fullName}
           ${cvData.position}
===========================================

LIÊN HỆ:
-----------
📞 Điện thoại: ${cvData.phone}
📧 Email: ${cvData.email}
📍 Địa chỉ: ${cvData.address}
🎂 Ngày sinh: ${cvData.birthDate}
🌐 Website/Giới tính: ${cvData.website}

MỤC TIÊU NGHỀ NGHIỆP:
-----------
${cvData.objective}

KINH NGHIỆM LÀM VIỆC:
-----------
${cvData.experience.map((exp, i) => `
${i + 1}. ${exp.position} - ${exp.company}
   Thời gian: ${exp.period}
   ${exp.description}
`).join('\n')}

HỌC VẤN:
-----------
${cvData.education.map((edu, i) => `
${i + 1}. ${edu.degree} - ${edu.school}
   Thời gian: ${edu.period}
   ${edu.details}
`).join('\n')}

KỸ NĂNG:
-----------
${cvData.skills.map((skill) => `• ${skill}`).join('\n')}

SỞ THÍCH:
-----------
${cvData.hobbies}

===========================================
    `;

    // Tạo blob và tải xuống
    const blob = new Blob([cvContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CV_${cvData.fullName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(' Đã tải xuống CV thành công!');
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

  const addEducation = () => setCvData({ ...cvData, education: [...cvData.education, { school: '', degree: '', period: '', details: '' }] });
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
    <div className="cv-inline-container">
      <div className="cv-inline-wrapper">
        <div className="cv-inline-left">
          {/* Avatar */}
          <div className="cv-avatar-section">
            <label className="avatar-upload">
              {cvData.avatar ? (
                <img src={cvData.avatar} alt="Avatar" className="cv-avatar-img" />
              ) : (
                <div className="cv-avatar-placeholder"></div>
              )}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="file-input" />
              <div className="avatar-overlay">Thay đổi</div>
            </label>
          </div>

          {/* Name & Position */}
          <div className="cv-name-section">
            <input
              type="text"
              className="cv-name-input"
              placeholder="Họ và tên"
              value={cvData.fullName}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            />
            <input
              type="text"
              className="cv-position-input"
              placeholder="Vị trí"
              value={cvData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
            />
          </div>

          {/* Contact Info */}
          <div className="cv-section-left">
            <h4 className="cv-section-title-left">
              <span contentEditable suppressContentEditableWarning>📞 Liên hệ</span>
            </h4>
            <div className="cv-info-group">
              <input
                type="tel"
                className="cv-input-left"
                placeholder="📞 Số điện thoại"
                value={cvData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
              <input
                type="email"
                className="cv-input-left"
                placeholder="📧 Email"
                value={cvData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
              <input
                type="text"
                className="cv-input-left"
                placeholder="📍 Địa chỉ"
                value={cvData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
              <input
                type="text"
                className="cv-input-left"
                placeholder="🎂 Ngày sinh"
                value={cvData.birthDate}
                onChange={(e) => handleInputChange('birthDate', e.target.value)}
              />
              <input
                type="text"
                className="cv-input-left"
                placeholder="🌐 Website/Giới tính"
                value={cvData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
              />
            </div>
          </div>

          {/* Skills */}
          <div className="cv-section-left">
            <h4 className="cv-section-title-left">
              <span contentEditable suppressContentEditableWarning>⚡ Kỹ năng</span>
            </h4>
            <div className="cv-skills-group">
              {cvData.skills.map((skill, i) => (
                <div key={i} className="cv-skill-item-inline">
                  <input
                    type="text"
                    className="cv-input-left"
                    placeholder="Kỹ năng..."
                    value={skill}
                    onChange={(e) => updateSkill(i, e.target.value)}
                  />
                  {cvData.skills.length > 1 && (
                    <button onClick={() => removeSkill(i)} className="btn-remove-mini">✕</button>
                  )}
                </div>
              ))}
              <button onClick={addSkill} className="btn-add-left">+ Thêm kỹ năng</button>
            </div>
          </div>

          {/* Hobbies */}
          <div className="cv-section-left">
            <h4 className="cv-section-title-left">
              <span contentEditable suppressContentEditableWarning>🎨 Sở thích</span>
            </h4>
            <textarea
              className="cv-textarea-left"
              placeholder="Sở thích của bạn..."
              rows="3"
              value={cvData.hobbies}
              onChange={(e) => handleInputChange('hobbies', e.target.value)}
            />
          </div>
        </div>

        <div className="cv-inline-right">
          {/* Objective */}
          <div className="cv-section-right">
            <h4 className="cv-section-title-right">
              <span contentEditable suppressContentEditableWarning> Mục tiêu nghề nghiệp</span>
            </h4>
            <textarea
              className="cv-textarea-right"
              placeholder="Mô tả mục tiêu nghề nghiệp của bạn..."
              rows="5"
              value={cvData.objective}
              onChange={(e) => handleInputChange('objective', e.target.value)}
            />
          </div>

          {/* Experience */}
          <div className="cv-section-right">
            <div className="section-header-with-btn">
              <h4 className="cv-section-title-right">
                <span contentEditable suppressContentEditableWarning> Kinh nghiệm làm việc</span>
              </h4>
              <button onClick={addExperience} className="btn-add-inline">+ Thêm</button>
            </div>
            {cvData.experience.map((exp, i) => (
              <div key={i} className="cv-exp-block">
                <div className="exp-header-inline">
                  <input
                    type="text"
                    className="cv-input-exp-position"
                    placeholder="Vị trí"
                    value={exp.position}
                    onChange={(e) => updateExperience(i, 'position', e.target.value)}
                  />
                  <input
                    type="text"
                    className="cv-input-exp-period"
                    placeholder="Thời gian"
                    value={exp.period}
                    onChange={(e) => updateExperience(i, 'period', e.target.value)}
                  />
                  {cvData.experience.length > 1 && (
                    <button onClick={() => removeExperience(i)} className="btn-remove-inline">✕</button>
                  )}
                </div>
                <input
                  type="text"
                  className="cv-input-company"
                  placeholder="Tên công ty"
                  value={exp.company}
                  onChange={(e) => updateExperience(i, 'company', e.target.value)}
                />
                <textarea
                  className="cv-textarea-desc"
                  placeholder="Mô tả công việc..."
                  rows="6"
                  value={exp.description}
                  onChange={(e) => updateExperience(i, 'description', e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* Education */}
          <div className="cv-section-right">
            <div className="section-header-with-btn">
              <h4 className="cv-section-title-right">
                <span contentEditable suppressContentEditableWarning> Học vấn</span>
              </h4>
              <button onClick={addEducation} className="btn-add-inline">+ Thêm</button>
            </div>
            {cvData.education.map((edu, i) => (
              <div key={i} className="cv-exp-block">
                <div className="exp-header-inline">
                  <input
                    type="text"
                    className="cv-input-exp-position"
                    placeholder="Bằng cấp/Chuyên ngành"
                    value={edu.degree}
                    onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                  />
                  <input
                    type="text"
                    className="cv-input-exp-period"
                    placeholder="Thời gian"
                    value={edu.period}
                    onChange={(e) => updateEducation(i, 'period', e.target.value)}
                  />
                  {cvData.education.length > 1 && (
                    <button onClick={() => removeEducation(i)} className="btn-remove-inline">✕</button>
                  )}
                </div>
                <input
                  type="text"
                  className="cv-input-company"
                  placeholder="Tên trường"
                  value={edu.school}
                  onChange={(e) => updateEducation(i, 'school', e.target.value)}
                />
                <textarea
                  className="cv-textarea-desc"
                  placeholder="Chi tiết (thành tích, GPA...)..."
                  rows="3"
                  value={edu.details}
                  onChange={(e) => updateEducation(i, 'details', e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="cv-bottom-actions">
        {saveStatus && <span className="save-status">{saveStatus}</span>}
        <button onClick={handleSaveAndRedirect} className="btn-save-cv"> Lưu CV</button>
        <button onClick={handleDownloadCV} className="btn-download"> Tải xuống</button>
        <button onClick={clearCVData} className="btn-clear">🗑️ Xóa toàn bộ</button>
      </div>
    </div>
  );
}

export default CVBuilder;
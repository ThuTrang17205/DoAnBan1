


const generateCVHTML = (cvData) => {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CV - ${cvData.fullName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #333;
    }

    .cv-container {
      display: flex;
      min-height: 297mm;
      width: 210mm;
      margin: 0 auto;
    }

        .cv-left {
      width: 35%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
    }

    .cv-avatar {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      margin: 0 auto 20px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .cv-avatar img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .cv-avatar-placeholder {
      font-size: 60px;
      color: #667eea;
    }

    .cv-name {
      text-align: center;
      margin-bottom: 30px;
    }

    .cv-name h1 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .cv-name h2 {
      font-size: 16px;
      font-weight: 400;
      opacity: 0.9;
    }

    .cv-section-left {
      margin-bottom: 30px;
    }

    .cv-section-title-left {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid rgba(255,255,255,0.3);
      text-transform: uppercase;
    }

    .cv-info-item {
      margin-bottom: 12px;
      font-size: 13px;
      line-height: 1.4;
    }

    .cv-skill-item {
      margin-bottom: 8px;
      padding: 6px 12px;
      background: rgba(255,255,255,0.2);
      border-radius: 6px;
      font-size: 13px;
    }

        .cv-right {
      width: 65%;
      padding: 40px 35px;
      background: white;
    }

    .cv-section-right {
      margin-bottom: 30px;
    }

    .cv-section-title-right {
      font-size: 18px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 3px solid #667eea;
      text-transform: uppercase;
    }

    .cv-objective {
      font-size: 14px;
      line-height: 1.8;
      text-align: justify;
      color: #555;
    }

    .cv-exp-item, .cv-edu-item {
      margin-bottom: 20px;
      padding-left: 20px;
      border-left: 3px solid #667eea;
    }

    .cv-exp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .cv-exp-position {
      font-size: 16px;
      font-weight: 700;
      color: #2c3e50;
    }

    .cv-exp-period {
      font-size: 13px;
      color: #7f8c8d;
      font-style: italic;
    }

    .cv-exp-company {
      font-size: 14px;
      color: #667eea;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .cv-exp-description {
      font-size: 13px;
      line-height: 1.6;
      color: #555;
      white-space: pre-line;
    }

    .cv-hobbies {
      font-size: 13px;
      line-height: 1.6;
      color: #555;
      white-space: pre-line;
    }

    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .cv-container {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="cv-container">
    <!-- LEFT SIDEBAR -->
    <div class="cv-left">
      <!-- Avatar -->
      <div class="cv-avatar">
        ${cvData.avatar 
          ? `<img src="${cvData.avatar}" alt="Avatar">` 
          : '<div class="cv-avatar-placeholder">👤</div>'
        }
      </div>

      <!-- Name -->
      <div class="cv-name">
        <h1>${cvData.fullName || 'Họ và tên'}</h1>
        <h2>${cvData.position || 'Vị trí ứng tuyển'}</h2>
      </div>

      <!-- Contact Info -->
      <div class="cv-section-left">
        <h3 class="cv-section-title-left">📞 Liên hệ</h3>
        ${cvData.phone ? `<div class="cv-info-item">📱 ${cvData.phone}</div>` : ''}
        ${cvData.email ? `<div class="cv-info-item">📧 ${cvData.email}</div>` : ''}
        ${cvData.address ? `<div class="cv-info-item">📍 ${cvData.address}</div>` : ''}
        ${cvData.birthDate ? `<div class="cv-info-item">🎂 ${cvData.birthDate}</div>` : ''}
        ${cvData.website ? `<div class="cv-info-item">🌐 ${cvData.website}</div>` : ''}
      </div>

      <!-- Skills -->
      ${cvData.skills && cvData.skills.length > 0 ? `
      <div class="cv-section-left">
        <h3 class="cv-section-title-left">⚡ Kỹ năng</h3>
        ${cvData.skills.map(skill => 
          skill ? `<div class="cv-skill-item">${skill}</div>` : ''
        ).join('')}
      </div>
      ` : ''}

      <!-- Hobbies -->
      ${cvData.hobbies ? `
      <div class="cv-section-left">
        <h3 class="cv-section-title-left">🎨 Sở thích</h3>
        <div class="cv-hobbies">${cvData.hobbies}</div>
      </div>
      ` : ''}
    </div>

    <!-- RIGHT CONTENT -->
    <div class="cv-right">
      <!-- Objective -->
      ${cvData.objective ? `
      <div class="cv-section-right">
        <h3 class="cv-section-title-right">🎯 Mục tiêu nghề nghiệp</h3>
        <div class="cv-objective">${cvData.objective}</div>
      </div>
      ` : ''}

      <!-- Experience -->
      ${cvData.experience && cvData.experience.length > 0 ? `
      <div class="cv-section-right">
        <h3 class="cv-section-title-right">💼 Kinh nghiệm làm việc</h3>
        ${cvData.experience.map(exp => 
          exp.company || exp.position ? `
          <div class="cv-exp-item">
            <div class="cv-exp-header">
              <div class="cv-exp-position">${exp.position || 'Vị trí'}</div>
              <div class="cv-exp-period">${exp.period || ''}</div>
            </div>
            <div class="cv-exp-company">${exp.company || 'Công ty'}</div>
            ${exp.description ? `<div class="cv-exp-description">${exp.description}</div>` : ''}
          </div>
          ` : ''
        ).join('')}
      </div>
      ` : ''}

      <!-- Education -->
      ${cvData.education && cvData.education.length > 0 ? `
      <div class="cv-section-right">
        <h3 class="cv-section-title-right">🎓 Học vấn</h3>
        ${cvData.education.map(edu => 
          edu.school || edu.degree ? `
          <div class="cv-edu-item">
            <div class="cv-exp-header">
              <div class="cv-exp-position">${edu.degree || 'Bằng cấp'}</div>
              <div class="cv-exp-period">${edu.period || ''}</div>
            </div>
            <div class="cv-exp-company">${edu.school || 'Trường'}</div>
            ${edu.details ? `<div class="cv-exp-description">${edu.details}</div>` : ''}
          </div>
          ` : ''
        ).join('')}
      </div>
      ` : ''}
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = { generateCVHTML };
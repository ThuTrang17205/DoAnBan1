import React, { useState } from 'react';
import './CoverLetter.css';

export default function CoverLetterTemplates() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const categories = [
    { id: 'all', name: 'Tất cả mẫu thư', count: 3 },
    { id: 'professional', name: 'Chuyên nghiệp', count: 1 },
    { id: 'creative', name: 'Sáng tạo', count: 1 },
    { id: 'colorful', name: 'Màu sắc', count: 2 }
  ];

  const templates = [
    {
      id: 1,
      name: 'Tinh tế 2',
      category: 'professional',
      tags: ['Chuyên Nghiệp', 'Sáng Tạo'],
      colors: ['#1a1a1a', '#8b0000', '#1e3a8a'],
      description: 'Thiết kế thanh lịch với sidebar xanh dương, phù hợp cho mọi ngành nghề'
    },
    {
      id: 2,
      name: 'Màu sắc 1',
      category: 'colorful',
      tags: ['Màu Sắc', 'Sáng Tạo'],
      colors: ['#7dd3c0'],
      description: 'Thiết kế gradient pastel độc đáo, nổi bật và sáng tạo'
    },
    {
      id: 3,
      name: 'Chrome',
      category: 'colorful',
      tags: ['Màu Sắc', 'Sáng Tạo'],
      colors: ['#2563eb', '#10b981', '#f59e0b', '#ef4444'],
      description: 'Thiết kế gradient hiện đại với avatar tròn, trẻ trung và chuyên nghiệp'
    }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="cover-letter-page">
      {/* Header */}
    
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Mẫu Cover Letter chuyên nghiệp</h1>
        <p>Chọn từ nhiều mẫu thư xin việc được thiết kế chi tiết, thu hút nhà tuyển dụng</p>
      </div>

      {/* Main Content */}
      <div className="main-container">
        <div className="content-wrapper">
          {/* Sidebar */}
          <aside className="sidebar">
            {/* Categories */}
            <div className="categories-card">
              <h3>Danh mục mẫu thư</h3>
              <div className="category-list">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  >
                    <span>{cat.name}</span>
                    <span className="count-badge">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Banner */}
            <div className="premium-banner">
              <div className="premium-icon">⭐</div>
              <h4>Nâng cấp tài khoản</h4>
              <p>Truy cập không giới hạn tất cả mẫu Cover Letter cao cấp</p>
              <button className="premium-btn">Nâng cấp ngay</button>
            </div>
          </aside>

          {/* Templates Grid */}
          <div className="templates-section">
            <div className="section-header">
              <h2>Tất cả mẫu thư</h2>
              <p>Nhiều mẫu thư có sẵn</p>
            </div>

            <div className="templates-grid">
              {filteredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onClick={() => setSelectedTemplate(template)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedTemplate && (
        <PreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}

function TemplateCard({ template, onClick }) {
  return (
    <div className="template-card" onClick={onClick}>
      <div className="template-preview">
        {renderLetterPreview(template)}
      </div>
      <div className="template-info">
        <h3>{template.name}</h3>
        <div className="tags">
          {template.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <div className="color-palette">
          {template.colors.map((color, i) => (
            <div key={i} className="color-dot" style={{ background: color }}></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderLetterPreview(template) {
  if (template.id === 1) {
    return (
      <div className="letter-preview-1">
        <div className="sidebar-blue">
          <div className="avatar-frame">
            <div className="avatar-img"></div>
          </div>
          <div className="vertical-text">
            <div className="name-vertical">ĐỖ HOÀNG NAM</div>
            <div className="title-vertical">DIGITAL MARKETING</div>
          </div>
          <div className="contact-vertical">
            <div className="contact-item-v">📅 15/03/1998</div>
            <div className="contact-item-v">📧 hoangnam@email.com</div>
            <div className="contact-item-v">📞 0123 456 789</div>
            <div className="contact-item-v">📍 Hà Nội, Việt Nam</div>
          </div>
        </div>
        <div className="content-area">
          <div className="letter-greeting">
            <div className="to-label">Kính gửi: <strong>Công ty ABC</strong></div>
            <div className="date-label">Hà Nội, ngày 10 tháng 12 năm 2025</div>
          </div>
          
          <div className="letter-body">
            <div className="body-paragraph">
              <div className="p-text">Tôi viết thư này để bày tỏ sự quan tâm sâu sắc đến vị trí <strong>Digital Marketing Executive</strong> tại Công ty ABC. Với hơn 3 năm kinh nghiệm trong lĩnh vực marketing số và niềm đam mê mãnh liệt với sáng tạo nội dung, tôi tin rằng mình có thể đóng góp hiệu quả cho sự phát triển của công ty.</div>
            </div>

            <div className="body-paragraph">
              <div className="p-text">Trong quá trình làm việc tại Công ty XYZ, tôi đã thành công trong việc tăng 150% lượng tương tác trên mạng xã hội và cải thiện 80% tỷ lệ chuyển đổi thông qua các chiến dịch quảng cáo Facebook và Google Ads. Tôi thành thạo các công cụ như Google Analytics, SEMrush, và có kỹ năng mạnh về content marketing, SEO/SEM.</div>
            </div>

            <div className="body-paragraph">
              <div className="p-text">Tôi rất ấn tượng với các chiến dịch marketing gần đây của Công ty ABC và mong muốn được đóng góp ý tưởng sáng tạo cũng như kinh nghiệm của mình để cùng công ty đạt được những mục tiêu kinh doanh trong tương lai.</div>
            </div>

            <div className="body-paragraph">
              <div className="p-text">Tôi rất mong được cơ hội trao đổi thêm về vị trí này. Xin vui lòng liên hệ với tôi qua số điện thoại 0123 456 789 hoặc email hoangnam@email.com.</div>
            </div>

            <div className="letter-closing">
              <div className="closing-text">Trân trọng,</div>
              <div className="signature-name">Đỗ Hoàng Nam</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template.id === 2) {
    return (
      <div className="letter-preview-2">
        <div className="gradient-overlay"></div>
        <div className="paper">
          <div className="header-section">
            <div className="avatar-circle"></div>
            <div className="header-info">
              <div className="name-text">HOÀNG THỊ TRANG</div>
              <div className="job-text">Digital Marketing</div>
              <div className="info-grid">
                <div className="info-cell">📱 0987 654 321</div>
                <div className="info-cell">📧 trang@email.com</div>
                <div className="info-cell">📍 Hà Nội</div>
                <div className="info-cell">🎂 06/12/2003</div>
              </div>
            </div>
          </div>
          <div className="content-box">
            <div className="box-title">Kính gửi: Ban Giám đốc Công ty DEF</div>
            <div className="box-content">
              <div className="real-paragraph">Tôi là Hoàng Thị Trang, sinh viên năm cuối ngành Marketing tại Đại học Ngoại thương. Tôi viết thư này để ứng tuyển vị trí Marketing Intern tại công ty quý vị.</div>
              
              <div className="real-paragraph">Trong thời gian học tập, tôi đã tham gia nhiều dự án thực tế về digital marketing và đạt giải Nhất cuộc thi Marketing Challenge 2024. Tôi thành thạo các công cụ như Canva, Facebook Ads Manager và có kinh nghiệm quản lý fanpage với 50K+ followers.</div>
              
              <div className="real-paragraph">Tôi mong muốn được học hỏi và đóng góp cho sự phát triển của công ty. Xin vui lòng xem CV đính kèm để biết thêm chi tiết.</div>
              
              <div className="real-paragraph signature-style">Trân trọng,<br/>Hoàng Thị Trang</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (template.id === 3) {
    return (
      <div className="letter-preview-3">
        <div className="gradient-bg-3"></div>
        <div className="paper-3">
          <div className="header-3">
            <div className="avatar-gradient"></div>
            <div className="info-3">
              <div className="name-3">NGUYỄN HUY MINH</div>
              <div className="contacts-3">
                <div className="contact-3">📱 0369 147 258</div>
                <div className="contact-3">📧 huyminh@email.com</div>
                <div className="contact-3">📍 TP. HCM</div>
              </div>
            </div>
          </div>
          <div className="body-3">
            <div className="greeting-3">Kính gửi: Phòng Nhân sự Công ty GHI</div>
            <div className="date-3">TP. Hồ Chí Minh, ngày 10/12/2025</div>
            
            <div className="real-section">
              <div className="real-text">Tôi viết thư này để bày tỏ sự quan tâm đến vị trí <strong>Senior UX/UI Designer</strong> tại Công ty GHI. Với 5+ năm kinh nghiệm thiết kế sản phẩm số và đam mê tạo ra trải nghiệm người dùng xuất sắc, tôi tin mình phù hợp với vị trí này.</div>
            </div>
            
            <div className="real-section">
              <div className="real-text">Tại công ty hiện tại, tôi đã dẫn dắt team thiết kế các dự án lớn như ứng dụng ngân hàng số với 2M+ users và trang thương mại điện tử đạt doanh thu 100 tỷ/năm. Tôi thành thạo Figma, Adobe XD, Sketch và có kinh nghiệm làm việc theo phương pháp Agile/Scrum.</div>
            </div>
            
            <div className="real-section">
              <div className="real-text">Tôi rất ấn tượng với các sản phẩm của Công ty GHI và mong muốn đóng góp vào sự phát triển của công ty. Rất mong có cơ hội trao đổi thêm.</div>
            </div>
            
            <div className="closing-3">
              <div className="closing-regards">Trân trọng,</div>
              <div className="closing-name">Nguyễn Huy Minh</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function PreviewModal({ template, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="modal-layout">
          <div className="modal-left">
            <div className="preview-wrapper">
              {renderLetterPreview(template)}
            </div>
          </div>

          <div className="modal-right">
            <h2 className="modal-title">{template.name}</h2>
            
            <div className="modal-section">
              <h4>Về mẫu thư này</h4>
              <p>{template.description}</p>
            </div>

            <div className="modal-section">
              <h4>Phù hợp với</h4>
              <div className="tags-wrapper">
                {template.tags.map(tag => (
                  <span key={tag} className="tag-large">{tag}</span>
                ))}
              </div>
            </div>

            <div className="modal-section">
              <h4>Tính năng</h4>
              <ul className="features">
                <li><span className="check-icon">✓</span> Dễ dàng chỉnh sửa và tùy chỉnh</li>
                <li><span className="check-icon">✓</span> Thiết kế chuyên nghiệp, thu hút</li>
                <li><span className="check-icon">✓</span> Xuất PDF chất lượng cao</li>
                <li><span className="check-icon">✓</span> Phù hợp mọi ngành nghề</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button className="btn-primary"> Sử dụng mẫu này</button>
              <button className="btn-secondary"> Tải xuống</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
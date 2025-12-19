import React, { useState } from 'react';
import './CVTemplatesPage.css';

export default function CVTemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const categories = [
    { id: 'all', name: 'Tất cả mẫu CV', count: 9 },
    { id: 'simple', name: 'CV Đơn giản', count: 2 },
    { id: 'professional', name: 'CV Chuyên nghiệp', count: 3 },
    { id: 'creative', name: 'CV Sáng tạo', count: 2 },
    { id: 'modern', name: 'CV Hiện đại', count: 2 }
  ];

  const templates = [
    {
      id: 1,
      name: 'Lê Quang Dũng',
      category: 'professional',
      isPremium: false,
      tags: ['ATS', 'Chuyên nghiệp', '2 cột'],
      accentColor: '#2563eb',
      layout: 'two-column-header',
      description: 'Thiết kế 2 cột với header xám, phù hợp cho Business Development, Sales'
    },
    {
      id: 2,
      name: 'Nguyễn Minh Trang',
      category: 'modern',
      isPremium: false,
      tags: ['Hiện đại', 'Tối giản', 'Badge'],
      accentColor: '#00C853',
      layout: 'single-column-badge',
      description: 'Thiết kế hiện đại với badge "Mới", phù hợp cho sinh viên mới ra trường'
    },
    {
      id: 3,
      name: 'Nguyễn Quỳnh Như',
      category: 'professional',
      isPremium: true,
      tags: ['ATS', 'Chuyên nghiệp', '3 cột'],
      accentColor: '#34495e',
      layout: 'three-column-info',
      description: 'Layout 3 cột thông tin, phù hợp cho quản lý cấp cao'
    },
    {
      id: 4,
      name: 'Mai Anh Designer',
      category: 'creative',
      isPremium: true,
      tags: ['Sáng tạo', '2 cột', 'Màu sắc'],
      accentColor: '#4CAF50',
      layout: 'sidebar-creative',
      description: 'Thiết kế 2 cột với accent màu xanh lá, phù hợp cho Designer, Creative'
    },
    {
      id: 5,
      name: 'Tiêu chuẩn',
      category: 'simple',
      isPremium: false,
      tags: ['ATS', 'Đơn giản', '1 cột'],
      accentColor: '#2563eb',
      layout: 'single-column-simple',
      description: 'CV đơn giản 1 cột, dễ đọc, tối ưu ATS'
    },
    {
      id: 6,
      name: 'Thanh lịch',
      category: 'professional',
      isPremium: false,
      tags: ['ATS', 'Thanh lịch', 'Timeline'],
      accentColor: '#8b5cf6',
      layout: 'timeline-elegant',
      description: 'Thiết kế timeline rõ ràng, phù hợp mọi ngành nghề'
    },
    {
      id: 7,
      name: 'Sáng tạo',
      category: 'creative',
      isPremium: true,
      tags: ['Sáng tạo', 'Hiện đại', 'Màu sắc'],
      accentColor: '#ec4899',
      layout: 'creative-colorful',
      description: 'Thiết kế độc đáo với màu sắc nổi bật'
    },
    {
      id: 8,
      name: 'Minimalist',
      category: 'modern',
      isPremium: true,
      tags: ['Hiện đại', 'Tối giản', 'Clean'],
      accentColor: '#06b6d4',
      layout: 'minimal-clean',
      description: 'Thiết kế tối giản, sạch sẽ, chuyên nghiệp'
    },
    {
      id: 9,
      name: 'Fresh Graduate',
      category: 'simple',
      isPremium: false,
      tags: ['Sinh viên', 'Đơn giản', 'ATS'],
      accentColor: '#10b981',
      layout: 'fresh-graduate',
      description: 'Dành cho sinh viên mới ra trường, ít kinh nghiệm'
    }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  return (
    <div className="cv-templates-page">
      {/* Hero Section */}
      <div className="hero-section">
        <h1>Mẫu CV chuyên nghiệp</h1>
        <p>Chọn từ nhiều mẫu CV được thiết kế chi tiết, tối ưu ATS</p>
      </div>

      {/* Main Content */}
      <div className="main-container">
        <div className="content-wrapper">
          {/* Sidebar */}
          <aside className="sidebar">
            {/* Categories */}
            <div className="categories-card">
              <h3>Danh mục mẫu CV</h3>
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
              <p>Truy cập không giới hạn tất cả mẫu CV cao cấp</p>
              <button className="premium-btn">Nâng cấp ngay</button>
            </div>
          </aside>

          {/* Templates Grid */}
          <div className="templates-section">
            <div>
              <h2>{categories.find(c => c.id === selectedCategory)?.name}</h2>
              <p>{filteredTemplates.length} mẫu CV có sẵn</p>
            </div>

            <div className="templates-grid">
              {filteredTemplates.map(template => (
                <CVTemplateCard
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
        <CVPreviewModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}

function CVTemplateCard({ template, onClick }) {
  return (
    <div className="cv-template-card" onClick={onClick}>
      {/* CV Preview */}
      <div className="cv-preview-area">
        {template.isPremium && (
          <div className="premium-badge">⭐ PREMIUM</div>
        )}
        
        {renderCVPreview(template)}
      </div>

      {/* Info */}
      <div className="template-info">
        <h3>{template.name}</h3>
        <div className="template-tags">
          {template.tags.map(tag => (
            <span key={tag} className="template-tag">{tag}</span>
          ))}
        </div>
        <div className="template-actions">
          <button className="btn-view"> Xem</button>
          <button 
            className="btn-use" 
            style={{ background: template.accentColor }}
          >
             Dùng
          </button>
        </div>
      </div>
    </div>
  );
}

function renderCVPreview(template) {
  // Template 1: Lê Quang Dũng - Professional 2 columns
  if (template.id === 1) {
    return (
      <div style={{
        width: '240px',
        height: '340px',
        background: 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        fontSize: '7px',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden'
      }}>
        {/* Header with gray background */}
        <div style={{
          background: '#e8e8e8',
          padding: '14px 12px',
          display: 'flex',
          gap: '10px',
          borderBottom: '2px solid #d0d0d0'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            background: '#c0c0c0',
            border: '2px solid #999',
            flexShrink: 0
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px', color: '#1a1a1a' }}>
              LÊ QUANG DŨNG
            </div>
            <div style={{ fontSize: '6.5px', color: '#555', marginBottom: '5px', fontWeight: '600' }}>
              Business Development Executive
            </div>
            <div style={{ fontSize: '5.5px', color: '#666', lineHeight: '1.5' }}>
              <div>📅 15/03/1998 | 👤 Nam</div>
              <div>📞 0123-456-789</div>
              <div>✉️ lequangdung@email.com</div>
              <div>📍 Hà Nội, Việt Nam</div>
            </div>
          </div>
        </div>
        
        {/* Body content */}
        <div style={{ padding: '12px' }}>
          {/* Objective */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              fontSize: '7.5px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              borderBottom: '1.5px solid #2563eb',
              paddingBottom: '2px',
              marginBottom: '5px',
              textTransform: 'uppercase'
            }}>
              Mục Tiêu Nghề Nghiệp
            </div>
            <div style={{ fontSize: '6px', color: '#555', lineHeight: '1.5' }}>
              Mong muốn trở thành Business Development Manager tại một công ty lớn, góp phần phát triển thị trường và tăng trưởng doanh thu bền vững.
            </div>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              fontSize: '7.5px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              borderBottom: '1.5px solid #2563eb',
              paddingBottom: '2px',
              marginBottom: '5px',
              textTransform: 'uppercase'
            }}>
              Kinh Nghiệm Làm Việc
            </div>
            <div style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '6.5px', fontWeight: 'bold', color: '#2563eb', marginBottom: '1px' }}>
                03/2022 - Hiện tại
              </div>
              <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '1px' }}>
                Business Development Executive
              </div>
              <div style={{ fontSize: '6px', color: '#666', marginBottom: '3px', fontStyle: 'italic' }}>
                FPT Software - Hà Nội
              </div>
              <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '5.5px', color: '#555', lineHeight: '1.6' }}>
                <li>Phát triển 50+ khách hàng doanh nghiệp mới</li>
                <li>Đạt 120% target doanh số quý 4/2024</li>
                <li>Quản lý portfolio 100+ khách hàng</li>
              </ul>
            </div>
          </div>

          {/* Education */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              fontSize: '7.5px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              borderBottom: '1.5px solid #2563eb',
              paddingBottom: '2px',
              marginBottom: '5px',
              textTransform: 'uppercase'
            }}>
              Học Vấn
            </div>
            <div>
              <div style={{ fontSize: '6.5px', fontWeight: 'bold', color: '#2563eb', marginBottom: '1px' }}>
                2016 - 2020
              </div>
              <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '1px' }}>
                Cử nhân Kinh tế Quốc tế
              </div>
              <div style={{ fontSize: '6px', color: '#666', marginBottom: '2px' }}>
                Đại học Ngoại Thương Hà Nội
              </div>
              <div style={{ fontSize: '5.5px', color: '#555' }}>
                GPA: 3.6/4.0 | Tốt nghiệp Khá
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <div style={{
              fontSize: '7.5px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              borderBottom: '1.5px solid #2563eb',
              paddingBottom: '2px',
              marginBottom: '5px',
              textTransform: 'uppercase'
            }}>
              Kỹ Năng
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
              {['Sales', 'Negotiation', 'CRM', 'B2B', 'Marketing'].map(skill => (
                <span key={skill} style={{
                  fontSize: '5.5px',
                  background: '#e3f2fd',
                  color: '#2563eb',
                  padding: '2px 5px',
                  borderRadius: '3px',
                  fontWeight: '600'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Template 2: Nguyễn Minh Trang - Modern with badge
  if (template.id === 2) {
    return (
      <div style={{
        width: '240px',
        height: '340px',
        background: 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        fontSize: '7px',
        fontFamily: 'Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* New Badge */}
        <div style={{
          position: 'absolute',
          top: '8px',
          left: '12px',
          background: template.accentColor,
          color: 'white',
          padding: '3px 8px',
          borderRadius: '10px',
          fontSize: '7px',
          fontWeight: 'bold',
          zIndex: 10
        }}>
          ✿ Mới
        </div>

        {/* Header */}
        <div style={{
          padding: '20px 12px 12px',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'start' }}>
            <div style={{
              width: '42px',
              height: '42px',
              background: '#f5f5f5',
              border: '2px solid #ddd',
              borderRadius: '6px',
              flexShrink: 0
            }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px', color: '#1a1a1a' }}>
                NGUYỄN MINH TRANG
              </div>
              <div style={{ fontSize: '6.5px', color: '#7f8c8d', marginBottom: '4px' }}>
                Audit Intern
              </div>
              <div style={{ 
                fontSize: '5.5px', 
                color: '#666', 
                lineHeight: '1.4',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2px'
              }}>
                <div>📅 06/12/2003</div>
                <div>📞 034-612-6612</div>
                <div>👤 Nữ</div>
                <div>✉️ trang@email.com</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '12px' }}>
          {/* Objective */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              fontSize: '7.5px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              textAlign: 'center',
              borderBottom: '1.5px solid #34495e',
              paddingBottom: '3px',
              marginBottom: '5px'
            }}>
              MỤC TIÊU NGHỀ NGHIỆP
            </div>
            <div style={{ fontSize: '6px', color: '#555', lineHeight: '1.5', textAlign: 'justify' }}>
              Sinh viên năm cuối mong muốn có cơ hội thực tập tại vị trí Audit để tích lũy kinh nghiệm và phát triển kỹ năng chuyên môn trong lĩnh vực kiểm toán.
            </div>
          </div>

          {/* Education */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              fontSize: '7.5px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              textAlign: 'center',
              borderBottom: '1.5px solid #34495e',
              paddingBottom: '3px',
              marginBottom: '5px'
            }}>
              HỌC VẤN
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ fontSize: '6px', fontWeight: 'bold', color: '#34495e', width: '45px', flexShrink: 0 }}>
                2021 - 2025
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '1px' }}>
                  Đại học Ngoại thương Hà Nội
                </div>
                <div style={{ fontSize: '6px', color: '#7f8c8d', marginBottom: '2px' }}>
                  Chuyên ngành: Ngân hàng & Tài chính
                </div>
                <div style={{ fontSize: '5.5px', color: '#555' }}>
                  GPA: 3.4/4.0 | Dự kiến tốt nghiệp 06/2025
                </div>
              </div>
            </div>
          </div>

          {/* Activities */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              fontSize: '7.5px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              textAlign: 'center',
              borderBottom: '1.5px solid #34495e',
              paddingBottom: '3px',
              marginBottom: '5px'
            }}>
              HOẠT ĐỘNG
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ fontSize: '6px', fontWeight: 'bold', color: '#34495e', width: '45px', flexShrink: 0 }}>
                2022 - 2025
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '6.5px', fontWeight: 'bold', marginBottom: '2px' }}>
                  Thành viên CLB Nguồn nhân lực
                </div>
                <ul style={{ margin: 0, paddingLeft: '10px', fontSize: '5.5px', color: '#555', lineHeight: '1.6' }}>
                  <li>Tổ chức 5+ workshop về phát triển nghề nghiệp</li>
                  <li>Hỗ trợ 200+ sinh viên tìm việc làm part-time</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <div style={{
              fontSize: '7.5px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              textAlign: 'center',
              borderBottom: '1.5px solid #34495e',
              paddingBottom: '3px',
              marginBottom: '5px'
            }}>
              KỸ NĂNG
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center' }}>
              {['Excel', 'MS Office', 'Tiếng Anh', 'Teamwork'].map(skill => (
                <span key={skill} style={{
                  fontSize: '5.5px',
                  background: '#e8f8f5',
                  color: '#00C853',
                  padding: '2px 5px',
                  borderRadius: '3px',
                  fontWeight: '600'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Template 3: Nguyễn Quỳnh Như - 3 columns
  if (template.id === 3) {
    return (
      <div style={{
        width: '240px',
        height: '340px',
        background: 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        fontSize: '6.5px',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: '#f8f9fa',
          padding: '12px',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <div style={{
              width: '38px',
              height: '46px',
              background: '#d0d5dd',
              flexShrink: 0
            }}></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>
                Nguyễn Quỳnh Như
              </div>
              <div style={{
                fontSize: '7px',
                fontWeight: 'bold',
                color: '#34495e',
                paddingBottom: '3px',
                borderBottom: '1.5px solid #333'
              }}>
                Quản lý nhà hàng
              </div>
            </div>
          </div>
        </div>

        {/* 3 Column Info */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          padding: '10px 12px',
          borderBottom: '1.5px solid #e0e0e0',
          background: '#fafafa'
        }}>
          <div>
            <div style={{
              fontSize: '6.5px',
              fontWeight: 'bold',
              marginBottom: '4px',
              paddingBottom: '2px',
              borderBottom: '1.5px solid #333',
              textTransform: 'uppercase'
            }}>
              Thông tin
            </div>
            <div style={{ fontSize: '5px', color: '#555', lineHeight: '1.5' }}>
              <div>📅 15/05/1995</div>
              <div>📞 024-6680</div>
              <div>✉️ nhuquynh@</div>
              <div>📍 HN, VN</div>
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '6.5px',
              fontWeight: 'bold',
              marginBottom: '4px',
              paddingBottom: '2px',
              borderBottom: '1.5px solid #333',
              textTransform: 'uppercase'
            }}>
              Học vấn
            </div>
            <div style={{ fontSize: '5px', color: '#555' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>ĐH Kinh tế</div>
              <div>2013-2017</div>
              <div>Quản trị KS</div>
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '6.5px',
              fontWeight: 'bold',
              marginBottom: '4px',
              paddingBottom: '2px',
              borderBottom: '1.5px solid #333',
              textTransform: 'uppercase'
            }}>
              Chứng chỉ
            </div>
            <div style={{ fontSize: '5px', color: '#555' }}>
              <div style={{ fontWeight: 'bold' }}>Food Safety</div>
              <div>2022</div>
            </div>
          </div>
        </div>

        {/* Experience */}
        <div style={{ padding: '10px 12px' }}>
          <div style={{
            fontSize: '7px',
            fontWeight: 'bold',
            marginBottom: '6px',
            paddingBottom: '2px',
            borderBottom: '1.5px solid #333',
            textTransform: 'uppercase'
          }}>
            Kinh Nghiệm Làm Việc
          </div>
          
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '6px', fontWeight: 'bold', color: '#34495e', marginBottom: '1px' }}>
              01/2022 - Hiện tại
            </div>
            <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '1px' }}>
              Quản lý nhà hàng
            </div>
            <div style={{ fontSize: '5.5px', color: '#666', marginBottom: '3px', fontStyle: 'italic' }}>
              RKW Hotel & Restaurant - Hà Nội
            </div>
            <ul style={{ margin: 0, paddingLeft: '10px', fontSize: '5px', color: '#555', lineHeight: '1.6' }}>
              <li>Quản lý 30+ nhân viên bộ phận F&B</li>
              <li>Tăng doanh thu 25% năm 2024</li>
              <li>Đảm bảo chất lượng dịch vụ 5 sao</li>
              <li>Xử lý khiếu nại & giữ chân khách hàng</li>
            </ul>
          </div>

          <div>
            <div style={{ fontSize: '6px', fontWeight: 'bold', color: '#34495e', marginBottom: '1px' }}>
              06/2019 - 12/2021
            </div>
            <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '1px' }}>
              Trưởng ca nhà hàng
            </div>
            <div style={{ fontSize: '5.5px', color: '#666', marginBottom: '3px', fontStyle: 'italic' }}>
              Golden Palace Restaurant
            </div>
            <ul style={{ margin: 0, paddingLeft: '10px', fontSize: '5px', color: '#555', lineHeight: '1.6' }}>
              <li>Điều phối 15 nhân viên phục vụ</li>
              <li>Đào tạo nhân viên mới</li>
              <li>Kiểm soát chất lượng món ăn</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Template 4: Mai Anh Designer - Sidebar creative
  if (template.id === 4) {
    return (
      <div style={{
        width: '240px',
        height: '340px',
        background: 'white',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        display: 'grid',
        gridTemplateColumns: '85px 1fr',
        fontSize: '6.5px',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden'
      }}>
        {/* Sidebar */}
        <div style={{
          background: '#f8f9fa',
          padding: '12px 8px'
        }}>
          {/* Avatar */}
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a8e6cf, #4CAF50)',
            border: '3px solid white',
            margin: '0 auto 8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}></div>
          
          <div style={{ fontSize: '9px', fontWeight: 'bold', textAlign: 'center', marginBottom: '2px', color: '#1a1a1a' }}>
            NGUYỄN MAI ANH
          </div>
          <div style={{ fontSize: '6px', color: '#666', textAlign: 'center', marginBottom: '10px' }}>
            UI/UX Designer
          </div>

          {/* Contact Info */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              fontSize: '6.5px',
              fontWeight: 'bold',
              marginBottom: '5px',
              paddingBottom: '2px',
              borderBottom: `2px solid ${template.accentColor}`
            }}>
              Thông tin
            </div>
            <div style={{ fontSize: '5px', color: '#555', lineHeight: '1.7' }}>
              <div>📞 024-6680-xxx</div>
              <div>✉️ maianh@</div>
              <div>email.com</div>
              <div>📍 Hà Nội</div>
              <div>🌐 portfolio.io</div>
            </div>
          </div>

          {/* Skills */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              fontSize: '6.5px',
              fontWeight: 'bold',
              marginBottom: '5px',
              paddingBottom: '2px',
              borderBottom: `2px solid ${template.accentColor}`
            }}>
              Kỹ năng
            </div>
            <div style={{ fontSize: '5px', color: '#555', lineHeight: '1.7' }}>
              {['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Wireframe'].map((skill, i) => (
                <div key={i} style={{ marginBottom: '2px', paddingLeft: '8px', position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: template.accentColor,
                    fontWeight: 'bold'
                  }}>•</span>
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <div style={{
              fontSize: '6.5px',
              fontWeight: 'bold',
              marginBottom: '5px',
              paddingBottom: '2px',
              borderBottom: `2px solid ${template.accentColor}`
            }}>
              Ngôn ngữ
            </div>
            <div style={{ fontSize: '5px', color: '#555', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '2px' }}>
                <div style={{ fontWeight: 'bold' }}>Tiếng Việt</div>
                <div>Bản ngữ</div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>English</div>
                <div>IELTS 7.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '12px 10px' }}>
          {/* Education */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              fontSize: '7px',
              fontWeight: 'bold',
              marginBottom: '5px',
              paddingBottom: '2px',
              borderBottom: `2px solid ${template.accentColor}`,
              display: 'inline-block',
              textTransform: 'uppercase'
            }}>
              Học vấn
            </div>
            <div>
              <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '1px' }}>
                ĐH Mỹ thuật Công nghiệp
              </div>
              <div style={{ fontSize: '5.5px', color: '#888', marginBottom: '2px' }}>
                09/2015 - 05/2019
              </div>
              <div style={{ fontSize: '6px', color: '#555', marginBottom: '2px' }}>
                Cử nhân Thiết kế Đồ họa
              </div>
              <div style={{ fontSize: '5px', color: '#555' }}>
                GPA: 3.7/4.0 | Tốt nghiệp Giỏi
              </div>
            </div>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              fontSize: '7px',
              fontWeight: 'bold',
              marginBottom: '5px',
              paddingBottom: '2px',
              borderBottom: `2px solid ${template.accentColor}`,
              display: 'inline-block',
              textTransform: 'uppercase'
            }}>
              Kinh nghiệm
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                <div style={{ fontSize: '7px', fontWeight: 'bold' }}>
                  Senior UI/UX Designer
                </div>
                <div style={{ fontSize: '5.5px', color: '#888' }}>
                  03/2020 - Nay
                </div>
              </div>
              <div style={{ fontSize: '6px', color: '#666', marginBottom: '3px', fontStyle: 'italic' }}>
                Tech Corp Vietnam
              </div>
              <ul style={{ margin: 0, paddingLeft: '10px', fontSize: '5px', color: '#555', lineHeight: '1.6' }}>
                <li>Thiết kế UI/UX cho 20+ dự án web & mobile</li>
                <li>Tăng conversion rate 35% qua A/B testing</li>
                <li>Lead team 4 designers</li>
                <li>Xây dựng design system cho công ty</li>
              </ul>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1px' }}>
                <div style={{ fontSize: '7px', fontWeight: 'bold' }}>
                  UI Designer
                </div>
                <div style={{ fontSize: '5.5px', color: '#888' }}>
                  06/2019 - 02/2020
                </div>
              </div>
              <div style={{ fontSize: '6px', color: '#666', marginBottom: '3px', fontStyle: 'italic' }}>
                Creative Agency
              </div>
              <ul style={{ margin: 0, paddingLeft: '10px', fontSize: '5px', color: '#555', lineHeight: '1.6' }}>
                <li>Thiết kế giao diện website & landing page</li>
                <li>Làm việc với 10+ clients khác nhau</li>
              </ul>
            </div>
          </div>

          {/* Projects */}
          <div>
            <div style={{
              fontSize: '7px',
              fontWeight: 'bold',
              marginBottom: '5px',
              paddingBottom: '2px',
              borderBottom: `2px solid ${template.accentColor}`,
              display: 'inline-block',
              textTransform: 'uppercase'
            }}>
              Dự án nổi bật
            </div>
            <ul style={{ margin: 0, paddingLeft: '10px', fontSize: '5px', color: '#555', lineHeight: '1.6' }}>
              <li><strong>E-commerce Platform:</strong> Redesign UI tăng 40% sales</li>
              <li><strong>Banking App:</strong> UX cho 500K+ users</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Default template for others (5-9)
  return (
    <div style={{
      width: '240px',
      height: '340px',
      background: 'white',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      padding: '16px 14px',
      fontSize: '7px',
      fontFamily: 'Arial, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '14px',
        paddingBottom: '10px',
        borderBottom: `2px solid ${template.accentColor}`
      }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#1a1a1a' }}>
          {template.name.toUpperCase()}
        </div>
        <div style={{ fontSize: '6.5px', color: '#666' }}>
          Professional Position Title
        </div>
      </div>

      {/* Contact Info */}
      <div style={{ marginBottom: '12px', fontSize: '6px', color: '#555', lineHeight: '1.6' }}>
        <div>📞 0123-456-789 | ✉️ email@example.com</div>
        <div>📍 Hà Nội, Việt Nam</div>
      </div>

      {/* Experience Section */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          fontSize: '8px',
          fontWeight: 'bold',
          color: template.accentColor,
          marginBottom: '6px',
          textTransform: 'uppercase'
        }}>
          Kinh Nghiệm Làm Việc
        </div>
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '6.5px', fontWeight: 'bold', marginBottom: '1px' }}>
            2020 - Hiện tại
          </div>
          <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '1px' }}>
            Senior Position Title
          </div>
          <div style={{ fontSize: '6px', color: '#666', marginBottom: '3px', fontStyle: 'italic' }}>
            Company Name - Location
          </div>
          <ul style={{ margin: 0, paddingLeft: '12px', fontSize: '5.5px', color: '#555', lineHeight: '1.6' }}>
            <li>Mô tả công việc và thành tích đạt được</li>
            <li>Các dự án quan trọng đã thực hiện</li>
            <li>Kỹ năng và kinh nghiệm tích lũy</li>
          </ul>
        </div>
      </div>

      {/* Education Section */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{
          fontSize: '8px',
          fontWeight: 'bold',
          color: template.accentColor,
          marginBottom: '6px',
          textTransform: 'uppercase'
        }}>
          Học Vấn
        </div>
        <div>
          <div style={{ fontSize: '6.5px', fontWeight: 'bold', marginBottom: '1px' }}>
            2016 - 2020
          </div>
          <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '1px' }}>
            Cử nhân Chuyên ngành
          </div>
          <div style={{ fontSize: '6px', color: '#666' }}>
            Tên trường đại học
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <div style={{
          fontSize: '8px',
          fontWeight: 'bold',
          color: template.accentColor,
          marginBottom: '6px',
          textTransform: 'uppercase'
        }}>
          Kỹ Năng
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5'].map(skill => (
            <span key={skill} style={{
              fontSize: '5.5px',
              background: `${template.accentColor}15`,
              color: template.accentColor,
              padding: '3px 6px',
              borderRadius: '4px',
              fontWeight: '600'
            }}>
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CVPreviewModal({ template, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="close-button">×</button>

        <div className="modal-layout">
          {/* Left - CV Preview */}
          <div className="modal-left">
            <div className="preview-scaled">
              {renderCVPreview(template)}
            </div>
          </div>

          {/* Right - Info */}
          <div className="modal-right">
            <div className="modal-header">
              <h2 className="modal-title">{template.name}</h2>
              {template.isPremium && (
                <span className="modal-premium-badge">⭐ PREMIUM</span>
              )}
            </div>

            <div className="modal-section">
              <h4>Về mẫu CV này</h4>
              <p>{template.description}</p>
            </div>

            <div className="modal-section">
              <h4>Phù hợp với</h4>
              <div className="modal-tags">
                {template.tags.map(tag => (
                  <span key={tag} className="modal-tag">{tag}</span>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-use-modal"
                style={{ background: template.accentColor }}
              >
                 Sử dụng mẫu này
              </button>
              <button 
                className="btn-download-modal"
                style={{ border: `2px solid ${template.accentColor}`, color: template.accentColor }}
              >
                 Tải xuống
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
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
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '60px 20px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '12px' }}>
          Mẫu CV chuyên nghiệp
        </h1>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>
          Chọn từ nhiều mẫu CV được thiết kế chi tiết, tối ưu ATS
        </p>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '30px' }}>
          {/* Sidebar */}
          <aside>
            {/* Categories */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                Danh mục mẫu CV
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      background: selectedCategory === cat.id ? '#667eea' : 'transparent',
                      color: selectedCategory === cat.id ? 'white' : '#333',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: selectedCategory === cat.id ? '600' : '400',
                      transition: 'all 0.2s'
                    }}
                  >
                    <span>{cat.name}</span>
                    <span style={{
                      background: selectedCategory === cat.id ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {cat.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px',
              padding: '24px',
              color: 'white',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⭐</div>
              <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
                Nâng cấp tài khoản
              </h4>
              <p style={{ fontSize: '13px', opacity: 0.9, marginBottom: '16px' }}>
                Truy cập không giới hạn tất cả mẫu CV cao cấp
              </p>
              <button style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                borderRadius: '8px',
                background: 'white',
                color: '#f5576c',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}>
                Nâng cấp ngay
              </button>
            </div>
          </aside>

          {}
          <div>
            <div style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
                {categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p style={{ color: '#666' }}>{filteredTemplates.length} mẫu CV có sẵn</p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px'
            }}>
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
    <div style={{
      background: 'white',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      transition: 'all 0.3s',
      cursor: 'pointer'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
    }}
    onClick={onClick}>
      {/* CV Preview */}
      <div style={{
        position: 'relative',
        background: '#f5f5f5',
        padding: '30px 20px',
        height: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {template.isPremium && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: 'bold',
            zIndex: 10
          }}>
            ⭐ PREMIUM
          </div>
        )}
        
        {renderCVPreview(template)}
      </div>

      {/* Info */}
      <div style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
          {template.name}
        </h3>
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          marginBottom: '16px'
        }}>
          {template.tags.map(tag => (
            <span key={tag} style={{
              background: '#f0f0f0',
              color: '#666',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11px'
            }}>
              {tag}
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button style={{
            flex: 1,
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500'
          }}>
             Xem
          </button>
          <button style={{
            flex: 1,
            padding: '10px',
            border: 'none',
            borderRadius: '8px',
            background: template.accentColor,
            color: 'white',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500'
          }}>
             Dùng
          </button>
        </div>
      </div>
    </div>
  );
}

function renderCVPreview(template) {
  // Template 1: Lê Quang Dũng
  if (template.id === 1) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '300px',
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        fontSize: '8px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: '#e8e8e8',
          padding: '20px 16px',
          display: 'flex',
          gap: '12px'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: '#d0d0d0',
            border: '2px solid #999',
            flexShrink: 0
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '2px' }}>LÊ QUANG DŨNG</div>
            <div style={{ fontSize: '7px', color: '#666', marginBottom: '6px' }}>Business Development Executive</div>
            <div style={{ fontSize: '6px', color: '#555', lineHeight: '1.4' }}>
              <div>📅 15/03/1998</div>
              <div>📞 0123456789</div>
              <div>✉️ email@gmail.vn</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '8px',
              fontWeight: 'bold',
              borderBottom: '1.5px solid #333',
              paddingBottom: '3px',
              marginBottom: '6px'
            }}>MỤC TIÊU NGHỀ NGHIỆP</div>
            <div style={{ fontSize: '6px', color: '#555', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '2px', height: '6px', background: '#e0e0e0', width: '100%' }}></div>
              <div style={{ marginBottom: '2px', height: '6px', background: '#e0e0e0', width: '98%' }}></div>
              <div style={{ marginBottom: '2px', height: '6px', background: '#e0e0e0', width: '95%' }}></div>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '8px',
              fontWeight: 'bold',
              borderBottom: '1.5px solid #333',
              paddingBottom: '3px',
              marginBottom: '6px'
            }}>HỌC VẤN</div>
            <div style={{ fontSize: '6px', marginBottom: '4px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>2016 - 2020</div>
              <div style={{ color: '#555', marginBottom: '1px' }}>Trường ĐH Ngoại Thương</div>
              <div style={{ height: '5px', background: '#e0e0e0', width: '70%', marginBottom: '1px' }}></div>
              <div style={{ height: '5px', background: '#e0e0e0', width: '60%' }}></div>
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '8px',
              fontWeight: 'bold',
              borderBottom: '1.5px solid #333',
              paddingBottom: '3px',
              marginBottom: '6px'
            }}>KINH NGHIỆM</div>
            <div style={{ fontSize: '6px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>03/2022 - 02/2025</div>
              <div style={{ color: '#555', marginBottom: '2px' }}>Business Development Executive</div>
              <div style={{ height: '5px', background: '#e0e0e0', width: '100%', marginBottom: '1px' }}></div>
              <div style={{ height: '5px', background: '#e0e0e0', width: '95%', marginBottom: '1px' }}></div>
              <div style={{ height: '5px', background: '#e0e0e0', width: '90%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  if (template.id === 2) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '300px',
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        fontSize: '8px',
        fontFamily: 'Arial, sans-serif',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '16px',
          background: template.accentColor,
          color: 'white',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '8px',
          fontWeight: 'bold',
          zIndex: 10
        }}>✿ Mới</div>
        <div style={{
          background: 'white',
          padding: '30px 16px 16px',
          display: 'flex',
          gap: '12px',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: '#f5f5f5',
            border: '2px solid #ddd',
            borderRadius: '6px',
            flexShrink: 0
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '2px' }}>NGUYỄN MINH TRANG</div>
            <div style={{ fontSize: '7px', color: '#7f8c8d', marginBottom: '6px' }}>Audit intern</div>
            <div style={{ fontSize: '6px', color: '#555', lineHeight: '1.3', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px' }}>
              <div>📅 06/12/2003</div>
              <div>📞 (034) 612 6612</div>
              <div>👤 Nữ</div>
              <div>✉️ hotro@topcv.vn</div>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '8px',
              fontWeight: 'bold',
              textAlign: 'center',
              borderBottom: '1.5px solid #34495e',
              paddingBottom: '4px',
              marginBottom: '6px'
            }}>MỤC TIÊU NGHỀ NGHIỆP</div>
            <div style={{ fontSize: '6px', color: '#555', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '2px', height: '5px', background: '#e0e0e0' }}></div>
              <div style={{ marginBottom: '2px', height: '5px', background: '#e0e0e0', width: '98%' }}></div>
              <div style={{ marginBottom: '4px', height: '5px', background: '#e0e0e0', width: '70%' }}></div>
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '8px',
              fontWeight: 'bold',
              textAlign: 'center',
              borderBottom: '1.5px solid #34495e',
              paddingBottom: '4px',
              marginBottom: '6px'
            }}>HỌC VẤN</div>
            <div style={{ fontSize: '6px', display: 'grid', gridTemplateColumns: '45px 1fr', gap: '8px' }}>
              <div style={{ fontWeight: 'bold' }}>2021 - 2025</div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>ĐH Ngoại thương HN</div>
                <div style={{ color: '#7f8c8d', marginBottom: '2px', fontSize: '5px' }}>Ngân hàng & Tài chính</div>
                <div style={{ height: '4px', background: '#e0e0e0', width: '90%', marginBottom: '1px' }}></div>
                <div style={{ height: '4px', background: '#e0e0e0', width: '70%' }}></div>
              </div>
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '8px',
              fontWeight: 'bold',
              textAlign: 'center',
              borderBottom: '1.5px solid #34495e',
              paddingBottom: '4px',
              marginBottom: '6px'
            }}>HOẠT ĐỘNG</div>
            <div style={{ fontSize: '6px', display: 'grid', gridTemplateColumns: '45px 1fr', gap: '8px' }}>
              <div style={{ fontWeight: 'bold' }}>2022 - 2025</div>
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>CLB Nguồn nhân lực</div>
                <div style={{ height: '4px', background: '#e0e0e0', width: '100%', marginBottom: '1px' }}></div>
                <div style={{ height: '4px', background: '#e0e0e0', width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }


  if (template.id === 3) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '300px',
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        fontSize: '7px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: '#f8f9fa',
          padding: '16px',
          display: 'flex',
          gap: '10px'
        }}>
          <div style={{
            width: '45px',
            height: '55px',
            background: '#d0d5dd',
            flexShrink: 0
          }}></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '2px' }}>Nguyễn Quỳnh Như</div>
            <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '4px', paddingBottom: '3px', borderBottom: '1.5px solid #333' }}>Quản lý nhà hàng</div>
            <div style={{ fontSize: '5px', color: '#555', lineHeight: '1.4' }}>
              <div style={{ marginBottom: '2px', height: '4px', background: '#e0e0e0', width: '100%' }}></div>
              <div style={{ marginBottom: '2px', height: '4px', background: '#e0e0e0', width: '95%' }}></div>
            </div>
          </div>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          padding: '12px 16px',
          borderBottom: '1.5px solid #e0e0e0'
        }}>
          <div>
            <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '4px', paddingBottom: '2px', borderBottom: '1.5px solid #333' }}>THÔNG TIN</div>
            <div style={{ fontSize: '5px', color: '#555' }}>
              <div style={{ marginBottom: '2px' }}>📅 15/05/1995</div>
              <div style={{ marginBottom: '2px' }}>✉️ hotro@topcv.vn</div>
              <div style={{ marginBottom: '2px' }}>📞 (024) 6680</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '4px', paddingBottom: '2px', borderBottom: '1.5px solid #333' }}>HỌC VẤN</div>
            <div style={{ fontSize: '5px', color: '#555' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>Đại học TopCV</div>
              <div style={{ marginBottom: '1px' }}>2015 - 2017</div>
              <div style={{ height: '4px', background: '#e0e0e0', width: '80%' }}></div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '7px', fontWeight: 'bold', marginBottom: '4px', paddingBottom: '2px', borderBottom: '1.5px solid #333' }}>CHỨNG CHỈ</div>
            <div style={{ fontSize: '5px', color: '#555' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>2022</div>
              <div style={{ height: '4px', background: '#e0e0e0', width: '90%' }}></div>
            </div>
          </div>
        </div>
        <div style={{ padding: '12px 16px' }}>
          <div style={{
            fontSize: '7px',
            fontWeight: 'bold',
            marginBottom: '6px',
            paddingBottom: '2px',
            borderBottom: '1.5px solid #333'
          }}>KINH NGHIỆM</div>
          <div style={{ fontSize: '5px', marginBottom: '8px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>01/2022 - Hiện tại</div>
            <div style={{ fontSize: '6px', fontWeight: 'bold', marginBottom: '1px' }}>Quản lý nhà hàng</div>
            <div style={{ color: '#555', marginBottom: '2px' }}>RKW Hotel</div>
            <div style={{ height: '4px', background: '#e0e0e0', width: '100%', marginBottom: '1px' }}></div>
            <div style={{ height: '4px', background: '#e0e0e0', width: '85%' }}></div>
          </div>
        </div>
      </div>
    );
  }

 
  if (template.id === 4) {
    return (
      <div style={{
        width: '100%',
        maxWidth: '300px',
        background: 'white',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        display: 'grid',
        gridTemplateColumns: '95px 1fr',
        fontSize: '7px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: '#f8f9fa',
          padding: '16px 10px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: '#d0d5dd',
            border: '3px solid white',
            margin: '0 auto 10px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
          }}></div>
          <div style={{ fontSize: '10px', fontWeight: 'bold', textAlign: 'center', marginBottom: '3px' }}>NGUYỄN MAI ANH</div>
          <div style={{ fontSize: '6px', color: '#666', textAlign: 'center', marginBottom: '12px' }}>Designer</div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '7px',
              fontWeight: 'bold',
              marginBottom: '6px',
              paddingBottom: '3px',
              borderBottom: `2px solid ${template.accentColor}`
            }}>Thông tin</div>
            <div style={{ fontSize: '5px', color: '#555', lineHeight: '1.6' }}>
              <div style={{ marginBottom: '3px' }}>📞 024 6680</div>
              <div style={{ fontSize: '4px' }}>✉️ hotro@topcv.vn</div>
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '7px',
              fontWeight: 'bold',
              marginBottom: '6px',
              paddingBottom: '3px',
              borderBottom: `2px solid ${template.accentColor}`
            }}>Kỹ năng</div>
            <div style={{ fontSize: '5px', color: '#555' }}>
              {['User Interview', 'User Research', 'Prototyping'].map((skill, i) => (
                <div key={i} style={{ marginBottom: '3px', paddingLeft: '8px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 0, color: template.accentColor, fontWeight: 'bold' }}>•</span>
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 12px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '7px',
              fontWeight: 'bold',
              marginBottom: '6px',
              paddingBottom: '3px',
              borderBottom: `2px solid ${template.accentColor}`,
              display: 'inline-block'
            }}>Học vấn</div>
            <div style={{ fontSize: '5px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>ĐH MỸ THUẬT TOPCV</div>
              <div style={{ fontSize: '4px', color: '#888', marginBottom: '1px' }}>09/2015 - 05/2019</div>
              <div style={{ height: '4px', background: '#e0e0e0', width: '80%' }}></div>
            </div>
          </div>
          <div>
            <div style={{
              fontSize: '7px',
              fontWeight: 'bold',
              marginBottom: '6px',
              paddingBottom: '3px',
              borderBottom: `2px solid ${template.accentColor}`,
              display: 'inline-block'
            }}>Kinh nghiệm</div>
            <div style={{ fontSize: '5px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>Công ty ABC | 03/2020</div>
              <div style={{ fontSize: '6px', fontWeight: 'bold', marginBottom: '2px' }}>Senior Designer</div>
              <div style={{ height: '4px', background: '#e0e0e0', width: '100%', marginBottom: '1px' }}></div>
              <div style={{ height: '4px', background: '#e0e0e0', width: '85%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div style={{
      width: '100%',
      maxWidth: '300px',
      background: 'white',
      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      padding: '20px',
      fontSize: '8px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: `2px solid ${template.accentColor}` }}>
        <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
          {template.name.toUpperCase()}
        </div>
        <div style={{ fontSize: '7px', color: '#666' }}>Professional CV Template</div>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '8px', fontWeight: 'bold', color: template.accentColor, marginBottom: '6px' }}>KINH NGHIỆM</div>
        <div style={{ fontSize: '6px', color: '#555' }}>
          <div style={{ marginBottom: '2px', height: '5px', background: '#e0e0e0', width: '100%' }}></div>
          <div style={{ marginBottom: '2px', height: '5px', background: '#e0e0e0', width: '95%' }}></div>
          <div style={{ height: '5px', background: '#e0e0e0', width: '80%' }}></div>
        </div>
      </div>
      <div>
        <div style={{ fontSize: '8px', fontWeight: 'bold', color: template.accentColor, marginBottom: '6px' }}>HỌC VẤN</div>
        <div style={{ fontSize: '6px', color: '#555' }}>
          <div style={{ marginBottom: '2px', height: '5px', background: '#e0e0e0', width: '90%' }}></div>
          <div style={{ height: '5px', background: '#e0e0e0', width: '70%' }}></div>
        </div>
      </div>
    </div>
  );
}

function CVPreviewModal({ template, onClose }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }} onClick={onClose}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        maxWidth: '1200px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        position: 'relative'
      }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '40px',
          height: '40px',
          border: 'none',
          borderRadius: '50%',
          background: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          ×
        </button>

        {/* Left - CV Preview */}
        <div style={{
          background: '#f5f5f5',
          padding: '40px',
          overflowY: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ transform: 'scale(1.5)' }}>
            {renderCVPreview(template)}
          </div>
        </div>

        {/* Right - Details */}
        <div style={{
          padding: '40px',
          overflowY: 'auto'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
              {template.name}
            </h2>
            {template.isPremium && (
              <span style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 'bold',
                display: 'inline-block'
              }}>
                ⭐ PREMIUM
              </span>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
              Về mẫu CV này
            </h4>
            <p style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
              {template.description}
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
              Phù hợp với
            </h4>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {template.tags.map(tag => (
                <span key={tag} style={{
                  background: '#f0f0f0',
                  color: '#666',
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: '500'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button style={{
              width: '100%',
              padding: '16px',
              border: 'none',
              borderRadius: '12px',
              background: template.accentColor,
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
               Sử dụng mẫu này
            </button>
            <button style={{
              width: '100%',
              padding: '16px',
              border: `2px solid ${template.accentColor}`,
              borderRadius: '12px',
              background: 'white',
              color: template.accentColor,
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
               Tải xuống
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
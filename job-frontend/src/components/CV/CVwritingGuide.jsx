import React, { useState } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';

const CVGuide = () => {
  const [selectedCategory, setSelectedCategory] = useState('general');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const categories = [
    { id: 'general', name: 'Hướng dẫn chung' },
    { id: 'office', name: 'Hành chính Văn Phòng' },
    { id: 'it', name: 'IT' },
    { id: 'sales', name: 'Sale & Marketing' },
    { id: 'education', name: 'Giáo dục' },
    { id: 'creative', name: 'Sáng tạo' },
    { id: 'accounting', name: 'Kế toán' },
    { id: 'realestate', name: 'Bất động sản' },
    { id: 'law', name: 'Luật' },
    { id: 'logistics', name: 'Logistics' },
    { id: 'finance', name: 'Tài chính Ngân Hàng' },
  ];

  const content = {
    general: {
      title: 'Hướng Dẫn Viết CV Chung',
      sections: [
        {
          title: '10 Kỹ Năng Nên Có Trong CV',
          items: [
            'Giao tiếp hiệu quả',
            'Làm việc nhóm',
            'Quản lý thời gian',
            'Giải quyết vấn đề',
            'Tư duy phản biện',
            'Sáng tạo',
            'Kỹ năng lãnh đạo',
            'Tin học văn phòng',
            'Ngoại ngữ',
            'Kỹ năng chuyên môn'
          ]
        },
        {
          title: 'Cấu Trúc CV Chuẩn',
          items: [
            'Thông tin cá nhân: Họ tên, ngày sinh, SĐT, email, địa chỉ',
            'Mục tiêu nghề nghiệp: 2-3 câu ngắn gọn, cụ thể',
            'Kinh nghiệm làm việc: Liệt kê từ mới đến cũ, có số liệu',
            'Học vấn: Trường, chuyên ngành, thời gian, GPA',
            'Kỹ năng: Hard skills và Soft skills',
            'Chứng chỉ: Tên, tổ chức cấp, thời gian',
            'Dự án: Tên, vai trò, công nghệ, kết quả',
            'Sở thích: Liên quan đến công việc',
            'Người tham chiếu: Tùy chọn'
          ]
        },
        {
          title: 'Công Thức Viết Kinh Nghiệm',
          highlight: 'Động từ hành động + Công việc cụ thể + Kết quả đạt được',
          example: 'Ví dụ: Quản lý đội ngũ 5 nhân viên sale, đạt doanh số 2 tỷ/tháng, tăng 30% so với kỳ trước'
        },
        {
          title: 'Các Lỗi Thường Gặp',
          items: [
            'Lỗi chính tả, ngữ pháp',
            'CV quá dài (>2 trang)',
            'Thiếu tập trung vào vị trí ứng tuyển',
            'Không có số liệu cụ thể',
            'Thiết kế quá rối, khó đọc',
            'Email không chuyên nghiệp',
            'Thiếu từ khóa từ JD',
            'Thông tin không liên quan'
          ]
        }
      ]
    },
    office: {
      title: 'CV Hành Chính Văn Phòng',
      positions: ['Trợ lý Nhân sự', 'Trợ lý Giám đốc', 'Nhân viên C&B', 'Hành chính Văn phòng'],
      skills: ['MS Office (Word, Excel, PowerPoint)', 'Giao tiếp, điều phối', 'Quản lý thời gian', 'Soạn thảo văn bản', 'Tổ chức công việc'],
      objective: 'Ứng tuyển vị trí Trợ lý Nhân sự với 1 năm kinh nghiệm trong tuyển dụng và quản lý hồ sơ nhân viên. Mong muốn đóng góp vào việc xây dựng đội ngũ chất lượng cao.',
      highlights: [
        'Quản lý lịch trình, tổ chức cuộc họp',
        'Xử lý văn bản, hồ sơ nhân sự',
        'Hỗ trợ tuyển dụng, onboarding',
        'Phối hợp giữa các phòng ban'
      ]
    },
    it: {
      title: 'CV Ngành IT',
      positions: ['Software Developer', 'Frontend/Backend Developer', 'Mobile Developer', 'UI/UX Designer', 'QA Tester', 'Data Analyst'],
      skills: ['Ngôn ngữ lập trình (Java, Python, JS)', 'Framework (React, Node.js, Spring)', 'Database (MySQL, MongoDB)', 'Git, Docker, Jenkins', 'Agile/Scrum'],
      objective: 'Backend Developer với 2 năm kinh nghiệm phát triển ứng dụng web bằng Java và Spring Boot. Tìm kiếm cơ hội xây dựng hệ thống có khả năng mở rộng cao.',
      highlights: [
        'Portfolio/GitHub là bắt buộc',
        'Liệt kê Technical Skills chi tiết',
        'Mô tả dự án với công nghệ, vai trò, kết quả',
        'Highlight thành tích: tốc độ xử lý, số người dùng'
      ],
      projectExample: {
        name: 'Website Thương mại Điện tử',
        tech: 'React, Node.js, MongoDB',
        role: 'Frontend Developer',
        result: 'Xử lý 1000+ đơn hàng/ngày, tốc độ load < 2s'
      }
    },
    sales: {
      title: 'CV Sale & Marketing',
      positions: ['Nhân viên kinh doanh', 'Telesales', 'Digital Marketing', 'Content Marketing', 'Social Media Manager'],
      skills: ['Kỹ năng bán hàng, thương thuyết', 'Digital marketing (SEO, SEM)', 'Content creation', 'Google Analytics, Facebook Ads', 'CRM tools'],
      objective: 'Digital Marketing Specialist với 3 năm kinh nghiệm trong SEO, SEM và Social Media Marketing. Mong muốn tối ưu hóa chi phí quảng cáo và tăng trưởng doanh thu.',
      highlights: [
        'Doanh số đạt được: 150% KPI (3 tỷ/2 tỷ)',
        'Tăng 200% lượng truy cập website qua SEO',
        'Quản lý ngân sách 50 triệu/tháng, ROI 300%',
        'Tăng 45% engagement rate trên Facebook'
      ]
    },
    education: {
      title: 'CV Ngành Giáo Dục',
      positions: ['Giáo viên các cấp', 'Gia sư', 'Trợ giảng', 'Tư vấn khóa học', 'Academic Advisor'],
      skills: ['Kỹ năng giảng dạy, truyền đạt', 'Quản lý lớp học', 'Lập kế hoạch bài giảng', 'Đánh giá học sinh', 'Công nghệ trong giảng dạy'],
      objective: 'Giáo viên Tiếng Anh với chứng chỉ TESOL và 2 năm kinh nghiệm giảng dạy IELTS. Mong muốn nâng cao năng lực Tiếng Anh cho học sinh.',
      highlights: [
        'Giảng dạy Toán 10-12 cho 150+ học sinh',
        'Tỷ lệ học sinh đạt khá giỏi: 85%',
        'Phát triển 20+ bộ đề ôn thi',
        'Áp dụng phương pháp giảng dạy tích cực'
      ]
    },
    creative: {
      title: 'CV Ngành Sáng Tạo',
      positions: ['Graphic Designer', 'UI/UX Designer', 'Copywriter', 'Content Creator', 'Video Editor', 'Art Director'],
      skills: ['Adobe Creative Suite (Ps, Ai, Pr, Ae)', 'Figma, Sketch', 'Typography, Color theory', 'Storytelling', 'Sáng tạo nội dung'],
      objective: 'Graphic Designer với 3 năm kinh nghiệm thiết kế branding cho thương hiệu F&B. Portfolio: behance.net/yourname. Mong muốn phát triển dự án quốc tế.',
      highlights: [
        'Portfolio online là quan trọng nhất',
        'CV có thể thiết kế sáng tạo, độc đáo',
        'Mô tả dự án với vai trò, kết quả cụ thể',
        'Highlight awards, recognition'
      ]
    },
    accounting: {
      title: 'CV Ngành Kế Toán',
      positions: ['Nhân viên kế toán', 'Kế toán trưởng', 'Kiểm toán viên', 'Kế toán thuế', 'Kế toán tổng hợp'],
      skills: ['Kế toán tài chính, quản trị', 'Thuế', 'Phần mềm (MISA, Fast, Excel)', 'Lập báo cáo tài chính', 'Kiểm soát chi phí'],
      certificates: ['Chứng chỉ kế toán trưởng', 'CPA', 'ACCA', 'CMA'],
      objective: 'Kế toán tổng hợp với 4 năm kinh nghiệm, có chứng chỉ kế toán trưởng. Tìm kiếm vị trí Kế toán trưởng để tối ưu hóa quy trình tài chính.',
      highlights: [
        'Quản lý sổ sách cho công ty 200+ nhân viên',
        'Lập báo cáo tài chính theo VAS và IFRS',
        'Xử lý 500+ chứng từ/tháng, độ chính xác 99.9%',
        'Giảm 10% chi phí vận hành qua phân tích'
      ]
    },
    realestate: {
      title: 'CV Bất Động Sản',
      positions: ['Sales BĐS', 'Tư vấn căn hộ', 'Môi giới BĐS', 'Quản lý dự án BĐS'],
      skills: ['Kỹ năng bán hàng, thuyết phục', 'Hiểu biết luật đất đai', 'Phân tích thị trường BĐS', 'Thương thuyết', 'Networking'],
      objective: 'Sales BĐS với 2 năm kinh nghiệm tư vấn căn hộ cao cấp, đạt Top Performer 2023. Mong muốn phát triển với các dự án quy mô lớn.',
      highlights: [
        'Bán 25 căn hộ trong 6 tháng, giá trị 75 tỷ',
        'Top 3 sales xuất sắc công ty năm 2023',
        'Database 500+ khách hàng tiềm năng',
        'Tỷ lệ chốt deal 35%'
      ]
    },
    law: {
      title: 'CV Ngành Luật',
      positions: ['Luật sư', 'Trợ lý pháp lý', 'Chuyên viên pháp chế', 'Thực tập sinh pháp lý'],
      skills: ['Kiến thức pháp luật chuyên sâu', 'Soạn thảo văn bản pháp lý', 'Tư vấn pháp luật', 'Nghiên cứu án lệ', 'Tranh tụng'],
      certificates: ['Chứng chỉ hành nghề luật sư', 'Bằng thạc sĩ luật', 'Chứng chỉ trọng tài viên'],
      highlights: [
        'Tham gia 50+ vụ án dân sự, hình sự',
        'Chuyên môn: Luật doanh nghiệp, M&A',
        'Tỷ lệ thắng kiện 80%',
        'Soạn thảo 100+ hợp đồng cho doanh nghiệp'
      ]
    },
    logistics: {
      title: 'CV Ngành Logistics',
      positions: ['Nhân viên vận hành', 'Nhân viên chứng từ', 'Pricing Staff', 'Customer Service', 'Sales Logistics'],
      skills: ['Quản lý kho, vận chuyển', 'Hải quan, xuất nhập khẩu', 'Phần mềm quản lý logistics', 'Điều phối', 'Tiếng Anh chuyên ngành'],
      highlights: [
        'Quản lý 500+ đơn hàng XNK/tháng',
        'Giảm 15% chi phí vận chuyển',
        'Tỷ lệ giao hàng đúng hạn 98%',
        'Tối ưu tuyến đường vận chuyển'
      ]
    },
    finance: {
      title: 'CV Tài Chính Ngân Hàng',
      positions: ['Giao dịch viên NH', 'Chuyên viên tín dụng', 'Quan hệ khách hàng', 'Tư vấn chứng khoán', 'Phân tích tài chính'],
      skills: ['Kiến thức tài chính, ngân hàng', 'Phân tích báo cáo tài chính', 'Đánh giá rủi ro', 'Tư vấn sản phẩm', 'Quản lý khách hàng'],
      certificates: ['Chứng chỉ hành nghề chứng khoán', 'CFA', 'FRM'],
      highlights: [
        'Quản lý 100+ KH VIP, tổng TS 500 tỷ',
        'Đạt 120% KPI phát triển KH mới',
        'Giảm tỷ lệ nợ xấu từ 5% xuống 2%',
        'Tăng trưởng dư nợ 50%/năm'
      ]
    }
  };

  const currentContent = content[selectedCategory];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Hướng Dẫn Viết CV</h1>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
          >
            <Menu size={24} color="#374151" />
          </button>
        </div>
      </header>

      {}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
        />
      )}

      {}
      <aside style={{
        position: 'fixed',
        left: 0,
        top: 0,
        height: '100%',
        width: '280px',
        backgroundColor: 'white',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>Danh mục</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              style={{ padding: '0.5rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
            >
              <X size={20} color="#6b7280" />
            </button>
          </div>
          <nav>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSidebarOpen(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  marginBottom: '0.25rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  backgroundColor: selectedCategory === cat.id ? '#3b82f6' : 'transparent',
                  color: selectedCategory === cat.id ? 'white' : '#374151',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                  fontWeight: selectedCategory === cat.id ? '600' : '500',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== cat.id) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {cat.name}
                {selectedCategory === cat.id && <ChevronRight size={16} />}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {}
      <main style={{ padding: '2rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '1rem' }}>
            {currentContent.title}
          </h2>

          {}
          {selectedCategory === 'general' && (
            <div>
              {currentContent.sections.map((section, idx) => (
                <div key={idx} style={{ marginBottom: '2.5rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
                    {section.title}
                  </h3>
                  {section.items && (
                    <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                      {section.items.map((item, i) => (
                        <li key={i} style={{ marginBottom: '0.5rem', color: '#4b5563' }}>{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.highlight && (
                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '0.5rem', padding: '1rem', marginTop: '1rem' }}>
                      <p style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem' }}>Công thức:</p>
                      <p style={{ color: '#78350f', marginBottom: '0.5rem' }}>{section.highlight}</p>
                      <p style={{ color: '#78350f', fontSize: '0.875rem', fontStyle: 'italic' }}>{section.example}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {}
          {selectedCategory !== 'general' && (
            <div>
              {}
              {currentContent.positions && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem' }}>
                    Vị trí phổ biến
                  </h3>
                  <p style={{ color: '#4b5563', lineHeight: '1.8' }}>
                    {currentContent.positions.join(', ')}
                  </p>
                </div>
              )}

              {}
              {currentContent.skills && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem' }}>
                    Kỹ năng cần có
                  </h3>
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                    {currentContent.skills.map((skill, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem', color: '#4b5563' }}>{skill}</li>
                    ))}
                  </ul>
                </div>
              )}

              {}
              {currentContent.certificates && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem' }}>
                    Chứng chỉ quan trọng
                  </h3>
                  <p style={{ color: '#4b5563', lineHeight: '1.8' }}>
                    {currentContent.certificates.join(', ')}
                  </p>
                </div>
              )}

              {}
              {currentContent.objective && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem' }}>
                    Mẫu mục tiêu nghề nghiệp
                  </h3>
                  <p style={{ color: '#4b5563', lineHeight: '1.8', fontStyle: 'italic', backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                    "{currentContent.objective}"
                  </p>
                </div>
              )}

              {}
              {currentContent.projectExample && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem' }}>
                    Ví dụ mô tả dự án
                  </h3>
                  <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.5rem' }}>
                    <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}><strong>Tên dự án:</strong> {currentContent.projectExample.name}</p>
                    <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}><strong>Công nghệ:</strong> {currentContent.projectExample.tech}</p>
                    <p style={{ marginBottom: '0.5rem', color: '#4b5563' }}><strong>Vai trò:</strong> {currentContent.projectExample.role}</p>
                    <p style={{ color: '#4b5563' }}><strong>Kết quả:</strong> {currentContent.projectExample.result}</p>
                  </div>
                </div>
              )}

              {}
              {currentContent.highlights && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.75rem' }}>
                    Điểm nhấn trong CV
                  </h3>
                  <ul style={{ listStyle: 'disc', paddingLeft: '1.5rem', lineHeight: '1.8' }}>
                    {currentContent.highlights.map((highlight, i) => (
                      <li key={i} style={{ marginBottom: '0.5rem', color: '#4b5563' }}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {}
        <div style={{ marginTop: '2rem', backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', marginBottom: '1rem' }}>
            Checklist Hoàn Thiện CV
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {[
              'Thông tin liên hệ đầy đủ',
              'Mục tiêu rõ ràng, phù hợp',
              'Kinh nghiệm có số liệu cụ thể',
              'Kỹ năng liên quan công việc',
              'Không có lỗi chính tả',
              'Thiết kế chuyên nghiệp',
              'Độ dài 1-2 trang',
              'File PDF tên rõ ràng'
            ].map((item, i) => (
              <li key={i} style={{ color: '#4b5563', padding: '0.5rem 0' }}>
                • {item}
              </li>
            ))}
          </ul>
        </div>
      </main>

      {}
      <footer style={{ backgroundColor: '#1f2937', color: 'white', padding: '2rem', textAlign: 'center', marginTop: '3rem' }}>
        <p style={{ fontSize: '0.875rem', margin: 0 }}>Tài liệu tham khảo: JobPortal | Cập nhật: Tháng 12/2025</p>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem' }}>Chúc bạn thành công trong hành trình tìm kiếm công việc!</p>
      </footer>
    </div>
  );
};

export default CVGuide;
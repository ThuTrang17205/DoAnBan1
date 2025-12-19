

require('dotenv').config();
const pool = require('../../config/db');

const sampleJobs = [
  {
    title: "Senior Full-stack Developer",
    category: "Công nghệ thông tin",
    location: "Hà Nội",
    min_salary: 25000000,
    max_salary: 40000000,
    currency: "VND",
    experience: "3-5 năm",
    description: "Chúng tôi đang tìm kiếm Senior Full-stack Developer có kinh nghiệm với React, Node.js và PostgreSQL.",
    requirements: "- 3+ năm kinh nghiệm\n- Thành thạo React, Node.js\n- Kinh nghiệm với PostgreSQL\n- Biết Git, Docker",
    benefits: "- Lương thỏa thuận\n- Bảo hiểm đầy đủ\n- Du lịch hàng năm\n- Môi trường năng động",
    status: "open",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
  },
  {
    title: "Marketing Manager",
    category: "Marketing - Truyền thông",
    location: "Hồ Chí Minh",
    min_salary: 20000000,
    max_salary: 30000000,
    currency: "VND",
    experience: "5+ năm",
    description: "Quản lý và phát triển chiến lược marketing cho công ty.",
    requirements: "- 5+ năm kinh nghiệm marketing\n- Am hiểu digital marketing\n- Kỹ năng quản lý team\n- Tiếng Anh tốt",
    benefits: "- Lương cạnh tranh\n- Thưởng theo KPI\n- Đào tạo chuyên sâu\n- Team building định kỳ",
    status: "open",
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Kế toán trưởng",
    category: "Kế toán - Tài chính - Ngân hàng",
    location: "Đà Nẵng",
    min_salary: 18000000,
    max_salary: 25000000,
    currency: "VND",
    experience: "7+ năm",
    description: "Quản lý công tác kế toán, tài chính của công ty.",
    requirements: "- Tốt nghiệp Đại học chuyên ngành Kế toán\n- 7+ năm kinh nghiệm\n- Có chứng chỉ CPA là lợi thế\n- Thành thạo Excel, phần mềm kế toán",
    benefits: "- Lương từ 18-25 triệu\n- Thưởng cuối năm\n- Bảo hiểm xã hội\n- Nghỉ phép năm",
    status: "open",
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  },
  {
    title: "UI/UX Designer",
    category: "Thiết kế - Đồ hoạ",
    location: "Hà Nội",
    min_salary: 12000000,
    max_salary: 20000000,
    currency: "VND",
    experience: "2-3 năm",
    description: "Thiết kế giao diện và trải nghiệm người dùng cho các sản phẩm web/mobile.",
    requirements: "- 2+ năm kinh nghiệm UI/UX\n- Thành thạo Figma, Adobe XD\n- Hiểu biết về User Research\n- Portfolio ấn tượng",
    benefits: "- Lương thỏa thuận\n- Làm việc với dự án lớn\n- Môi trường sáng tạo\n- Flexible working time",
    status: "open",
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Sales Executive",
    category: "Kinh doanh - Bán hàng",
    location: "Hồ Chí Minh",
    min_salary: 10000000,
    max_salary: 15000000,
    currency: "VND",
    experience: "1-2 năm",
    description: "Tìm kiếm khách hàng mới và chăm sóc khách hàng hiện tại.",
    requirements: "- Kinh nghiệm bán hàng B2B\n- Kỹ năng giao tiếp tốt\n- Chủ động, nhiệt tình\n- Có xe máy",
    benefits: "- Lương cơ bản + hoa hồng cao\n- Thưởng doanh số\n- Đào tạo kỹ năng\n- Cơ hội thăng tiến",
    status: "open",
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000)
  },
  {
    title: "HR Manager",
    category: "Nhân sự - Hành chính",
    location: "Hà Nội",
    min_salary: 15000000,
    max_salary: 22000000,
    currency: "VND",
    experience: "4-6 năm",
    description: "Quản lý hoạt động nhân sự toàn công ty.",
    requirements: "- 4+ năm kinh nghiệm HR\n- Kinh nghiệm tuyển dụng\n- Am hiểu luật lao động\n- Kỹ năng quản lý tốt",
    benefits: "- Lương cạnh tranh\n- Bảo hiểm đầy đủ\n- Thưởng hiệu suất\n- Đào tạo nâng cao",
    status: "open",
    deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Data Analyst",
    category: "Công nghệ thông tin",
    location: "Hồ Chí Minh",
    min_salary: 15000000,
    max_salary: 25000000,
    currency: "VND",
    experience: "2-4 năm",
    description: "Phân tích dữ liệu và tạo báo cáo insights cho business.",
    requirements: "- Thành thạo SQL, Python\n- Kinh nghiệm với Power BI/Tableau\n- Tư duy phân tích tốt\n- Biết Machine Learning là lợi thế",
    benefits: "- Lương tốt\n- Làm việc với data lớn\n- Công nghệ hiện đại\n- Remote 2 ngày/tuần",
    status: "open",
    deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
  },
  {
    title: "Content Writer",
    category: "Marketing - Truyền thông",
    location: "Remote",
    min_salary: 8000000,
    max_salary: 12000000,
    currency: "VND",
    experience: "1-2 năm",
    description: "Viết content cho website, blog, social media.",
    requirements: "- Kỹ năng viết tốt\n- Am hiểu SEO\n- Sáng tạo, chủ động\n- Biết tiếng Anh là lợi thế",
    benefits: "- Làm việc remote\n- Thời gian linh hoạt\n- Cơ hội sáng tạo\n- Đào tạo kỹ năng",
    status: "open",
    deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
  }
];

/**
 * Seed sample jobs
 */
async function seedJobs() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(' Starting job seeding...');
    
    
    const employerCheck = await client.query(
      'SELECT id FROM employers LIMIT 1'
    );
    
    if (employerCheck.rows.length === 0) {
      console.log(' No employers found in database!');
      console.log(' Please create at least one employer first.');
      console.log(' You can create a test employer with:');
      console.log('   node userSeeder.js create employer');
      await client.query('ROLLBACK');
      return;
    }
    
    const employerId = employerCheck.rows[0].id;
    console.log(` Using employer ID: ${employerId}`);
    
    let createdCount = 0;
    
    for (const job of sampleJobs) {
      const result = await client.query(
        `INSERT INTO jobs (
          employer_id, title, category, location, 
          min_salary, max_salary, currency, experience,
          description, requirements, benefits, status, deadline, posted_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
        RETURNING id, title`,
        [
          employerId, 
          job.title, 
          job.category, 
          job.location,
          job.min_salary, 
          job.max_salary, 
          job.currency, 
          job.experience,
          job.description, 
          job.requirements, 
          job.benefits, 
          job.status, 
          job.deadline
        ]
      );
      
      console.log(` Created job: ${result.rows[0].title} (ID: ${result.rows[0].id})`);
      createdCount++;
    }
    
    await client.query('COMMIT');
    
    console.log('\n Job seeding completed!');
    console.log(` Summary:`);
    console.log(`    Created: ${createdCount} jobs`);
    console.log(`    Employer ID: ${employerId}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Error seeding jobs:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Clear all jobs
 */
async function clearJobs() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(' Clearing all jobs...');
    
    // Delete applications first (foreign key constraint)
    const deletedApplications = await client.query('DELETE FROM applications RETURNING *');
    console.log(`   Deleted ${deletedApplications.rows.length} applications`);
    
    // Delete jobs
    const deletedJobs = await client.query('DELETE FROM jobs RETURNING *');
    console.log(`   Deleted ${deletedJobs.rows.length} jobs`);
    
    await client.query('COMMIT');
    
    console.log(' All jobs cleared successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Error clearing jobs:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Count jobs
 */
async function countJobs() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open,
        COUNT(CASE WHEN status = 'closed' THEN 1 END) as closed
      FROM jobs
    `);
    
    const stats = result.rows[0];
    
    console.log('\n ==================== JOB STATISTICS ====================');
    console.log(`   Total jobs: ${stats.total}`);
    console.log(`   Open jobs: ${stats.open}`);
    console.log(`   Closed jobs: ${stats.closed}`);
    console.log('=========================================================\n');
    
    return stats;
  } catch (error) {
    console.error(' Error counting jobs:', error.message);
    throw error;
  }
}

/**
 * List jobs
 */
async function listJobs(limit = 10) {
  try {
    const result = await pool.query(
      `SELECT j.id, j.title, j.category, j.location, j.status, j.posted_at,
              COALESCE(u.company_name, e.company) as company_name
       FROM jobs j
       LEFT JOIN employers e ON j.employer_id = e.id
       LEFT JOIN users u ON e.user_id = u.id
       ORDER BY j.posted_at DESC
       LIMIT $1`,
      [limit]
    );
    
    console.log(`\n ==================== RECENT JOBS (Top ${limit}) ====================`);
    if (result.rows.length === 0) {
      console.log('   No jobs found.');
    } else {
      result.rows.forEach((job, index) => {
        console.log(`${index + 1}. [${job.status.toUpperCase()}] ${job.title}`);
        console.log(`   Company: ${job.company_name || 'N/A'}`);
        console.log(`   Location: ${job.location} | Category: ${job.category}`);
        console.log(`   Posted: ${job.posted_at}`);
        console.log('   ---');
      });
    }
    console.log('===================================================================\n');
    
    return result.rows;
  } catch (error) {
    console.error(' Error listing jobs:', error.message);
    throw error;
  }
}


module.exports = {
  seedJobs,
  clearJobs,
  countJobs,
  listJobs,
  sampleJobs
};


if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'seed':
      seedJobs()
        .then(() => process.exit(0))
        .catch(error => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    case 'clear':
      clearJobs()
        .then(() => process.exit(0))
        .catch(error => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    case 'count':
      countJobs()
        .then(() => process.exit(0))
        .catch(error => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    case 'list':
      const limit = parseInt(args[1]) || 10;
      listJobs(limit)
        .then(() => process.exit(0))
        .catch(error => {
          console.error(error);
          process.exit(1);
        });
      break;
      
    default:
      console.log(' Job Seeder Commands:');
      console.log('   node jobSeeder.js seed        - Seed sample jobs');
      console.log('   node jobSeeder.js clear       - Clear all jobs');
      console.log('   node jobSeeder.js count       - Count jobs');
      console.log('   node jobSeeder.js list [n]    - List recent jobs (default: 10)');
      process.exit(0);
  }
}
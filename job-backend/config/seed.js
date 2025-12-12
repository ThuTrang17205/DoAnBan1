const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// ==================== SEED DATA ====================

const normalUsers = [
  { username: "user1", name: "Nguyễn Văn A", email: "user1@gmail.com", password: "123456", phone: "0901234567", role: "user" },
  { username: "user2", name: "Trần Thị B", email: "user2@gmail.com", password: "123456", phone: "0901234568", role: "user" },
  { username: "user3", name: "Lê Văn C", email: "user3@gmail.com", password: "123456", phone: "0901234569", role: "user" },
  { username: "user4", name: "Phạm Thị D", email: "user4@gmail.com", password: "123456", phone: "0901234570", role: "user" },
  { username: "user5", name: "Hoàng Văn E", email: "user5@gmail.com", password: "123456", phone: "0901234571", role: "user" },
];

const employerUsers = [
  { 
    username: "fpt_hr",
    name: "FPT HR Manager",
    email: "hr@fpt.com", 
    password: "123456", 
    phone: "0241234567",
    role: "employer",
    company_name: "FPT Software",
    contact_person: "Nguyễn Thu Hà",
    company_size: "1000+",
    industry: "Công nghệ thông tin"
  },
  { 
    username: "viettel_hr",
    name: "Viettel HR Manager",
    email: "hr@viettel.com", 
    password: "123456", 
    phone: "0241234568",
    role: "employer",
    company_name: "Viettel Solutions",
    contact_person: "Trần Minh Tuấn",
    company_size: "500-1000",
    industry: "Viễn thông"
  },
  { 
    username: "vng_hr",
    name: "VNG HR Manager",
    email: "hr@vng.com", 
    password: "123456", 
    phone: "0281234567",
    role: "employer",
    company_name: "VNG Corporation",
    contact_person: "Lê Thị Mai",
    company_size: "500-1000",
    industry: "Internet & Gaming"
  },
  { 
    username: "shopee_hr",
    name: "Shopee HR Manager",
    email: "hr@shopee.vn", 
    password: "123456", 
    phone: "0281234568",
    role: "employer",
    company_name: "Shopee Vietnam",
    contact_person: "Phạm Văn Nam",
    company_size: "1000+",
    industry: "Thương mại điện tử"
  },
  { 
    username: "tiki_hr",
    name: "Tiki HR Manager",
    email: "hr@tiki.vn", 
    password: "123456", 
    phone: "0281234569",
    role: "employer",
    company_name: "Tiki Corporation",
    contact_person: "Hoàng Minh Anh",
    company_size: "500-1000",
    industry: "E-commerce"
  },
];

const companies = [
  { name: "FPT Software", description: "Công ty phần mềm hàng đầu Việt Nam", location: "Hà Nội", website: "https://fpt-software.com" },
  { name: "Viettel Solutions", description: "Công ty công nghệ của Tập đoàn Viettel", location: "Hà Nội", website: "https://viettelsolutions.vn" },
  { name: "VNG Corporation", description: "Công ty internet hàng đầu Việt Nam", location: "Hồ Chí Minh", website: "https://vng.com.vn" },
  { name: "Shopee Vietnam", description: "Sàn thương mại điện tử số 1 Đông Nam Á", location: "Hồ Chí Minh", website: "https://shopee.vn" },
  { name: "Tiki Corporation", description: "Nền tảng thương mại điện tử Việt Nam", location: "Hồ Chí Minh", website: "https://tiki.vn" },
];

const jobCategories = [
  "Công nghệ thông tin",
  "Marketing",
  "Kinh doanh",
  "Kế toán",
  "Nhân sự",
  "Thiết kế",
  "Xây dựng",
  "Y tế",
  "Giáo dục",
  "Du lịch"
];

const jobTitles = {
  "Công nghệ thông tin": [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Mobile Developer",
    "DevOps Engineer",
    "QA Engineer",
    "Data Analyst",
    "UI/UX Designer"
  ],
  "Marketing": [
    "Marketing Manager",
    "Digital Marketing Specialist",
    "Content Writer",
    "SEO Specialist",
    "Social Media Manager"
  ],
  "Kinh doanh": [
    "Sales Manager",
    "Business Development",
    "Account Manager",
    "Sales Executive"
  ]
};

const locations = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ"];
const jobTypes = ["Full-time", "Part-time", "Remote", "Hybrid"];
const experienceLevels = ["Intern", "Fresher", "Junior", "Middle", "Senior"];

// ==================== SEED FUNCTIONS ====================

async function seedUsers() {
  console.log("🌱 Seeding normal users...");
  
  for (const user of normalUsers) {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    try {
      await pool.query(
        `INSERT INTO users (username, name, email, password, phone, role, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (email) DO NOTHING`,
        [user.username, user.name, user.email, hashedPassword, user.phone, user.role]
      );
      console.log(`✅ Created user: ${user.email}`);
    } catch (err) {
      console.error(`❌ Error creating user ${user.email}:`, err.message);
    }
  }
}

async function seedEmployers() {
  console.log("\n🌱 Seeding employers...");
  
  for (const employer of employerUsers) {
    const hashedPassword = await bcrypt.hash(employer.password, 10);
    
    try {
      // Insert vào bảng users với role = 'employer'
      const result = await pool.query(
        `INSERT INTO users (
          username, name, email, password, phone, role, 
          company_name, contact_person, company_size, industry, created_at
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (email) DO NOTHING
        RETURNING id`,
        [
          employer.username,
          employer.name,
          employer.email,
          hashedPassword,
          employer.phone,
          employer.role,
          employer.company_name,
          employer.contact_person,
          employer.company_size,
          employer.industry
        ]
      );
      
      if (result.rows.length > 0) {
        const userId = result.rows[0].id;
        
        // Insert vào bảng employers
        await pool.query(
          `INSERT INTO employers (user_id, company, description)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id) DO NOTHING`,
          [userId, employer.company_name, `${employer.company_name} - ${employer.industry}`]
        );
        
        console.log(`✅ Created employer: ${employer.company_name}`);
      }
    } catch (err) {
      console.error(`❌ Error creating employer ${employer.company_name}:`, err.message);
    }
  }
}

async function seedCompanies() {
  console.log("\n🌱 Seeding companies...");
  
  for (const company of companies) {
    try {
      await pool.query(
        `INSERT INTO companies (name, description, location, website, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT DO NOTHING`,
        [company.name, company.description, company.location, company.website]
      );
      console.log(`✅ Created company: ${company.name}`);
    } catch (err) {
      console.error(`❌ Error creating company ${company.name}:`, err.message);
    }
  }
}

async function seedJobs() {
  console.log("\n🌱 Seeding jobs...");
  
  // Lấy danh sách companies
  const companiesResult = await pool.query("SELECT id, name FROM companies");
  const companiesList = companiesResult.rows;
  
  if (companiesList.length === 0) {
    console.log("❌ No companies found. Please seed companies first.");
    return;
  }
  
  let jobCount = 0;
  
  // Tạo 25 jobs
  for (let i = 0; i < 25; i++) {
    const category = jobCategories[Math.floor(Math.random() * jobCategories.length)];
    const titlesForCategory = jobTitles[category] || ["Software Developer"];
    const title = titlesForCategory[Math.floor(Math.random() * titlesForCategory.length)];
    
    const company = companiesList[Math.floor(Math.random() * companiesList.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const jobType = jobTypes[Math.floor(Math.random() * jobTypes.length)];
    const experience = experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
    
    const minSalary = Math.floor(Math.random() * 20 + 10) * 1000000; // 10-30M
    const maxSalary = minSalary + Math.floor(Math.random() * 20 + 10) * 1000000; // +10-30M
    
    const description = `Mô tả công việc cho vị trí ${title} tại ${company.name}. 

Trách nhiệm công việc:
- Phát triển và maintain các tính năng mới
- Làm việc với team để deliver sản phẩm chất lượng
- Review code và mentor junior members
- Tham gia các cuộc họp technical

Yêu cầu:
- Kinh nghiệm: ${experience}
- Hình thức: ${jobType}
- Địa điểm: ${location}`;
    
    const requirements = `- Tốt nghiệp ${category}
- Có kinh nghiệm ${experience}
- Kỹ năng giao tiếp tốt
- Làm việc nhóm hiệu quả
- Chủ động và có trách nhiệm`;
    
    const benefits = `- Lương: ${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()} VNĐ
- Bảo hiểm đầy đủ theo luật
- 13th month salary
- Team building, du lịch hàng năm
- Môi trường làm việc chuyên nghiệp
- Cơ hội thăng tiến`;
    
    try {
      await pool.query(
        `INSERT INTO jobs (
          title, company, company_name, company_id, location, 
          min_salary, max_salary, currency, salary,
          category, description, requirements, benefits,
          job_type, experience, status, posted_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())`,
        [
          title,
          company.name,
          company.name,
          company.id,
          location,
          minSalary,
          maxSalary,
          'VNĐ',
          `${minSalary.toLocaleString()} - ${maxSalary.toLocaleString()} VNĐ`,
          category,
          description,
          requirements,
          benefits,
          jobType,
          experience,
          'open'
        ]
      );
      jobCount++;
      console.log(`✅ Created job ${jobCount}: ${title} at ${company.name}`);
    } catch (err) {
      console.error(`❌ Error creating job:`, err.message);
    }
  }
  
  console.log(`✅ Total created ${jobCount} jobs`);
}

async function seedApplications() {
  console.log("\n🌱 Seeding applications...");
  
  // Lấy danh sách users (role = 'user') và jobs
  const usersResult = await pool.query("SELECT id FROM users WHERE role = 'user'");
  const jobsResult = await pool.query("SELECT id FROM jobs");
  
  const usersList = usersResult.rows;
  const jobsList = jobsResult.rows;
  
  if (usersList.length === 0 || jobsList.length === 0) {
    console.log("❌ Need users and jobs to create applications");
    return;
  }
  
  const statuses = ["pending", "reviewing", "responded"];
  
  // Tạo 20-30 applications
  const numApplications = Math.floor(Math.random() * 10) + 20;
  
  for (let i = 0; i < numApplications; i++) {
    const user = usersList[Math.floor(Math.random() * usersList.length)];
    const job = jobsList[Math.floor(Math.random() * jobsList.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    try {
      await pool.query(
        `INSERT INTO applications (user_id, job_id, status, ngay_ung_tuyen)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, job_id) DO NOTHING`,
        [user.id, job.id, status]
      );
      console.log(`✅ Created application ${i + 1}`);
    } catch (err) {
      if (!err.message.includes("duplicate")) {
        console.error(`❌ Error creating application:`, err.message);
      }
    }
  }
}

// ==================== MAIN FUNCTION ====================

async function main() {
  console.log("🚀 Starting seed process...\n");
  
  try {
    await seedUsers();
    await seedEmployers();
    await seedCompanies();
    await seedJobs();
    await seedApplications();
    
    console.log("\n✅ Seed completed successfully!");
    console.log("\n📊 Summary:");
    
    const userCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    const employerCount = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'employer'");
    const companyCount = await pool.query("SELECT COUNT(*) FROM companies");
    const jobCount = await pool.query("SELECT COUNT(*) FROM jobs");
    const applicationCount = await pool.query("SELECT COUNT(*) FROM applications");
    
    console.log(`- Normal Users: ${userCount.rows[0].count}`);
    console.log(`- Employers: ${employerCount.rows[0].count}`);
    console.log(`- Companies: ${companyCount.rows[0].count}`);
    console.log(`- Jobs: ${jobCount.rows[0].count}`);
    console.log(`- Applications: ${applicationCount.rows[0].count}`);
    
    console.log("\n🔑 Test Accounts:");
    console.log("User: user1@gmail.com / 123456");
    console.log("Employer: hr@fpt.com / 123456");
    console.log("Admin: admin / admin123");
    
  } catch (err) {
    console.error("❌ Seed error:", err);
  } finally {
    await pool.end();
    console.log("\n👋 Database connection closed");
    process.exit(0);
  }
}

// Run seed
main();
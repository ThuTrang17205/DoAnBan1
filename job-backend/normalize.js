// ========================
// 🚀 CHUẨN HOÁ DỮ LIỆU JOBS
// ========================

console.log("🔧 Bắt đầu chuẩn hoá dữ liệu từ raw_jobs...");

import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

// ========================
// 🔌 Kết nối PostgreSQL
// ========================
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "job_portal",
  password: process.env.DB_PASSWORD || "trang1718",
  port: process.env.DB_PORT || 5432,
});

// ========================
// 🧭 Hàm chuẩn hoá location
// ========================
function normalizeLocation(location) {
  if (!location) return null;
  const lc = location.toLowerCase().trim();

  if (lc.includes("ha noi") || lc.includes("hn")) return "Hà Nội";
  if (lc.includes("ho chi minh") || lc.includes("hcm")) return "TP. Hồ Chí Minh";
  if (lc.includes("da nang")) return "Đà Nẵng";
  if (lc.includes("can tho")) return "Cần Thơ";
  if (lc.includes("hai phong")) return "Hải Phòng";

  return location.charAt(0).toUpperCase() + location.slice(1);
}

// ========================
// 💰 Hàm chuẩn hoá lương
// ========================
function normalizeSalary(salary) {
  if (!salary) return { min: null, max: null, currency: "VND" };

  const cleaned = salary.replace(/\./g, "").replace(/,/g, "").toLowerCase();
  const regex = /(\d+)[^\d]+(\d+)?/;
  const match = cleaned.match(regex);

  let currency = "VND";
  if (cleaned.includes("usd") || cleaned.includes("$")) currency = "USD";

  if (!match) return { min: null, max: null, currency };

  const multiplier = currency === "USD" ? 1 : 1_000_000;
  const min = parseInt(match[1]) * multiplier;
  const max = match[2] ? parseInt(match[2]) * multiplier : min;

  return { min, max, currency };
}

// ========================
// 🧠 Phân loại ngành nghề
// ========================
function detectCategory(title, description = "") {
  const text = (title + " " + description)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const categories = [
    { key: /developer|engineer|it|software|frontend|backend|fullstack|devops|tester|qa|lap trinh|code|data|ai|machine learning|system admin|mang may tinh|it support/, cat: "Công nghệ thông tin" },
    { key: /ke toan|accountant|finance|thu ngan|kiem toan|ngan hang|bank|auditor|bao cao tai chinh|giao dich vien/, cat: "Kế toán - Tài chính - Ngân hàng" },
    { key: /sales|kinh doanh|telesales|cham soc khach hang|customer service|ban hang|sale admin|tu van vien|cham soc kh/, cat: "Kinh doanh - Bán hàng" },
    { key: /marketing|seo|content|social|brand|digital|pr|truyen thong|quang cao|copywriter|facebook ads|google ads|tiktok/, cat: "Marketing - Truyền thông" },
    { key: /nhan su|hanh chinh|hr|tuyen dung|recruiter|hanh chanh|bao hiem|cham cong|quan ly nhan vien/, cat: "Nhân sự - Hành chính" },
    { key: /designer|thiet ke|ui|ux|graphic|hoa si|illustrator|figma|photoshop|indesign|3d|animation/, cat: "Thiết kế - Đồ hoạ" },
    { key: /ky su|construction|civil|co khi|dien|xay dung|maintenance|mechanical|dien lanh|ky thuat vien|autocad/, cat: "Kỹ thuật - Xây dựng" },
    { key: /giao vien|training|giang vien|education|teacher|gia su|dao tao|day hoc/, cat: "Giáo dục - Đào tạo" },
    { key: /bat dong san|real estate|moi gioi|sales bds|dat nen|chung cu/, cat: "Bất động sản" },
    { key: /lao dong pho thong|phu kho|boc vac|shipper|phuc vu|tap vu|bao ve|giao hang|cong nhan|tho ho|tho dien/, cat: "Lao động phổ thông" },
    { key: /chef|phuc vu|nha hang|bep|barista|dau bep|phuc vu ban|le tan|khach san|housekeeping|bartender/, cat: "Nhà hàng - Khách sạn" },
    { key: /support|dich vu|care|service|tong dai vien|customer support|bao hanh|ky thuat ho tro/, cat: "Dịch vụ - Khách hàng" },
    { key: /manager|truong phong|giam doc|lead|supervisor|quan ly|chief|head/, cat: "Quản lý / Cấp cao" },
  ];

  for (const k of categories) {
    if (k.key.test(text)) return k.cat;
  }

  return "Khác";
}

// ========================
// 🔎 Kiểm tra job trùng
// ========================
async function isDuplicate(title, company, location) {
  const res = await pool.query(
    `SELECT 1 FROM jobs WHERE title=$1 AND company=$2 AND location=$3 LIMIT 1`,
    [title, company, location]
  );
  return res.rowCount > 0;
}

// ========================
// 🧼 Chạy chuẩn hoá
// ========================
(async () => {
  try {
    const { rows } = await pool.query("SELECT * FROM raw_jobs");
    console.log(`📦 Có ${rows.length} job thô cần xử lý`);

    // ✅ SỬA: Đổi created_at → posted_at
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        title TEXT,
        company TEXT,
        location TEXT,
        min_salary NUMERIC,
        max_salary NUMERIC,
        currency VARCHAR(10),
        category TEXT,
        description TEXT,
        url TEXT UNIQUE,
        source TEXT,
        posted_at TIMESTAMP DEFAULT NOW()
      )
    `);

    let count = 0;
    for (const job of rows) {
      if (!job.title || !job.company) continue;

      const location = normalizeLocation(job.location);
      const { min, max, currency } = normalizeSalary(job.salary);
      const category = detectCategory(job.title, job.description || "");

      const duplicate = await isDuplicate(job.title, job.company, location);
      if (duplicate) {
        console.log(`⚠️ Bỏ qua job trùng: ${job.title}`);
        continue;
      }

      await pool.query(
        `INSERT INTO jobs (title, company, location, min_salary, max_salary, currency, category, description, url, source)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (url) DO NOTHING;`,
        [
          job.title.trim(),
          job.company.trim(),
          location,
          min,
          max,
          currency,
          category,
          job.description || null,
          job.url,
          job.source || "topcv",
        ]
      );

      count++;
      console.log(`✅ ${count}. ${job.title} → ${category}`);
    }

    console.log(`🎯 Hoàn tất! Đã lưu ${count} job sạch vào bảng "jobs".`);
  } catch (err) {
    console.error("❌ Lỗi:", err);
  } finally {
    await pool.end();
  }
})();
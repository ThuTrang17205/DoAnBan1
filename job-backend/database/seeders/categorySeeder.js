

const pool = require('../../config/db');

const categories = [
  {
    slug: "cong-nghe-thong-tin",
    name: "Công nghệ thông tin",
   
    description: "Lập trình, phát triển phần mềm, IT support, DevOps, Data Science"
  },
  {
    slug: "ke-toan-tai-chinh",
    name: "Kế toán - Tài chính - Ngân hàng",
   
    description: "Kế toán, kiểm toán, tài chính, ngân hàng, đầu tư"
  },
  {
    slug: "kinh-doanh-ban-hang",
    name: "Kinh doanh - Bán hàng",
  
    description: "Sales, business development, telesales, account manager"
  },
  {
    slug: "marketing-truyen-thong",
    name: "Marketing - Truyền thông",
   
    description: "Digital marketing, content marketing, SEO, branding, PR"
  },
  {
    slug: "nhan-su-hanh-chinh",
    name: "Nhân sự - Hành chính",
  
    description: "HR, tuyển dụng, hành chính, văn phòng"
  },
  {
    slug: "thiet-ke-do-hoa",
    name: "Thiết kế - Đồ hoạ",

    description: "Graphic design, UI/UX, thiết kế web, multimedia"
  },
  {
    slug: "ky-thuat-xay-dung",
    name: "Kỹ thuật - Xây dựng",
    
    description: "Kỹ sư xây dựng, kiến trúc, cơ khí, điện, điện tử"
  },
  {
    slug: "giao-duc-dao-tao",
    name: "Giáo dục - Đào tạo",
    
    description: "Giáo viên, giảng viên, đào tạo, nghiên cứu"
  },
  {
    slug: "bat-dong-san",
    name: "Bất động sản",
   
    description: "Môi giới, tư vấn, quản lý dự án bất động sản"
  },
  {
    slug: "lao-dong-pho-thong",
    name: "Lao động phổ thông",
    
    description: "Công nhân, thợ kỹ thuật, vận hành máy móc"
  },
  {
    slug: "nha-hang-khach-san",
    name: "Nhà hàng - Khách sạn",
    
    description: "F&B, hospitality, du lịch, phục vụ"
  },
  {
    slug: "dich-vu-khach-hang",
    name: "Dịch vụ - Khách hàng",
  
    description: "Customer service, customer care, call center"
  },
  {
    slug: "quan-ly-cap-cao",
    name: "Quản lý / Cấp cao",
 
    description: "Manager, director, executive, C-level"
  },
  {
    slug: "khac",
    name: "Khác",
  
    description: "Các ngành nghề khác"
  }
];

/**
 * Seed categories (optional - nếu cần lưu vào database)
 */
async function seedCategories() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log(' Starting category seeding...');
    
   
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'categories'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log(' Note: Categories table does not exist.');
      console.log(' Categories are defined in the Category model, no database table needed.');
      console.log(' Seeding skipped (not required).');
      await client.query('ROLLBACK');
      return;
    }
    
   
    for (const category of categories) {
      const existingCategory = await client.query(
        'SELECT * FROM categories WHERE slug = $1',
        [category.slug]
      );
      
      if (existingCategory.rows.length === 0) {
        await client.query(
          `INSERT INTO categories (slug, name, icon, description, created_at)
           VALUES ($1, $2, $3, $4, NOW())`,
          [category.slug, category.name, category.icon, category.description]
        );
        console.log(` Created category: ${category.name}`);
      } else {
        console.log(` Category already exists: ${category.name}`);
      }
    }
    
    await client.query('COMMIT');
    console.log(' Category seeding completed!');
    console.log(` Total categories: ${categories.length}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(' Error seeding categories:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Display categories (không cần seed)
 */
function displayCategories() {
  console.log('\n ==================== CATEGORIES ====================');
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat.icon} ${cat.name} (${cat.slug})`);
    console.log(`   ${cat.description}`);
  });
  console.log('====================================================\n');
}

// Export
module.exports = {
  seedCategories,
  displayCategories,
  categories
};

// Run directly
if (require.main === module) {
  displayCategories();
  
  seedCategories()
    .then(() => {
      console.log(' Seeder finished successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error(' Seeder failed:', error);
      process.exit(1);
    });
}
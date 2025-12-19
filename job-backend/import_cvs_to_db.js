// import_cvs_to_db.js (ở root job-backend/)

const fs = require('fs');
const path = require('path');
const pool = require('./config/db'); // ✅ Sửa từ '../config/db' thành './config/db'

async function importAllCVs() {
  const cvFolder = path.join(__dirname, 'cv_parser_data'); // ✅ Sửa từ '../cv_parser_data'
  const files = fs.readdirSync(cvFolder).filter(f => f.endsWith('.json'));
  
  console.log(`📁 Found ${files.length} CV files`);
  
  for (const file of files) {
    try {
      const cvData = JSON.parse(
        fs.readFileSync(path.join(cvFolder, file), 'utf8')
      );
      
      console.log(`\n📄 Processing: ${file}`);
      console.log(`   Name: ${cvData.full_name || cvData.name}`);
      console.log(`   Email: ${cvData.email}`);
      
      // Check if user exists
      const userCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [cvData.email]
      );
      
      let userId;
      if (userCheck.rows.length === 0) {
        // Create user
        const userResult = await pool.query(`
          INSERT INTO users (name, email, role, is_active, created_at)
          VALUES ($1, $2, 'candidate', true, NOW())
          RETURNING id
        `, [cvData.full_name || cvData.name, cvData.email]);
        userId = userResult.rows[0].id;
        console.log(`   ✅ Created new user (ID: ${userId})`);
      } else {
        userId = userCheck.rows[0].id;
        console.log(`   ℹ️  User already exists (ID: ${userId})`);
      }
      
      // Insert/Update CV data
      const result = await pool.query(`
        INSERT INTO cv_parsed_data (
          user_id, 
          cv_id, 
          full_name, 
          email, 
          phone, 
          skills, 
          skill_levels,
          total_experience_years, 
          education_level,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET
          skills = EXCLUDED.skills,
          skill_levels = EXCLUDED.skill_levels,
          total_experience_years = EXCLUDED.total_experience_years,
          education_level = EXCLUDED.education_level,
          updated_at = NOW()
        RETURNING id
      `, [
        userId,
        cvData.cv_id || userId,
        cvData.full_name || cvData.name,
        cvData.email,
        cvData.phone,
        JSON.stringify(cvData.skills || []),
        JSON.stringify(cvData.skill_levels || []),
        cvData.total_experience_years || cvData.experience_years || 0,
        cvData.education_level || cvData.education || 'Unknown'
      ]);
      
      console.log(`   ✅ CV data saved (cv_parsed_data ID: ${result.rows[0].id})`);
      
    } catch (error) {
      console.error(`   ❌ Error importing ${file}:`, error.message);
    }
  }
  
  // Summary
  console.log('\n📊 Import Summary:');
  const countUsers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'candidate'");
  const countCVs = await pool.query("SELECT COUNT(*) FROM cv_parsed_data");
  
  console.log(`   Total candidates: ${countUsers.rows[0].count}`);
  console.log(`   Total CVs parsed: ${countCVs.rows[0].count}`);
  console.log('\n🎉 Import completed!');
}

importAllCVs()
  .then(() => {
    console.log('\n✅ Script finished successfully');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
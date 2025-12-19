// test-parser.js
// Script test parsing CV đơn giản

const CVParserService = require('./services/cvParser');
// ✅ DÒNG MỚI
const { pool, shutdown } = require('./config/db');

async function testParser() {
  try {
    console.log('\n🧪 TESTING CV PARSER...\n');

    // 1. Lấy 1 CV chưa parse
    const cvQuery = await pool.query(`
      SELECT 
        uc.id,
        uc.user_id,
        uc.file_name,
        uc.file_path,
        u.name as user_name
      FROM user_cvs uc
      INNER JOIN users u ON uc.user_id = u.id
      LEFT JOIN cv_parsed_data cpd ON uc.id = cpd.cv_id
      WHERE cpd.id IS NULL
        AND u.role = 'candidate'
      LIMIT 1
    `);

    if (cvQuery.rows.length === 0) {
      console.log('❌ Không tìm thấy CV nào chưa parse!');
      console.log('Thử parse lại một CV đã có...');
      
      // Lấy CV bất kỳ
      const anyCv = await pool.query(`
        SELECT id, user_id, file_name, file_path
        FROM user_cvs
        LIMIT 1
      `);
      
      if (anyCv.rows.length === 0) {
        console.log('❌ Không có CV nào trong database!');
        process.exit(1);
      }
      
      cv = anyCv.rows[0];
    } else {
      cv = cvQuery.rows[0];
    }

    console.log('📄 Testing with CV:');
    console.log(`   ID: ${cv.id}`);
    console.log(`   User: ${cv.user_name || cv.user_id}`);
    console.log(`   File: ${cv.file_name}`);
    console.log(`   Path: ${cv.file_path}\n`);

    // 2. Parse CV
    console.log('🚀 Starting parse...\n');
    const startTime = Date.now();

    const result = await CVParserService.parseByCvId(cv.id);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // 3. Display results
    console.log('\n' + '='.repeat(60));
    console.log('✅ PARSING SUCCESSFUL!');
    console.log('='.repeat(60) + '\n');

    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`📋 Parsed CV ID: ${result.id}`);
    console.log(`👤 User ID: ${result.user_id}\n`);

    console.log('📊 EXTRACTED DATA:');
    console.log('─'.repeat(60));
    
    console.log(`Full Name:     ${result.full_name || 'N/A'}`);
    console.log(`Email:         ${result.email || 'N/A'}`);
    console.log(`Phone:         ${result.phone || 'N/A'}`);
    console.log(`Position:      ${result.current_position || 'N/A'}`);
    console.log(`Company:       ${result.current_company || 'N/A'}`);
    console.log(`Experience:    ${result.total_experience_years || 0} years`);
    console.log(`Education:     ${result.education_level || 'N/A'}`);
    console.log(`University:    ${result.university || 'N/A'}`);
    
    // Skills
    let skillsDisplay = 'N/A';
    if (result.skills) {
      try {
        const skillsArray = typeof result.skills === 'string' 
          ? JSON.parse(result.skills) 
          : result.skills;
        
        if (Array.isArray(skillsArray) && skillsArray.length > 0) {
          skillsDisplay = skillsArray.slice(0, 5).join(', ');
          if (skillsArray.length > 5) {
            skillsDisplay += ` (+${skillsArray.length - 5} more)`;
          }
        }
      } catch (e) {
        skillsDisplay = `Error parsing: ${result.skills.substring(0, 50)}...`;
      }
    }
    console.log(`Skills:        ${skillsDisplay}`);
    
    console.log(`\nParsing Method: ${result.parsing_method}`);
    console.log(`Confidence:     ${result.confidence_score || 0}`);
    console.log(`Parsed At:      ${result.parsed_at}`);

    console.log('\n' + '='.repeat(60));
    console.log('💾 Data saved to cv_parsed_data table');
    console.log('='.repeat(60) + '\n');

    // 4. Verify in database
    const verifyQuery = await pool.query(`
      SELECT 
        cpd.*,
        u.name as user_name
      FROM cv_parsed_data cpd
      INNER JOIN users u ON cpd.user_id = u.id
      WHERE cpd.id = $1
    `, [result.id]);

    if (verifyQuery.rows.length > 0) {
      console.log('✅ Verified: Data exists in database\n');
    } else {
      console.log('❌ Warning: Could not verify data in database\n');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('\nStack trace:');
    console.error(error.stack);
    process.exit(1);
  // ✅ DÒNG MỚI
} finally {
  await shutdown();
}
}

// Run
testParser();
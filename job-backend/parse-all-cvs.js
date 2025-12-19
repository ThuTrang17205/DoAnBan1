// parse-all-cvs.js
// Script parse tất cả CVs chưa được parse

const CVParserService = require('./services/cvParser');
const { pool, shutdown } = require('./config/db');

async function parseAllCVs() {
  console.log('\n🚀 PARSING ALL CVS...\n');

  try {
    // 1. Lấy tất cả CVs chưa parse
    const query = `
      SELECT 
        uc.id,
        uc.user_id,
        uc.file_name,
        uc.file_path,
        u.name as user_name,
        u.email
      FROM user_cvs uc
      INNER JOIN users u ON uc.user_id = u.id
      LEFT JOIN cv_parsed_data cpd ON uc.id = cpd.cv_id
      WHERE cpd.id IS NULL
      ORDER BY uc.id
    `;

    const result = await pool.query(query);
    const cvs = result.rows;

    if (cvs.length === 0) {
      console.log('✅ All CVs are already parsed!');
      console.log('\nTo re-parse all CVs, run:');
      console.log('DELETE FROM cv_parsed_data; -- Then run this script again\n');
      return;
    }

    console.log(`📋 Found ${cvs.length} CVs to parse:\n`);

    // 2. Parse từng CV
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (let i = 0; i < cvs.length; i++) {
      const cv = cvs[i];
      const progress = `[${i + 1}/${cvs.length}]`;

      try {
        console.log(`${progress} Parsing CV ${cv.id}: ${cv.file_name}`);
        console.log(`   User: ${cv.user_name || cv.email || cv.user_id}`);
        console.log(`   Path: ${cv.file_path}`);

        const startTime = Date.now();
        
        // Parse CV
        const parsed = await CVParserService.parseByCvId(cv.id);
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);

        console.log(`   ✅ Success! (${duration}s)`);
        console.log(`   → Name: ${parsed.full_name || 'N/A'}`);
        console.log(`   → Email: ${parsed.email || 'N/A'}`);
        console.log(`   → Skills: ${parsed.skills ? 'Yes' : 'No'}`);
        console.log(`   → Experience: ${parsed.total_experience_years || 0} years`);
        console.log('');

        successCount++;

      } catch (error) {
        errorCount++;
        console.log(`   ❌ Error: ${error.message}\n`);
        
        errors.push({
          cv_id: cv.id,
          file_name: cv.file_name,
          error: error.message
        });
      }
    }

    // 3. Summary
    console.log('='.repeat(60));
    console.log('📊 PARSING SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Success: ${successCount}/${cvs.length}`);
    console.log(`❌ Failed:  ${errorCount}/${cvs.length}`);
    console.log('');

    if (errors.length > 0) {
      console.log('❌ ERRORS:');
      console.log('─'.repeat(60));
      errors.forEach(err => {
        console.log(`CV ${err.cv_id}: ${err.file_name}`);
        console.log(`   Error: ${err.error}`);
      });
      console.log('');
    }

    // 4. Verify total parsed CVs
    const totalQuery = await pool.query(`
      SELECT COUNT(*) as total FROM cv_parsed_data
    `);

    console.log('='.repeat(60));
    console.log(`💾 Total CVs in cv_parsed_data: ${totalQuery.rows[0].total}`);
    console.log('='.repeat(60) + '\n');

    // 5. Show sample parsed data
    if (successCount > 0) {
      const sampleQuery = await pool.query(`
        SELECT 
          id,
          cv_id,
          full_name,
          email,
          skills::text as skills_text,
          total_experience_years,
          education_level,
          parsing_method
        FROM cv_parsed_data
        ORDER BY id DESC
        LIMIT 3
      `);

      console.log('📄 Sample parsed CVs (latest 3):');
      console.log('─'.repeat(60));
      sampleQuery.rows.forEach(row => {
        console.log(`CV ${row.cv_id}: ${row.full_name || 'N/A'}`);
        console.log(`   Email: ${row.email || 'N/A'}`);
        console.log(`   Experience: ${row.total_experience_years || 0} years`);
        console.log(`   Method: ${row.parsing_method}`);
        
        // Show first 3 skills
        if (row.skills_text) {
          try {
            const skills = JSON.parse(row.skills_text);
            const skillsPreview = Array.isArray(skills) && skills.length > 0
              ? skills.slice(0, 3).join(', ') + (skills.length > 3 ? '...' : '')
              : 'None';
            console.log(`   Skills: ${skillsPreview}`);
          } catch (e) {
            console.log(`   Skills: (error parsing)`);
          }
        }
        console.log('');
      });
    }

    console.log('🎉 Done! You can now run matching tests.\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await shutdown();
  }
}

// Run
parseAllCVs();
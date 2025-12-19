// check-unparsed-cvs.js
// Kiểm tra CVs nào chưa được parse

const { pool, shutdown } = require('./config/db');

async function checkUnparsedCVs() {
  try {
    console.log('\n🔍 CHECKING UNPARSED CVS...\n');

    // 1. Tổng số CVs
    const totalCVs = await pool.query('SELECT COUNT(*) FROM user_cvs');
    const totalParsed = await pool.query('SELECT COUNT(*) FROM cv_parsed_data');

    console.log('📊 Statistics:');
    console.log(`   Total CV files: ${totalCVs.rows[0].count}`);
    console.log(`   Parsed CVs: ${totalParsed.rows[0].count}`);
    console.log(`   Unparsed: ${totalCVs.rows[0].count - totalParsed.rows[0].count}\n`);

    // 2. Lấy danh sách CVs chưa parse
    const unparsed = await pool.query(`
      SELECT 
        uc.id as cv_id,
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
    `);

    if (unparsed.rows.length === 0) {
      console.log('✅ All CVs are parsed!\n');
    } else {
      console.log(`❌ Found ${unparsed.rows.length} unparsed CVs:\n`);
      console.log('─'.repeat(80));
      
      unparsed.rows.forEach((cv, idx) => {
        console.log(`${idx + 1}. CV ID: ${cv.cv_id} | User: ${cv.user_name || cv.email}`);
        console.log(`   File: ${cv.file_name}`);
        console.log(`   Path: ${cv.file_path}`);
        console.log('');
      });

      console.log('─'.repeat(80));
      console.log('\n💡 To parse these CVs, run:');
      console.log('   node parse-all-cvs.js\n');
    }

    // 3. Chi tiết CVs đã parse
    const parsed = await pool.query(`
      SELECT 
        cpd.id,
        cpd.cv_id,
        cpd.user_id,
        cpd.full_name,
        cpd.email,
        cpd.parsing_method,
        uc.file_name
      FROM cv_parsed_data cpd
      INNER JOIN user_cvs uc ON cpd.cv_id = uc.id
      ORDER BY cpd.id
    `);

    if (parsed.rows.length > 0) {
      console.log('✅ Parsed CVs:');
      console.log('─'.repeat(80));
      parsed.rows.forEach((cv, idx) => {
        console.log(`${idx + 1}. ${cv.full_name || 'N/A'} | CV ID: ${cv.cv_id} | Method: ${cv.parsing_method}`);
        console.log(`   File: ${cv.file_name}`);
        console.log('');
      });
      console.log('─'.repeat(80) + '\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await shutdown();
  }
}

checkUnparsedCVs();
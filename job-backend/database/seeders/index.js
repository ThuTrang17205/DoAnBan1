

require('dotenv').config();
const { seedCategories, displayCategories } = require('./categorySeeder');
const { seedAdmins } = require('./adminSeeder');
const { seedJobs, countJobs } = require('./jobSeeder');

/**
 * Run all seeders in order
 */
async function seedAll() {
  console.log('\n ==================== STARTING SEED PROCESS ====================\n');
  
  try {
    
    console.log(' Step 1/3: Categories');
    displayCategories();
    
    
    console.log('\n Step 2/3: Admin accounts');
    await seedAdmins();
    
    
    console.log('\n Step 3/3: Sample jobs');
    await seedJobs();
    
   
    console.log('\n ==================== SEED SUMMARY ====================');
    await countJobs();
    
    console.log('\n ==================== ALL SEEDERS COMPLETED ====================');
    console.log(' Database is now populated with sample data!');
    console.log('\n Next steps:');
    console.log('   1. Start the server: npm start');
    console.log('   2. Login as admin:');
    console.log('      Username: admin | Password: admin123');
    console.log('   3. Create employers and users via API');
    console.log('\n IMPORTANT: Change default passwords in production!\n');
    
  } catch (error) {
    console.error('\n ==================== SEED FAILED ====================');
    console.error('Error:', error.message);
    console.error('\n Troubleshooting:');
    console.error('   1. Check if database is running');
    console.error('   2. Verify .env configuration');
    console.error('   3. Make sure tables are created');
    console.error('   4. Check if employers exist (for job seeding)');
    throw error;
  }
}

/**
 * Reset database (clear all data)
 */
async function resetDatabase() {
  console.log('\n ==================== RESETTING DATABASE ====================\n');
  console.log(' WARNING: This will delete ALL data!');
  console.log('Press Ctrl+C to cancel or wait 3 seconds...\n');
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const { clearJobs } = require('./jobSeeder');
  const pool = require('../../config/db');
  
  try {
    
    await clearJobs();
    
   
    await pool.query('DELETE FROM applications');
    console.log(' Cleared applications');
    
    await pool.query('DELETE FROM user_profiles');
    console.log(' Cleared user profiles');
    
    await pool.query('DELETE FROM employers');
    console.log(' Cleared employers');
    
    await pool.query('DELETE FROM users WHERE role != $1', ['admin']);
    console.log(' Cleared users (kept admins)');
    
    console.log('\n Database reset completed!');
    console.log(' Note: Admin accounts were preserved');
    
  } catch (error) {
    console.error(' Error resetting database:', error.message);
    throw error;
  }
}

/**
 * Check database status
 */
// check-database.js


const pool = require('./config/db'); // Adjust path nếu cần

async function checkDatabase() {
  console.log(' CHECKING DATABASE STATUS...\n');

  try {
    // 1. Check users
    const usersResult = await pool.query(`
      SELECT 
        role,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active
      FROM users
      GROUP BY role
    `);
    
    console.log(' USERS:');
    console.table(usersResult.rows);

    // 2. Check CVs uploaded
    const cvsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_cvs,
        COUNT(DISTINCT user_id) as unique_users
      FROM user_cvs
    `);
    console.log('\n CVS UPLOADED:');
    console.table(cvsResult.rows);

    // 3. Check CVs parsed
    const cvParsedResult = await pool.query(`
      SELECT 
        COUNT(*) as total_parsed,
        COUNT(*) FILTER (WHERE parsing_method = 'AI') as ai_parsed,
        COUNT(*) FILTER (WHERE parsing_method = 'RULE') as rule_parsed
      FROM cv_parsed_data
    `);
    console.log('\n CVS PARSED:');
    console.table(cvParsedResult.rows);

    // 4. Check Jobs
    const jobsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(*) FILTER (WHERE status = 'open') as open_jobs
      FROM jobs
    `);
    console.log('\n JOBS:');
    console.table(jobsResult.rows);

    // 5. Check Jobs parsed
    const jobParsedResult = await pool.query(`
      SELECT 
        COUNT(*) as total_parsed,
        COUNT(*) FILTER (WHERE parsing_method = 'AI') as ai_parsed,
        COUNT(*) FILTER (WHERE parsing_method = 'RULE') as rule_parsed
      FROM job_parsed_data
    `);
    console.log('\n JOBS PARSED:');
    console.table(jobParsedResult.rows);

    // 6. Check Skills master
    const skillsResult = await pool.query(`
      SELECT COUNT(*) as total_skills FROM skills_master
    `);
    console.log('\n SKILLS MASTER:');
    console.table(skillsResult.rows);

    // 7. Check candidate_skills relations
    const candidateSkillsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_relations,
        COUNT(DISTINCT user_id) as candidates_with_skills
      FROM candidate_skills
    `);
    console.log('\n CANDIDATE_SKILLS (Relations):');
    console.table(candidateSkillsResult.rows);

    // 8. Check job_skills relations
    const jobSkillsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_relations,
        COUNT(DISTINCT job_id) as jobs_with_skills
      FROM job_skills
    `);
    console.log('\n JOB_SKILLS (Relations):');
    console.table(jobSkillsResult.rows);

    // 9. Check existing matches
    const matchesResult = await pool.query(`
      SELECT 
        COUNT(*) as total_matches,
        COUNT(DISTINCT job_id) as jobs_matched,
        COUNT(DISTINCT candidate_id) as candidates_matched,
        ROUND(AVG(total_score), 2) as avg_score
      FROM matching_scores
    `);
    console.log('\n MATCHING SCORES (Existing):');
    console.table(matchesResult.rows);

    // 10. Sample jobs for testing
    const sampleJobsResult = await pool.query(`
      SELECT 
        j.id,
        j.title,
        j.company,
        j.status,
        CASE WHEN jpd.id IS NOT NULL THEN 'Yes' ELSE 'No' END as is_parsed,
        jpd.min_experience_years
      FROM jobs j
      LEFT JOIN job_parsed_data jpd ON j.id = jpd.job_id
      WHERE j.status = 'open'
      ORDER BY j.id DESC
      LIMIT 5
    `);
    console.log('\n SAMPLE JOBS (for testing):');
    console.table(sampleJobsResult.rows);

    // 11. Sample candidates for testing
    const sampleCandidatesResult = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        CASE WHEN cpd.id IS NOT NULL THEN 'Yes' ELSE 'No' END as has_parsed_cv,
        cpd.total_experience_years
      FROM users u
      LEFT JOIN cv_parsed_data cpd ON u.id = cpd.user_id
      WHERE u.role = 'candidate'
        AND u.is_active = true
      ORDER BY u.id DESC
      LIMIT 5
    `);
    console.log('\n SAMPLE CANDIDATES (for testing):');
    console.table(sampleCandidatesResult.rows);

    // RECOMMENDATION
    console.log('\n' + '='.repeat(60));
    console.log(' SUMMARY & RECOMMENDATIONS:');
    console.log('='.repeat(60));

    const totalParsedJobs = parseInt(jobParsedResult.rows[0].total_parsed);
    const totalParsedCVs = parseInt(cvParsedResult.rows[0].total_parsed);
    const totalSkills = parseInt(skillsResult.rows[0].total_skills);

    if (totalParsedJobs === 0) {
      console.log(' KHÔNG CÓ JOB NÀO ĐƯỢC PARSE!');
      console.log('   → Bạn cần parse jobs trước: JobParserService.parseByJobId(jobId)');
    } else {
      console.log(` Có ${totalParsedJobs} jobs đã parse`);
    }

    if (totalParsedCVs === 0) {
      console.log(' KHÔNG CÓ CV NÀO ĐƯỢC PARSE!');
      console.log('   → Bạn cần parse CVs trước: CVParserService.parseByCvId(cvId)');
    } else {
      console.log(` Có ${totalParsedCVs} CVs đã parse`);
    }

    if (totalSkills === 0) {
      console.log(' KHÔNG CÓ SKILLS TRONG skills_master!');
      console.log('   → Bạn cần insert skills vào bảng skills_master');
    } else {
      console.log(` Có ${totalSkills} skills trong master`);
    }

    // Final verdict
    console.log('\n' + '='.repeat(60));
    if (totalParsedJobs > 0 && totalParsedCVs > 0 && totalSkills > 0) {
      console.log(' SẴN SÀNG TEST MATCHING!');
      console.log('\nBạn có thể chạy:');
      
      const firstJob = sampleJobsResult.rows.find(j => j.is_parsed === 'Yes');
      if (firstJob) {
        console.log(`\nnode test-matching.js ${firstJob.id}`);
      }
    } else {
      console.log('  CHƯA SẴN SÀNG - Cần parse data trước!');
    }
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error(' Error:', error.message);
    console.error(error.stack);
  } finally {
    await pool.end();
  }
}

// Run
checkDatabase();


module.exports = {
  seedAll,
  resetDatabase,
  checkDatabase
};


if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'all':
    case 'seed':
      seedAll()
        .then(() => {
          console.log('\n Seeding completed successfully!');
          process.exit(0);
        })
        .catch(error => {
          console.error('\n Seeding failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'reset':
      resetDatabase()
        .then(() => {
          console.log('\n Reset completed successfully!');
          process.exit(0);
        })
        .catch(error => {
          console.error('\n Reset failed:', error.message);
          process.exit(1);
        });
      break;
      
    case 'check':
    case 'status':
      checkDatabase()
        .then(() => {
          process.exit(0);
        })
        .catch(error => {
          console.error('\n Check failed:', error.message);
          process.exit(1);
        });
      break;
      
    default:
      console.log('\n ==================== SEEDER COMMANDS ====================\n');
      console.log('Run all seeders:');
      console.log('   node database/seeders/index.js all');
      console.log('   npm run seed:all\n');
      console.log('Individual seeders:');
      console.log('   node database/seeders/adminSeeder.js seed');
      console.log('   node database/seeders/jobSeeder.js seed\n');
      console.log('Other commands:');
      console.log('   node database/seeders/index.js check    - Check database status');
      console.log('   node database/seeders/index.js reset    - Reset database (⚠️ deletes all data)');
      console.log('\n=========================================================\n');
      process.exit(0);
  }
}
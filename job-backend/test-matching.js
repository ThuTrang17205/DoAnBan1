// test-matching.js
// Script test matching cho 1 job

const matchingService = require('./services/matching.service');
const pool = require('./config/db');

async function testMatching() {
  try {
    // Lấy jobId từ command line
    const jobId = process.argv[2];

    if (!jobId) {
      console.error('❌ Usage: node test-matching.js <jobId>');
      console.error('Example: node test-matching.js 123');
      process.exit(1);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 TESTING MATCHING FOR JOB ${jobId}`);
    console.log(`${'='.repeat(60)}\n`);

    // 1. Check job tồn tại và đã parse chưa
    const jobCheck = await pool.query(`
      SELECT 
        j.id,
        j.title,
        j.company,
        j.status,
        jpd.id as parsed_id,
        jpd.required_skills,
        jpd.min_experience_years,
        jpd.required_education_level
      FROM jobs j
      LEFT JOIN job_parsed_data jpd ON j.id = jpd.job_id
      WHERE j.id = $1
    `, [jobId]);

    if (jobCheck.rows.length === 0) {
      console.error(`❌ Job ${jobId} không tồn tại!`);
      process.exit(1);
    }

    const job = jobCheck.rows[0];
    
    console.log('📋 JOB INFO:');
    console.log(`   Title: ${job.title}`);
    console.log(`   Company: ${job.company}`);
    console.log(`   Status: ${job.status}`);
    console.log(`   Parsed: ${job.parsed_id ? 'Yes ✅' : 'No ❌'}`);

    if (!job.parsed_id) {
      console.error('\n❌ Job chưa được parse!');
      console.error('Bạn cần chạy: JobParserService.parseByJobId(jobId) trước');
      process.exit(1);
    }

    console.log(`\n   Required Skills: ${job.required_skills ? JSON.stringify(job.required_skills).substring(0, 100) + '...' : 'N/A'}`);
    console.log(`   Min Experience: ${job.min_experience_years || 0} years`);
    console.log(`   Education: ${job.required_education_level || 'N/A'}`);

    // 2. Check số lượng candidates có thể match
    const candidateCount = await pool.query(`
      SELECT COUNT(*) as total
      FROM cv_parsed_data cpd
      INNER JOIN users u ON cpd.user_id = u.id
      WHERE u.role = 'candidate' AND u.is_active = true
    `);

    console.log(`\n👥 CANDIDATES AVAILABLE: ${candidateCount.rows[0].total}`);

    if (parseInt(candidateCount.rows[0].total) === 0) {
      console.error('\n❌ Không có candidate nào có CV đã parse!');
      process.exit(1);
    }

    // 3. Chạy matching
    console.log(`\n${'='.repeat(60)}`);
    console.log('🚀 RUNNING MATCHING...');
    console.log(`${'='.repeat(60)}\n`);

    const startTime = Date.now();

    const result = await matchingService.matchCandidatesForJob(jobId, {
      limit: 50,           // Match tối đa 50 candidates
      useRelations: true   // Dùng candidate_skills/job_skills tables
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // 4. Hiển thị kết quả
    console.log(`\n${'='.repeat(60)}`);
    console.log('✅ MATCHING COMPLETED!');
    console.log(`${'='.repeat(60)}\n`);

    console.log(`⏱️  Duration: ${duration}s`);
    console.log(`👥 Total Candidates: ${result.total_candidates}`);
    console.log(`✅ Qualified: ${result.qualified_candidates}`);
    console.log(`❌ Not Qualified: ${result.total_candidates - result.qualified_candidates}`);

    // 5. Top 10 matches
    const top10 = result.matches.slice(0, 10);

    console.log(`\n${'='.repeat(60)}`);
    console.log('🏆 TOP 10 CANDIDATES:');
    console.log(`${'='.repeat(60)}\n`);

    console.table(top10.map((m, idx) => ({
      '#': idx + 1,
      'Candidate': m.candidate_name || `ID: ${m.candidate_id}`,
      'Total': m.total_score,
      'Skills': m.skills_score,
      'Exp': m.experience_score,
      'Edu': m.education_score,
      'Loc': m.location_score,
      'Sal': m.salary_score,
      'Qualified': m.is_qualified ? '✅' : '❌'
    })));

    // 6. Score distribution
    console.log(`\n${'='.repeat(60)}`);
    console.log('📊 SCORE DISTRIBUTION:');
    console.log(`${'='.repeat(60)}\n`);

    const ranges = {
      '90-100': 0,
      '80-89': 0,
      '70-79': 0,
      '60-69': 0,
      '50-59': 0,
      'Below 50': 0
    };

    result.matches.forEach(m => {
      const score = m.total_score;
      if (score >= 90) ranges['90-100']++;
      else if (score >= 80) ranges['80-89']++;
      else if (score >= 70) ranges['70-79']++;
      else if (score >= 60) ranges['60-69']++;
      else if (score >= 50) ranges['50-59']++;
      else ranges['Below 50']++;
    });

    console.table(Object.entries(ranges).map(([range, count]) => ({
      'Score Range': range,
      'Count': count,
      'Percentage': `${((count / result.matches.length) * 100).toFixed(1)}%`
    })));

    // 7. Avg scores
    const avgScores = {
      total: result.matches.reduce((sum, m) => sum + m.total_score, 0) / result.matches.length,
      skills: result.matches.reduce((sum, m) => sum + m.skills_score, 0) / result.matches.length,
      experience: result.matches.reduce((sum, m) => sum + m.experience_score, 0) / result.matches.length,
      education: result.matches.reduce((sum, m) => sum + m.education_score, 0) / result.matches.length
    };

    console.log(`\n${'='.repeat(60)}`);
    console.log('📈 AVERAGE SCORES:');
    console.log(`${'='.repeat(60)}\n`);

    console.table(Object.entries(avgScores).map(([key, value]) => ({
      'Criteria': key.charAt(0).toUpperCase() + key.slice(1),
      'Average': value.toFixed(2)
    })));

    console.log(`\n${'='.repeat(60)}`);
    console.log('💾 Kết quả đã được lưu vào bảng matching_scores');
    console.log(`${'='.repeat(60)}\n`);

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run
testMatching();
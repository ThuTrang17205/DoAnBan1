/**
 * createTestUser.js
 * Script để tạo user test trong database
 * 
 * Cách chạy: node scripts/createTestUser.js
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function createTestUser() {
  try {
    console.log('\n🚀 Starting test user creation...\n');

    // User data
    const username = 'tra';
    const password = 'tra';
    const email = 'tra@test.com';
    const name = 'Tra User';
    const role = 'user';

    // Hash password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('📝 User details:');
    console.log('  Username:', username);
    console.log('  Password (plain):', password);
    console.log('  Password (hashed):', hashedPassword.substring(0, 20) + '...');
    console.log('  Email:', email);
    console.log('  Name:', name);
    console.log('  Role:', role);

    // Delete old user if exists
    console.log('\n🗑️  Checking for existing user...');
    const deleteResult = await pool.query(
      'DELETE FROM users WHERE username = $1 OR email = $2 RETURNING id',
      [username, email]
    );
    
    if (deleteResult.rowCount > 0) {
      console.log('✅ Deleted old user (ID:', deleteResult.rows[0].id, ')');
    } else {
      console.log('ℹ️  No existing user found');
    }

    // Insert new user
    console.log('\n➕ Creating new user...');
    const result = await pool.query(
      `INSERT INTO users (username, password, email, name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, username, email, name, role, created_at`,
      [username, hashedPassword, email, name, role]
    );

    console.log('✅ User created successfully!');
    console.log('\n📋 Created user details:');
    console.log(result.rows[0]);

    // Test login
    console.log('\n🔐 Testing login...');
    const loginResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (loginResult.rows.length > 0) {
      const user = loginResult.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (isMatch) {
        console.log('✅ Login test PASSED - Password matches!');
        console.log('\n🎉 SUCCESS! You can now login with:');
        console.log('   Username:', username);
        console.log('   Password:', password);
      } else {
        console.log('❌ Login test FAILED - Password does not match!');
      }
    } else {
      console.log('❌ User not found in database!');
    }

    console.log('\n✅ Script completed successfully!\n');
    await pool.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

// Chạy script
createTestUser();
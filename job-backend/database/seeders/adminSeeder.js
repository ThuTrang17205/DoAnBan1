/**
 * Admin Seeder
 * Creates default admin accounts for the system
 */

require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../../config/db');

/**
 * Admin accounts data
 */
const adminAccounts = [
  {
    username: 'admin',
    email: 'admin@jobportal.com',
    password: 'admin123',
    full_name: 'System Administrator',
    role: 'admin',
    is_active: true
  },
  {
    username: 'superadmin',
    email: 'superadmin@jobportal.com',
    password: 'super123',
    full_name: 'Super Administrator',
    role: 'superadmin',
    is_active: true
  },
  {
    username: 'moderator',
    email: 'moderator@jobportal.com',
    password: 'mod123',
    full_name: 'Content Moderator',
    role: 'moderator',
    is_active: true
  }
];

/**
 * Hash password
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Check if admin exists
 */
const adminExists = async (username, email) => {
  const query = `
    SELECT id FROM admin 
    WHERE username = $1 OR email = $2
  `;
  const result = await pool.query(query, [username, email]);
  return result.rows.length > 0;
};

/**
 * Create single admin account
 */
const createAdmin = async (adminData) => {
  try {
    // Check if admin already exists
    const exists = await adminExists(adminData.username, adminData.email);
    
    if (exists) {
      console.log(`⏭️  Admin "${adminData.username}" already exists, skipping...`);
      return null;
    }

    // Hash password
    const hashedPassword = await hashPassword(adminData.password);

    // Insert admin
    const query = `
      INSERT INTO admin (
        username,
        email,
        password,
        full_name,
        role,
        is_active,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, username, email, role
    `;

    const values = [
      adminData.username,
      adminData.email,
      hashedPassword,
      adminData.full_name,
      adminData.role,
      adminData.is_active
    ];

    const result = await pool.query(query, values);
    const newAdmin = result.rows[0];

    console.log(`✅ Created admin: ${newAdmin.username} (${newAdmin.role})`);
    console.log(`   📧 Email: ${newAdmin.email}`);
    console.log(`   🔑 Password: ${adminData.password} (⚠️ Change in production!)`);
    
    return newAdmin;
  } catch (error) {
    console.error(`❌ Error creating admin "${adminData.username}":`, error.message);
    throw error;
  }
};

/**
 * Seed all admin accounts
 */
const seedAdmins = async () => {
  console.log('📝 Seeding admin accounts...\n');

  try {
    let created = 0;
    let skipped = 0;

    for (const admin of adminAccounts) {
      const result = await createAdmin(admin);
      if (result) {
        created++;
      } else {
        skipped++;
      }
      console.log(''); // Empty line for readability
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log(`📊 Summary: ${created} created, ${skipped} skipped`);
    console.log('═══════════════════════════════════════════════════════\n');

    if (created > 0) {
      console.log('🔐 Default Admin Credentials:');
      console.log('┌─────────────────────────────────────────────────────┐');
      adminAccounts.forEach(admin => {
        console.log(`│ Username: ${admin.username.padEnd(20)} Password: ${admin.password.padEnd(12)} │`);
      });
      console.log('└─────────────────────────────────────────────────────┘');
      console.log('⚠️  IMPORTANT: Change these passwords in production!\n');
    }

    return { created, skipped };
  } catch (error) {
    console.error('❌ Error seeding admins:', error.message);
    throw error;
  }
};

/**
 * Clear all admin accounts (except superadmin)
 */
const clearAdmins = async () => {
  try {
    console.log('🗑️  Clearing admin accounts (keeping superadmin)...');
    
    const query = `
      DELETE FROM admin 
      WHERE role != 'superadmin'
      RETURNING username
    `;
    
    const result = await pool.query(query);
    
    console.log(`✅ Deleted ${result.rowCount} admin accounts`);
    result.rows.forEach(row => {
      console.log(`   - ${row.username}`);
    });
    
    return result.rowCount;
  } catch (error) {
    console.error('❌ Error clearing admins:', error.message);
    throw error;
  }
};

/**
 * Count admin accounts
 */
const countAdmins = async () => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM admin');
    const count = parseInt(result.rows[0].count);
    
    console.log(`📊 Total admin accounts: ${count}`);
    
    // Count by role
    const roleQuery = `
      SELECT role, COUNT(*) as count 
      FROM admin 
      GROUP BY role
    `;
    const roleResult = await pool.query(roleQuery);
    
    console.log('   By role:');
    roleResult.rows.forEach(row => {
      console.log(`   - ${row.role}: ${row.count}`);
    });
    
    return count;
  } catch (error) {
    console.error('❌ Error counting admins:', error.message);
    throw error;
  }
};

/**
 * List all admin accounts
 */
const listAdmins = async () => {
  try {
    const query = `
      SELECT 
        id,
        username,
        email,
        full_name,
        role,
        is_active,
        created_at
      FROM admin
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query);
    
    console.log('\n📋 Admin Accounts:\n');
    console.log('┌────────────────────────────────────────────────────────────────────────┐');
    console.log('│ Username       │ Email                    │ Role        │ Active │');
    console.log('├────────────────────────────────────────────────────────────────────────┤');
    
    result.rows.forEach(admin => {
      const username = admin.username.padEnd(15);
      const email = admin.email.padEnd(25);
      const role = admin.role.padEnd(12);
      const active = admin.is_active ? '✅' : '❌';
      console.log(`│ ${username}│ ${email}│ ${role}│ ${active}     │`);
    });
    
    console.log('└────────────────────────────────────────────────────────────────────────┘\n');
    
    return result.rows;
  } catch (error) {
    console.error('❌ Error listing admins:', error.message);
    throw error;
  }
};

/**
 * Update admin password
 */
const updateAdminPassword = async (username, newPassword) => {
  try {
    const hashedPassword = await hashPassword(newPassword);
    
    const query = `
      UPDATE admin 
      SET password = $1, updated_at = NOW()
      WHERE username = $2
      RETURNING username
    `;
    
    const result = await pool.query(query, [hashedPassword, username]);
    
    if (result.rowCount === 0) {
      console.log(`❌ Admin "${username}" not found`);
      return false;
    }
    
    console.log(`✅ Password updated for admin: ${username}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating password:', error.message);
    throw error;
  }
};

/**
 * Toggle admin active status
 */
const toggleAdminStatus = async (username) => {
  try {
    const query = `
      UPDATE admin 
      SET is_active = NOT is_active, updated_at = NOW()
      WHERE username = $1
      RETURNING username, is_active
    `;
    
    const result = await pool.query(query, [username]);
    
    if (result.rowCount === 0) {
      console.log(`❌ Admin "${username}" not found`);
      return false;
    }
    
    const admin = result.rows[0];
    const status = admin.is_active ? 'activated' : 'deactivated';
    console.log(`✅ Admin "${admin.username}" ${status}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error toggling status:', error.message);
    throw error;
  }
};

// Export functions
module.exports = {
  seedAdmins,
  clearAdmins,
  countAdmins,
  listAdmins,
  createAdmin,
  updateAdminPassword,
  toggleAdminStatus,
  adminAccounts // Export for reference
};

// Run directly from command line
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  (async () => {
    try {
      switch (command) {
        case 'seed':
          await seedAdmins();
          break;
          
        case 'clear':
          await clearAdmins();
          break;
          
        case 'count':
          await countAdmins();
          break;
          
        case 'list':
          await listAdmins();
          break;
          
        case 'update-password':
          const username = args[1];
          const password = args[2];
          if (!username || !password) {
            console.log('Usage: node adminSeeder.js update-password <username> <password>');
            process.exit(1);
          }
          await updateAdminPassword(username, password);
          break;
          
        case 'toggle-status':
          const user = args[1];
          if (!user) {
            console.log('Usage: node adminSeeder.js toggle-status <username>');
            process.exit(1);
          }
          await toggleAdminStatus(user);
          break;
          
        default:
          console.log('\n📝 Admin Seeder Commands:\n');
          console.log('Seed admins:');
          console.log('  node database/seeders/adminSeeder.js seed\n');
          console.log('List admins:');
          console.log('  node database/seeders/adminSeeder.js list\n');
          console.log('Count admins:');
          console.log('  node database/seeders/adminSeeder.js count\n');
          console.log('Clear admins:');
          console.log('  node database/seeders/adminSeeder.js clear\n');
          console.log('Update password:');
          console.log('  node database/seeders/adminSeeder.js update-password <username> <password>\n');
          console.log('Toggle status:');
          console.log('  node database/seeders/adminSeeder.js toggle-status <username>\n');
      }
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Command failed:', error.message);
      process.exit(1);
    }
  })();
}
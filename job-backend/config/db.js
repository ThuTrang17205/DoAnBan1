/**
 * Database Configuration
 * PostgreSQL Connection Pool with Error Handling
 */

const { Pool } = require("pg");
require("dotenv").config();

// Validate required environment variables
const requiredEnvVars = ['DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

// Log database configuration (hide password)
console.log('\n🔧 Database Configuration:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log("DB_USER:    ", process.env.DB_USER);
console.log("DB_HOST:    ", process.env.DB_HOST);
console.log("DB_PORT:    ", process.env.DB_PORT || 5432);
console.log("DB_NAME:    ", process.env.DB_NAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "****" + process.env.DB_PASSWORD.slice(-4) : "(empty)");
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Create connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  
  // Connection pool settings
  max: 20,                      // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,     // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Return error after 2s if connection not established
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('💥 Unexpected database pool error:', err);
  console.error('   Client:', client ? 'Active' : 'None');
});

// Handle pool connection
pool.on('connect', (client) => {
  console.log('✅ New database client connected to pool');
});

// Handle pool removal
pool.on('remove', (client) => {
  console.log('🔌 Database client removed from pool');
});

// Test database connection
const testConnection = async () => {
  try {
    console.log('🔍 Testing database connection...');
    const result = await pool.query('SELECT NOW(), current_database(), current_user');
    const { now, current_database, current_user } = result.rows[0];
    
    console.log('✅ Successfully connected to PostgreSQL');
    console.log(`   Time:     ${now}`);
    console.log(`   Database: ${current_database}`);
    console.log(`   User:     ${current_user}\n`);
    
    return true;
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    console.error('   Code:', err.code);
    console.error('   Details:', err.detail || 'No additional details');
    
    // Common error messages
    if (err.code === 'ECONNREFUSED') {
      console.error('\n💡 Solution: Make sure PostgreSQL is running');
      console.error('   - Check if PostgreSQL service is started');
      console.error('   - Verify DB_HOST and DB_PORT in .env file\n');
    } else if (err.code === '28P01') {
      console.error('\n💡 Solution: Authentication failed');
      console.error('   - Check DB_USER and DB_PASSWORD in .env file\n');
    } else if (err.code === '3D000') {
      console.error('\n💡 Solution: Database does not exist');
      console.error('   - Create database:', process.env.DB_NAME);
      console.error('   - Run: createdb', process.env.DB_NAME, '\n');
    }
    
    return false;
  }
};

// Run test connection immediately
testConnection().then(success => {
  if (!success) {
    console.warn('⚠️  Server will continue but database operations may fail\n');
  }
});

// Helper function to execute queries with error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.NODE_ENV === 'development' && duration > 100) {
      console.log('⚠️  Slow query detected:', {
        duration: `${duration}ms`,
        rows: result.rowCount,
        text: text.substring(0, 100) + '...'
      });
    }
    
    return result;
  } catch (err) {
    console.error('❌ Query error:', err.message);
    console.error('   Query:', text.substring(0, 200));
    console.error('   Params:', params);
    throw err;
  }
};

// Helper function to get a client from pool
const getClient = async () => {
  try {
    const client = await pool.connect();
    const release = client.release.bind(client);
    
    // Override release to add logging
    client.release = () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔓 Client released back to pool');
      }
      return release();
    };
    
    return client;
  } catch (err) {
    console.error('❌ Error getting client from pool:', err.message);
    throw err;
  }
};

// Helper function for transactions
const transaction = async (callback) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Transaction failed, rolled back:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🔌 Closing database connection pool...');
  try {
    await pool.end();
    console.log('✅ Database pool closed successfully\n');
  } catch (err) {
    console.error('❌ Error closing database pool:', err.message);
  }
};

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Export pool and helpers
module.exports = {
  pool,           // Raw pool for direct access
  query,          // Helper for queries with logging
  getClient,      // Get client for multiple operations
  transaction,    // Helper for transactions
  testConnection, // Test connection function
  shutdown        // Graceful shutdown
};

// Default export is pool for backward compatibility
module.exports.default = pool;
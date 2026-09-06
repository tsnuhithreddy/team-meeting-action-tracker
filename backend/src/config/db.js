const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool to handle multiple concurrent queries efficiently
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'team_meeting_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper function to test database connectivity
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database successfully.');
    connection.release();
  } catch (error) {
    console.error('❌ MySQL Database connection failed:', error.message);
  }
}

module.exports = {
  pool,
  query: (sql, params) => pool.query(sql, params),
  testConnection
};
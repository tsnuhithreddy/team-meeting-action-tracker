const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initDatabase() {
  console.log('🔄 Initializing MySQL Database...');

  // Step 1: Connect to MySQL server (without database selected yet)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    // Step 2: Read and execute schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('📦 Executing schema.sql (creating database & tables)...');
    await connection.query(schemaSql);
    console.log('✅ Tables created successfully.');

    // Step 3: Read and execute seed.sql
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    console.log('🌱 Executing seed.sql (inserting demo users & tasks)...');
    await connection.query(seedSql);
    console.log('✅ Seed data inserted successfully.');

    console.log('\n🎉 Database setup complete! Demo accounts available:');
    console.log(' - Admin:    admin@tracker.com    (password: password123)');
    console.log(' - Manager:  alice@tracker.com    (password: password123)');
    console.log(' - Employee: bob@tracker.com      (password: password123)');
    console.log(' - Employee: charlie@tracker.com  (password: password123)\n');
  } catch (err) {
    console.error('❌ Error during database initialization:', err.message);
  } finally {
    await connection.end();
  }
}

initDatabase();
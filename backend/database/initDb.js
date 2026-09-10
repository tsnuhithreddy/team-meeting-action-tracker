const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function initDatabase() {
  console.log('Initializing MySQL Database...');

  const dbName = process.env.DB_NAME || 'team_meeting_tracker';

  // Step 1: Connect to MySQL server (without database selected yet)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  });

  try {
    // Step 2: Create (if needed) and select the *configured* database name.
    // schema.sql/seed.sql no longer hardcode a database name themselves —
    // whatever database is selected here is what they'll apply to, so this
    // always matches DB_NAME instead of silently diverging from it.
    console.log(`Creating database "${dbName}" if it doesn't exist...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.query(`USE \`${dbName}\`;`);

    // Step 3: Read and execute schema.sql
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    console.log('Executing schema.sql (creating tables)...');
    await connection.query(schemaSql);
    console.log('Tables created successfully.');

    // Step 4: Read and execute seed.sql
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
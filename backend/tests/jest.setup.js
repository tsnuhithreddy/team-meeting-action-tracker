const { pool } = require('../src/config/db');

// Without this, the mysql2 pool's keep-alive socket stays open after tests
// finish, so Jest never exits on its own in CI (it just hangs until the
// platform's job timeout kills it — confirmed on GitHub Actions, where the
// backend-test job ran for the full 6-hour limit before being cancelled).
// Closing the pool lets the process exit naturally once tests are done.
afterAll(async () => {
  await pool.end();
});
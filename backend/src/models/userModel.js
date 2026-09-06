const { query } = require('../config/db');

/**
 * User Data Access Layer
 * Executes parameterized SQL queries for user accounts.
 */
class UserModel {
  // Find user by email including their assigned role name
  static async findByEmail(email) {
    const sql = `
      SELECT u.id, u.full_name, u.email, u.password_hash, u.is_active, r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
      LIMIT 1
    `;
    const [rows] = await query(sql, [email]);
    return rows[0] || null;
  }

  // Find user by ID
  static async findById(id) {
    const sql = `
      SELECT u.id, u.full_name, u.email, u.is_active, u.created_at, r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
      LIMIT 1
    `;
    const [rows] = await query(sql, [id]);
    return rows[0] || null;
  }

  // Get all active users (for dropdowns when assigning tasks or adding participants)
  static async findAll() {
    const sql = `
      SELECT u.id, u.full_name, u.email, u.is_active, r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.full_name ASC
    `;
    const [rows] = await query(sql);
    return rows;
  }
}

module.exports = UserModel;
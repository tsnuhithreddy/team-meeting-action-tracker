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

  // Get users. By default returns everyone (used by the Admin's user
  // management page, which needs to see deactivated accounts too). Pass
  // activeOnly: true for contexts like assignee/participant dropdowns,
  // where showing a deactivated user would let someone assign work to or
  // invite an account that can no longer log in.
  static async findAll({ activeOnly = false } = {}) {
    let sql = `
      SELECT u.id, u.full_name, u.email, u.is_active, r.name AS role
      FROM users u
      JOIN roles r ON u.role_id = r.id
    `;
    if (activeOnly) {
      sql += ` WHERE u.is_active = TRUE `;
    }
    sql += ` ORDER BY u.full_name ASC `;
    const [rows] = await query(sql);
    return rows;
  }
}

module.exports = UserModel;
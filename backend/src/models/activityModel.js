const { query } = require('../config/db');

class ActivityModel {
  // Find activity logs with optional user and entity filters
  static async findAll({ userId, role, entityType, limit = 50 }) {
    let sql = `
      SELECT 
        a.id, 
        a.user_id, 
        a.action, 
        a.entity_type, 
        a.entity_id, 
        a.details, 
        a.created_at,
        u.full_name AS user_name,
        u.email AS user_email,
        r.name AS user_role
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];

    // Role-based scope: Employees only see their own activities
    if (role === 'EMPLOYEE') {
      sql += ` AND a.user_id = ? `;
      params.push(userId);
    }

    if (entityType) {
      sql += ` AND a.entity_type = ? `;
      params.push(entityType);
    }

    sql += ` ORDER BY a.created_at DESC LIMIT ? `;
    params.push(Number(limit));

    const [rows] = await query(sql, params);
    return rows;
  }
}

module.exports = ActivityModel;
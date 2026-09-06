const { query } = require('../config/db');

class CommentModel {
  // Add a new comment to a task
  static async create({ taskId, userId, commentText }) {
    const sql = `
      INSERT INTO task_comments (task_id, user_id, comment_text)
      VALUES (?, ?, ?)
    `;
    const [result] = await query(sql, [taskId, userId, commentText]);
    return result.insertId;
  }

  // Find all comments for a task, ordered chronologically
  static async findByTaskId(taskId) {
    const sql = `
      SELECT 
        c.id, 
        c.task_id, 
        c.user_id, 
        c.comment_text, 
        c.created_at,
        u.full_name AS author_name,
        u.email AS author_email,
        r.name AS author_role
      FROM task_comments c
      JOIN users u ON c.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `;
    const [rows] = await query(sql, [taskId]);
    return rows;
  }

  // Find single comment by ID
  static async findById(id) {
    const sql = `
      SELECT 
        c.id, 
        c.task_id, 
        c.user_id, 
        c.comment_text, 
        c.created_at,
        u.full_name AS author_name,
        r.name AS author_role
      FROM task_comments c
      JOIN users u ON c.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE c.id = ?
      LIMIT 1
    `;
    const [rows] = await query(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = CommentModel;
const { query } = require('../config/db');

class TaskModel {
  // Create a new task
  static async create({ meetingId, title, description, assigneeId, priority, dueDate, createdBy }) {
    const sql = `
      INSERT INTO tasks (meeting_id, title, description, assignee_id, priority, status, due_date, created_by)
      VALUES (?, ?, ?, ?, ?, 'OPEN', ?, ?)
    `;
    const [result] = await query(sql, [
      meetingId,
      title,
      description || null,
      assigneeId || null,
      priority || 'MEDIUM',
      dueDate,
      createdBy
    ]);
    return result.insertId;
  }

  // Find task by ID with assignee, creator, and meeting details
  static async findById(id) {
    const sql = `
      SELECT 
        t.id, 
        t.meeting_id, 
        t.title, 
        t.description, 
        t.assignee_id, 
        t.priority, 
        t.status, 
        t.due_date, 
        t.created_by,
        t.created_at,
        t.updated_at,
        CASE 
          WHEN t.due_date < CURDATE() AND t.status != 'COMPLETED' THEN TRUE 
          ELSE FALSE 
        END AS is_overdue,
        u_assignee.full_name AS assignee_name,
        u_assignee.email AS assignee_email,
        u_creator.full_name AS creator_name,
        m.title AS meeting_title
      FROM tasks t
      LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
      JOIN users u_creator ON t.created_by = u_creator.id
      JOIN meetings m ON t.meeting_id = m.id
      WHERE t.id = ?
      LIMIT 1
    `;
    const [rows] = await query(sql, [id]);
    return rows[0] || null;
  }

  // Find all tasks with optional filtering (meetingId, status, priority, assigneeId, overdue)
  static async findAll({ meetingId, status, priority, assigneeId, overdue }) {
    let sql = `
      SELECT 
        t.id, 
        t.meeting_id, 
        t.title, 
        t.description, 
        t.assignee_id, 
        t.priority, 
        t.status, 
        t.due_date, 
        t.created_by,
        t.created_at,
        t.updated_at,
        CASE 
          WHEN t.due_date < CURDATE() AND t.status != 'COMPLETED' THEN TRUE 
          ELSE FALSE 
        END AS is_overdue,
        u_assignee.full_name AS assignee_name,
        u_creator.full_name AS creator_name,
        m.title AS meeting_title
      FROM tasks t
      LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
      JOIN users u_creator ON t.created_by = u_creator.id
      JOIN meetings m ON t.meeting_id = m.id
      WHERE 1=1
    `;
    const params = [];

    if (meetingId) {
      sql += ` AND t.meeting_id = ? `;
      params.push(meetingId);
    }
    if (status) {
      sql += ` AND t.status = ? `;
      params.push(status);
    }
    if (priority) {
      sql += ` AND t.priority = ? `;
      params.push(priority);
    }
    if (assigneeId) {
      sql += ` AND t.assignee_id = ? `;
      params.push(assigneeId);
    }
    if (overdue === 'true' || overdue === true) {
      sql += ` AND t.due_date < CURDATE() AND t.status != 'COMPLETED' `;
    }

    sql += ` ORDER BY t.due_date ASC, t.created_at DESC `;

    const [rows] = await query(sql, params);
    return rows;
  }

  // Find tasks assigned to a specific user (My Tasks)
  static async findByAssignee(userId) {
    return await this.findAll({ assigneeId: userId });
  }

  // Update full task (Admin/Manager)
  static async update(id, { title, description, assigneeId, priority, status, dueDate }) {
    const sql = `
      UPDATE tasks 
      SET title = ?, description = ?, assignee_id = ?, priority = ?, status = ?, due_date = ?
      WHERE id = ?
    `;
    await query(sql, [
      title,
      description || null,
      assigneeId || null,
      priority,
      status,
      dueDate,
      id
    ]);
  }

  // Update only task status (for assigned employee or manager)
  static async updateStatus(id, status) {
    const sql = `UPDATE tasks SET status = ? WHERE id = ?`;
    await query(sql, [status, id]);
  }

  // Delete task
  static async delete(id) {
    const sql = `DELETE FROM tasks WHERE id = ?`;
    const [result] = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = TaskModel;
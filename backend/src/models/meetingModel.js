const { query, pool } = require('../config/db');

class MeetingModel {
  // Create a meeting and its participants using a transaction
  static async create({ title, description, meetingDate, startTime, endTime, locationOrLink, createdBy, participantIds = [] }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert meeting record
      const meetingSql = `
        INSERT INTO meetings (title, description, meeting_date, start_time, end_time, location_or_link, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await connection.query(meetingSql, [
        title,
        description || null,
        meetingDate,
        startTime,
        endTime,
        locationOrLink || null,
        createdBy
      ]);

      const meetingId = result.insertId;

      // 2. Insert creator as participant automatically
      const allParticipants = Array.from(new Set([...participantIds, createdBy]));

      if (allParticipants.length > 0) {
        const participantValues = allParticipants.map((userId) => [meetingId, userId]);
        const participantSql = `INSERT INTO meeting_participants (meeting_id, user_id) VALUES ?`;
        await connection.query(participantSql, [participantValues]);
      }

      await connection.commit();
      return meetingId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Get meetings scoped by user role (Employees only see their own meetings)
  static async findAll({ userId, role }) {
    let sql = `
      SELECT DISTINCT 
        m.id, 
        m.title, 
        m.description, 
        m.meeting_date, 
        m.start_time, 
        m.end_time, 
        m.location_or_link, 
        m.created_by,
        u.full_name AS creator_name,
        (SELECT COUNT(*) FROM tasks t WHERE t.meeting_id = m.id) AS total_tasks,
        (SELECT COUNT(*) FROM meeting_participants mp WHERE mp.meeting_id = m.id) AS total_participants
      FROM meetings m
      JOIN users u ON m.created_by = u.id
    `;

    const params = [];

    // If EMPLOYEE, only return meetings where they are a participant
    if (role === 'EMPLOYEE') {
      sql += ` JOIN meeting_participants mp ON m.id = mp.meeting_id WHERE mp.user_id = ? `;
      params.push(userId);
    }

    sql += ` ORDER BY m.meeting_date DESC, m.start_time DESC `;

    const [rows] = await query(sql, params);
    return rows;
  }

  // Get single meeting by ID with participants and linked tasks
  static async findById(id) {
    const meetingSql = `
      SELECT 
        m.id, 
        m.title, 
        m.description, 
        m.meeting_date, 
        m.start_time, 
        m.end_time, 
        m.location_or_link, 
        m.created_by,
        m.created_at,
        u.full_name AS creator_name,
        u.email AS creator_email
      FROM meetings m
      JOIN users u ON m.created_by = u.id
      WHERE m.id = ?
      LIMIT 1
    `;
    const [meetings] = await query(meetingSql, [id]);
    if (!meetings.length) return null;

    const meeting = meetings[0];

    // Get participants
    const participantsSql = `
      SELECT u.id, u.full_name, u.email, r.name AS role, mp.joined_at
      FROM meeting_participants mp
      JOIN users u ON mp.user_id = u.id
      JOIN roles r ON u.role_id = r.id
      WHERE mp.meeting_id = ?
    `;
    const [participants] = await query(participantsSql, [id]);

    // Get linked tasks
    const tasksSql = `
      SELECT 
        t.id, t.title, t.description, t.priority, t.status, t.due_date,
        u.id AS assignee_id, u.full_name AS assignee_name
      FROM tasks t
      LEFT JOIN users u ON t.assignee_id = u.id
      WHERE t.meeting_id = ?
      ORDER BY t.created_at ASC
    `;
    const [tasks] = await query(tasksSql, [id]);

    return {
      ...meeting,
      participants,
      tasks
    };
  }

  // Update meeting details
  static async update(id, { title, description, meetingDate, startTime, endTime, locationOrLink }) {
    const sql = `
      UPDATE meetings
      SET title = ?, description = ?, meeting_date = ?, start_time = ?, end_time = ?, location_or_link = ?
      WHERE id = ?
    `;
    await query(sql, [title, description || null, meetingDate, startTime, endTime, locationOrLink || null, id]);
  }

  // Check whether a given user is a participant of a given meeting
  static async isParticipant(meetingId, userId) {
    const sql = `SELECT 1 FROM meeting_participants WHERE meeting_id = ? AND user_id = ? LIMIT 1`;
    const [rows] = await query(sql, [meetingId, userId]);
    return rows.length > 0;
  }

  // Delete meeting (cascades to tasks and participants)
  static async delete(id) {
    const sql = `DELETE FROM meetings WHERE id = ?`;
    const [result] = await query(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = MeetingModel;
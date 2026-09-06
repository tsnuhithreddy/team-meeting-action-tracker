const { query } = require('../config/db');

class DashboardService {
  static async getDashboardMetrics(user) {
    // 1. Task Metrics Breakdown
    let taskSql = `
      SELECT
        COUNT(*) AS total_tasks,
        SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) AS open_tasks,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_tasks,
        SUM(CASE WHEN status = 'BLOCKED' THEN 1 ELSE 0 END) AS blocked_tasks,
        SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) AS completed_tasks,
        SUM(CASE WHEN due_date < CURDATE() AND status != 'COMPLETED' THEN 1 ELSE 0 END) AS overdue_tasks,
        SUM(CASE WHEN priority = 'CRITICAL' AND status != 'COMPLETED' THEN 1 ELSE 0 END) AS critical_tasks
      FROM tasks
    `;

    const taskParams = [];
    if (user.role === 'EMPLOYEE') {
      taskSql += ` WHERE assignee_id = ? `;
      taskParams.push(user.id);
    }

    const [taskMetrics] = await query(taskSql, taskParams);

    // 2. Meeting Count
    let meetingSql = `SELECT COUNT(*) AS total_meetings FROM meetings`;
    const meetingParams = [];
    if (user.role === 'EMPLOYEE') {
      meetingSql = `
        SELECT COUNT(DISTINCT m.id) AS total_meetings 
        FROM meetings m 
        JOIN meeting_participants mp ON m.id = mp.meeting_id 
        WHERE mp.user_id = ?
      `;
      meetingParams.push(user.id);
    }
    const [meetingMetrics] = await query(meetingSql, meetingParams);

    // 3. Recent 5 Activity Logs
    let activitySql = `
      SELECT a.id, a.action, a.entity_type, a.details, a.created_at, u.full_name AS user_name
      FROM activity_logs a
      LEFT JOIN users u ON a.user_id = u.id
    `;
    const activityParams = [];
    if (user.role === 'EMPLOYEE') {
      activitySql += ` WHERE a.user_id = ? `;
      activityParams.push(user.id);
    }
    activitySql += ` ORDER BY a.created_at DESC LIMIT 5 `;
    const [recentActivity] = await query(activitySql, activityParams);

    // 4. Upcoming Meetings
    let upcomingSql = `
      SELECT m.id, m.title, m.meeting_date, m.start_time, m.end_time, m.location_or_link
      FROM meetings m
    `;
    const upcomingParams = [];
    if (user.role === 'EMPLOYEE') {
      upcomingSql += ` JOIN meeting_participants mp ON m.id = mp.meeting_id WHERE mp.user_id = ? AND m.meeting_date >= CURDATE() `;
      upcomingParams.push(user.id);
    } else {
      upcomingSql += ` WHERE m.meeting_date >= CURDATE() `;
    }
    upcomingSql += ` ORDER BY m.meeting_date ASC, m.start_time ASC LIMIT 3 `;
    const [upcomingMeetings] = await query(upcomingSql, upcomingParams);

    return {
      metrics: {
        totalMeetings: Number(meetingMetrics[0]?.total_meetings || 0),
        totalTasks: Number(taskMetrics[0]?.total_tasks || 0),
        openTasks: Number(taskMetrics[0]?.open_tasks || 0),
        inProgressTasks: Number(taskMetrics[0]?.in_progress_tasks || 0),
        blockedTasks: Number(taskMetrics[0]?.blocked_tasks || 0),
        completedTasks: Number(taskMetrics[0]?.completed_tasks || 0),
        overdueTasks: Number(taskMetrics[0]?.overdue_tasks || 0),
        criticalTasks: Number(taskMetrics[0]?.critical_tasks || 0)
      },
      recentActivity,
      upcomingMeetings
    };
  }
}

module.exports = DashboardService;
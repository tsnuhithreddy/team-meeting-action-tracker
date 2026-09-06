const CommentModel = require('../models/commentModel');
const TaskModel = require('../models/taskModel');
const AppError = require('../utils/appError');
const { query } = require('../config/db');

class CommentService {
  // Add a comment to a task
  static async addComment(taskId, commentText, user) {
    // 1. Verify task exists
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    // 2. Insert comment
    const commentId = await CommentModel.create({
      taskId,
      userId: user.id,
      commentText
    });

    // 3. Record audit log
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.id, 'ADD_COMMENT', 'COMMENT', commentId, `Commented on task: "${task.title}"`]
    );

    return await CommentModel.findById(commentId);
  }

  // Get comments for a task
  static async getCommentsByTaskId(taskId) {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }
    return await CommentModel.findByTaskId(taskId);
  }
}

module.exports = CommentService;
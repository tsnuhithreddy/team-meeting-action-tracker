const TaskModel = require('../models/taskModel');
const MeetingModel = require('../models/meetingModel');
const UserModel = require('../models/userModel');
const AppError = require('../utils/appError');
const { query } = require('../config/db');

class TaskService {
  // Validate state transitions
  static validateStatusTransition(currentStatus, newStatus, userRole, hasAssignee) {
    if (currentStatus === newStatus) return;

    // Rule: Cannot mark as COMPLETED without an assignee
    if (newStatus === 'COMPLETED' && !hasAssignee) {
      throw new AppError('Cannot mark task as COMPLETED without an assigned team member.', 400);
    }

    // Rule: Only Manager or Admin can reopen a completed task
    if (currentStatus === 'COMPLETED' && newStatus === 'OPEN' && userRole === 'EMPLOYEE') {
      throw new AppError('Only a Manager or Admin can reopen a completed task.', 403);
    }
  }

  // Create task (Admin/Manager only)
  static async createTask(taskData, user) {
    // 1. Verify parent meeting exists
    const meeting = await MeetingModel.findById(taskData.meetingId);
    if (!meeting) {
      throw new AppError('The associated meeting does not exist.', 404);
    }

    // 2. If assignee provided, verify user exists
    if (taskData.assigneeId) {
      const assignee = await UserModel.findById(taskData.assigneeId);
      if (!assignee) {
        throw new AppError('Assigned user not found.', 404);
      }
    }

    const taskId = await TaskModel.create({
      ...taskData,
      createdBy: user.id
    });

    // Record audit log
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.id, 'CREATE_TASK', 'TASK', taskId, `Created task: "${taskData.title}" for meeting #${taskData.meetingId}`]
    );

    return await TaskModel.findById(taskId);
  }

  // Get tasks with filtering
  static async getAllTasks(filters) {
    return await TaskModel.findAll(filters);
  }

  // Get tasks for current logged-in employee
  static async getMyTasks(userId) {
    return await TaskModel.findByAssignee(userId);
  }

  // Get single task by ID
  static async getTaskById(taskId) {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }
    return task;
  }

  // Update full task (Admin/Manager)
  static async updateTask(taskId, updateData, user) {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    const hasAssignee = Boolean(updateData.assigneeId || task.assignee_id);
    this.validateStatusTransition(task.status, updateData.status, user.role, hasAssignee);

    await TaskModel.update(taskId, updateData);

    // Record audit log
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.id, 'UPDATE_TASK', 'TASK', taskId, `Updated task details for: "${updateData.title}"`]
    );

    return await TaskModel.findById(taskId);
  }

  // Update status only (Employees for assigned tasks, Managers/Admins for any)
  static async updateTaskStatus(taskId, newStatus, user) {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    // Authorization: Employee can ONLY update their own assigned task
    if (user.role === 'EMPLOYEE' && task.assignee_id !== user.id) {
      throw new AppError('You can only update the status of tasks assigned to you.', 403);
    }

    const hasAssignee = Boolean(task.assignee_id);
    this.validateStatusTransition(task.status, newStatus, user.role, hasAssignee);

    await TaskModel.updateStatus(taskId, newStatus);

    // Record audit log
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.id, 'UPDATE_TASK_STATUS', 'TASK', taskId, `Changed status from ${task.status} to ${newStatus}`]
    );

    return await TaskModel.findById(taskId);
  }

  // Delete task (Admin/Manager only)
  static async deleteTask(taskId, user) {
    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError('Task not found.', 404);
    }

    await TaskModel.delete(taskId);

    // Record audit log
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.id, 'DELETE_TASK', 'TASK', taskId, `Deleted task: "${task.title}"`]
    );

    return true;
  }
}

module.exports = TaskService;
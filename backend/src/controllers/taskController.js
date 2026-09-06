const TaskService = require('../services/taskService');
const catchAsync = require('../utils/catchAsync');

exports.createTask = catchAsync(async (req, res) => {
  const task = await TaskService.createTask(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Task created successfully.',
    data: task
  });
});

exports.getAllTasks = catchAsync(async (req, res) => {
  const tasks = await TaskService.getAllTasks(req.query);
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

exports.getMyTasks = catchAsync(async (req, res) => {
  const tasks = await TaskService.getMyTasks(req.user.id);
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

exports.getTaskById = catchAsync(async (req, res) => {
  const task = await TaskService.getTaskById(Number(req.params.id));
  res.status(200).json({
    success: true,
    data: task
  });
});

exports.updateTask = catchAsync(async (req, res) => {
  const task = await TaskService.updateTask(Number(req.params.id), req.body, req.user);
  res.status(200).json({
    success: true,
    message: 'Task updated successfully.',
    data: task
  });
});

exports.updateTaskStatus = catchAsync(async (req, res) => {
  const task = await TaskService.updateTaskStatus(Number(req.params.id), req.body.status, req.user);
  res.status(200).json({
    success: true,
    message: 'Task status updated successfully.',
    data: task
  });
});

exports.deleteTask = catchAsync(async (req, res) => {
  await TaskService.deleteTask(Number(req.params.id), req.user);
  res.status(200).json({
    success: true,
    message: 'Task deleted successfully.'
  });
});
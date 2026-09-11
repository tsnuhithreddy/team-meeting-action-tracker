const UserService = require('../services/userService');
const catchAsync = require('../utils/catchAsync');

exports.getAllUsers = catchAsync(async (req, res) => {
  const activeOnly = req.query.activeOnly === 'true';
  const users = await UserService.getAllUsers({ activeOnly });
  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
});

exports.createUser = catchAsync(async (req, res) => {
  const user = await UserService.createUser(req.body);
  res.status(201).json({
    success: true,
    message: 'User created successfully.',
    data: user
  });
});

exports.deactivateUser = catchAsync(async (req, res) => {
  await UserService.deactivateUser(Number(req.params.id));
  res.status(200).json({
    success: true,
    message: 'User deactivated successfully.'
  });
});
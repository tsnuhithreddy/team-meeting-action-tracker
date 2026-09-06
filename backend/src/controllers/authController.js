const AuthService = require('../services/authService');
const catchAsync = require('../utils/catchAsync');

// Handle user login
exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await AuthService.login(email, password);

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    token: result.token,
    user: result.user
  });
});

// Handle getting current user's profile
exports.getMe = catchAsync(async (req, res) => {
  const user = await AuthService.getProfile(req.user.id);

  res.status(200).json({
    success: true,
    user
  });
});
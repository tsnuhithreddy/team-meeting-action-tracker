const DashboardService = require('../services/dashboardService');
const catchAsync = require('../utils/catchAsync');

exports.getDashboard = catchAsync(async (req, res) => {
  const data = await DashboardService.getDashboardMetrics(req.user);
  res.status(200).json({
    success: true,
    data
  });
});
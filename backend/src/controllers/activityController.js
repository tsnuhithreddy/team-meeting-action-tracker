const ActivityService = require('../services/activityService');
const catchAsync = require('../utils/catchAsync');

exports.getActivityLogs = catchAsync(async (req, res) => {
  const logs = await ActivityService.getLogs(req.query, req.user);

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
});
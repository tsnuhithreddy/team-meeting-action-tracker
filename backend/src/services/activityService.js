const ActivityModel = require('../models/activityModel');

class ActivityService {
  // Get activity trail
  static async getLogs(filters, user) {
    return await ActivityModel.findAll({
      userId: user.id,
      role: user.role,
      entityType: filters.entityType,
      limit: filters.limit || 50
    });
  }
}

module.exports = ActivityService;
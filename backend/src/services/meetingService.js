const MeetingModel = require('../models/meetingModel');
const UserModel = require('../models/userModel');
const AppError = require('../utils/appError');
const { query } = require('../config/db');

class MeetingService {
  // Verify every participant ID corresponds to a real, active user before
  // attempting to insert them. Without this, a nonexistent ID hit a raw
  // foreign-key error (500, leaking table/constraint names), and a
  // deactivated user's ID went through silently with no check at all.
  static async validateParticipants(participantIds) {
    if (!participantIds || participantIds.length === 0) return;
    for (const id of participantIds) {
      const participant = await UserModel.findById(id);
      if (!participant) {
        throw new AppError(`Participant user with ID ${id} not found.`, 404);
      }
      if (!participant.is_active) {
        throw new AppError(`Cannot add deactivated user "${participant.full_name}" as a meeting participant.`, 400);
      }
    }
  }

  // Validate time logic: end_time must strictly follow start_time
  static validateMeetingTimes(startTime, endTime) {
    if (startTime >= endTime) {
      throw new AppError('Meeting end time must be after the start time.', 400);
    }
  }

  // Create a new meeting
  static async createMeeting(meetingData, user) {
    this.validateMeetingTimes(meetingData.startTime, meetingData.endTime);
    await this.validateParticipants(meetingData.participantIds);

    const meetingId = await MeetingModel.create({
      ...meetingData,
      createdBy: user.id
    });

    // Record audit log
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.id, 'CREATE_MEETING', 'MEETING', meetingId, `Scheduled meeting: "${meetingData.title}"`]
    );

    return await MeetingModel.findById(meetingId);
  }

  // Get all meetings accessible to the user
  static async getAllMeetings(user) {
    return await MeetingModel.findAll({ userId: user.id, role: user.role });
  }

  // Get meeting details with access control
  static async getMeetingById(meetingId, user) {
    const meeting = await MeetingModel.findById(meetingId);
    if (!meeting) {
      throw new AppError('Meeting not found.', 404);
    }

    // If EMPLOYEE, verify they are in the participant roster
    if (user.role === 'EMPLOYEE') {
      const isParticipant = meeting.participants.some((p) => p.id === user.id);
      if (!isParticipant) {
        throw new AppError('You do not have permission to view this meeting.', 403);
      }
    }

    return meeting;
  }

  // Update meeting (Only creator or ADMIN)
  static async updateMeeting(meetingId, updateData, user) {
    const meeting = await MeetingModel.findById(meetingId);
    if (!meeting) {
      throw new AppError('Meeting not found.', 404);
    }

    if (user.role !== 'ADMIN' && meeting.created_by !== user.id) {
      throw new AppError('You are not authorized to edit this meeting.', 403);
    }

    this.validateMeetingTimes(updateData.startTime, updateData.endTime);
    await MeetingModel.update(meetingId, updateData);

    // Record audit log
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.id, 'UPDATE_MEETING', 'MEETING', meetingId, `Updated meeting details for: "${updateData.title}"`]
    );

    return await MeetingModel.findById(meetingId);
  }

  // Delete meeting (Only creator or ADMIN)
  static async deleteMeeting(meetingId, user) {
    const meeting = await MeetingModel.findById(meetingId);
    if (!meeting) {
      throw new AppError('Meeting not found.', 404);
    }

    if (user.role !== 'ADMIN' && meeting.created_by !== user.id) {
      throw new AppError('You are not authorized to delete this meeting.', 403);
    }

    await MeetingModel.delete(meetingId);

    // Record audit log
    await query(
      `INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)`,
      [user.id, 'DELETE_MEETING', 'MEETING', meetingId, `Deleted meeting: "${meeting.title}"`]
    );

    return true;
  }
}

module.exports = MeetingService;
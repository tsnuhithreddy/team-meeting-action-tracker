const MeetingService = require('../services/meetingService');
const catchAsync = require('../utils/catchAsync');

exports.createMeeting = catchAsync(async (req, res) => {
  const meeting = await MeetingService.createMeeting(req.body, req.user);
  res.status(201).json({
    success: true,
    message: 'Meeting created successfully.',
    data: meeting
  });
});

exports.getAllMeetings = catchAsync(async (req, res) => {
  const meetings = await MeetingService.getAllMeetings(req.user);
  res.status(200).json({
    success: true,
    count: meetings.length,
    data: meetings
  });
});

exports.getMeetingById = catchAsync(async (req, res) => {
  const meeting = await MeetingService.getMeetingById(Number(req.params.id), req.user);
  res.status(200).json({
    success: true,
    data: meeting
  });
});

exports.updateMeeting = catchAsync(async (req, res) => {
  const meeting = await MeetingService.updateMeeting(Number(req.params.id), req.body, req.user);
  res.status(200).json({
    success: true,
    message: 'Meeting updated successfully.',
    data: meeting
  });
});

exports.deleteMeeting = catchAsync(async (req, res) => {
  await MeetingService.deleteMeeting(Number(req.params.id), req.user);
  res.status(200).json({
    success: true,
    message: 'Meeting deleted successfully.'
  });
});
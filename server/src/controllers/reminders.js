const Reminder = require('../models/Reminder');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create new medication reminder
// @route   POST /api/reminders
// @access  Private (Admin, Doctor, Patient)
exports.createReminder = asyncHandler(async (req, res, next) => {
  req.body.patient = req.user.id;
  const reminder = await Reminder.create(req.body);
  res.status(201).json({
    success: true,
    data: reminder
  });
});

// @desc    Get patient's reminders
// @route   GET /api/reminders/patient/:patientId
// @access  Private (Admin, Doctor, Patient)
exports.getPatientReminders = asyncHandler(async (req, res, next) => {
  const reminders = await Reminder.find({ patient: req.params.patientId })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: reminders.length,
    data: reminders
  });
});

// @desc    Update reminder
// @route   PUT /api/reminders/:id
// @access  Private (Admin, Doctor, Patient)
exports.updateReminder = asyncHandler(async (req, res, next) => {
  const reminder = await Reminder.findById(req.params.id);

  if (!reminder) {
    return next(new ErrorResponse('Reminder not found', 404));
  }

  reminder.status = req.body.status;
  await reminder.save();

  res.status(200).json({
    success: true,
    data: reminder
  });
}); 
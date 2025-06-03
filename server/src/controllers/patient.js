const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get patient history
// @route   GET /api/patient/history/:patientId
// @access  Private (Admin, Doctor, Patient)
exports.getPatientHistory = asyncHandler(async (req, res, next) => {
  const patientId = req.params.patientId;

  const appointments = await Appointment.find({ patient: patientId }).sort('-date');
  const prescriptions = await Prescription.find({ patient: patientId }).sort('-createdAt');

  res.status(200).json({
    success: true,
    data: {
      appointments,
      prescriptions
    }
  });
}); 
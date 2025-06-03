const LabTest = require('../models/LabTest');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');

// @desc    Order new lab test
// @route   POST /api/lab/order
// @access  Private (Admin, Doctor)
exports.orderLabTest = asyncHandler(async (req, res, next) => {
  req.body.doctor = req.user.id;
  const labTest = await LabTest.create(req.body);

  // Notify patient about the test order
  const patient = await User.findById(req.body.patient);
  if (patient) {
    // TODO: Implement notification system
    // sendNotification(patient.id, 'New lab test ordered');
  }

  res.status(201).json({
    success: true,
    data: labTest
  });
});

// @desc    Get all lab tests for a patient
// @route   GET /api/lab/patient/:patientId
// @access  Private (Admin, Doctor, Patient)
exports.getPatientLabTests = asyncHandler(async (req, res, next) => {
  const labTests = await LabTest.find({ patient: req.params.patientId })
    .populate('doctor', 'name email')
    .sort('-orderDate');

  res.status(200).json({
    success: true,
    data: labTests
  });
});

// @desc    Update lab test results
// @route   PUT /api/lab/:id/results
// @access  Private (Admin, Doctor)
exports.updateLabTestResults = asyncHandler(async (req, res, next) => {
  let labTest = await LabTest.findById(req.params.id);

  if (!labTest) {
    return next(new ErrorResponse('Lab test not found', 404));
  }

  labTest = await LabTest.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      status: 'completed',
      resultDate: Date.now()
    },
    { new: true }
  );

  // Notify doctor about new results
  const doctor = await User.findById(labTest.doctor);
  if (doctor) {
    // TODO: Implement notification system
    // sendNotification(doctor.id, 'New lab results available');
  }

  res.status(200).json({
    success: true,
    data: labTest
  });
});

// @desc    Get all pending lab tests
// @route   GET /api/lab/pending
// @access  Private (Admin, Doctor)
exports.getPendingLabTests = asyncHandler(async (req, res, next) => {
  const labTests = await LabTest.find({ status: { $in: ['ordered', 'in_progress'] } })
    .populate('patient', 'name email')
    .populate('doctor', 'name email')
    .sort('-orderDate');

  res.status(200).json({
    success: true,
    data: labTests
  });
}); 
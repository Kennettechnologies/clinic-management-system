const InsuranceClaim = require('../models/InsuranceClaim');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create new insurance claim
// @route   POST /api/insurance/claim
// @access  Private (Admin, Doctor)
exports.createInsuranceClaim = asyncHandler(async (req, res, next) => {
  const claim = await InsuranceClaim.create(req.body);

  res.status(201).json({
    success: true,
    data: claim
  });
});

// @desc    Get all insurance claims for a patient
// @route   GET /api/insurance/patient/:patientId
// @access  Private (Admin, Doctor, Patient)
exports.getPatientClaims = asyncHandler(async (req, res, next) => {
  const claims = await InsuranceClaim.find({ patient: req.params.patientId })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: claims
  });
});

// @desc    Update insurance claim status
// @route   PUT /api/insurance/:id/status
// @access  Private (Admin, Doctor)
exports.updateClaimStatus = asyncHandler(async (req, res, next) => {
  let claim = await InsuranceClaim.findById(req.params.id);

  if (!claim) {
    return next(new ErrorResponse('Insurance claim not found', 404));
  }

  claim = await InsuranceClaim.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );

  res.status(200).json({
    success: true,
    data: claim
  });
});

// @desc    Get all pending insurance claims
// @route   GET /api/insurance/pending
// @access  Private (Admin, Doctor)
exports.getPendingClaims = asyncHandler(async (req, res, next) => {
  const claims = await InsuranceClaim.find({ status: 'pending' })
    .populate('patient', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: claims
  });
}); 
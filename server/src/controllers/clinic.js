const Clinic = require('../models/Clinic');
const Branch = require('../models/Branch');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Create new clinic
// @route   POST /api/clinic
// @access  Private (Admin)
exports.createClinic = asyncHandler(async (req, res, next) => {
  const clinic = await Clinic.create(req.body);

  res.status(201).json({
    success: true,
    data: clinic
  });
});

// @desc    Get all clinics
// @route   GET /api/clinic
// @access  Private (Admin)
exports.getClinics = asyncHandler(async (req, res, next) => {
  const clinics = await Clinic.find().populate('admin', 'name email');

  res.status(200).json({
    success: true,
    data: clinics
  });
});

// @desc    Create new branch
// @route   POST /api/clinic/:clinicId/branch
// @access  Private (Admin)
exports.createBranch = asyncHandler(async (req, res, next) => {
  req.body.clinic = req.params.clinicId;
  const branch = await Branch.create(req.body);

  const clinic = await Clinic.findById(req.params.clinicId);
  clinic.branches.push(branch._id);
  await clinic.save();

  res.status(201).json({
    success: true,
    data: branch
  });
});

// @desc    Get all branches for a clinic
// @route   GET /api/clinic/:clinicId/branch
// @access  Private (Admin)
exports.getBranches = asyncHandler(async (req, res, next) => {
  const branches = await Branch.find({ clinic: req.params.clinicId })
    .populate('manager', 'name email');

  res.status(200).json({
    success: true,
    data: branches
  });
}); 
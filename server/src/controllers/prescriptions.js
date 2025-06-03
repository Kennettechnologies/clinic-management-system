// @desc    Get all pending e-prescriptions for a pharmacy
// @route   GET /api/prescriptions/pharmacy
// @access  Private (Pharmacy)
exports.getPharmacyPrescriptions = asyncHandler(async (req, res, next) => {
  const prescriptions = await Prescription.find({ status: 'pending' })
    .populate('patient', 'name email')
    .populate('doctor', 'name email')
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
});

// @desc    Update e-prescription status
// @route   PUT /api/prescriptions/:id/status
// @access  Private (Pharmacy)
exports.updatePrescriptionStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  const prescription = await Prescription.findById(req.params.id);

  if (!prescription) {
    return next(new ErrorResponse('Prescription not found', 404));
  }

  prescription.status = status;
  await prescription.save();

  res.status(200).json({
    success: true,
    data: prescription
  });
}); 
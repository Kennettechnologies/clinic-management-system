const Patient = require('../models/Patient');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const Appointment = require('../models/Appointment');
const Billing = require('../models/Billing');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all patients
// @route   GET /api/v1/patients
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getPatients = asyncHandler(async (req, res, next) => {
    const patients = await Patient.find()
        .populate('user', 'firstName lastName email phoneNumber')
        .populate('familyMembers.user', 'firstName lastName email phoneNumber');

    res.status(200).json({
        success: true,
        count: patients.length,
        data: patients
    });
});

// @desc    Get single patient
// @route   GET /api/v1/patients/:id
// @access  Private (Admin, Doctor, Nurse, Receptionist, Patient)
exports.getPatient = asyncHandler(async (req, res, next) => {
    const patient = await Patient.findById(req.params.id)
        .populate('user', 'firstName lastName email phoneNumber dateOfBirth gender')
        .populate('familyMembers.user', 'firstName lastName email phoneNumber')
        .populate('medications.prescribedBy', 'firstName lastName');

    if (!patient) {
        return next(new ErrorResponse(`Patient not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: patient
    });
});

// @desc    Create new patient
// @route   POST /api/v1/patients
// @access  Private (Admin, Doctor, Receptionist)
exports.createPatient = asyncHandler(async (req, res, next) => {
    // Create user first
    const user = await User.create({
        ...req.body.user,
        role: 'patient'
    });

    // Create patient profile
    const patient = await Patient.create({
        ...req.body,
        user: user._id
    });

    res.status(201).json({
        success: true,
        data: patient
    });
});

// @desc    Update patient
// @route   PUT /api/v1/patients/:id
// @access  Private (Admin, Doctor)
exports.updatePatient = asyncHandler(async (req, res, next) => {
    let patient = await Patient.findById(req.params.id);

    if (!patient) {
        return next(new ErrorResponse(`Patient not found with id of ${req.params.id}`, 404));
    }

    // Update user data if provided
    if (req.body.user) {
        await User.findByIdAndUpdate(patient.user, req.body.user, {
            new: true,
            runValidators: true
        });
    }

    // Update patient data
    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate('user', 'firstName lastName email phoneNumber');

    res.status(200).json({
        success: true,
        data: patient
    });
});

// @desc    Delete patient
// @route   DELETE /api/v1/patients/:id
// @access  Private (Admin)
exports.deletePatient = asyncHandler(async (req, res, next) => {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
        return next(new ErrorResponse(`Patient not found with id of ${req.params.id}`, 404));
    }

    // Delete associated user
    await User.findByIdAndDelete(patient.user);

    // Delete patient
    await patient.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get patient medical records
// @route   GET /api/v1/patients/:id/medical-records
// @access  Private (Admin, Doctor, Nurse, Patient)
exports.getPatientMedicalRecords = asyncHandler(async (req, res, next) => {
    const records = await MedicalRecord.find({ patient: req.params.id })
        .populate('doctor', 'firstName lastName')
        .populate('appointment')
        .sort('-date');

    res.status(200).json({
        success: true,
        count: records.length,
        data: records
    });
});

// @desc    Get patient appointments
// @route   GET /api/v1/patients/:id/appointments
// @access  Private (Admin, Doctor, Nurse, Receptionist, Patient)
exports.getPatientAppointments = asyncHandler(async (req, res, next) => {
    const appointments = await Appointment.find({ patient: req.params.id })
        .populate('doctor', 'firstName lastName')
        .sort('-date');

    res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
    });
});

// @desc    Get patient billing
// @route   GET /api/v1/patients/:id/billing
// @access  Private (Admin, Doctor, Receptionist, Patient)
exports.getPatientBilling = asyncHandler(async (req, res, next) => {
    const billing = await Billing.find({ patient: req.params.id })
        .populate('appointment')
        .sort('-date');

    res.status(200).json({
        success: true,
        count: billing.length,
        data: billing
    });
}); 
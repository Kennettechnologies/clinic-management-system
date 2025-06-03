const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all doctors
// @route   GET /api/v1/doctors
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getDoctors = asyncHandler(async (req, res, next) => {
    const doctors = await Doctor.find()
        .populate('user', 'firstName lastName email phoneNumber')
        .populate('ratings.patient', 'firstName lastName');

    res.status(200).json({
        success: true,
        count: doctors.length,
        data: doctors
    });
});

// @desc    Get single doctor
// @route   GET /api/v1/doctors/:id
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getDoctor = asyncHandler(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id)
        .populate('user', 'firstName lastName email phoneNumber dateOfBirth gender')
        .populate('ratings.patient', 'firstName lastName');

    if (!doctor) {
        return next(new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: doctor
    });
});

// @desc    Create new doctor
// @route   POST /api/v1/doctors
// @access  Private (Admin)
exports.createDoctor = asyncHandler(async (req, res, next) => {
    // Create user first
    const user = await User.create({
        ...req.body.user,
        role: 'doctor'
    });

    // Create doctor profile
    const doctor = await Doctor.create({
        ...req.body,
        user: user._id
    });

    res.status(201).json({
        success: true,
        data: doctor
    });
});

// @desc    Update doctor
// @route   PUT /api/v1/doctors/:id
// @access  Private (Admin, Doctor)
exports.updateDoctor = asyncHandler(async (req, res, next) => {
    let doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        return next(new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404));
    }

    // Update user data if provided
    if (req.body.user) {
        await User.findByIdAndUpdate(doctor.user, req.body.user, {
            new: true,
            runValidators: true
        });
    }

    // Update doctor data
    doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate('user', 'firstName lastName email phoneNumber');

    res.status(200).json({
        success: true,
        data: doctor
    });
});

// @desc    Delete doctor
// @route   DELETE /api/v1/doctors/:id
// @access  Private (Admin)
exports.deleteDoctor = asyncHandler(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
        return next(new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404));
    }

    // Delete associated user
    await User.findByIdAndDelete(doctor.user);

    // Delete doctor
    await doctor.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get doctor schedule
// @route   GET /api/v1/doctors/:id/schedule
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getDoctorSchedule = asyncHandler(async (req, res, next) => {
    const doctor = await Doctor.findById(req.params.id).select('schedule');

    if (!doctor) {
        return next(new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: doctor.schedule
    });
});

// @desc    Update doctor schedule
// @route   PUT /api/v1/doctors/:id/schedule
// @access  Private (Admin, Doctor)
exports.updateDoctorSchedule = asyncHandler(async (req, res, next) => {
    const doctor = await Doctor.findByIdAndUpdate(
        req.params.id,
        { schedule: req.body },
        {
            new: true,
            runValidators: true
        }
    );

    if (!doctor) {
        return next(new ErrorResponse(`Doctor not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: doctor.schedule
    });
});

// @desc    Get doctor appointments
// @route   GET /api/v1/doctors/:id/appointments
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getDoctorAppointments = asyncHandler(async (req, res, next) => {
    const appointments = await Appointment.find({ doctor: req.params.id })
        .populate('patient', 'firstName lastName')
        .sort('-date');

    res.status(200).json({
        success: true,
        count: appointments.length,
        data: appointments
    });
});

// @desc    Get doctor patients
// @route   GET /api/v1/doctors/:id/patients
// @access  Private (Admin, Doctor)
exports.getDoctorPatients = asyncHandler(async (req, res, next) => {
    // Get all appointments for this doctor
    const appointments = await Appointment.find({ doctor: req.params.id })
        .distinct('patient');

    // Get patient details
    const patients = await Patient.find({ user: { $in: appointments } })
        .populate('user', 'firstName lastName email phoneNumber');

    res.status(200).json({
        success: true,
        count: patients.length,
        data: patients
    });
}); 
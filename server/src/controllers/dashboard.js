const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Telemedicine = require('../models/Telemedicine');
const Notification = require('../models/Notification');

// @desc    Get dashboard statistics
// @route   GET /api/v1/dashboard/stats
// @access  Private
exports.getDashboardStats = asyncHandler(async (req, res, next) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const todayAppointments = await Appointment.countDocuments({
        date: {
            $gte: today,
            $lt: tomorrow
        }
    });

    // Get total patients
    const totalPatients = await User.countDocuments({ role: 'patient' });

    // Get active doctors
    const activeDoctors = await User.countDocuments({ 
        role: 'doctor',
        isActive: true
    });

    // Get pending telemedicine consultations
    const pendingConsultations = await Telemedicine.countDocuments({
        status: 'scheduled',
        startTime: { $gte: new Date() }
    });

    res.status(200).json({
        success: true,
        data: {
            todayAppointments,
            totalPatients,
            activeDoctors,
            pendingConsultations
        }
    });
});

// @desc    Get recent activity
// @route   GET /api/v1/dashboard/activity
// @access  Private
exports.getRecentActivity = asyncHandler(async (req, res, next) => {
    const activities = [];

    // Get recent appointments
    const recentAppointments = await Appointment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('patient', 'name')
        .populate('doctor', 'name');

    // Get recent telemedicine sessions
    const recentTelemedicine = await Telemedicine.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('patient', 'name')
        .populate('doctor', 'name');

    // Combine and format activities
    recentAppointments.forEach(appointment => {
        activities.push({
            type: 'appointment',
            description: `New appointment scheduled for ${appointment.patient.name} with Dr. ${appointment.doctor.name}`,
            timestamp: appointment.createdAt
        });
    });

    recentTelemedicine.forEach(session => {
        activities.push({
            type: 'video',
            description: `Video consultation scheduled for ${session.patient.name} with Dr. ${session.doctor.name}`,
            timestamp: session.createdAt
        });
    });

    // Sort activities by timestamp
    activities.sort((a, b) => b.timestamp - a.timestamp);

    // Return only the 10 most recent activities
    res.status(200).json({
        success: true,
        data: activities.slice(0, 10)
    });
});

// @desc    Get notifications
// @route   GET /api/v1/dashboard/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
    // Get notifications for the current user
    const notifications = await Notification.find({
        $or: [
            { recipient: req.user._id },
            { role: req.user.role }
        ],
        read: false
    })
    .sort({ createdAt: -1 })
    .limit(10);

    res.status(200).json({
        success: true,
        data: notifications
    });
}); 
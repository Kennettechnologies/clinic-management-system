const Telemedicine = require('../models/Telemedicine');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');
const twilio = require('../utils/twilio');
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// @desc    Get all telemedicine sessions
// @route   GET /api/v1/telemedicine
// @access  Private (Admin, Doctor, Nurse)
exports.getTelemedicineSessions = asyncHandler(async (req, res, next) => {
    const sessions = await Telemedicine.find()
        .populate('patient', 'name email')
        .populate('doctor', 'name email');

    res.status(200).json({
        success: true,
        data: sessions
    });
});

// @desc    Get single telemedicine session
// @route   GET /api/v1/telemedicine/:id
// @access  Private (Admin, Doctor, Nurse, Patient)
exports.getTelemedicineSession = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id)
        .populate('patient', 'name email')
        .populate('doctor', 'name email');

    if (!session) {
        return next(new ErrorResponse('Session not found', 404));
    }

    // Check if user has access to this session
    if (req.user.role !== 'admin' && 
        req.user.role !== 'doctor' && 
        req.user.role !== 'nurse' && 
        session.patient._id.toString() !== req.user.id) {
        return next(new ErrorResponse('Not authorized to access this session', 403));
    }

    res.status(200).json({
        success: true,
        data: session
    });
});

// @desc    Create new telemedicine session
// @route   POST /api/v1/telemedicine
// @access  Private (Admin, Doctor)
exports.createTelemedicineSession = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Generate meeting ID and URL for video consultations
    if (req.body.type === 'video') {
        const roomName = `meet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const room = await twilio.createVideoRoom(roomName);
        
        req.body.meetingId = room.sid;
        req.body.meetingUrl = `${process.env.FRONTEND_URL}/video/${room.sid}`;
    }

    const session = await Telemedicine.create(req.body);

    // Send email notifications
    try {
        await sendEmail({
            email: session.patient.email,
            subject: 'Telemedicine Session Scheduled',
            message: `Your ${session.type} consultation has been scheduled. ${session.type === 'video' ? `Join at: ${session.meetingUrl}` : ''}`
        });
    } catch (err) {
        console.log('Email could not be sent');
    }

    res.status(201).json({
        success: true,
        data: session
    });
});

// @desc    Update telemedicine session
// @route   PUT /api/v1/telemedicine/:id
// @access  Private (Admin, Doctor)
exports.updateTelemedicineSession = asyncHandler(async (req, res, next) => {
    let session = await Telemedicine.findById(req.params.id);

    if (!session) {
        return next(new ErrorResponse('Session not found', 404));
    }

    session = await Telemedicine.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: session
    });
});

// @desc    Delete telemedicine session
// @route   DELETE /api/v1/telemedicine/:id
// @access  Private
exports.deleteTelemedicineSession = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id);

    if (!session) {
        return next(new ErrorResponse('Session not found', 404));
    }

    await session.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get video token
// @route   GET /api/v1/telemedicine/:id/token
// @access  Private (Admin, Doctor, Patient)
exports.getVideoToken = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id);

    if (!session) {
        return next(new ErrorResponse('Session not found', 404));
    }

    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    const token = new AccessToken(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_API_KEY,
        process.env.TWILIO_API_SECRET
    );

    token.identity = req.user.name;
    token.addGrant(new VideoGrant({ room: session.meetingId }));

    res.status(200).json({
        success: true,
        data: {
            token: token.toJwt()
        }
    });
});

// @desc    Start telemedicine session
// @route   PUT /api/v1/telemedicine/:id/start
// @access  Private (Admin, Doctor)
exports.startSession = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id);

    if (!session) {
        return next(new ErrorResponse('Session not found', 404));
    }

    session.status = 'active';
    await session.save();

    res.status(200).json({
        success: true,
        data: session
    });
});

// @desc    End telemedicine session
// @route   PUT /api/v1/telemedicine/:id/end
// @access  Private (Admin, Doctor)
exports.endSession = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id);

    if (!session) {
        return next(new ErrorResponse('Session not found', 404));
    }

    if (session.type === 'video') {
        await twilio.endRoom(session.meetingId);
    }

    session.status = 'completed';
    session.endTime = Date.now();
    session.duration = Math.round((session.endTime - session.startTime) / (1000 * 60)); // Duration in minutes
    await session.save();

    res.status(200).json({
        success: true,
        data: session
    });
});

// @desc    Get session participants
// @route   GET /api/v1/telemedicine/:id/participants
// @access  Private (Admin, Doctor)
exports.getSessionParticipants = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id);

    if (!session) {
        return next(new ErrorResponse('Session not found', 404));
    }

    if (session.type !== 'video') {
        return next(new ErrorResponse('This session is not a video consultation', 400));
    }

    const participants = await twilio.getRoomParticipants(session.meetingId);

    res.status(200).json({
        success: true,
        data: participants
    });
});

// @desc    Add chat message
// @route   POST /api/v1/telemedicine/:id/chat
// @access  Private (Admin, Doctor, Patient)
exports.addChatMessage = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id);

    if (!session) {
        return next(new ErrorResponse('Session not found', 404));
    }

    session.chatHistory.push({
        sender: req.user.id,
        message: req.body.message
    });

    await session.save();

    res.status(200).json({
        success: true,
        data: session
    });
});

// @desc    Share file
// @route   POST /api/v1/telemedicine/:id/files
// @access  Private (Admin, Doctor, Patient)
exports.shareFile = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id);

    if (!session) {
        return next(new ErrorResponse('Session not found', 404));
    }

    session.sharedFiles.push({
        name: req.body.name,
        type: req.body.type,
        url: req.body.url,
        uploadedBy: req.user.id
    });

    await session.save();

    res.status(200).json({
        success: true,
        data: session
    });
});

// @desc    Get patient telemedicine sessions
// @route   GET /api/v1/telemedicine/patient/:patientId
// @access  Private (Admin, Doctor, Nurse, Patient)
exports.getPatientSessions = asyncHandler(async (req, res, next) => {
    const sessions = await Telemedicine.find({ patient: req.params.patientId })
        .populate('doctor', 'name email')
        .populate('appointment')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions
    });
});

// @desc    Get doctor telemedicine sessions
// @route   GET /api/v1/telemedicine/doctor/:doctorId
// @access  Private (Admin, Doctor)
exports.getDoctorSessions = asyncHandler(async (req, res, next) => {
    const sessions = await Telemedicine.find({ doctor: req.params.doctorId })
        .populate('patient', 'name email')
        .populate('appointment')
        .sort('-createdAt');

    res.status(200).json({
        success: true,
        count: sessions.length,
        data: sessions
    });
});

// @desc    Get participants in a telemedicine session
// @route   GET /api/telemedicine/:id/participants
// @access  Private
exports.getParticipants = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id)
        .populate('patient', 'name email')
        .populate('doctor', 'name email');

    if (!session) {
        return next(new ErrorResponse('Session not found', 404));
    }

    res.status(200).json({
        success: true,
        data: {
            patient: session.patient,
            doctor: session.doctor,
            status: session.status
        }
    });
});

// @desc    Start recording
// @route   POST /api/v1/telemedicine/:id/recording/start
// @access  Private
exports.startRecording = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id);

    if (!session) {
        return next(new ErrorResponse('Session not found', 404));
    }

    const recording = await client.video.recordings.create({
        roomSid: session.meetingId,
        type: 'audio-video'
    });

    session.recordingSid = recording.sid;
    await session.save();

    res.status(200).json({
        success: true,
        data: recording
    });
});

// @desc    Stop recording
// @route   POST /api/v1/telemedicine/:id/recording/stop
// @access  Private
exports.stopRecording = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id);

    if (!session || !session.recordingSid) {
        return next(new ErrorResponse('Recording not found', 404));
    }

    await client.video.recordings(session.recordingSid).update({
        status: 'stopped'
    });

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Save recording
// @route   POST /api/v1/telemedicine/:id/recording/save
// @access  Private
exports.saveRecording = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id);

    if (!session || !session.recordingSid) {
        return next(new ErrorResponse('Recording not found', 404));
    }

    const recording = await client.video.recordings(session.recordingSid).fetch();
    const recordingUrl = `https://video.twilio.com/v1/Recordings/${recording.sid}/Media`;

    session.recordingUrl = recordingUrl;
    await session.save();

    res.status(200).json({
        success: true,
        data: recording
    });
});

// @desc    Delete recording
// @route   DELETE /api/v1/telemedicine/:id/recording
// @access  Private
exports.deleteRecording = asyncHandler(async (req, res, next) => {
    const session = await Telemedicine.findById(req.params.id);

    if (!session || !session.recordingSid) {
        return next(new ErrorResponse('Recording not found', 404));
    }

    await client.video.recordings(session.recordingSid).remove();

    session.recordingSid = undefined;
    session.recordingUrl = undefined;
    await session.save();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Upload a shared file to a telemedicine session
// @route   POST /api/telemedicine/:id/files
// @access  Doctor/Patient
exports.uploadSharedFile = asyncHandler(async (req, res, next) => {
  const sessionId = req.params.id;
  const session = await Telemedicine.findById(sessionId);
  if (!session) {
    return next(new ErrorResponse('Session not found', 404));
  }
  // Only allow participants
  if (
    session.doctor.toString() !== req.user.id &&
    session.patient.toString() !== req.user.id
  ) {
    return next(new ErrorResponse('Not authorized to upload files for this session', 403));
  }
  if (!req.file) {
    return next(new ErrorResponse('No file uploaded', 400));
  }
  // Save file info to session
  const fileMeta = {
    name: req.file.originalname,
    type: req.file.mimetype,
    url: `/uploads/telemedicine/${req.file.filename}`,
    uploadedBy: req.user.id,
    uploadedAt: new Date()
  };
  session.sharedFiles.push(fileMeta);
  await session.save();
  res.status(201).json(fileMeta);
}); 
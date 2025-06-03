const express = require('express');
const {
    getTelemedicineSessions,
    getTelemedicineSession,
    createTelemedicineSession,
    updateTelemedicineSession,
    deleteTelemedicineSession,
    getVideoToken,
    getParticipants,
    startSession,
    startRecording,
    stopRecording,
    saveRecording,
    deleteRecording,
    addChatMessage,
    shareFile,
    getPatientSessions,
    getDoctorSessions,
    getSessionParticipants,
    uploadSharedFile
} = require('../controllers/telemedicine');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/telemedicine'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Protect all routes
router.use(protect);

// Base routes
router
    .route('/')
    .get(authorize('admin', 'doctor', 'nurse'), getTelemedicineSessions)
    .post(authorize('admin', 'doctor'), createTelemedicineSession);

router
    .route('/:id')
    .get(authorize('admin', 'doctor', 'patient'), getTelemedicineSession)
    .put(authorize('admin', 'doctor'), updateTelemedicineSession)
    .delete(authorize('admin'), deleteTelemedicineSession);

// Video routes
router
    .route('/:id/token')
    .get(authorize('admin', 'doctor', 'patient'), getVideoToken);

// Waiting room routes
router
    .route('/:id/participants')
    .get(authorize('admin', 'doctor', 'patient'), getParticipants);

router
    .route('/:id/start')
    .post(authorize('admin', 'doctor'), startSession);

// Recording routes
router
    .route('/:id/recording/start')
    .post(authorize('admin', 'doctor'), startRecording);

router
    .route('/:id/recording/stop')
    .post(authorize('admin', 'doctor'), stopRecording);

router
    .route('/:id/recording/save')
    .post(authorize('admin', 'doctor'), saveRecording);

router
    .route('/:id/recording')
    .delete(authorize('admin', 'doctor'), deleteRecording);

// Chat and file sharing routes
router
    .route('/:id/chat')
    .post(authorize('admin', 'doctor', 'patient'), addChatMessage);

router
    .route('/:id/files')
    .post(
        authorize('admin', 'doctor', 'patient'),
        upload.single('file'),
        uploadSharedFile
    );

// Patient and doctor specific routes
router
    .route('/patient/:patientId')
    .get(authorize('admin', 'doctor', 'nurse', 'patient'), getPatientSessions);

router
    .route('/doctor/:doctorId')
    .get(authorize('admin', 'doctor'), getDoctorSessions);

module.exports = router; 
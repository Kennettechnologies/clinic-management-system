const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getPatientHistory } = require('../controllers/patient');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get patient history
router.get('/history/:patientId', authorize('admin', 'doctor', 'patient'), getPatientHistory);

module.exports = router; 
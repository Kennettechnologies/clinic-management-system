const express = require('express');
const { checkSymptoms, suggestPrescriptions, optimizeAppointments } = require('../controllers/ai');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Symptom checker route
router.post('/symptoms', checkSymptoms);

// Prescription suggestions route
router.post('/prescriptions', suggestPrescriptions);

// Appointment optimization route
router.post('/appointments/optimize', optimizeAppointments);

module.exports = router; 
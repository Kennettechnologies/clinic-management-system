const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createReminder,
  getPatientReminders,
  updateReminder
} = require('../controllers/reminders');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create medication reminder
router.post('/', authorize('admin', 'doctor', 'patient'), createReminder);

// Get patient's reminders
router.get('/patient/:patientId', authorize('admin', 'doctor', 'patient'), getPatientReminders);

// Update reminder
router.put('/:id', authorize('admin', 'doctor', 'patient'), updateReminder);

module.exports = router; 
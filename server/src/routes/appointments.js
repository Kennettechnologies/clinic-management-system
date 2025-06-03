const express = require('express');
const {
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    getAvailableSlots,
    confirmAppointment,
    cancelAppointment,
    rescheduleAppointment
} = require('../controllers/appointments');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Base routes
router.route('/')
    .get(authorize('admin', 'doctor', 'nurse', 'receptionist'), getAppointments)
    .post(authorize('admin', 'doctor', 'receptionist'), createAppointment);

router.route('/:id')
    .get(authorize('admin', 'doctor', 'nurse', 'receptionist'), getAppointment)
    .put(authorize('admin', 'doctor', 'receptionist'), updateAppointment)
    .delete(authorize('admin', 'doctor'), deleteAppointment);

// Appointment management routes
router.get('/slots/:doctorId', authorize('admin', 'doctor', 'nurse', 'receptionist'), getAvailableSlots);
router.put('/:id/confirm', authorize('admin', 'doctor', 'receptionist'), confirmAppointment);
router.put('/:id/cancel', authorize('admin', 'doctor', 'receptionist'), cancelAppointment);
router.put('/:id/reschedule', authorize('admin', 'doctor', 'receptionist'), rescheduleAppointment);

module.exports = router; 
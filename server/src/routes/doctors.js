const express = require('express');
const {
    getDoctors,
    getDoctor,
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorSchedule,
    updateDoctorSchedule,
    getDoctorAppointments,
    getDoctorPatients
} = require('../controllers/doctors');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Admin routes
router.route('/')
    .get(authorize('admin', 'doctor', 'nurse', 'receptionist'), getDoctors)
    .post(authorize('admin'), createDoctor);

router.route('/:id')
    .get(authorize('admin', 'doctor', 'nurse', 'receptionist'), getDoctor)
    .put(authorize('admin', 'doctor'), updateDoctor)
    .delete(authorize('admin'), deleteDoctor);

// Doctor specific routes
router.get('/:id/schedule', authorize('admin', 'doctor', 'nurse', 'receptionist'), getDoctorSchedule);
router.put('/:id/schedule', authorize('admin', 'doctor'), updateDoctorSchedule);
router.get('/:id/appointments', authorize('admin', 'doctor', 'nurse', 'receptionist'), getDoctorAppointments);
router.get('/:id/patients', authorize('admin', 'doctor'), getDoctorPatients);

module.exports = router; 
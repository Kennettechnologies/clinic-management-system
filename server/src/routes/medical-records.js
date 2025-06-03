const express = require('express');
const {
    getMedicalRecords,
    getMedicalRecord,
    createMedicalRecord,
    updateMedicalRecord,
    deleteMedicalRecord,
    getPatientRecords,
    getDoctorRecords,
    addAttachment,
    removeAttachment
} = require('../controllers/medical-records');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Base routes
router.route('/')
    .get(authorize('admin', 'doctor', 'nurse'), getMedicalRecords)
    .post(authorize('admin', 'doctor'), createMedicalRecord);

router.route('/:id')
    .get(authorize('admin', 'doctor', 'nurse'), getMedicalRecord)
    .put(authorize('admin', 'doctor'), updateMedicalRecord)
    .delete(authorize('admin'), deleteMedicalRecord);

// Patient and doctor specific routes
router.get('/patient/:patientId', authorize('admin', 'doctor', 'nurse'), getPatientRecords);
router.get('/doctor/:doctorId', authorize('admin', 'doctor'), getDoctorRecords);

// Attachment management
router.post('/:id/attachments', authorize('admin', 'doctor'), addAttachment);
router.delete('/:id/attachments/:attachmentId', authorize('admin', 'doctor'), removeAttachment);

module.exports = router; 
const {
  createPrescription,
  getPrescription,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getPharmacyPrescriptions,
  updatePrescriptionStatus
} = require('../controllers/prescriptions');

// Pharmacy dashboard routes
router.get('/pharmacy', authorize('pharmacy'), getPharmacyPrescriptions);
router.put('/:id/status', authorize('pharmacy'), updatePrescriptionStatus); 
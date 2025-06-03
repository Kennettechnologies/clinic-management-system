const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  orderLabTest,
  getPatientLabTests,
  updateLabTestResults,
  getPendingLabTests
} = require('../controllers/lab');

const router = express.Router();

// Protect all routes
router.use(protect);

// Order new lab test
router.post('/order', authorize('admin', 'doctor'), orderLabTest);

// Get patient's lab tests
router.get('/patient/:patientId', authorize('admin', 'doctor', 'patient'), getPatientLabTests);

// Update lab test results
router.put('/:id/results', authorize('admin', 'doctor'), updateLabTestResults);

// Get pending lab tests
router.get('/pending', authorize('admin', 'doctor'), getPendingLabTests);

module.exports = router; 
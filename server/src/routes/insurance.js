const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createInsuranceClaim,
  getPatientClaims,
  updateClaimStatus,
  getPendingClaims
} = require('../controllers/insurance');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create new insurance claim
router.post('/claim', authorize('admin', 'doctor'), createInsuranceClaim);

// Get patient's insurance claims
router.get('/patient/:patientId', authorize('admin', 'doctor', 'patient'), getPatientClaims);

// Update insurance claim status
router.put('/:id/status', authorize('admin', 'doctor'), updateClaimStatus);

// Get pending insurance claims
router.get('/pending', authorize('admin', 'doctor'), getPendingClaims);

module.exports = router; 
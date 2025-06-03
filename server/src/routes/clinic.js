const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  createClinic,
  getClinics,
  createBranch,
  getBranches
} = require('../controllers/clinic');

const router = express.Router();

// Protect all routes
router.use(protect);

// Create new clinic
router.post('/', authorize('admin'), createClinic);

// Get all clinics
router.get('/', authorize('admin'), getClinics);

// Create new branch
router.post('/:clinicId/branch', authorize('admin'), createBranch);

// Get all branches for a clinic
router.get('/:clinicId/branch', authorize('admin'), getBranches);

module.exports = router; 
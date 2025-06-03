const express = require('express');
const {
    getDashboardStats,
    getRecentActivity,
    getNotifications
} = require('../controllers/dashboard');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Dashboard routes
router.get('/stats', authorize('admin', 'doctor', 'nurse', 'receptionist'), getDashboardStats);
router.get('/activity', authorize('admin', 'doctor', 'nurse', 'receptionist'), getRecentActivity);
router.get('/notifications', authorize('admin', 'doctor', 'nurse', 'receptionist', 'patient'), getNotifications);

module.exports = router; 
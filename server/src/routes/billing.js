const express = require('express');
const {
    getBills,
    getBill,
    createBill,
    updateBill,
    deleteBill,
    getPatientBills,
    processPayment,
    generateInvoice,
    getPaymentHistory,
    refundPayment
} = require('../controllers/billing');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Base routes
router.route('/')
    .get(authorize('admin', 'doctor', 'receptionist'), getBills)
    .post(authorize('admin', 'doctor', 'receptionist'), createBill);

router.route('/:id')
    .get(authorize('admin', 'doctor', 'receptionist'), getBill)
    .put(authorize('admin', 'doctor', 'receptionist'), updateBill)
    .delete(authorize('admin'), deleteBill);

// Patient specific routes
router.get('/patient/:patientId', authorize('admin', 'doctor', 'receptionist'), getPatientBills);
router.get('/patient/:patientId/history', authorize('admin', 'doctor', 'receptionist'), getPaymentHistory);

// Payment management
router.post('/:id/payment', authorize('admin', 'receptionist'), processPayment);
router.post('/:id/invoice', authorize('admin', 'doctor', 'receptionist'), generateInvoice);
router.post('/:id/refund', authorize('admin'), refundPayment);

module.exports = router; 
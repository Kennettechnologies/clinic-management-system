const express = require('express');
const {
    getInventoryItems,
    getInventoryItem,
    createInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    getLowStockItems,
    updateStock,
    getStockHistory,
    getCategoryItems,
    addStockAlert
} = require('../controllers/inventory');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Base routes
router.route('/')
    .get(authorize('admin', 'doctor', 'nurse', 'receptionist'), getInventoryItems)
    .post(authorize('admin', 'nurse'), createInventoryItem);

router.route('/:id')
    .get(authorize('admin', 'doctor', 'nurse', 'receptionist'), getInventoryItem)
    .put(authorize('admin', 'nurse'), updateInventoryItem)
    .delete(authorize('admin'), deleteInventoryItem);

// Stock management routes
router.get('/low-stock', authorize('admin', 'nurse'), getLowStockItems);
router.put('/:id/stock', authorize('admin', 'nurse'), updateStock);
router.get('/:id/history', authorize('admin', 'nurse'), getStockHistory);
router.get('/category/:category', authorize('admin', 'doctor', 'nurse', 'receptionist'), getCategoryItems);
router.post('/:id/alert', authorize('admin', 'nurse'), addStockAlert);

module.exports = router; 
const express = require('express');
const {
    getCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    getSubcategories,
    getRootCategories
} = require('../controllers/categories');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Base routes
router.route('/')
    .get(authorize('admin', 'doctor', 'nurse', 'receptionist'), getCategories)
    .post(authorize('admin'), createCategory);

router.route('/:id')
    .get(authorize('admin', 'doctor', 'nurse', 'receptionist'), getCategory)
    .put(authorize('admin'), updateCategory)
    .delete(authorize('admin'), deleteCategory);

// Special routes
router.get('/root', authorize('admin', 'doctor', 'nurse', 'receptionist'), getRootCategories);
router.get('/:id/subcategories', authorize('admin', 'doctor', 'nurse', 'receptionist'), getSubcategories);

module.exports = router; 
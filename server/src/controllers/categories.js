const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.find()
        .populate('parent', 'name')
        .populate('createdBy', 'firstName lastName')
        .sort('name');

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
});

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id)
        .populate('parent', 'name')
        .populate('createdBy', 'firstName lastName');

    if (!category) {
        return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: category
    });
});

// @desc    Create new category
// @route   POST /api/v1/categories
// @access  Private (Admin)
exports.createCategory = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const category = await Category.create(req.body);

    res.status(201).json({
        success: true,
        data: category
    });
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private (Admin)
exports.updateCategory = asyncHandler(async (req, res, next) => {
    let category = await Category.findById(req.params.id);

    if (!category) {
        return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: category
    });
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin)
exports.deleteCategory = asyncHandler(async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new ErrorResponse(`Category not found with id of ${req.params.id}`, 404));
    }

    // Check if category has any subcategories
    const hasSubcategories = await Category.findOne({ parent: req.params.id });
    if (hasSubcategories) {
        return next(new ErrorResponse('Cannot delete category with subcategories', 400));
    }

    await category.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get subcategories
// @route   GET /api/v1/categories/:id/subcategories
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getSubcategories = asyncHandler(async (req, res, next) => {
    const subcategories = await Category.find({ parent: req.params.id })
        .populate('createdBy', 'firstName lastName')
        .sort('name');

    res.status(200).json({
        success: true,
        count: subcategories.length,
        data: subcategories
    });
});

// @desc    Get root categories
// @route   GET /api/v1/categories/root
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getRootCategories = asyncHandler(async (req, res, next) => {
    const categories = await Category.find({ parent: null })
        .populate('createdBy', 'firstName lastName')
        .sort('name');

    res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
    });
}); 
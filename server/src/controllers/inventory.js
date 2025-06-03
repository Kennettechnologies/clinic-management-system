const Inventory = require('../models/Inventory');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all inventory items
// @route   GET /api/v1/inventory
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getInventoryItems = asyncHandler(async (req, res, next) => {
    const items = await Inventory.find()
        .populate('category')
        .populate('lastUpdatedBy', 'firstName lastName')
        .sort('-updatedAt');

    res.status(200).json({
        success: true,
        count: items.length,
        data: items
    });
});

// @desc    Get single inventory item
// @route   GET /api/v1/inventory/:id
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getInventoryItem = asyncHandler(async (req, res, next) => {
    const item = await Inventory.findById(req.params.id)
        .populate('category')
        .populate('lastUpdatedBy', 'firstName lastName');

    if (!item) {
        return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: item
    });
});

// @desc    Create new inventory item
// @route   POST /api/v1/inventory
// @access  Private (Admin, Nurse)
exports.createInventoryItem = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.lastUpdatedBy = req.user.id;

    const item = await Inventory.create(req.body);

    // Check if stock is below threshold
    if (item.quantity <= item.lowStockThreshold) {
        try {
            await sendEmail({
                email: process.env.ADMIN_EMAIL,
                subject: 'Low Stock Alert',
                message: `Item ${item.name} is running low on stock. Current quantity: ${item.quantity}`
            });
        } catch (err) {
            console.log('Email could not be sent');
        }
    }

    res.status(201).json({
        success: true,
        data: item
    });
});

// @desc    Update inventory item
// @route   PUT /api/v1/inventory/:id
// @access  Private (Admin, Nurse)
exports.updateInventoryItem = asyncHandler(async (req, res, next) => {
    let item = await Inventory.findById(req.params.id);

    if (!item) {
        return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
    }

    // Add user to req.body
    req.body.lastUpdatedBy = req.user.id;

    item = await Inventory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: item
    });
});

// @desc    Delete inventory item
// @route   DELETE /api/v1/inventory/:id
// @access  Private (Admin)
exports.deleteInventoryItem = asyncHandler(async (req, res, next) => {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
        return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
    }

    await item.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get low stock items
// @route   GET /api/v1/inventory/low-stock
// @access  Private (Admin, Nurse)
exports.getLowStockItems = asyncHandler(async (req, res, next) => {
    const items = await Inventory.find({
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    })
        .populate('category')
        .sort('quantity');

    res.status(200).json({
        success: true,
        count: items.length,
        data: items
    });
});

// @desc    Update stock
// @route   PUT /api/v1/inventory/:id/stock
// @access  Private (Admin, Nurse)
exports.updateStock = asyncHandler(async (req, res, next) => {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
        return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
    }

    const { quantity, type, reason } = req.body;

    // Update stock based on type (add/remove)
    if (type === 'add') {
        item.quantity += quantity;
    } else if (type === 'remove') {
        if (item.quantity < quantity) {
            return next(new ErrorResponse('Insufficient stock', 400));
        }
        item.quantity -= quantity;
    }

    // Add to stock history
    item.stockHistory.push({
        type,
        quantity,
        reason,
        updatedBy: req.user.id,
        date: Date.now()
    });

    // Update last updated by
    item.lastUpdatedBy = req.user.id;

    await item.save();

    // Check if stock is below threshold
    if (item.quantity <= item.lowStockThreshold) {
        try {
            await sendEmail({
                email: process.env.ADMIN_EMAIL,
                subject: 'Low Stock Alert',
                message: `Item ${item.name} is running low on stock. Current quantity: ${item.quantity}`
            });
        } catch (err) {
            console.log('Email could not be sent');
        }
    }

    res.status(200).json({
        success: true,
        data: item
    });
});

// @desc    Get stock history
// @route   GET /api/v1/inventory/:id/history
// @access  Private (Admin, Nurse)
exports.getStockHistory = asyncHandler(async (req, res, next) => {
    const item = await Inventory.findById(req.params.id)
        .populate('stockHistory.updatedBy', 'firstName lastName');

    if (!item) {
        return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        count: item.stockHistory.length,
        data: item.stockHistory
    });
});

// @desc    Get items by category
// @route   GET /api/v1/inventory/category/:category
// @access  Private (Admin, Doctor, Nurse, Receptionist)
exports.getCategoryItems = asyncHandler(async (req, res, next) => {
    const items = await Inventory.find({ category: req.params.category })
        .populate('category')
        .sort('name');

    res.status(200).json({
        success: true,
        count: items.length,
        data: items
    });
});

// @desc    Add stock alert
// @route   POST /api/v1/inventory/:id/alert
// @access  Private (Admin, Nurse)
exports.addStockAlert = asyncHandler(async (req, res, next) => {
    const item = await Inventory.findById(req.params.id);

    if (!item) {
        return next(new ErrorResponse(`Item not found with id of ${req.params.id}`, 404));
    }

    const { threshold, email } = req.body;

    item.stockAlerts.push({
        threshold,
        email,
        createdBy: req.user.id,
        createdAt: Date.now()
    });

    await item.save();

    res.status(200).json({
        success: true,
        data: item
    });
}); 
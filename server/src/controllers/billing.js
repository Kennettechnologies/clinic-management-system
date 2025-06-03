const Billing = require('../models/Billing');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const sendEmail = require('../utils/sendEmail');

// @desc    Get all bills
// @route   GET /api/v1/billing
// @access  Private (Admin, Doctor, Receptionist)
exports.getBills = asyncHandler(async (req, res, next) => {
    const bills = await Billing.find()
        .populate('patient', 'firstName lastName')
        .populate('appointment')
        .populate('createdBy', 'firstName lastName')
        .sort('-date');

    res.status(200).json({
        success: true,
        count: bills.length,
        data: bills
    });
});

// @desc    Get single bill
// @route   GET /api/v1/billing/:id
// @access  Private (Admin, Doctor, Receptionist)
exports.getBill = asyncHandler(async (req, res, next) => {
    const bill = await Billing.findById(req.params.id)
        .populate('patient', 'firstName lastName email phoneNumber')
        .populate('appointment')
        .populate('createdBy', 'firstName lastName');

    if (!bill) {
        return next(new ErrorResponse(`Bill not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: bill
    });
});

// @desc    Create new bill
// @route   POST /api/v1/billing
// @access  Private (Admin, Doctor, Receptionist)
exports.createBill = asyncHandler(async (req, res, next) => {
    // Add user to req.body
    req.body.createdBy = req.user.id;

    const bill = await Billing.create(req.body);

    res.status(201).json({
        success: true,
        data: bill
    });
});

// @desc    Update bill
// @route   PUT /api/v1/billing/:id
// @access  Private (Admin, Doctor, Receptionist)
exports.updateBill = asyncHandler(async (req, res, next) => {
    let bill = await Billing.findById(req.params.id);

    if (!bill) {
        return next(new ErrorResponse(`Bill not found with id of ${req.params.id}`, 404));
    }

    bill = await Billing.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: bill
    });
});

// @desc    Delete bill
// @route   DELETE /api/v1/billing/:id
// @access  Private (Admin)
exports.deleteBill = asyncHandler(async (req, res, next) => {
    const bill = await Billing.findById(req.params.id);

    if (!bill) {
        return next(new ErrorResponse(`Bill not found with id of ${req.params.id}`, 404));
    }

    await bill.remove();

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Get patient bills
// @route   GET /api/v1/billing/patient/:patientId
// @access  Private (Admin, Doctor, Receptionist)
exports.getPatientBills = asyncHandler(async (req, res, next) => {
    const bills = await Billing.find({ patient: req.params.patientId })
        .populate('appointment')
        .sort('-date');

    res.status(200).json({
        success: true,
        count: bills.length,
        data: bills
    });
});

// @desc    Process payment
// @route   POST /api/v1/billing/:id/payment
// @access  Private (Admin, Receptionist)
exports.processPayment = asyncHandler(async (req, res, next) => {
    const bill = await Billing.findById(req.params.id);

    if (!bill) {
        return next(new ErrorResponse(`Bill not found with id of ${req.params.id}`, 404));
    }

    // Update payment details
    bill.paymentMethod = req.body.paymentMethod;
    bill.paymentDetails = {
        ...req.body.paymentDetails,
        paymentDate: Date.now(),
        paymentStatus: 'completed'
    };
    bill.status = 'paid';

    await bill.save();

    // Send payment confirmation email
    try {
        await sendEmail({
            email: bill.patient.email,
            subject: 'Payment Confirmation',
            message: `Your payment of ${bill.total} has been received for invoice ${bill.invoiceNumber}`
        });
    } catch (err) {
        console.log('Email could not be sent');
    }

    res.status(200).json({
        success: true,
        data: bill
    });
});

// @desc    Generate invoice
// @route   POST /api/v1/billing/:id/invoice
// @access  Private (Admin, Doctor, Receptionist)
exports.generateInvoice = asyncHandler(async (req, res, next) => {
    const bill = await Billing.findById(req.params.id)
        .populate('patient', 'firstName lastName email')
        .populate('appointment');

    if (!bill) {
        return next(new ErrorResponse(`Bill not found with id of ${req.params.id}`, 404));
    }

    // Generate invoice number if not exists
    if (!bill.invoiceNumber) {
        bill.invoiceNumber = `INV-${Date.now()}`;
        await bill.save();
    }

    // Send invoice email
    try {
        await sendEmail({
            email: bill.patient.email,
            subject: 'Invoice Generated',
            message: `Your invoice ${bill.invoiceNumber} has been generated for ${bill.total}`
        });
    } catch (err) {
        console.log('Email could not be sent');
    }

    res.status(200).json({
        success: true,
        data: bill
    });
});

// @desc    Get payment history
// @route   GET /api/v1/billing/patient/:patientId/history
// @access  Private (Admin, Doctor, Receptionist)
exports.getPaymentHistory = asyncHandler(async (req, res, next) => {
    const bills = await Billing.find({
        patient: req.params.patientId,
        'paymentDetails.paymentStatus': 'completed'
    })
        .select('invoiceNumber date total paymentMethod paymentDetails')
        .sort('-date');

    res.status(200).json({
        success: true,
        count: bills.length,
        data: bills
    });
});

// @desc    Refund payment
// @route   POST /api/v1/billing/:id/refund
// @access  Private (Admin)
exports.refundPayment = asyncHandler(async (req, res, next) => {
    const bill = await Billing.findById(req.params.id);

    if (!bill) {
        return next(new ErrorResponse(`Bill not found with id of ${req.params.id}`, 404));
    }

    if (bill.status !== 'paid') {
        return next(new ErrorResponse('Only paid bills can be refunded', 400));
    }

    // Update payment status
    bill.paymentDetails.paymentStatus = 'refunded';
    bill.status = 'refunded';
    await bill.save();

    // Send refund confirmation email
    try {
        await sendEmail({
            email: bill.patient.email,
            subject: 'Payment Refund',
            message: `Your payment of ${bill.total} for invoice ${bill.invoiceNumber} has been refunded`
        });
    } catch (err) {
        console.log('Email could not be sent');
    }

    res.status(200).json({
        success: true,
        data: bill
    });
}); 
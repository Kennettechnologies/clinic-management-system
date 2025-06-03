const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    items: [{
        description: String,
        quantity: {
            type: Number,
            default: 1
        },
        unitPrice: Number,
        amount: Number,
        type: {
            type: String,
            enum: ['consultation', 'procedure', 'medication', 'lab_test', 'other']
        },
        taxRate: {
            type: Number,
            default: 0
        },
        taxAmount: {
            type: Number,
            default: 0
        }
    }],
    subtotal: {
        type: Number,
        required: true
    },
    tax: {
        rate: {
            type: Number,
            default: 0
        },
        amount: {
            type: Number,
            default: 0
        }
    },
    discount: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'insurance', 'online', 'other']
    },
    paymentDetails: {
        transactionId: String,
        paymentDate: Date,
        paymentStatus: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded']
        },
        paymentGateway: String,
        cardLast4: String
    },
    insurance: {
        provider: String,
        policyNumber: String,
        claimNumber: String,
        claimStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'paid']
        },
        coverageAmount: Number,
        patientResponsibility: Number
    },
    notes: String,
    attachments: [{
        type: {
            type: String,
            enum: ['receipt', 'insurance_claim', 'prescription', 'other']
        },
        name: String,
        url: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Add indexes for frequently queried fields
billingSchema.index({ patient: 1, date: -1 });
billingSchema.index({ invoiceNumber: 1 });
billingSchema.index({ status: 1 });
billingSchema.index({ dueDate: 1 });

// Calculate totals before saving
billingSchema.pre('save', function(next) {
    // Calculate item totals
    this.items.forEach(item => {
        item.amount = item.quantity * item.unitPrice;
        item.taxAmount = item.amount * (item.taxRate / 100);
    });

    // Calculate subtotal
    this.subtotal = this.items.reduce((sum, item) => sum + item.amount, 0);

    // Calculate tax
    this.tax.amount = this.items.reduce((sum, item) => sum + item.taxAmount, 0);

    // Calculate total
    this.total = this.subtotal + this.tax.amount - this.discount;

    next();
});

// Virtual for checking if invoice is overdue
billingSchema.virtual('isOverdue').get(function() {
    return this.status === 'pending' && new Date() > this.dueDate;
});

// Virtual for getting days until due
billingSchema.virtual('daysUntilDue').get(function() {
    const today = new Date();
    const due = new Date(this.dueDate);
    return Math.ceil((due - today) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Billing', billingSchema); 
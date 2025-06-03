const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: 'Category',
        required: true
    },
    quantity: {
        type: Number,
        required: [true, 'Please add a quantity'],
        min: [0, 'Quantity cannot be negative']
    },
    unit: {
        type: String,
        required: [true, 'Please add a unit'],
        enum: ['piece', 'box', 'pack', 'bottle', 'kit', 'other']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: [0, 'Price cannot be negative']
    },
    lowStockThreshold: {
        type: Number,
        required: [true, 'Please add a low stock threshold'],
        min: [0, 'Threshold cannot be negative']
    },
    location: {
        type: String,
        required: [true, 'Please add a location'],
        maxlength: [100, 'Location cannot be more than 100 characters']
    },
    supplier: {
        name: {
            type: String,
            required: [true, 'Please add a supplier name']
        },
        contact: {
            type: String,
            required: [true, 'Please add a supplier contact']
        },
        email: {
            type: String,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        }
    },
    expiryDate: {
        type: Date
    },
    batchNumber: {
        type: String
    },
    stockHistory: [{
        type: {
            type: String,
            enum: ['add', 'remove'],
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        reason: {
            type: String,
            required: true
        },
        updatedBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    stockAlerts: [{
        threshold: {
            type: Number,
            required: true
        },
        email: {
            type: String,
            required: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    lastUpdatedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp before saving
InventorySchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Inventory', InventorySchema); 
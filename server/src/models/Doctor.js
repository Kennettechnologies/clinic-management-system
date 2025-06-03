const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    qualifications: [{
        degree: String,
        institution: String,
        year: Number,
        country: String
    }],
    license: {
        number: {
            type: String,
            required: true,
            unique: true
        },
        issuingAuthority: String,
        issueDate: Date,
        expiryDate: Date,
        status: {
            type: String,
            enum: ['active', 'suspended', 'expired'],
            default: 'active'
        }
    },
    experience: {
        years: Number,
        previousHospitals: [{
            name: String,
            position: String,
            from: Date,
            to: Date
        }]
    },
    schedule: {
        workingDays: [{
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
        }],
        workingHours: {
            start: String,
            end: String
        },
        breakTime: {
            start: String,
            end: String
        },
        appointmentDuration: {
            type: Number,
            default: 30 // in minutes
        }
    },
    consultationFee: {
        amount: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    languages: [{
        type: String
    }],
    services: [{
        name: String,
        description: String,
        duration: Number, // in minutes
        fee: Number
    }],
    availability: {
        type: Boolean,
        default: true
    },
    ratings: [{
        patient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        review: String,
        date: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    documents: [{
        type: {
            type: String,
            enum: ['certificate', 'license', 'insurance', 'other']
        },
        name: String,
        url: String,
        uploadDate: {
            type: Date,
            default: Date.now
        },
        expiryDate: Date
    }],
    notes: String
}, {
    timestamps: true
});

// Add indexes for frequently queried fields
doctorSchema.index({ user: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ 'license.number': 1 });

// Calculate average rating before saving
doctorSchema.pre('save', function(next) {
    if (this.ratings.length > 0) {
        this.averageRating = this.ratings.reduce((acc, item) => acc + item.rating, 0) / this.ratings.length;
        this.totalRatings = this.ratings.length;
    }
    next();
});

module.exports = mongoose.model('Doctor', doctorSchema); 
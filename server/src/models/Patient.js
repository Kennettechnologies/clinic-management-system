const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    bloodGroup: {
        type: String,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        required: true
    },
    height: {
        value: Number,
        unit: {
            type: String,
            enum: ['cm', 'ft'],
            default: 'cm'
        }
    },
    weight: {
        value: Number,
        unit: {
            type: String,
            enum: ['kg', 'lbs'],
            default: 'kg'
        }
    },
    allergies: [{
        name: String,
        severity: {
            type: String,
            enum: ['mild', 'moderate', 'severe']
        },
        notes: String
    }],
    chronicConditions: [{
        name: String,
        diagnosisDate: Date,
        status: {
            type: String,
            enum: ['active', 'inactive', 'resolved']
        },
        notes: String
    }],
    medications: [{
        name: String,
        dosage: String,
        frequency: String,
        startDate: Date,
        endDate: Date,
        prescribedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        notes: String
    }],
    familyHistory: [{
        relation: {
            type: String,
            enum: ['father', 'mother', 'sibling', 'grandparent', 'other']
        },
        condition: String,
        notes: String
    }],
    insurance: {
        provider: String,
        policyNumber: String,
        groupNumber: String,
        coverageDetails: String,
        validUntil: Date
    },
    emergencyContact: {
        name: String,
        relationship: String,
        phoneNumber: String,
        address: String
    },
    documents: [{
        type: {
            type: String,
            enum: ['test_result', 'prescription', 'medical_report', 'insurance', 'other']
        },
        name: String,
        url: String,
        uploadDate: {
            type: Date,
            default: Date.now
        },
        notes: String
    }],
    familyMembers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        relationship: {
            type: String,
            enum: ['spouse', 'child', 'parent', 'sibling', 'other']
        }
    }],
    preferredPharmacy: {
        name: String,
        address: String,
        phoneNumber: String
    },
    notes: String
}, {
    timestamps: true
});

// Add indexes for frequently queried fields
patientSchema.index({ user: 1 });
patientSchema.index({ 'insurance.policyNumber': 1 });

module.exports = mongoose.model('Patient', patientSchema); 
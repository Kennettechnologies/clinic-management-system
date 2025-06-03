const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment'
    },
    date: {
        type: Date,
        default: Date.now
    },
    // SOAP Format
    subjective: {
        chiefComplaint: String,
        historyOfPresentIllness: String,
        pastMedicalHistory: String,
        familyHistory: String,
        socialHistory: String,
        reviewOfSystems: String
    },
    objective: {
        vitalSigns: {
            bloodPressure: String,
            heartRate: Number,
            temperature: Number,
            respiratoryRate: Number,
            oxygenSaturation: Number,
            weight: Number,
            height: Number
        },
        physicalExamination: String,
        labResults: [{
            testName: String,
            result: String,
            unit: String,
            referenceRange: String,
            date: Date,
            lab: String
        }],
        imagingResults: [{
            type: String,
            description: String,
            date: Date,
            facility: String,
            url: String
        }]
    },
    assessment: {
        diagnoses: [{
            condition: String,
            icd10Code: String,
            status: {
                type: String,
                enum: ['active', 'resolved', 'chronic']
            },
            notes: String
        }],
        differentialDiagnoses: [{
            condition: String,
            probability: {
                type: String,
                enum: ['high', 'medium', 'low']
            }
        }]
    },
    plan: {
        medications: [{
            name: String,
            dosage: String,
            frequency: String,
            duration: String,
            instructions: String,
            prescribedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        procedures: [{
            name: String,
            description: String,
            date: Date,
            performedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        followUp: {
            required: Boolean,
            date: Date,
            reason: String
        },
        referrals: [{
            specialist: String,
            reason: String,
            priority: {
                type: String,
                enum: ['routine', 'urgent']
            }
        }],
        patientEducation: [{
            topic: String,
            materials: [{
                type: String,
                url: String
            }]
        }]
    },
    attachments: [{
        type: {
            type: String,
            enum: ['image', 'document', 'lab_result', 'prescription', 'other']
        },
        name: String,
        url: String,
        uploadDate: {
            type: Date,
            default: Date.now
        }
    }],
    notes: String,
    status: {
        type: String,
        enum: ['draft', 'final', 'amended'],
        default: 'draft'
    },
    lastModifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Add indexes for frequently queried fields
medicalRecordSchema.index({ patient: 1, date: -1 });
medicalRecordSchema.index({ doctor: 1, date: -1 });
medicalRecordSchema.index({ appointment: 1 });

// Virtual for getting the full SOAP note
medicalRecordSchema.virtual('soapNote').get(function() {
    return {
        subjective: this.subjective,
        objective: this.objective,
        assessment: this.assessment,
        plan: this.plan
    };
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema); 
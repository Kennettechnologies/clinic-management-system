const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    type: {
        type: String,
        enum: ['in-person', 'video', 'phone'],
        default: 'in-person'
    },
    reason: {
        type: String,
        required: true
    },
    notes: String,
    symptoms: [{
        type: String
    }],
    priority: {
        type: String,
        enum: ['routine', 'urgent', 'emergency'],
        default: 'routine'
    },
    reminders: [{
        type: {
            type: String,
            enum: ['email', 'sms', 'push']
        },
        sent: {
            type: Boolean,
            default: false
        },
        scheduledFor: Date,
        sentAt: Date
    }],
    followUp: {
        required: {
            type: Boolean,
            default: false
        },
        date: Date,
        notes: String
    },
    cancellation: {
        reason: String,
        cancelledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        cancelledAt: Date
    },
    payment: {
        status: {
            type: String,
            enum: ['pending', 'completed', 'refunded'],
            default: 'pending'
        },
        amount: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        method: {
            type: String,
            enum: ['cash', 'card', 'insurance', 'online']
        },
        transactionId: String,
        paidAt: Date
    }
}, {
    timestamps: true
});

// Add indexes for frequently queried fields
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ date: 1 });

// Virtual for checking if appointment is in the past
appointmentSchema.virtual('isPast').get(function() {
    return new Date(this.date) < new Date();
});

// Virtual for checking if appointment is today
appointmentSchema.virtual('isToday').get(function() {
    const today = new Date();
    const appointmentDate = new Date(this.date);
    return today.toDateString() === appointmentDate.toDateString();
});

// Method to check if appointment time slot is available
appointmentSchema.statics.isSlotAvailable = async function(doctorId, date, startTime, endTime) {
    const existingAppointment = await this.findOne({
        doctor: doctorId,
        date: date,
        status: { $in: ['scheduled', 'confirmed'] },
        $or: [
            {
                startTime: { $lt: endTime },
                endTime: { $gt: startTime }
            }
        ]
    });
    return !existingAppointment;
};

module.exports = mongoose.model('Appointment', appointmentSchema); 
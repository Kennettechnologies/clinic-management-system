const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    role: {
        type: String,
        enum: ['admin', 'doctor', 'nurse', 'receptionist', 'patient'],
        required: false
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'urgent', 'success'],
        default: 'info'
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        trim: true,
        maxlength: [500, 'Message cannot be more than 500 characters']
    },
    link: {
        type: String,
        required: false
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create index for faster queries
NotificationSchema.index({ recipient: 1, read: 1 });
NotificationSchema.index({ role: 1, read: 1 });

module.exports = mongoose.model('Notification', NotificationSchema); 
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from the token
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized to access this route'
        });
    }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

// Check if user is the owner of the resource
exports.checkOwnership = (model) => {
    return async (req, res, next) => {
        try {
            const resource = await model.findById(req.params.id);

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    message: 'Resource not found'
                });
            }

            // Check if user is admin or the owner of the resource
            if (req.user.role !== 'admin' && resource.user.toString() !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'Not authorized to access this resource'
                });
            }

            req.resource = resource;
            next();
        } catch (err) {
            return res.status(500).json({
                success: false,
                message: 'Error checking resource ownership'
            });
        }
    };
};

// Check if user has access to patient data
exports.checkPatientAccess = async (req, res, next) => {
    try {
        const patientId = req.params.patientId || req.body.patientId;

        if (!patientId) {
            return res.status(400).json({
                success: false,
                message: 'Patient ID is required'
            });
        }

        // Admin and doctors have full access
        if (req.user.role === 'admin' || req.user.role === 'doctor') {
            return next();
        }

        // Nurses and receptionists have limited access
        if (req.user.role === 'nurse' || req.user.role === 'receptionist') {
            // Add specific access rules for nurses and receptionists
            return next();
        }

        // Patients can only access their own data
        if (req.user.role === 'patient' && req.user.id === patientId) {
            return next();
        }

        return res.status(403).json({
            success: false,
            message: 'Not authorized to access this patient data'
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Error checking patient access'
        });
    }
}; 
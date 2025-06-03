const express = require('express');
const {
    register,
    login,
    getMe,
    updateDetails,
    updatePassword,
    forgotPassword,
    resetPassword,
    logout,
    generateTwoFactorSecret,
    verifyTwoFactor,
    validateTwoFactor
} = require('../controllers/auth');

const router = express.Router();

const { protect } = require('../middleware/auth');
const auditLog = require('../middleware/audit');

// Public routes
router.post('/register', auditLog('CREATE', 'USER'), register);
router.post('/login', auditLog('LOGIN', 'USER'), login);
router.post('/forgotpassword', auditLog('CREATE', 'PASSWORD_RESET'), forgotPassword);
router.put('/resetpassword/:resettoken', auditLog('UPDATE', 'PASSWORD'), resetPassword);
router.post('/2fa/validate', auditLog('LOGIN', '2FA'), validateTwoFactor);

// Protected routes
router.get('/me', protect, auditLog('VIEW', 'USER'), getMe);
router.put('/updatedetails', protect, auditLog('UPDATE', 'USER'), updateDetails);
router.put('/updatepassword', protect, auditLog('UPDATE', 'PASSWORD'), updatePassword);
router.get('/logout', protect, auditLog('LOGOUT', 'USER'), logout);

// 2FA routes
router.post('/2fa/generate', protect, auditLog('CREATE', '2FA'), generateTwoFactorSecret);
router.post('/2fa/verify', protect, auditLog('UPDATE', '2FA'), verifyTwoFactor);

module.exports = router; 
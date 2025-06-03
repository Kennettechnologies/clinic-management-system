const AuditLog = require('../models/AuditLog');

const auditLog = (action, resource) => async (req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    res.send = originalSend;
    const result = res.send.call(this, data);

    // Only log successful operations
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const auditData = {
        user: req.user.id,
        action,
        resource,
        resourceId: req.params.id,
        details: JSON.stringify(req.body),
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      };

      AuditLog.create(auditData).catch(err => {
        console.error('Audit logging failed:', err);
      });
    }

    return result;
  };

  next();
};

module.exports = auditLog; 
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// In a real scenario, use securely generated RSA keys. 
// For prototype, we generate a mock secret.
const JWT_SECRET = 'samadhanpath-prototype-secret-key-2026';

function generateConsent({ masterId, requestingDepartment, sourceDepartment, purpose, requestedFields }) {
  const payload = {
    masterId,
    requestingDepartment,
    sourceDepartment,
    purpose,
    requestedFields,
    status: 'ACTIVE'
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
  const consentId = `CONSENT-${Date.now()}`;
  
  return {
    consentId,
    token,
    payload,
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 3600 * 1000).toISOString()
  };
}

function verifyConsent(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

module.exports = {
  generateConsent,
  verifyConsent
};

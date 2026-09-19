const crypto = require('crypto');

let auditLogs = [];
let previousHash = 'GENESIS';

function hashEvent(timestamp, masterId, action, consentId, prevHash) {
  const dataString = `${prevHash}${timestamp}${masterId}${action}${consentId || ''}`;
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

function logEvent({ actor, masterId, department, action, endpoint, consentId, result }) {
  const timestamp = new Date().toISOString();
  const currentHash = hashEvent(timestamp, masterId, action, consentId, previousHash);
  
  const logEntry = {
    auditId: `AUDIT-${Date.now()}`,
    timestamp,
    actor,
    masterId,
    department,
    action,
    endpoint,
    consentId,
    result,
    previousHash,
    currentHash
  };

  auditLogs.push(logEntry);
  previousHash = currentHash; // Update chain
  
  // Log to console for prototype visibility
  console.log(`[AUDIT] ${timestamp} | ${action} | ${department} | Result: ${result}`);
  
  return logEntry;
}

function getLogs() {
  return auditLogs;
}

function verifyIntegrity() {
  let tempPrevHash = 'GENESIS';
  let tamperedRecords = [];
  
  for (let log of auditLogs) {
    if (log.previousHash !== tempPrevHash) {
      tamperedRecords.push(log.auditId);
    }
    const computedHash = hashEvent(log.timestamp, log.masterId, log.action, log.consentId, tempPrevHash);
    if (log.currentHash !== computedHash) {
      tamperedRecords.push(log.auditId);
    }
    tempPrevHash = log.currentHash;
  }
  
  return {
    valid: tamperedRecords.length === 0,
    recordsChecked: auditLogs.length,
    tamperedRecords
  };
}

module.exports = {
  logEvent,
  getLogs,
  verifyIntegrity
};

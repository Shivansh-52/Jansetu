const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const { generateConsent, verifyConsent } = require('./consent');
const { logEvent, getLogs, verifyIntegrity } = require('./audit');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Mock database for Gateway mappings (Master ID -> Department IDs)
const identityMappings = {
  'SP-000001': {
    education: 'EDU-92831',
    publicServices: 'PS-18291',
    healthcare: 'HC-77321',
    agriculture: 'AGR-56221'
  },
  'SP-000002': {
    education: 'EDU-92832',
    publicServices: 'PS-18292'
  }
};

let circuitState = {
  'public-services': 'CLOSED', // CLOSED, OPEN, HALF-OPEN
};

app.get('/api/health', (req, res) => {
  res.json({ status: 'ONLINE', service: 'Gateway', circuitState });
});

// Auth
app.post('/api/auth', (req, res) => {
  const { masterId } = req.body;
  if (identityMappings[masterId]) {
    logEvent({ actor: masterId, masterId, department: 'Gateway', action: 'LOGIN', result: 'SUCCESS' });
    res.json({ success: true, masterId, connectedServices: Object.keys(identityMappings[masterId]) });
  } else {
    logEvent({ actor: 'UNKNOWN', masterId: masterId || 'UNKNOWN', department: 'Gateway', action: 'LOGIN', result: 'FAILED' });
    res.status(401).json({ success: false, message: 'Invalid Master ID' });
  }
});

// 1. Consent Request
app.post('/api/consent/request', (req, res) => {
  const { masterId, requestingDepartment, sourceDepartment, purpose, requestedFields } = req.body;
  
  const consent = generateConsent({
    masterId,
    requestingDepartment,
    sourceDepartment,
    purpose,
    requestedFields
  });
  
  logEvent({ actor: masterId, masterId, department: 'Gateway', action: 'CONSENT_CREATED', consentId: consent.consentId, result: 'SUCCESS' });
  
  res.json({ success: true, consent });
});

// 2. Scholarship Workflow (Orchestration)
app.post('/api/education/scholarship', async (req, res) => {
  const { masterId, consentToken, studentName, category } = req.body;
  
  try {
    logEvent({ actor: masterId, masterId, department: 'Gateway', action: 'APPLICATION_SUBMITTED', result: 'STARTED' });
    
    // Validate Consent
    const consentCheck = verifyConsent(consentToken);
    if (!consentCheck.valid) {
      logEvent({ actor: masterId, masterId, department: 'Gateway', action: 'CONSENT_VERIFIED', result: 'DENIED' });
      return res.status(403).json({ success: false, message: 'Invalid or expired consent' });
    }
    
    logEvent({ actor: masterId, masterId, department: 'Gateway', action: 'CONSENT_VERIFIED', consentId: consentCheck.decoded.consentId, result: 'APPROVED' });
    
    // Circuit Breaker Check
    if (circuitState['public-services'] === 'OPEN') {
      return res.status(503).json({ success: false, message: 'Public Services temporarily unavailable' });
    }

    // Call Public Services to verify income
    const psId = identityMappings[masterId]?.publicServices;
    if (!psId) return res.status(404).json({ success: false, message: 'Public Services Identity not found' });

    let incomeResponse;
    try {
      logEvent({ actor: 'Gateway', masterId, department: 'PublicServices', action: 'DATA_REQUEST', result: 'INITIATED' });
      const psRes = await axios.get(`http://localhost:4005/api/income/verify/${psId}`);
      incomeResponse = psRes.data;
      logEvent({ actor: 'PublicServices', masterId, department: 'Gateway', action: 'DATA_ACCESSED', result: 'SUCCESS' });
    } catch (err) {
      // Basic circuit breaker trigger
      circuitState['public-services'] = 'OPEN';
      logEvent({ actor: 'Gateway', masterId, department: 'PublicServices', action: 'API_FAILURE', result: 'CIRCUIT_OPENED' });
      return res.status(503).json({ success: false, message: 'Error communicating with Public Services' });
    }
    
    // Transform Data (Common Data Model mapping)
    logEvent({ actor: 'Gateway', masterId, department: 'Gateway', action: 'DATA_TRANSFORMED', result: 'SUCCESS' });

    // Call Education API to submit
    const eduRes = await axios.post('http://localhost:4001/api/scholarships', {
      studentName, // CDM standardized name
      category,
      incomeStatus: incomeResponse,
      consentId: consentCheck.decoded.consentId
    });
    
    logEvent({ actor: 'Education', masterId, department: 'Gateway', action: 'APPLICATION_CREATED', result: 'SUCCESS' });
    
    res.json({ success: true, trackingId: eduRes.data.applicationId, application: eduRes.data.application });
    
  } catch (error) {
    console.error(error);
    logEvent({ actor: 'System', masterId, department: 'Gateway', action: 'ERROR', result: 'FAILED' });
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// Audit Endpoints
app.get('/api/audit/logs', (req, res) => {
  res.json(getLogs());
});

app.get('/api/audit/verify-integrity', (req, res) => {
  res.json(verifyIntegrity());
});

// Circuit Breaker Admin
app.post('/api/admin/circuit/:service/:state', (req, res) => {
  const { service, state } = req.params;
  if (['OPEN', 'CLOSED', 'HALF-OPEN'].includes(state.toUpperCase())) {
    circuitState[service] = state.toUpperCase();
    res.json({ success: true, circuitState });
  } else {
    res.status(400).json({ success: false, message: 'Invalid state' });
  }
});

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});

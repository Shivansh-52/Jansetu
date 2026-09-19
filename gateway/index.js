require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.POSTGRES_GATEWAY_URL
});

// Setup DB and Seed Data
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS citizens (
                master_id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(100),
                mobile VARCHAR(20),
                password VARCHAR(100)
            );
            
            CREATE TABLE IF NOT EXISTS master_identity_mappings (
                master_id VARCHAR(50) REFERENCES citizens(master_id),
                education_id VARCHAR(50),
                healthcare_id VARCHAR(50),
                agriculture_id VARCHAR(50),
                infrastructure_id VARCHAR(50),
                public_services_id VARCHAR(50),
                PRIMARY KEY (master_id)
            );
            
            CREATE TABLE IF NOT EXISTS consent_logs (
                consent_id SERIAL PRIMARY KEY,
                master_id VARCHAR(50),
                requesting_department VARCHAR(100),
                source_department VARCHAR(100),
                data_requested VARCHAR(200),
                purpose TEXT,
                decision VARCHAR(20),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS audit_logs (
                log_id SERIAL PRIMARY KEY,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                master_id VARCHAR(50),
                department VARCHAR(100),
                endpoint VARCHAR(200),
                action VARCHAR(100),
                result VARCHAR(50)
            );
        `);
        
        const check = await pool.query('SELECT COUNT(*) FROM citizens');
        if (parseInt(check.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO citizens (master_id, name, mobile, password)
                VALUES 
                ('SP-000001', 'Rahul Kumar', '9876543210', 'Demo@123'),
                ('SP-000002', 'Priya Sharma', '9876543211', 'Demo@123'),
                ('SP-000003', 'Amit Patel', '9876543212', 'Demo@123')
            `);
            
            await pool.query(`
                INSERT INTO master_identity_mappings (master_id, education_id, healthcare_id, agriculture_id, infrastructure_id, public_services_id)
                VALUES
                ('SP-000001', 'EDU-1001', 'PAT-5001', 'FAR-7001', 'CIT-9001', 'APP-3001'),
                ('SP-000002', 'EDU-1002', 'PAT-5002', 'FAR-7002', 'CIT-9002', 'APP-3002'),
                ('SP-000003', 'EDU-1003', 'PAT-5003', 'FAR-7003', 'CIT-9003', 'APP-3003')
            `);
            console.log('Gateway DB initialized and seeded');
        }
    } catch (err) {
        console.error('Error initializing Gateway DB:', err);
    }
}
initDB();

// Middleware for audit logging
const auditLog = async (master_id, department, endpoint, action, result) => {
    try {
        await pool.query(
            'INSERT INTO audit_logs (master_id, department, endpoint, action, result) VALUES ($1, $2, $3, $4, $5)',
            [master_id, department, endpoint, action, result]
        );
    } catch (err) {
        console.error('Audit log error', err);
    }
};

// APIs
app.get('/api/system/health', async (req, res) => {
    const checkService = async (url) => {
        try {
            await axios.get(`${url}/api/health`, { timeout: 2000 });
            return 'online';
        } catch {
            return 'offline';
        }
    };
    
    const status = {
        education: await checkService(process.env.EDUCATION_SERVICE_URL),
        healthcare: await checkService(process.env.HEALTHCARE_SERVICE_URL),
        agriculture: await checkService(process.env.AGRICULTURE_SERVICE_URL),
        infrastructure: await checkService(process.env.INFRASTRUCTURE_SERVICE_URL),
        publicServices: await checkService(process.env.PUBLIC_SERVICES_URL),
        gateway: 'online'
    };
    res.json(status);
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const result = await pool.query('SELECT * FROM citizens WHERE master_id = $1 OR mobile = $1', [identifier]);
        if (result.rows.length === 0 || result.rows[0].password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        res.json({
            token: 'mock-jwt-token',
            user: { master_id: user.master_id, name: user.name, mobile: user.mobile, role: 'citizen' }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper to get mappings
const getMapping = async (masterId) => {
    const res = await pool.query('SELECT * FROM master_identity_mappings WHERE master_id = $1', [masterId]);
    return res.rows[0] || {};
};

// ==========================================
// AUDIT & CONSENT ROUTES (for Dashboard)
// ==========================================
app.get('/api/admin/audit-logs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 50');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/consent-logs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM consent_logs ORDER BY timestamp DESC LIMIT 50');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// PROXY & TRANSFORMATION ROUTES
// ==========================================

// Education Profile & Documents
app.get('/api/proxy/education/profile/:masterId', async (req, res) => {
    try {
        const map = await getMapping(req.params.masterId);
        if (!map.education_id) return res.status(404).json({ error: 'No education record mapped' });
        
        const response = await axios.get(`${process.env.EDUCATION_SERVICE_URL}/api/students/${map.education_id}`);
        // Transform
        const commonData = {
            masterId: req.params.masterId,
            name: response.data.student_name,
            dob: response.data.date_of_birth,
            domain: 'Education',
            details: response.data
        };
        await auditLog(req.params.masterId, 'Education', '/api/students', 'READ_PROFILE', 'SUCCESS');
        res.json(commonData);
    } catch (err) {
        await auditLog(req.params.masterId, 'Education', '/api/students', 'READ_PROFILE', 'FAILED');
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/proxy/education/documents/:masterId', async (req, res) => {
    try {
        const map = await getMapping(req.params.masterId);
        const response = await axios.get(`${process.env.EDUCATION_SERVICE_URL}/api/students/${map.education_id}/documents`);
        // Transform
        const docs = response.data.map(d => ({
            documentType: d.document_type,
            documentNumber: d.document_number,
            sourceDepartment: 'Education',
            verificationStatus: d.verification_status
        }));
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Public Services Profile & Certificates
app.get('/api/proxy/public-services/certificates/:masterId', async (req, res) => {
    try {
        const map = await getMapping(req.params.masterId);
        const response = await axios.get(`${process.env.PUBLIC_SERVICES_URL}/api/applicants/${map.public_services_id}/certificates`);
        // Transform
        const docs = response.data.map(d => ({
            documentType: d.certificate_type,
            documentNumber: d.certificate_number,
            sourceDepartment: 'Public Services',
            verificationStatus: d.verification_status
        }));
        await auditLog(req.params.masterId, 'Public Services', '/api/certificates', 'READ_CERTS', 'SUCCESS');
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Scholarship Application (Main Demo)
app.post('/api/proxy/education/scholarships', async (req, res) => {
    try {
        const { masterId, scheme_name, annual_family_income, consent_id } = req.body;
        
        // Log consent if provided
        if (consent_id) {
            await pool.query(
                'INSERT INTO consent_logs (master_id, requesting_department, source_department, data_requested, purpose, decision) VALUES ($1, $2, $3, $4, $5, $6)',
                [masterId, 'Education', 'Public Services', 'Income Certificate', 'Scholarship Application', 'ALLOW']
            );
        }

        const map = await getMapping(masterId);
        const response = await axios.post(`${process.env.EDUCATION_SERVICE_URL}/api/scholarships`, {
            student_id: map.education_id,
            scheme_name,
            annual_family_income
        });

        // Transform response
        const appRecord = {
            trackingId: `SP-EDU-2026-${response.data.scholarship_id.split('-')[1]}`,
            masterId,
            domain: 'Education',
            departmentId: response.data.scholarship_id,
            status: response.data.status
        };
        
        await auditLog(masterId, 'Education', '/api/scholarships', 'SUBMIT_APP', 'SUCCESS');
        res.json(appRecord);
    } catch (err) {
        await auditLog(req.body.masterId, 'Education', '/api/scholarships', 'SUBMIT_APP', 'FAILED');
        res.status(500).json({ error: err.message });
    }
});

// Healthcare
app.get('/api/proxy/healthcare/profile/:masterId', async (req, res) => {
    try {
        const map = await getMapping(req.params.masterId);
        const response = await axios.get(`${process.env.HEALTHCARE_SERVICE_URL}/api/patients/${map.healthcare_id}`);
        const commonData = {
            masterId: req.params.masterId,
            name: response.data.fullName,
            dob: response.data.dateOfBirth,
            domain: 'Healthcare',
            healthId: response.data.healthId,
            details: response.data
        };
        res.json(commonData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Agriculture
app.get('/api/proxy/agriculture/profile/:masterId', async (req, res) => {
    try {
        const map = await getMapping(req.params.masterId);
        const response = await axios.get(`${process.env.AGRICULTURE_SERVICE_URL}/api/farmers/${map.agriculture_id}`);
        const commonData = {
            masterId: req.params.masterId,
            name: response.data.farmer_name,
            domain: 'Agriculture',
            details: response.data
        };
        res.json(commonData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.GATEWAY_PORT || 5000;
app.listen(PORT, () => console.log(`Gateway Service running on port ${PORT}`));

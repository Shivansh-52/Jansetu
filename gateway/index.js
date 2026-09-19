require('dotenv').config({ path: './.env' });
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
                full_name VARCHAR(100),
                mobile VARCHAR(20),
                email VARCHAR(100),
                dob DATE,
                district VARCHAR(100),
                state VARCHAR(100),
                pincode VARCHAR(20),
                password VARCHAR(100),
                email_verified BOOLEAN DEFAULT FALSE,
                phone_verified BOOLEAN DEFAULT FALSE,
                status VARCHAR(20) DEFAULT 'ACTIVE',
                role VARCHAR(20) DEFAULT 'CITIZEN'
            );
            
            CREATE TABLE IF NOT EXISTS master_identity_mappings (
                master_id VARCHAR(50) REFERENCES citizens(master_id),
                education_id VARCHAR(50),
                healthcare_id VARCHAR(50),
                agriculture_id VARCHAR(50),
                infrastructure_id VARCHAR(50),
                public_services_id VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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
                request_id VARCHAR(50),
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                master_id VARCHAR(50),
                source_service VARCHAR(100),
                target_service VARCHAR(100),
                endpoint VARCHAR(200),
                purpose TEXT,
                fields_requested VARCHAR(200),
                consent_status VARCHAR(20),
                result VARCHAR(50)
            );
        
        console.log('Gateway DB initialized');
    } catch (err) {
        console.error('Error initializing Gateway DB:', err);
    }
}
initDB();

const auditLog = async (request_id, master_id, source_service, target_service, endpoint, purpose, fields_requested, consent_status, result) => {
    try {
        await pool.query(
            'INSERT INTO audit_logs (request_id, master_id, source_service, target_service, endpoint, purpose, fields_requested, consent_status, result) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
            [request_id, master_id, source_service, target_service, endpoint, purpose, fields_requested, consent_status, result]
        );
    } catch (err) {}
};

app.get('/api/health-stats', async (req, res) => {
    try {
        const counts = await pool.query('SELECT COUNT(*) FROM citizens');
        res.json({
            service: 'Master DB (Gateway)',
            technology: 'PostgreSQL',
            records: parseInt(counts.rows[0].count),
            documents: 0,
            status: 'CONNECTED'
        });
    } catch (e) {
        res.json({ service: 'Master DB (Gateway)', status: 'ERROR' });
    }
});

app.get('/api/monitor', async (req, res) => {
    try {
        const fetchStat = async (url) => {
            try { return (await axios.get(url)).data; }
            catch (e) { return { status: 'ERROR', error: e.message }; }
        };
        const [gateway, edu, hlt, agr, inf, pub] = await Promise.all([
            fetchStat(`http://localhost:${process.env.GATEWAY_PORT || 5000}/api/health-stats`),
            fetchStat(`${process.env.EDUCATION_SERVICE_URL}/api/health-stats`),
            fetchStat(`${process.env.HEALTHCARE_SERVICE_URL}/api/health-stats`),
            fetchStat(`${process.env.AGRICULTURE_SERVICE_URL}/api/health-stats`),
            fetchStat(`${process.env.INFRASTRUCTURE_SERVICE_URL}/api/health-stats`),
            fetchStat(`${process.env.PUBLIC_SERVICES_URL}/api/health-stats`)
        ]);
        res.json([gateway, edu, hlt, agr, inf, pub]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, dob, district, state, password } = req.body;
        const master_id = 'SP-' + Math.floor(Math.random() * 900000 + 100000);

        // 1. Save Master Record
        await pool.query(
            'INSERT INTO citizens (master_id, name, mobile, email, dob, district, state, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [master_id, name, phone, email, dob, district, state, password]
        );

        // 2. Distribute data to departments
        // Education
        const eduRes = await axios.post(`${process.env.EDUCATION_SERVICE_URL}/api/students`, {
            student_name: name,
            date_of_birth: dob,
            district
        }).catch(() => ({ data: { student_id: null }}));

        // Healthcare
        const hltRes = await axios.post(`${process.env.HEALTHCARE_SERVICE_URL}/api/patients`, {
            patientName: name,
            dob: dob,
            contact: phone
        }).catch(() => ({ data: { patientId: null }}));

        // Agriculture
        const agrRes = await axios.post(`${process.env.AGRICULTURE_SERVICE_URL}/api/farmers`, {
            farmer_name: name,
            phone_no: phone,
            district
        }).catch(() => ({ data: { farmer_id: null }}));

        // Infrastructure
        const infRes = await axios.post(`${process.env.INFRASTRUCTURE_SERVICE_URL}/api/citizens`, {
            name: name
        }).catch(() => ({ data: { citizen_ref: null }}));

        // Public Services
        const pubRes = await axios.post(`${process.env.PUBLIC_SERVICES_URL}/api/applicants`, {
            full_name: name,
            mobile: phone
        }).catch(() => ({ data: { applicant_id: null }}));

        // 3. Save Mappings
        await pool.query(
            'INSERT INTO master_identity_mappings (master_id, education_id, healthcare_id, agriculture_id, infrastructure_id, public_services_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [master_id, eduRes.data.student_id, hltRes.data.patientId, agrRes.data.farmer_id, infRes.data.citizen_ref, pubRes.data.applicant_id]
        );

        res.status(201).json({ master_id, success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const result = await pool.query('SELECT * FROM citizens WHERE master_id = $1 OR mobile = $1 OR email = $1', [identifier]);
        if (result.rows.length === 0 || result.rows[0].password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const user = result.rows[0];
        res.json({
            token: 'mock-jwt-token',
            user: { master_id: user.master_id, name: user.name, mobile: user.mobile }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/citizen/me/records', async (req, res) => {
    try {
        const masterId = req.query.master_id; // In real app, from JWT
        if (!masterId) return res.status(400).json({ error: 'Missing master_id' });

        const mapRes = await pool.query('SELECT * FROM master_identity_mappings WHERE master_id = $1', [masterId]);
        const mappings = mapRes.rows[0];
        if (!mappings) return res.status(404).json({ error: 'Mappings not found' });

        const citizenRes = await pool.query('SELECT * FROM citizens WHERE master_id = $1', [masterId]);
        const citizen = citizenRes.rows[0];

        const rawResponses = {};

        // Fetch Parallel
        const fetchDept = async (url, dept, action) => {
            const reqId = 'REQ-' + Date.now();
            try {
                const start = Date.now();
                const response = await axios.get(url);
                await auditLog(reqId, masterId, 'Gateway', dept, url, action, '*', 'AUTHORIZED', 'SUCCESS');
                return { data: response.data, time: Date.now() - start };
            } catch (err) {
                await auditLog(reqId, masterId, 'Gateway', dept, url, action, '*', 'AUTHORIZED', 'FAILED');
                return { data: null, error: err.message };
            }
        };

        const [edu, hlt, agr, inf, pub] = await Promise.all([
            mappings.education_id ? fetchDept(`${process.env.EDUCATION_SERVICE_URL}/api/students/${mappings.education_id}`, 'Education', 'READ_PROFILE') : Promise.resolve({ data: null }),
            mappings.healthcare_id ? fetchDept(`${process.env.HEALTHCARE_SERVICE_URL}/api/patients/${mappings.healthcare_id}`, 'Healthcare', 'READ_PROFILE') : Promise.resolve({ data: null }),
            mappings.agriculture_id ? fetchDept(`${process.env.AGRICULTURE_SERVICE_URL}/api/farmers/${mappings.agriculture_id}`, 'Agriculture', 'READ_PROFILE') : Promise.resolve({ data: null }),
            mappings.infrastructure_id ? fetchDept(`${process.env.INFRASTRUCTURE_SERVICE_URL}/api/citizens/${mappings.infrastructure_id}`, 'Infrastructure', 'READ_PROFILE') : Promise.resolve({ data: null }),
            mappings.public_services_id ? fetchDept(`${process.env.PUBLIC_SERVICES_URL}/api/applicants/${mappings.public_services_id}`, 'Public Services', 'READ_PROFILE') : Promise.resolve({ data: null })
        ]);

        rawResponses.education = edu.data;
        rawResponses.healthcare = hlt.data;
        rawResponses.agriculture = agr.data;
        rawResponses.infrastructure = inf.data;
        rawResponses.publicServices = pub.data;

        // Transformation to Common Data Model
        const commonDataModel = {
            masterId: masterId,
            identity: {
                name: citizen.name,
                dob: citizen.dob,
                phone: citizen.mobile,
                email: citizen.email
            },
            education: edu.data ? {
                studentId: edu.data.student_id,
                institution: edu.data.institution_name,
                course: edu.data.course_name
            } : null,
            healthcare: hlt.data ? {
                patientId: hlt.data.patientId,
                healthId: hlt.data.healthId,
                bloodGroup: hlt.data.bloodGroup
            } : null,
            agriculture: agr.data ? {
                farmerId: agr.data.farmer_id,
                village: agr.data.village,
                district: agr.data.district
            } : null,
            infrastructure: inf.data ? {
                citizenRef: inf.data.citizen_ref
            } : null,
            publicServices: pub.data ? {
                applicantId: pub.data.applicant_id,
                address: pub.data.address
            } : null
        };

        res.json({
            commonDataModel,
            rawResponses,
            logs: [
                { time: new Date().toLocaleTimeString(), message: 'REQUEST RECEIVED: GET /api/citizen/me/records' },
                { time: new Date().toLocaleTimeString(), message: `MASTER ID RESOLVED: ${masterId}` },
                { time: new Date().toLocaleTimeString(), message: `EDUCATION API: GET :4001/api/students/${mappings.education_id} - ${edu.data ? 'SUCCESS 200' : 'FAILED'}` },
                { time: new Date().toLocaleTimeString(), message: `HEALTHCARE API: GET :4002/api/patients/${mappings.healthcare_id} - ${hlt.data ? 'SUCCESS 200' : 'FAILED'}` },
                { time: new Date().toLocaleTimeString(), message: `AGRICULTURE API: GET :4003/api/farmers/${mappings.agriculture_id} - ${agr.data ? 'SUCCESS 200' : 'FAILED'}` },
                { time: new Date().toLocaleTimeString(), message: `INFRASTRUCTURE API: GET :4004/api/citizens/${mappings.infrastructure_id} - ${inf.data ? 'SUCCESS 200' : 'FAILED'}` },
                { time: new Date().toLocaleTimeString(), message: `PUBLIC SERVICES API: GET :4005/api/applicants/${mappings.public_services_id} - ${pub.data ? 'SUCCESS 200' : 'FAILED'}` },
                { time: new Date().toLocaleTimeString(), message: 'DATA TRANSFORMATION: 5 DEPARTMENT RESPONSES → COMMON DATA MODEL' },
                { time: new Date().toLocaleTimeString(), message: 'UNIFIED RESPONSE SENT' }
            ]
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.GATEWAY_PORT || 5000;
app.listen(PORT, () => console.log(`Gateway Service running on port ${PORT}`));

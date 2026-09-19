require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.POSTGRES_PUBLIC_SERVICES_URL
});

async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS applicants (
                applicant_id VARCHAR(50) PRIMARY KEY,
                applicant_name VARCHAR(100),
                mobile VARCHAR(20),
                address VARCHAR(200)
            );
            
            CREATE TABLE IF NOT EXISTS certificates (
                certificate_id VARCHAR(50) PRIMARY KEY,
                applicant_id VARCHAR(50) REFERENCES applicants(applicant_id),
                certificate_type VARCHAR(100),
                certificate_number VARCHAR(100),
                issued_on DATE,
                verification_status VARCHAR(50)
            );
        `);
        
        const check = await pool.query('SELECT COUNT(*) FROM applicants');
        if (parseInt(check.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO applicants (applicant_id, applicant_name, mobile, address)
                VALUES 
                ('APP-3001', 'Rahul Kumar', '9876543210', '123 Main St, Lucknow'),
                ('APP-3002', 'Priya Sharma', '9876543211', '456 Park Ave, Varanasi'),
                ('APP-3003', 'Amit Patel', '9876543212', '789 Oak Ln, Surat')
            `);
            
            await pool.query(`
                INSERT INTO certificates (certificate_id, applicant_id, certificate_type, certificate_number, issued_on, verification_status)
                VALUES
                ('CERT-1', 'APP-3001', 'Income Certificate', 'INC-99123', '2025-01-15', 'VERIFIED'),
                ('CERT-2', 'APP-3001', 'Domicile Certificate', 'DOM-88123', '2025-02-20', 'VERIFIED'),
                ('CERT-3', 'APP-3002', 'Income Certificate', 'INC-77124', '2025-03-10', 'VERIFIED'),
                ('CERT-4', 'APP-3003', 'Income Certificate', 'INC-66125', '2025-04-05', 'VERIFIED')
            `);
            console.log('Public Services DB seeded');
        }
    } catch (err) {
        console.error('Error initializing Public Services DB:', err);
    }
}
initDB();

app.get('/api/health-stats', async (req, res) => {
    try {
        const counts = await pool.query('SELECT COUNT(*) FROM applicants');
        const docs = await pool.query('SELECT COUNT(*) FROM service_applications');
        res.json({
            service: 'Public Services DB',
            technology: 'PostgreSQL (Neon)',
            records: parseInt(counts.rows[0].count),
            documents: parseInt(docs.rows[0].count),
            status: 'CONNECTED'
        });
    } catch (e) {
        res.json({ service: 'Public Services DB', status: 'ERROR' });
    }
});

app.get('/api/applicants/:applicantId', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM applicants WHERE applicant_id = $1', [req.params.applicantId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Applicant not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/applicants', async (req, res) => {
    try {
        const { full_name, mobile } = req.body;
        const applicant_id = 'PUB-' + Math.floor(Math.random() * 900000 + 100000);
        await pool.query(
            'INSERT INTO applicants (applicant_id, applicant_name, mobile, address) VALUES ($1, $2, $3, $4)',
            [applicant_id, full_name, mobile, 'Unassigned']
        );
        res.status(201).json({ applicant_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/applicants/:applicantId/certificates', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM certificates WHERE applicant_id = $1', [req.params.applicantId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PUBLIC_SERVICES_PORT || 4005;
app.listen(PORT, () => console.log(`Public Services Service running on port ${PORT}`));

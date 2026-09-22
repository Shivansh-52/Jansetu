
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./samadhanpath.db', (err) => {
    if (err) console.error('Database opening error: ', err);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS citizens (
                master_id TEXT PRIMARY KEY,
                full_name TEXT,
                mobile TEXT,
                email TEXT,
                dob TEXT,
                address TEXT,
                district TEXT,
                state TEXT,
                password TEXT,
                role TEXT DEFAULT 'CITIZEN'
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS master_identity_mappings (
                master_id TEXT PRIMARY KEY,
                education_id TEXT,
                healthcare_id TEXT,
                agriculture_id TEXT,
                municipal_id TEXT,
                revenue_id TEXT
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS applications (
                application_id TEXT PRIMARY KEY,
                master_id TEXT,
                service_id TEXT,
                service_type TEXT,
                department TEXT,
                department_reference_id TEXT,
                status TEXT,
                current_stage TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS consent_logs (
                consent_id TEXT PRIMARY KEY,
                master_id TEXT,
                requester TEXT,
                purpose TEXT,
                fields_shared TEXT,
                duration TEXT,
                status TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
                log_id INTEGER PRIMARY KEY AUTOINCREMENT,
                master_id TEXT,
                role TEXT,
                department TEXT,
                endpoint TEXT,
                action TEXT,
                status TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
    
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Gateway' });
});

const PORT = 4001;
app.listen(PORT, () => console.log(`Gateway Service running on port ${PORT}`));

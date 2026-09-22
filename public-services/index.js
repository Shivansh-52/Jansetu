
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./revenue.db', (err) => {
    if (err) console.error('Database opening error: ', err);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS applicants (
                applicant_id TEXT PRIMARY KEY,
                full_name TEXT,
                phone_number TEXT
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS certificate_applications (
                cert_app_id TEXT PRIMARY KEY,
                applicant_id TEXT,
                certificate_type TEXT,
                status TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
    
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Public-services' });
});

const PORT = 4006;
app.listen(PORT, () => console.log(`Public-services Service running on port ${PORT}`));

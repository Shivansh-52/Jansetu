
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./infrastructure.db', (err) => {
    if (err) console.error('Database opening error: ', err);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS citizens (
                municipal_citizen_id TEXT PRIMARY KEY,
                applicant_name TEXT,
                mobile TEXT
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS infrastructure_requests (
                infra_req_id TEXT PRIMARY KEY,
                municipal_citizen_id TEXT,
                issue_type TEXT,
                status TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
    
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Infrastructure' });
});

const PORT = 4005;
app.listen(PORT, () => console.log(`Infrastructure Service running on port ${PORT}`));

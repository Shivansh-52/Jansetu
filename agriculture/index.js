
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./agriculture.db', (err) => {
    if (err) console.error('Database opening error: ', err);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS farmers (
                farmer_id TEXT PRIMARY KEY,
                farmer_name TEXT,
                contact_number TEXT
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS agriculture_requests (
                agri_req_id TEXT PRIMARY KEY,
                farmer_id TEXT,
                request_type TEXT,
                status TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
    
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Agriculture' });
});

const PORT = 4004;
app.listen(PORT, () => console.log(`Agriculture Service running on port ${PORT}`));

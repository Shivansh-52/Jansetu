
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./healthcare.db', (err) => {
    if (err) console.error('Database opening error: ', err);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS citizens (
                citizen_id TEXT PRIMARY KEY,
                full_name TEXT,
                phone TEXT
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS health_applications (
                health_app_id TEXT PRIMARY KEY,
                citizen_id TEXT,
                service_name TEXT,
                status TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
    
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Healthcare' });
});

const PORT = 4003;
app.listen(PORT, () => console.log(`Healthcare Service running on port ${PORT}`));

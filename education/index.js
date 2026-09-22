
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./education.db', (err) => {
    if (err) console.error('Database opening error: ', err);
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS students (
                student_id TEXT PRIMARY KEY,
                student_name TEXT,
                mobile_no TEXT,
                dob TEXT
            )`);
    db.run(`CREATE TABLE IF NOT EXISTS education_applications (
                edu_app_id TEXT PRIMARY KEY,
                student_id TEXT,
                application_type TEXT,
                status TEXT,
                stage TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
    
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', service: 'Education' });
});

const PORT = 4002;
app.listen(PORT, () => console.log(`Education Service running on port ${PORT}`));

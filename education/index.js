require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.POSTGRES_EDUCATION_URL
});

// Setup DB and Seed Data
async function initDB() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS students (
                student_id VARCHAR(50) PRIMARY KEY,
                student_name VARCHAR(100),
                date_of_birth DATE,
                institution_name VARCHAR(100),
                course_name VARCHAR(100),
                mobile_number VARCHAR(20)
            );
            
            CREATE TABLE IF NOT EXISTS scholarships (
                scholarship_id VARCHAR(50) PRIMARY KEY,
                student_id VARCHAR(50) REFERENCES students(student_id),
                scheme_name VARCHAR(100),
                annual_family_income INT,
                application_status VARCHAR(50)
            );
            
            CREATE TABLE IF NOT EXISTS education_documents (
                document_id VARCHAR(50) PRIMARY KEY,
                student_id VARCHAR(50) REFERENCES students(student_id),
                document_type VARCHAR(100),
                document_number VARCHAR(100),
                verification_status VARCHAR(50)
            );
        `);
        
        // Seed
        const check = await pool.query('SELECT COUNT(*) FROM students');
        if (parseInt(check.rows[0].count) === 0) {
            await pool.query(`
                INSERT INTO students (student_id, student_name, date_of_birth, institution_name, course_name, mobile_number)
                VALUES 
                ('EDU-1001', 'Rahul Kumar', '1998-05-15', 'State College of Engineering', 'B.Tech CS', '9876543210'),
                ('EDU-1002', 'Priya Sharma', '2001-08-22', 'Govt Medical College', 'MBBS', '9876543211'),
                ('EDU-1003', 'Amit Patel', '1995-11-30', 'National Science Institute', 'B.Sc Physics', '9876543212')
            `);
            
            await pool.query(`
                INSERT INTO education_documents (document_id, student_id, document_type, document_number, verification_status)
                VALUES
                ('DOC-EDU-1', 'EDU-1001', 'Academic Record', 'AR-9921', 'VERIFIED'),
                ('DOC-EDU-2', 'EDU-1002', 'Academic Record', 'AR-8832', 'VERIFIED'),
                ('DOC-EDU-3', 'EDU-1003', 'Academic Record', 'AR-7743', 'VERIFIED')
            `);
        }
        console.log('Education DB initialized');
    } catch (err) {
        console.error('Error initializing Education DB:', err);
    }
}
initDB();

// APIs
app.get('/api/health', (req, res) => res.json({ status: 'online', service: 'education' }));

app.get('/api/students/:studentId', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM students WHERE student_id = $1', [req.params.studentId]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/students/:studentId/documents', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM education_documents WHERE student_id = $1', [req.params.studentId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/students/:studentId/scholarships', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM scholarships WHERE student_id = $1', [req.params.studentId]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/scholarships', async (req, res) => {
    try {
        const { student_id, scheme_name, annual_family_income } = req.body;
        const id = 'SCH-' + Math.floor(Math.random() * 100000);
        await pool.query(
            'INSERT INTO scholarships (scholarship_id, student_id, scheme_name, annual_family_income, application_status) VALUES ($1, $2, $3, $4, $5)',
            [id, student_id, scheme_name, annual_family_income, 'SUBMITTED']
        );
        res.status(201).json({ scholarship_id: id, status: 'SUBMITTED' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.EDUCATION_PORT || 4001;
app.listen(PORT, () => console.log(`Education Service running on port ${PORT}`));

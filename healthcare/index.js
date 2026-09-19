require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
    .then(() => console.log('Healthcare DB connected'))
    .catch(err => console.error('Healthcare DB connection error:', err));

// Schemas
const patientSchema = new mongoose.Schema({
    patientId: String,
    fullName: String,
    healthId: String,
    dateOfBirth: String,
    contact: String,
    bloodGroup: String,
    appointments: Array,
    documents: Array
});
const Patient = mongoose.model('Patient', patientSchema);

// Seed
async function seedDB() {
    try {
        const count = await Patient.countDocuments();
        if (count === 0) {
            await Patient.insertMany([
                {
                    patientId: 'PAT-5001',
                    fullName: 'Rahul Kumar',
                    healthId: '91-1111-2222-3333',
                    dateOfBirth: '1998-05-15',
                    contact: '9876543210',
                    bloodGroup: 'O+',
                    appointments: [],
                    documents: [{ type: 'Health Card', number: 'HC-901', status: 'VERIFIED' }]
                },
                {
                    patientId: 'PAT-5002',
                    fullName: 'Priya Sharma',
                    healthId: '91-2222-3333-4444',
                    dateOfBirth: '2001-08-22',
                    contact: '9876543211',
                    bloodGroup: 'A+',
                    appointments: [],
                    documents: [{ type: 'Health Card', number: 'HC-902', status: 'VERIFIED' }]
                },
                {
                    patientId: 'PAT-5003',
                    fullName: 'Amit Patel',
                    healthId: '91-3333-4444-5555',
                    dateOfBirth: '1995-11-30',
                    contact: '9876543212',
                    bloodGroup: 'B+',
                    appointments: [],
                    documents: [{ type: 'Health Card', number: 'HC-903', status: 'VERIFIED' }]
                }
            ]);
            console.log('Healthcare DB seeded');
        }
    } catch (err) {
        console.error('Seed error:', err);
    }
}
mongoose.connection.once('open', seedDB);

// APIs
app.get('/api/health-stats', async (req, res) => {
    try {
        const counts = await Patient.countDocuments();
        // Just mocking documents count as patients * 2 for demo purposes
        res.json({
            service: 'Healthcare DB',
            technology: 'MongoDB (Atlas)',
            records: counts,
            documents: counts * 2,
            status: 'CONNECTED'
        });
    } catch (e) {
        res.json({ service: 'Healthcare DB', status: 'ERROR' });
    }
});

app.get('/api/patients/:patientId', async (req, res) => {
    try {
        const patient = await Patient.findOne({ patientId: req.params.patientId });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.json(patient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/patients', async (req, res) => {
    try {
        const { patientName, dob, contact } = req.body;
        const patientId = 'HLT-' + Math.floor(Math.random() * 900000 + 100000);
        const newPatient = new Patient({
            patientId,
            fullName: patientName,
            dateOfBirth: dob,
            contact: contact,
            healthId: '91-' + Math.floor(Math.random() * 9000 + 1000) + '-' + Math.floor(Math.random() * 9000 + 1000),
            bloodGroup: 'Unknown',
            appointments: [],
            documents: []
        });
        await newPatient.save();
        res.status(201).json({ patientId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/patients/:patientId/documents', async (req, res) => {
    try {
        const patient = await Patient.findOne({ patientId: req.params.patientId });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.json(patient.documents);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/appointments', async (req, res) => {
    try {
        const { patientId, hospital, date } = req.body;
        const patient = await Patient.findOne({ patientId });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        
        const appointmentId = 'APT-' + Math.floor(Math.random() * 100000);
        patient.appointments.push({ appointmentId, hospital, date, status: 'SCHEDULED' });
        await patient.save();
        
        res.status(201).json({ appointmentId, status: 'SCHEDULED' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.HEALTHCARE_PORT || 4002;
app.listen(PORT, () => console.log(`Healthcare Service running on port ${PORT}`));

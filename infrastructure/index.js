require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: process.env.SQLITE_PATH || './infrastructure.db',
    logging: false
});

const Citizen = sequelize.define('infrastructure_citizen', {
    citizen_ref: { type: DataTypes.STRING, primaryKey: true },
    name: DataTypes.STRING
}, { timestamps: false });

const Report = sequelize.define('report', {
    report_id: { type: DataTypes.STRING, primaryKey: true },
    citizen_ref: DataTypes.STRING,
    reporter_name: DataTypes.STRING,
    issue_category: DataTypes.STRING,
    issue_description: DataTypes.TEXT,
    latitude: DataTypes.STRING,
    longitude: DataTypes.STRING,
    priority: DataTypes.STRING,
    status: DataTypes.STRING
}, { timestamps: true });

async function initDB() {
    await sequelize.sync();
    const citCount = await Citizen.count();
    if (citCount === 0) {
        await Citizen.create({ citizen_ref: 'CIT-9001', name: 'Rahul Kumar' });
    }
    const repCount = await Report.count();
    if (repCount === 0) {
        await Report.create({
            report_id: 'REP-1001',
            citizen_ref: 'CIT-9001',
            reporter_name: 'Rahul Kumar',
            issue_category: 'Pothole',
            issue_description: 'Deep pothole on Main Street',
            latitude: '19.0760',
            longitude: '72.8777',
            priority: 'HIGH',
            status: 'OPEN'
        });
    }
    console.log('Infrastructure DB seeded');
}
initDB();

app.get('/api/health-stats', async (req, res) => {
    try {
        const counts = await Citizen.count();
        const docs = await Report.count();
        res.json({
            service: 'Infrastructure DB',
            technology: 'SQLite',
            records: counts,
            documents: docs,
            status: 'CONNECTED'
        });
    } catch (e) {
        res.json({ service: 'Infrastructure DB', status: 'ERROR' });
    }
});

app.post('/api/citizens', async (req, res) => {
    try {
        const { name } = req.body;
        const citizen_ref = 'INF-' + Math.floor(Math.random() * 900000 + 100000);
        await Citizen.create({ citizen_ref, name });
        res.status(201).json({ citizen_ref });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/citizens/:citizenRef', async (req, res) => {
    try {
        const citizen = await Citizen.findByPk(req.params.citizenRef);
        if (!citizen) return res.status(404).json({ error: 'Citizen not found' });
        res.json(citizen);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/reports', async (req, res) => {
    try {
        const { citizen_ref, reporter_name, issue_category, issue_description, latitude, longitude } = req.body;
        const report_id = 'REP-' + Math.floor(Math.random() * 100000);
        
        // Mock AI Classification
        let priority = 'MEDIUM';
        if (issue_description.toLowerCase().includes('deep') || issue_description.toLowerCase().includes('urgent')) {
            priority = 'HIGH';
        }

        const report = await Report.create({
            report_id, citizen_ref, reporter_name, issue_category, issue_description, latitude, longitude, priority, status: 'OPEN'
        });
        res.status(201).json(report);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/reports/:citizenRef', async (req, res) => {
    try {
        const reports = await Report.findAll({ where: { citizen_ref: req.params.citizenRef } });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.INFRASTRUCTURE_PORT || 4004;
app.listen(PORT, () => console.log(`Infrastructure Service running on port ${PORT}`));

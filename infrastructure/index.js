require('dotenv').config({ path: '../.env' });
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
    const count = await Report.count();
    if (count === 0) {
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
        console.log('Infrastructure DB seeded');
    }
}
initDB();

app.get('/api/health', (req, res) => res.json({ status: 'online', service: 'infrastructure' }));

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

require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(cors());
app.use(express.json());

const sequelize = new Sequelize(process.env.MYSQL_URL, {
    dialect: 'mysql',
    logging: false
});

// Models
const Farmer = sequelize.define('farmer', {
    farmer_id: { type: DataTypes.STRING, primaryKey: true },
    farmer_name: DataTypes.STRING,
    phone_no: DataTypes.STRING,
    village: DataTypes.STRING,
    district: DataTypes.STRING
}, { timestamps: false });

const LandRecord = sequelize.define('land_record', {
    land_record_no: { type: DataTypes.STRING, primaryKey: true },
    farmer_id: DataTypes.STRING,
    land_area: DataTypes.STRING,
    ownership_type: DataTypes.STRING
}, { timestamps: false });

const InsuranceClaim = sequelize.define('insurance_claim', {
    claim_id: { type: DataTypes.STRING, primaryKey: true },
    farmer_id: DataTypes.STRING,
    crop_name: DataTypes.STRING,
    claim_status: DataTypes.STRING
}, { timestamps: false });

// Init and Seed
async function initDB() {
    try {
        await sequelize.sync();
        const count = await Farmer.count();
        if (count === 0) {
            await Farmer.bulkCreate([
                { farmer_id: 'FAR-7001', farmer_name: 'Rahul Kumar', phone_no: '9876543210', village: 'Rampur', district: 'Lucknow' },
                { farmer_id: 'FAR-7002', farmer_name: 'Priya Sharma', phone_no: '9876543211', village: 'Shivpur', district: 'Varanasi' },
                { farmer_id: 'FAR-7003', farmer_name: 'Amit Patel', phone_no: '9876543212', village: 'Anand', district: 'Surat' }
            ]);
            await LandRecord.bulkCreate([
                { land_record_no: 'LR-101', farmer_id: 'FAR-7001', land_area: '2.5 Hectares', ownership_type: 'Self' },
                { land_record_no: 'LR-102', farmer_id: 'FAR-7002', land_area: '1.2 Hectares', ownership_type: 'Joint' },
                { land_record_no: 'LR-103', farmer_id: 'FAR-7003', land_area: '5.0 Hectares', ownership_type: 'Self' }
            ]);
            console.log('Agriculture DB seeded');
        }
    } catch (err) {
        console.error('Agriculture DB Init Error:', err);
    }
}
setTimeout(initDB, 5000); // Wait for mysql to boot

// APIs
app.get('/api/health-stats', async (req, res) => {
    try {
        const counts = await Farmer.count();
        res.json({
            service: 'Agriculture DB',
            technology: 'MySQL (Aiven)',
            records: counts,
            documents: counts * 2,
            status: 'CONNECTED'
        });
    } catch (e) {
        res.json({ service: 'Agriculture DB', status: 'ERROR' });
    }
});

app.get('/api/farmers/:farmerId', async (req, res) => {
    try {
        const farmer = await Farmer.findByPk(req.params.farmerId);
        if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
        res.json(farmer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/farmers', async (req, res) => {
    try {
        const { farmer_name, phone_no, district } = req.body;
        const farmer_id = 'FAR-' + Math.floor(Math.random() * 900000 + 100000);
        await Farmer.create({
            farmer_id,
            farmer_name,
            phone_no,
            village: 'Unassigned',
            district
        });
        res.status(201).json({ farmer_id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/farmers/:farmerId/land', async (req, res) => {
    try {
        const land = await LandRecord.findAll({ where: { farmer_id: req.params.farmerId } });
        res.json(land);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/insurance/claims', async (req, res) => {
    try {
        const { farmer_id, crop_name } = req.body;
        const claim_id = 'CLM-' + Math.floor(Math.random() * 100000);
        await InsuranceClaim.create({ claim_id, farmer_id, crop_name, claim_status: 'SUBMITTED' });
        res.status(201).json({ claim_id, status: 'SUBMITTED' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.AGRICULTURE_PORT || 4003;
app.listen(PORT, () => console.log(`Agriculture Service running on port ${PORT}`));

require('dotenv').config();
const { Pool } = require('pg');
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

async function validateData() {
    console.log('--- 🔍 VALIDATING SEED DATA ---');

    const gatewayPool = new Pool({ connectionString: process.env.POSTGRES_GATEWAY_URL, ssl: { rejectUnauthorized: false } });
    const educationPool = new Pool({ connectionString: process.env.POSTGRES_EDUCATION_URL, ssl: { rejectUnauthorized: false } });
    const publicServicesPool = new Pool({ connectionString: process.env.POSTGRES_PUBLIC_SERVICES_URL, ssl: { rejectUnauthorized: false } });
    await mongoose.connect(process.env.MONGODB_URL);
    const Patient = mongoose.connection.db.collection('patients');
    const mysqlConn = await mysql.createConnection(process.env.MYSQL_URL);
    const sqlitePath = process.env.SQLITE_PATH || path.join(__dirname, '../infrastructure.db');
    const sqliteDb = new sqlite3.Database(sqlitePath);

    try {
        const citizensCount = (await gatewayPool.query('SELECT COUNT(*) FROM citizens')).rows[0].count;
        console.log(`[x] Gateway: Found ${citizensCount} citizens`);

        const eduCount = (await educationPool.query('SELECT COUNT(*) FROM students')).rows[0].count;
        console.log(`[x] Education: Found ${eduCount} students`);

        const hltCount = await Patient.countDocuments();
        console.log(`[x] Healthcare: Found ${hltCount} patients`);

        const [agrCount] = await mysqlConn.query('SELECT COUNT(*) as count FROM farmers');
        console.log(`[x] Agriculture: Found ${agrCount[0].count} farmers`);

        const pubCount = (await publicServicesPool.query('SELECT COUNT(*) FROM applicants')).rows[0].count;
        console.log(`[x] Public Services: Found ${pubCount} applicants`);
        
        sqliteDb.get('SELECT COUNT(*) as count FROM citizens', (err, row) => {
            console.log(`[x] Infrastructure: Found ${row.count} citizens`);
            console.log('\n✅ VALIDATION COMPLETE!');
            process.exit(0);
        });
    } catch (e) {
        console.error('Validation failed:', e);
        process.exit(1);
    }
}
validateData();

require('dotenv').config();
const { Pool } = require('pg');
const mongoose = require('mongoose');
const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const { faker } = require('@faker-js/faker');
const path = require('path');
const fs = require('fs');

async function seedAll() {
    console.log('--- 🌱 STARTING BULK SEED FOR SAMADHANPATH ---');

    // ========================================================
    // 1. Database Connections
    // ========================================================
    const gatewayPool = new Pool({ connectionString: process.env.POSTGRES_GATEWAY_URL, ssl: { rejectUnauthorized: false } });
    const educationPool = new Pool({ connectionString: process.env.POSTGRES_EDUCATION_URL, ssl: { rejectUnauthorized: false } });
    const publicServicesPool = new Pool({ connectionString: process.env.POSTGRES_PUBLIC_SERVICES_URL, ssl: { rejectUnauthorized: false } });
    
    await mongoose.connect(process.env.MONGODB_URL);
    
    const mysqlConn = await mysql.createConnection(process.env.MYSQL_URL);
    
    const sqlitePath = process.env.SQLITE_PATH || path.join(__dirname, '../infrastructure.db');
    if(fs.existsSync(sqlitePath)) fs.unlinkSync(sqlitePath);
    const sqliteDb = new sqlite3.Database(sqlitePath);

    // ========================================================
    // 2. Gateway Schemas (Drop & Create)
    // ========================================================
    console.log('📦 Rebuilding Gateway Database...');
    await gatewayPool.query(`
        DROP TABLE IF EXISTS audit_logs CASCADE;
        DROP TABLE IF EXISTS consent_logs CASCADE;
        DROP TABLE IF EXISTS master_identity_mappings CASCADE;
        DROP TABLE IF EXISTS citizens CASCADE;

        CREATE TABLE citizens (
            master_id VARCHAR(50) PRIMARY KEY,
            full_name VARCHAR(100),
            mobile VARCHAR(20),
            email VARCHAR(100),
            dob DATE,
            district VARCHAR(100),
            state VARCHAR(100),
            pincode VARCHAR(20),
            password VARCHAR(100),
            email_verified BOOLEAN DEFAULT TRUE,
            phone_verified BOOLEAN DEFAULT TRUE,
            status VARCHAR(20) DEFAULT 'ACTIVE',
            role VARCHAR(20) DEFAULT 'CITIZEN',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE master_identity_mappings (
            master_id VARCHAR(50) REFERENCES citizens(master_id),
            education_id VARCHAR(50),
            healthcare_id VARCHAR(50),
            agriculture_id VARCHAR(50),
            infrastructure_id VARCHAR(50),
            public_services_id VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (master_id)
        );
        CREATE TABLE audit_logs (
            log_id SERIAL PRIMARY KEY,
            request_id VARCHAR(50),
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            master_id VARCHAR(50),
            source_service VARCHAR(100),
            target_service VARCHAR(100),
            endpoint VARCHAR(200),
            purpose TEXT,
            fields_requested VARCHAR(200),
            consent_status VARCHAR(20),
            result VARCHAR(50)
        );
    `);

    // ========================================================
    // 3. Education Schemas
    // ========================================================
    console.log('📦 Rebuilding Education Database...');
    await educationPool.query(`
        DROP TABLE IF EXISTS education_documents CASCADE;
        DROP TABLE IF EXISTS academic_records CASCADE;
        DROP TABLE IF EXISTS students CASCADE;

        CREATE TABLE students (
            student_id VARCHAR(50) PRIMARY KEY,
            student_name VARCHAR(100),
            date_of_birth DATE,
            institution_name VARCHAR(100),
            course_name VARCHAR(100),
            mobile_number VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE education_documents (
            document_id VARCHAR(50) PRIMARY KEY,
            student_id VARCHAR(50) REFERENCES students(student_id),
            document_type VARCHAR(50),
            document_number VARCHAR(50),
            holder_name VARCHAR(100),
            issuing_authority VARCHAR(100),
            issue_date DATE,
            valid_until DATE,
            verification_status VARCHAR(20),
            verified_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // ========================================================
    // 4. Healthcare Schemas (Mongoose)
    // ========================================================
    console.log('📦 Rebuilding Healthcare Database...');
    await mongoose.connection.db.dropDatabase();
    
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
    const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

    // ========================================================
    // 5. Agriculture Schemas
    // ========================================================
    console.log('📦 Rebuilding Agriculture Database...');
    await mysqlConn.query(`DROP TABLE IF EXISTS agriculture_documents;`);
    await mysqlConn.query(`DROP TABLE IF EXISTS farmers;`);
    await mysqlConn.query(`
        CREATE TABLE farmers (
            farmer_id VARCHAR(50) PRIMARY KEY,
            farmer_name VARCHAR(100),
            phone_no VARCHAR(20),
            village VARCHAR(100),
            district VARCHAR(100)
        );
    `);
    await mysqlConn.query(`
        CREATE TABLE agriculture_documents (
            document_id VARCHAR(50) PRIMARY KEY,
            farmer_id VARCHAR(50),
            document_type VARCHAR(50),
            document_number VARCHAR(50),
            issuing_authority VARCHAR(100),
            issue_date DATE,
            valid_until DATE,
            verification_status VARCHAR(20),
            FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id)
        );
    `);

    // ========================================================
    // 6. Public Services Schemas
    // ========================================================
    console.log('📦 Rebuilding Public Services Database...');
    await publicServicesPool.query(`
        DROP TABLE IF EXISTS service_applications CASCADE;
        DROP TABLE IF EXISTS applicants CASCADE;

        CREATE TABLE applicants (
            applicant_id VARCHAR(50) PRIMARY KEY,
            applicant_name VARCHAR(100),
            mobile VARCHAR(20),
            address VARCHAR(200)
        );
        CREATE TABLE service_applications (
            document_id VARCHAR(50) PRIMARY KEY,
            applicant_id VARCHAR(50) REFERENCES applicants(applicant_id),
            document_type VARCHAR(50),
            document_number VARCHAR(50),
            holder_name VARCHAR(100),
            issuing_authority VARCHAR(100),
            issue_date DATE,
            valid_until DATE,
            status VARCHAR(20),
            verification_status VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // ========================================================
    // 7. Infrastructure Schemas
    // ========================================================
    console.log('📦 Rebuilding Infrastructure Database...');
    sqliteDb.serialize(() => {
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS citizens (
            citizen_ref VARCHAR(50) PRIMARY KEY,
            name VARCHAR(100)
        )`);
        sqliteDb.run(`CREATE TABLE IF NOT EXISTS reports (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            citizen_ref VARCHAR(50),
            issue VARCHAR(200),
            location VARCHAR(100),
            status VARCHAR(20),
            FOREIGN KEY(citizen_ref) REFERENCES citizens(citizen_ref)
        )`);
    });

    // ========================================================
    // 8. Generate 100 Citizens
    // ========================================================
    console.log('👥 Generating 100 Demo Citizens...');
    
    for (let i = 1; i <= 100; i++) {
        const masterId = `SP-${String(i).padStart(6, '0')}`;
        const name = faker.person.fullName();
        const dob = faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0];
        const email = faker.internet.email();
        const phone = faker.string.numeric(10);
        const district = faker.location.city();
        
        // Specific IDs
        const hasEdu = Math.random() > 0.3;
        const eduId = hasEdu ? `EDU-${faker.string.alphanumeric(6).toUpperCase()}` : null;
        
        const hasHealth = Math.random() > 0.1;
        const healthId = hasHealth ? `PAT-${faker.string.alphanumeric(6).toUpperCase()}` : null;
        
        const hasAgri = Math.random() > 0.5;
        const agriId = hasAgri ? `FAR-${faker.string.alphanumeric(6).toUpperCase()}` : null;
        
        const hasInfra = Math.random() > 0.4;
        const infraId = hasInfra ? `CIT-${faker.string.alphanumeric(6).toUpperCase()}` : null;
        
        const hasPub = Math.random() > 0.2;
        const pubId = hasPub ? `APP-${faker.string.alphanumeric(6).toUpperCase()}` : null;

        // Insert Gateway
        await gatewayPool.query(
            'INSERT INTO citizens (master_id, full_name, mobile, email, dob, district, password) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [masterId, name, phone, email, dob, district, 'demo123']
        );
        await gatewayPool.query(
            'INSERT INTO master_identity_mappings (master_id, education_id, healthcare_id, agriculture_id, infrastructure_id, public_services_id) VALUES ($1, $2, $3, $4, $5, $6)',
            [masterId, eduId, healthId, agriId, infraId, pubId]
        );

        // Insert Education
        if (hasEdu) {
            await educationPool.query(
                'INSERT INTO students (student_id, student_name, date_of_birth, institution_name, course_name, mobile_number) VALUES ($1, $2, $3, $4, $5, $6)',
                [eduId, name, dob, faker.company.name() + ' College', 'B.Tech', phone]
            );
            await educationPool.query(
                'INSERT INTO education_documents (document_id, student_id, document_type, document_number, holder_name, issuing_authority, issue_date, valid_until, verification_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [`DOC-${faker.string.numeric(5)}`, eduId, 'Marksheet', `MS-${faker.string.numeric(5)}`, name, 'State Board', '2015-05-15', '2099-12-31', 'VERIFIED']
            );
        }

        // Insert Healthcare
        if (hasHealth) {
            await Patient.create({
                patientId: healthId,
                fullName: name,
                healthId: faker.string.numeric(12),
                dateOfBirth: dob,
                contact: phone,
                bloodGroup: faker.helpers.arrayElement(['O+', 'A+', 'B+', 'AB+']),
                appointments: [],
                documents: [{ type: 'Health Card', number: `HC-${faker.string.numeric(4)}`, status: 'VERIFIED' }]
            });
        }

        // Insert Agriculture
        if (hasAgri) {
            await mysqlConn.query(
                'INSERT INTO farmers (farmer_id, farmer_name, phone_no, village, district) VALUES (?, ?, ?, ?, ?)',
                [agriId, name, phone, faker.location.city(), district]
            );
            await mysqlConn.query(
                'INSERT INTO agriculture_documents (document_id, farmer_id, document_type, document_number, issuing_authority, issue_date, valid_until, verification_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [`AG-${faker.string.numeric(5)}`, agriId, 'Farmer Registration', `FR-${faker.string.numeric(5)}`, 'Agri Dept', '2020-01-01', '2030-01-01', 'VERIFIED']
            );
        }

        // Insert Public Services
        if (hasPub) {
            await publicServicesPool.query(
                'INSERT INTO applicants (applicant_id, applicant_name, mobile, address) VALUES ($1, $2, $3, $4)',
                [pubId, name, phone, faker.location.streetAddress()]
            );
            await publicServicesPool.query(
                'INSERT INTO service_applications (document_id, applicant_id, document_type, document_number, holder_name, issuing_authority, issue_date, valid_until, status, verification_status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
                [`PS-${faker.string.numeric(5)}`, pubId, 'Income Certificate', `IC-${faker.string.numeric(5)}`, name, 'Revenue Dept', '2023-01-01', '2024-01-01', 'VALID', 'VERIFIED']
            );
        }

        // Insert Infrastructure
        if (hasInfra) {
            sqliteDb.run('INSERT INTO citizens (citizen_ref, name) VALUES (?, ?)', [infraId, name]);
            sqliteDb.run('INSERT INTO reports (citizen_ref, issue, location, status) VALUES (?, ?, ?, ?)', 
                [infraId, 'Pothole on Main Road', faker.location.street(), 'OPEN']);
        }
        
        process.stdout.write(`\rSeeded ${i}/100 users`);
    }

    // Add One Official User for demo
    await gatewayPool.query(
        'INSERT INTO citizens (master_id, full_name, mobile, email, password, role) VALUES ($1, $2, $3, $4, $5, $6)',
        ['SP-ADMIN01', 'Admin User', '0000000000', 'admin@gov.in', 'admin123', 'ADMIN']
    );

    console.log('\n✅ Seeding Complete!');
    
    // Cleanup
    gatewayPool.end();
    educationPool.end();
    publicServicesPool.end();
    mongoose.disconnect();
    mysqlConn.end();
    sqliteDb.close();
}

seedAll().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
});

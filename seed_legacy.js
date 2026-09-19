const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');

const MONGODB_URL = 'mongodb+srv://spidyyydev_db_user:KsfSbgoeBq9QzYqf@cluster0.k0xsyqr.mongodb.net/samadhan_path?retryWrites=true&w=majority&appName=Cluster0';

async function seedLegacy() {
    console.log("Seeding legacy collections for Python backend...");
    await mongoose.connect(MONGODB_URL);
    const db = mongoose.connection.db;

    const users = [];
    for(let i=0; i<10; i++) {
        users.push({
            name: faker.person.fullName(),
            email: `user${i}@example.com`,
            password: "scrypt:32768:8:1$DqXk... (dummy hash)", // Just a dummy
            role: "citizen",
            phone: faker.phone.number(),
            master_id: `SP-000${i+1}`
        });
    }

    const complaints = [];
    for(let i=0; i<20; i++) {
        complaints.push({
            title: faker.lorem.sentence(),
            description: faker.lorem.paragraph(),
            status: "Pending",
            user_id: `user${Math.floor(Math.random()*10)}@example.com`,
            created_at: new Date()
        });
    }

    await db.collection('users').deleteMany({});
    await db.collection('complaints').deleteMany({});
    
    if (users.length > 0) await db.collection('users').insertMany(users);
    if (complaints.length > 0) await db.collection('complaints').insertMany(complaints);

    console.log("Legacy DB seeded!");
    process.exit(0);
}

seedLegacy();

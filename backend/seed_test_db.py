from pymongo import MongoClient
import certifi
import random
import datetime

# Connection string without a database name defaults to the 'test' database
MONGO_URI = "mongodb+srv://spidyyydev_db_user:KsfSbgoeBq9QzYqf@cluster0.k0xsyqr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

def seed_test_db():
    try:
        client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
        db = client.get_default_database() # This will get 'test'
    except Exception as e:
        # Fallback if get_default_database fails on a connection string without db
        db = client['test']

    print(f"Connected to database: {db.name}")
    
    # Generate patients data
    patients = []
    blood_groups = ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-']
    
    for i in range(1, 101):
        patient_id = f"PAT-{str(i).zfill(6)}"
        patients.append({
            "patientId": patient_id,
            "fullName": f"Demo Citizen {i}",
            "healthId": f"91-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
            "dateOfBirth": f"{random.randint(1950, 2010)}-01-01",
            "contact": f"9{random.randint(100000000, 999999999)}",
            "bloodGroup": random.choice(blood_groups),
            "appointments": [],
            "documents": [{"type": "Health Card", "number": f"HC-{random.randint(1000, 9999)}", "status": "VERIFIED"}]
        })

    # Add legacy users
    from werkzeug.security import generate_password_hash
    db.users.update_one(
        {"email": "vansh@gmail.com"},
        {"$set": {
            "name": "Vansh",
            "password": generate_password_hash("#Tag2005"),
            "role": "citizen"
        }},
        upsert=True
    )
    db.users.update_one(
        {"email": "sp-10625276"},
        {"$set": {
            "name": "Tanu",
            "password": generate_password_hash("Tanusam@1328"),
            "role": "citizen",
            "master_id": "SP-10625276"
        }},
        upsert=True
    )

    db.patients.delete_many({})
    db.patients.insert_many(patients)
    print(f"Seeded {len(patients)} patients in the '{db.name}' database!")

if __name__ == "__main__":
    seed_test_db()

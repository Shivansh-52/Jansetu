from pymongo import MongoClient
from werkzeug.security import generate_password_hash

def seed_local():
    try:
        client = MongoClient("mongodb://localhost:27017/", serverSelectionTimeoutMS=2000)
        client.admin.command('ping')
        
        # Seed jansetu_ai
        db = client.jansetu_ai
        
        # Insert Vanssh user
        db.users.update_one(
            {"email": "vansh@gmail.com"},
            {"$set": {
                "name": "Vansh",
                "password": generate_password_hash("#Tag2005"),
                "role": "citizen"
            }},
            upsert=True
        )

        # Insert SP-10625276
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

        # Seed healthcare patients
        patients = [
            {
                "patientId": "PAT-5001",
                "fullName": "Rahul Kumar",
                "healthId": "91-1111-2222-3333",
                "dateOfBirth": "1998-05-15",
                "contact": "9876543210",
                "bloodGroup": "O+",
                "appointments": [],
                "documents": [{"type": "Health Card", "number": "HC-901", "status": "VERIFIED"}]
            }
        ]
        db.patients.delete_many({})
        db.patients.insert_many(patients)
        
        print("Local MongoDB seeded successfully.")
    except Exception as e:
        print(f"Failed to connect to local MongoDB: {e}")

if __name__ == "__main__":
    seed_local()

from pymongo import MongoClient
import os
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv('MONGO_URI')

if not MONGO_URI:
    print("Error: MONGO_URI not found in .env file.")
    exit(1)

print(f"Connecting to MongoDB...")
client = MongoClient(MONGO_URI)
db = client['samadhan_path']

def seed_kyc_dbs():
    print("Seeding Aadhaar KYC Database...")
    aadhaar_kyc = [
        {
            "aadhaar_number": "234567890123",
            "mobile": "7717465014",
            "name": "Ramesh Kumar Official",
            "dob": "1988-04-12",
            "gender": "Male",
            "address": "123 Civic Centre, Sector 4, Lucknow",
            "district": "Lucknow",
            "state": "Uttar Pradesh",
            "created_at": datetime.utcnow()
        },
        {
            "aadhaar_number": "987654321098",
            "mobile": "8081654984",
            "name": "Shivansh Official",
            "dob": "1995-10-22",
            "gender": "Male",
            "address": "45 Tech Park, Gomti Nagar",
            "district": "Lucknow",
            "state": "Uttar Pradesh",
            "created_at": datetime.utcnow()
        }
    ]
    
    # Drop and insert
    db.aadhaar_kyc.drop()
    db.aadhaar_kyc.insert_many(aadhaar_kyc)
    print(f"Inserted {len(aadhaar_kyc)} records into aadhaar_kyc.")

    print("Seeding DigiLocker KYC Database...")
    digilocker_kyc = [
        {
            "digilocker_id": "aarav.digilocker",
            "mobile": "7717465014",
            "mpin": "123456",
            "name": "Aarav Sharma Official",
            "dob": "1990-08-15",
            "gender": "Male",
            "address": "78 New Market, Hazratganj",
            "district": "Lucknow",
            "state": "Uttar Pradesh",
            "documents": [
                {
                    "doc_type": "income",
                    "doc_name": "Income Certificate",
                    "doc_ref": "INC-DL-9901",
                    "issued_by": "Revenue Department",
                    "issued_date": "2026-01-10"
                },
                {
                    "doc_type": "domicile",
                    "doc_name": "Domicile Certificate",
                    "doc_ref": "DOM-DL-8812",
                    "issued_by": "Revenue Department",
                    "issued_date": "2020-03-22"
                }
            ],
            "created_at": datetime.utcnow()
        }
    ]
    
    # Drop and insert
    db.digilocker_kyc.drop()
    db.digilocker_kyc.insert_many(digilocker_kyc)
    print(f"Inserted {len(digilocker_kyc)} records into digilocker_kyc.")

if __name__ == "__main__":
    seed_kyc_dbs()
    print("KYC Database Seeding Complete!")

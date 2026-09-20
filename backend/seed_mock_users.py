import os
from pymongo import MongoClient
import bcrypt
from dotenv import load_dotenv

load_dotenv('.env')

client = MongoClient(os.getenv('MONGO_URI'))
db = client.samadhan_path

mock_users = [
    {
        "name": "Priya Singh",
        "email": "priya.singh@example.com",
        "phone": "+919876543210",
        "role": "citizen",
        "master_id": "SP-77112233",
        "aadhaar": "987654321098",
        "digilocker_id": "priya.digilocker",
        "address": "Block C, Hiranandani Estate, Thane, MH"
    },
    {
        "name": "Rahul Verma",
        "email": "rahul.v@example.com",
        "phone": "+918765432109",
        "role": "citizen",
        "master_id": "SP-55667788",
        "aadhaar": "112233445566",
        "digilocker_id": "rahul.digilocker",
        "address": "Sector 14, Gurugram, HR"
    },
    {
        "name": "Anita Desai",
        "email": "anita.d@example.com",
        "phone": "+917654321098",
        "role": "citizen",
        "master_id": "SP-99887766",
        "aadhaar": "556677889900",
        "digilocker_id": "anita.digilocker",
        "address": "Koramangala 4th Block, Bengaluru, KA"
    },
    {
        "name": "Vikram Malhotra",
        "email": "vikram.m@example.com",
        "phone": "+919988776655",
        "role": "citizen",
        "master_id": "SP-22334455",
        "aadhaar": "102030405060",
        "digilocker_id": "vikram.digilocker",
        "address": "Civil Lines, Allahabad, UP"
    }
]

print("Seeding mock users...")
for user in mock_users:
    # Hash default password "Pass@123"
    salt = bcrypt.gensalt()
    user["password_hash"] = bcrypt.hashpw("Pass@123".encode('utf-8'), salt).decode('utf-8')
    
    # Check if already exists by Aadhaar
    if not db.users.find_one({"aadhaar": user["aadhaar"]}):
        db.users.insert_one(user)
        print(f"Inserted: {user['name']} | Aadhaar: {user['aadhaar']} | Digilocker: {user['digilocker_id']}")
    else:
        print(f"Skipped {user['name']}, already exists.")

print("\nDone seeding data!")

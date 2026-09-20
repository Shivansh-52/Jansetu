import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('.env')

client = MongoClient(os.getenv('MONGO_URI'))
db = client.samadhan_path

collections = [db.users, db.workers, db.dept_officers, db.contractors, db.admins]

print(f"{'Role':<15} | {'Name':<25} | {'Aadhaar':<15} | {'Digilocker ID':<20}")
print("-" * 80)

for coll in collections:
    role = coll.name
    users = coll.find({}, {'name': 1, 'aadhaar': 1, 'digilocker_id': 1})
    for u in users:
        name = u.get('name', 'N/A')
        aadhaar = u.get('aadhaar', 'N/A')
        digilocker = u.get('digilocker_id', 'N/A')
        if aadhaar != 'N/A' or digilocker != 'N/A':
            print(f"{role:<15} | {name:<25} | {aadhaar:<15} | {digilocker:<20}")

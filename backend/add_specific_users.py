from pymongo import MongoClient
import certifi
from werkzeug.security import generate_password_hash

MONGO_URI = "mongodb+srv://spidyyydev_db_user:KsfSbgoeBq9QzYqf@cluster0.k0xsyqr.mongodb.net/samadhan_path?retryWrites=true&w=majority&appName=Cluster0"

def insert_user():
    client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
    db = client.samadhan_path

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
    print("Added vansh@gmail.com")

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
    print("Added sp-10625276")

    print("Success")

if __name__ == "__main__":
    insert_user()

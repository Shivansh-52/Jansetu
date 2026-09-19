from pymongo import MongoClient
import certifi

MONGO_URI = "mongodb+srv://spidyyydev_db_user:KsfSbgoeBq9QzYqf@cluster0.k0xsyqr.mongodb.net/samadhan_path?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())
db = client.samadhan_path

print("Collections in samadhan_path:", db.list_collection_names())
print("Patient count:", db.patients.count_documents({}))

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv('MONGO_URI')
client = MongoClient(MONGO_URI)
db = client.samadhan_path

def fix_pending_complaints():
    # Find all Road/Infrastructure complaints that are still 'Pending' (meaning smart_assign failed)
    pending_complaints = list(db.complaints.find({
        'status': 'Pending',
        'department': 'Road'
    }))

    print(f"Found {len(pending_complaints)} pending road complaints to fix.")

    # Get the infra worker
    worker = db.workers.find_one({'email': 'infra@samadhan.in'})
    if not worker:
        print("Infra worker not found in DB!")
        return

    worker_id = str(worker['_id'])
    
    for c in pending_complaints:
        db.complaints.update_one(
            {'_id': c['_id']},
            {
                '$set': {
                    'worker_id': worker_id,
                    'status': 'Assigned',
                    'assignment_type': 'ai_smart_manual_fix'
                }
            }
        )
        print(f"Assigned complaint {c.get('ref_id')} to infra worker.")
        
    print("Done!")

if __name__ == '__main__':
    fix_pending_complaints()

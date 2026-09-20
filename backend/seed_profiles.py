import random
from database.mongo import get_db
from database.cloud_db import insert_education_profile, insert_agriculture_profile

def force_seed_all():
    db = get_db()
    users = list(db.users.find())
    
    for user in users:
        m_id = user.get('master_id')
        if not m_id:
            continue
            
        true_name = user.get('name', 'Citizen')
        dob = user.get('dob', '1990-01-01')
        
        # 1. Healthcare
        if not db.healthcare_profiles.find_one({'master_id': m_id}):
            health_id = f"{random.randint(10, 99)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(10, 99)}"
            db.healthcare_profiles.insert_one({
                "master_id": m_id,
                "healthId": health_id,
                "name": true_name,
                "dob": dob,
                "details": {
                    "bloodGroup": "O+",
                    "allergies": ["Penicillin", "Dust Mites", "Pollen"],
                    "chronicConditions": ["Mild Asthma", "Hypertension"],
                    "recentVisits": [
                        {"date": "2026-08-10", "hospital": "SGPGI Lucknow", "reason": "Asthma Checkup", "doctor": "Dr. Sharma"},
                        {"date": "2026-05-22", "hospital": "Apollo Clinic", "reason": "Fever & Cough", "doctor": "Dr. Gupta"}
                    ],
                    "vaccinations": [
                        {"name": "COVID-19 Booster", "date": "2025-11-15"}
                    ],
                    "insurance": {
                        "provider": "Ayushman Bharat PM-JAY",
                        "policyNumber": f"AB-PMJAY-{random.randint(100000, 999999)}",
                        "status": "Active",
                        "coverageAmount": "5,00,000 INR"
                    }
                }
            })
            print(f"Seeded Healthcare for {m_id}")
            
        # 2. Education
        try:
            insert_education_profile({
                "master_id": m_id,
                "name": true_name,
                "current_education": {
                    "level": "Postgraduate",
                    "course": "M.Tech Artificial Intelligence",
                    "institution": "IIT Kanpur",
                    "grad_year": 2027,
                    "cgpa": 9.2,
                    "scholarship_status": "Approved (Merit Based)"
                }
            })
            print(f"Seeded Education for {m_id}")
        except Exception as e:
            print(f"Education seed failed for {m_id}: {e}")
            
        # 3. Agriculture
        try:
            insert_agriculture_profile({
                "master_id": m_id,
                "farmer_id": f"FARM-{m_id}",
                "land_parcels": [
                    {
                        "size_acres": 4.5, 
                        "crop": "Wheat", 
                        "district": "Lucknow",
                        "soil_health_card": "Valid",
                        "irrigation": "Solar Tube Well",
                        "last_yield_quintals": 55.2
                    }
                ],
                "equipment": ["Tractor"],
                "pm_kisan_status": "Active",
                "subsidies_received": "45,000 INR (2025-2026)"
            })
            print(f"Seeded Agriculture for {m_id}")
        except Exception as e:
            print(f"Agriculture seed failed for {m_id}: {e}")

if __name__ == '__main__':
    force_seed_all()
    print("Seeding complete.")

import os

code = '''
# ================= KYC ENDPOINTS (RE-ADDED & ENHANCED) =================

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    mobile = data.get('mobile')
    if not mobile:
        return jsonify({'error': 'Mobile required'}), 400
    print(f"""
==================================================
[TWILIO FALLBACK] SMS SIMULATION
To: {mobile}
Message: Your Samadhan Path OTP code is 123456. Valid for 5 minutes.
==================================================
    """)
    return jsonify({'message': 'OTP Sent (Simulation)'}), 200

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    otp = data.get('otp')
    if otp != '123456':
        return jsonify({'error': 'Invalid OTP'}), 400
    return jsonify({'message': 'OTP Verified'}), 200

@auth_bp.route('/verify-aadhaar', methods=['POST'])
def verify_aadhaar():
    data = request.json
    aadhaar = data.get('aadhaar_number')
    if not aadhaar:
        return jsonify({'error': 'Aadhaar required'}), 400
    
    # Mock response
    kyc_data = {
        'name': 'Ramesh Kumar Official' if aadhaar == '234567890123' else 'Verified Citizen',
        'dob': '1995-08-15',
        'gender': 'Male',
        'address': 'Flat 402, Signature Tower, Gomti Nagar, Lucknow, UP',
        'photo': 'https://i.pravatar.cc/150?u=' + aadhaar
    }
    return jsonify({'message': 'Aadhaar Verified', 'data': kyc_data}), 200

@auth_bp.route('/update-aadhaar-details', methods=['POST'])
def update_aadhaar_details():
    db = get_db()
    data = request.json
    user_id = data.get('user_id')
    kyc_data = data.get('kyc_data', {})
    
    if not user_id or not kyc_data:
        return jsonify({'error': 'Missing user_id or kyc_data'}), 400
        
    from bson.objectid import ObjectId
    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    m_id = user.get('master_id')
    
    # Update main user record
    db.users.update_one(
        {'_id': ObjectId(user_id)},
        {'$set': {
            'name': kyc_data.get('name'),
            'dob': kyc_data.get('dob'),
            'gender': kyc_data.get('gender'),
            'address': kyc_data.get('address'),
            'aadhaar_verified': True
        }}
    )
    
    # ==== ENHANCED DB SEEDING (Requested by user) ====
    # Seed rich data using the verified Aadhaar name!
    true_name = kyc_data.get('name', 'Citizen')
    
    import random
    
    # 1. Healthcare (MongoDB Atlas)
    health_id = f"{random.randint(10, 99)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(10, 99)}"
    db.healthcare_profiles.update_one(
        {"master_id": m_id},
        {"$set": {
            "healthId": health_id,
            "name": true_name,
            "dob": kyc_data.get('dob', '1990-01-01'),
            "details": {
                "bloodGroup": "O+",
                "allergies": ["Penicillin", "Dust Mites", "Pollen"],
                "chronicConditions": ["Mild Asthma", "Hypertension"],
                "recentVisits": [
                    {"date": "2026-08-10", "hospital": "SGPGI Lucknow", "reason": "Asthma Checkup", "doctor": "Dr. Sharma"},
                    {"date": "2026-05-22", "hospital": "Apollo Clinic", "reason": "Fever & Cough", "doctor": "Dr. Gupta"},
                    {"date": "2025-11-12", "hospital": "City Care", "reason": "Routine Blood Work", "doctor": "Dr. Singh"}
                ],
                "vaccinations": [
                    {"name": "COVID-19 Booster", "date": "2025-11-15"},
                    {"name": "Flu Shot", "date": "2025-10-01"},
                    {"name": "Tetanus", "date": "2024-03-20"}
                ],
                "insurance": {
                    "provider": "Ayushman Bharat PM-JAY",
                    "policyNumber": f"AB-PMJAY-{random.randint(100000, 999999)}",
                    "status": "Active",
                    "coverageAmount": "5,00,000 INR"
                }
            }
        }},
        upsert=True
    )
    
    # 2. Education (Neon PostgreSQL)
    from database.cloud_db import insert_education_profile, insert_agriculture_profile
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
    
    # 3. Agriculture (Aiven MySQL)
    insert_agriculture_profile({
        "master_id": m_id,
        "farmer_id": f"FARM-{m_id}",
        "land_parcels": [
            {
                "size_acres": 4.5, 
                "crop": "Wheat", 
                "district": "Lucknow",
                "soil_health_card": "Valid (Issued 2026)",
                "irrigation": "Solar Tube Well",
                "last_yield_quintals": 55.2
            },
            {
                "size_acres": 2.2, 
                "crop": "Mustard", 
                "district": "Barabanki",
                "soil_health_card": "Pending Renewal",
                "irrigation": "Canal",
                "last_yield_quintals": 18.5
            }
        ],
        "equipment": ["Mahindra Tractor", "Seed Drill", "Solar Pump"],
        "pm_kisan_status": "Active",
        "subsidies_received": "45,000 INR (2025-2026)"
    })
    
    return jsonify({'message': 'Aadhaar Details Updated & Demo Data Seeded'}), 200

@auth_bp.route('/verify-digilocker', methods=['POST'])
def verify_digilocker():
    db = get_db()
    data = request.json
    user_id = data.get('user_id')
    
    if not user_id:
        return jsonify({'error': 'User ID required'}), 400
        
    from bson.objectid import ObjectId
    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    m_id = user.get('master_id')
    
    # Seed Digilocker mock documents
    from database.schemas import create_citizen_document
    import random
    docs = [
        create_citizen_document(m_id, "income", "Income Certificate", f"INC-2026-{random.randint(1000,9999)}", "Revenue Department", "2026-01-15"),
        create_citizen_document(m_id, "domicile", "Domicile Certificate", f"DOM-2026-{random.randint(1000,9999)}", "Revenue Department", "2020-05-10"),
        create_citizen_document(m_id, "academic", "HSC Marksheet", f"HSC-2022-{random.randint(1000,9999)}", "State Board of Education", "2022-06-20"),
        create_citizen_document(m_id, "identity", "PAN Card", f"PAN-{random.randint(1000,9999)}", "Income Tax Dept", "2018-04-12")
    ]
    db.documents.insert_many(docs)
    
    # Mark Digilocker verified
    db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'digilocker_verified': True}})
    
    return jsonify({'message': 'Digilocker Verified & Documents Linked'}), 200
'''

with open(r'c:\Users\Shivansh\Desktop\Samadhan Path\backend\routes\auth_routes.py', 'a', encoding='utf-8') as f:
    f.write(code)

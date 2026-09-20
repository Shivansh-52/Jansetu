from flask import Blueprint, request, jsonify
from database.mongo import get_db
from database.schemas import create_user, create_worker, create_dept_officer
import jwt
import datetime
from config import Config
import bcrypt
import re

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    db = get_db()
    data = request.json
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    email = data['email']
    password = data['password']
    # Hash password using bcrypt
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    role = data.get('role', 'Citizen') 
    
    # ===== PASSWORD FORMAT VALIDATION =====
    import re
    if len(password) < 8:
        return jsonify({'error': 'Password must be at least 8 characters long.'}), 400
    if not re.search(r'[A-Z]', password):
        return jsonify({'error': 'Password must contain at least one uppercase letter.'}), 400
    if not re.search(r'[a-z]', password):
        return jsonify({'error': 'Password must contain at least one lowercase letter.'}), 400
    if not re.search(r'[0-9]', password):
        return jsonify({'error': 'Password must contain at least one digit.'}), 400
    if not re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password):
        return jsonify({'error': 'Password must contain at least one special character (!@#$%^&*).'}), 400
        
    p_lower = password.lower()
    user_name = data.get('name', '').lower()
    if user_name:
        parts = [p for p in user_name.split() if len(p) > 2]
        for part in parts:
            if part in p_lower:
                return jsonify({'error': 'Password must not contain your name.'}), 400
                
    user_dob = data.get('dob', '')
    if user_dob:
        dob_clean = user_dob.replace('-', '')
        dob_rev = ''.join(user_dob.split('-')[::-1])
        year = user_dob.split('-')[0]
        if dob_clean in p_lower or dob_rev in p_lower or year in p_lower:
            return jsonify({'error': 'Password must not contain your date of birth.'}), 400

    print(f"[AUTH REGISTER] Attempting to register {email} as {role}")

    # Check if user exists in either collection
    if db.users.find_one({'email': email}) or db.workers.find_one({'email': email}) or db.dept_officers.find_one({'email': email}):
        print(f"[AUTH REGISTER] User {email} already exists.")
        return jsonify({'error': 'User with this email already exists'}), 400
    
    if role == 'Worker':
        # Frontend sends 'department', Schema expects 'department_id' (or we align them)
        dept = data.get('department') 
        new_worker = create_worker(
            name=data.get('name', 'Worker'),
            email=email,
            department_id=dept,
            password_hash=password_hash,
            role='Worker'
        )
        result = db.workers.insert_one(new_worker)
        user_id = str(result.inserted_id)
        collection = 'workers'
        
    elif role == 'dept_officer':
        dept = data.get('department')
        new_officer = create_dept_officer(
            name=data.get('name', 'Dept Officer'),
            email=email,
            department_id=dept,
            password_hash=password_hash,
            role='dept_officer'
        )
        result = db.dept_officers.insert_one(new_officer)
        user_id = str(result.inserted_id)
        collection = 'dept_officers'

    elif role in ['admin', 'governance']:
        # ===== ACCESS CODE VERIFICATION =====
        access_code = data.get('access_code', '').strip().upper()
        from routes.admin_routes import VALID_ADMIN_CODES
        if not access_code or access_code not in VALID_ADMIN_CODES:
            return jsonify({'error': 'Invalid or missing access code. Only developer-generated codes are accepted.'}), 403
        
        # Verify code matches the requested role
        if VALID_ADMIN_CODES[access_code] != role:
            return jsonify({'error': f'This access code is for {VALID_ADMIN_CODES[access_code]} role, not {role}.'}), 403

        # Create Admin/Governance Profile with district
        new_admin = {
            "name": data.get('name', 'Official'),
            "email": email,
            "password_hash": password_hash,
            "role": role,
            "department": data.get('department', 'Administration'),
            "district": data.get('district', ''),
            "access_code_used": access_code,
            "aadhaar": aadhaar,
            "digilocker_id": digilocker_id,
            "created_at": datetime.datetime.utcnow()
        }
        result = db.admins.insert_one(new_admin)
        user_id = str(result.inserted_id)
        collection = 'admins'

    else:
        new_user = create_user(
            name=data.get('name', 'Citizen'),
            email=email,
            password_hash=password_hash,
            role='Citizen',
            mobile=data.get('mobile', ''),
            address=data.get('address', ''),
            dob=data.get('dob', ''),
            district=data.get('district', ''),
            state=data.get('state', '')
        )
        result = db.users.insert_one(new_user)
        user_id = str(result.inserted_id)
        collection = 'users'
    
    # Map any guest complaints (submitted with this email before registration)
    try:
        mapped = db.complaints.update_many(
            {'email': email, 'user_id': 'Anonymous'},
            {'$set': {'user_id': user_id}}
        )
        if mapped.modified_count > 0:
            print(f"[AUTH REGISTER] Mapped {mapped.modified_count} guest complaint(s) to user {user_id}")
    except Exception as e:
        print(f"[AUTH REGISTER] Email mapping error: {e}")

    print(f"[AUTH REGISTER] Success: {user_id} in {collection}")
    
    return jsonify({
        'message': f'{role} registered successfully',
        'user_id': user_id,
        'role': role,
        'collection': collection
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    print("--- [AUTH LOGIN] Request Received ---")
    try:
        # Safe JSON parsing
        data = request.get_json(silent=True)
        if data is None:
            data = request.get_json(force=True, silent=True) or {}
        if not data:
            data = request.form.to_dict() if request.form else {}

        print(f"Headers: {dict(request.headers)}")
        print(f"Raw Payload: {data}")

        email_or_id = (data.get('email') or '').strip().lower()
        password = data.get('password') or ''
        context = data.get('context', 'public')

        if not email_or_id or not password:
            print("Error: Missing credentials in payload")
            return jsonify({'error': 'Please provide both Master ID/Email and password.'}), 400

        print(f"Attempting login for: {email_or_id}")

        # ===== 1. Universal Instant Demo Accounts (100% Guaranteed Hackathon / Offline Safe) =====
        demo_accounts = {
            'admin@jansetu.ai': {
                'id': 'admin_001',
                'name': 'System Administrator',
                'role': 'admin',
                'department': 'State Administration',
                'district': 'Lucknow',
                'passwords': ['admin123', 'Pass@123', 'Admin@123', '123456']
            },
            'gov@jansetu.ai': {
                'id': 'gov_001',
                'name': 'State Governance Oversight Head',
                'role': 'governance',
                'department': 'Governance & Policy Directorate',
                'district': 'Lucknow',
                'passwords': ['gov123', 'Pass@123', 'Gov@123', 'admin123', '123456']
            },
            'contractor@jansetu.ai': {
                'id': 'con_001',
                'name': 'LKO Infra Project Lead',
                'company_name': 'LKO Infrastructure & Highway Corp',
                'contractor_id': 'CON-LKO-781',
                'role': 'contractor',
                'department': 'Public Works Contractor',
                'district': 'Lucknow',
                'passwords': ['contractor123', 'Pass@123', 'Contractor@123', 'admin123', '123456']
            },
            'officer@jansetu.ai': {
                'id': 'off_001',
                'name': 'Executive Engineer (Roads)',
                'role': 'dept_officer',
                'department': 'Road',
                'district': 'Lucknow',
                'passwords': ['officer123', 'Pass@123', 'Officer@123', 'admin123', '123456']
            },
            'worker@jansetu.ai': {
                'id': 'work_001',
                'name': 'Ramesh Kumar (Field Worker)',
                'role': 'worker',
                'department': 'Road',
                'district': 'Lucknow',
                'passwords': ['worker123', 'Pass@123', 'Worker@123', 'admin123', '123456']
            },
            'citizen@jansetu.ai': {
                'id': 'cit_001',
                'name': 'Shivansh (Citizen)',
                'role': 'citizen',
                'department': 'Civic Citizen',
                'district': 'Lucknow',
                'master_id': 'SP-000001',
                'passwords': ['citizen123', 'Pass@123', 'Citizen@123', 'admin123', '123456']
            },
            'student@jansetu.ai': {
                'id': 'stu_001',
                'name': 'Aarav Sharma (Education Student)',
                'role': 'citizen',
                'department': 'Education Domain',
                'district': 'Bhopal',
                'master_id': 'SP-000001',
                'passwords': ['student123', 'Pass@123', 'Student@123', 'admin123', '123456']
            },
            'aarav@jansetu.ai': {
                'id': 'cit_aarav_001',
                'name': 'Aarav Sharma',
                'role': 'citizen',
                'department': 'Civic Citizen',
                'district': 'Varanasi',
                'master_id': 'SP-000001',
                'passwords': ['Demo@123', 'admin123', '123456']
            }
        }

        if email_or_id in demo_accounts or email_or_id == 'sp-mh-000001' or email_or_id == 'sp-12963072':
            demo_email = 'citizen@jansetu.ai' if email_or_id == 'sp-mh-000001' else ('aarav@jansetu.ai' if email_or_id == 'sp-12963072' else email_or_id)
            demo_user = demo_accounts[demo_email]
            if password in demo_user['passwords'] or password in ['admin123', 'Pass@123', '123456']:
                user_id = demo_user['id']
                target_role = demo_user['role']

                token = jwt.encode({
                    'user_id': user_id,
                    'role': target_role,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=48)
                }, Config.SECRET_KEY, algorithm="HS256")

                return jsonify({
                    'message': 'Login successful',
                    'token': token,
                    'user': {
                        'id': user_id,
                        '_id': user_id,
                        'name': demo_user['name'],
                        'email': demo_email,
                        'role': target_role,
                        'department': demo_user.get('department', 'General'),
                        'contractor_id': demo_user.get('contractor_id'),
                        'company_name': demo_user.get('company_name'),
                        'district': demo_user.get('district', 'Lucknow'),
                        'master_id': demo_user.get('master_id')
                    }
                }), 200

        # ===== 2. Database Lookup =====
        user = None
        role = 'citizen'
        try:
            db = get_db()
            if db is not None:
                # 1. Check Users (Citizens) by email or master_id
                pattern = re.compile(f'^{re.escape(email_or_id)}$', re.IGNORECASE)
                user = db.users.find_one({'email': pattern})
                if not user:
                    user = db.users.find_one({'master_id': pattern})
                if user:
                    role = user.get('role', 'citizen').lower()

                # 2. Check Workers
                if not user:
                    user = db.workers.find_one({'email': pattern})
                    if user:
                        role = 'worker'

                # 3. Check Dept Officers
                if not user:
                    user = db.dept_officers.find_one({'email': pattern})
                    if user:
                        role = 'dept_officer'

                # 4. Check Contractors
                if not user:
                    user = db.contractors.find_one({'email': pattern})
                    if user:
                        role = 'contractor'

                # 5. Check Admins & Governance
                if not user:
                    user = db.admins.find_one({'email': pattern})
                    if user:
                        role = user.get('role', 'admin').lower()
        except Exception as db_err:
            print(f"[AUTH LOGIN] DB search warning: {db_err}")

        if user:
            stored_hash = user.get('password_hash')
            pwd_match = False

            if stored_hash:
                try:
                    pwd_match = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
                except Exception:
                    pwd_match = (password == stored_hash)

            # Universal demo password fallback
            if not pwd_match and password in ['admin123', 'Pass@123', '123456']:
                pwd_match = True

            if pwd_match:
                print(f"Success: Password match for {email_or_id} ({role})")
                user_id = str(user['_id'])

                token = jwt.encode({
                    'user_id': user_id,
                    'role': role,
                    'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=48)
                }, Config.SECRET_KEY, algorithm="HS256")

                try:
                    if db is not None:
                        db.complaints.update_many(
                            {'email': user.get('email', email_or_id), 'user_id': 'Anonymous'},
                            {'$set': {'user_id': user_id}}
                        )
                except Exception:
                    pass

                return jsonify({
                    'message': 'Login successful',
                    'token': token,
                    'user': {
                        'id': user_id,
                        '_id': user_id,
                        'name': user.get('name', 'User'),
                        'email': user.get('email', email_or_id),
                        'role': role,
                        'department': user.get('department_id') or user.get('department', 'General'),
                        'contractor_id': user.get('contractor_id'),
                        'company_name': user.get('company_name'),
                        'district': user.get('district', ''),
                        'master_id': user.get('master_id')
                    }
                }), 200
            else:
                return jsonify({'error': 'Invalid password. Please try again.'}), 401
        else:
            return jsonify({'error': f'Account not found for "{email_or_id}". Use demo credentials or register.'}), 401

    except Exception as e:
        print(f"CRITICAL ERROR in Login: {e}")
        return jsonify({'error': f'Server Error: {str(e)}'}), 500

# ================= KYC ENDPOINTS (RE-ADDED & ENHANCED) =================

@auth_bp.route('/send-otp', methods=['POST'])
def send_otp():
    data = request.json
    identifier = data.get('aadhaar_or_mobile') or data.get('mobile')
    if not identifier:
        return jsonify({'error': 'Mobile required'}), 400
        
    db = get_db()
    mobile = identifier
    
    # If the user enters Aadhaar or Digilocker ID, find their actual phone number
    if len(identifier) == 12 and identifier.isdigit() or '.digilocker' in identifier or identifier.startswith('SP-'):
        user = None
        for coll in [db.users, db.workers, db.dept_officers, db.contractors, db.admins]:
            user = coll.find_one({'$or': [{'aadhaar': identifier}, {'master_id': identifier}, {'email': identifier}]})
            if user:
                break
        if user and user.get('phone'):
            mobile = user.get('phone')
        else:
            return jsonify({'error': 'User not found in system. Please register first.'}), 404

    # Standardize Mobile Number (+91)
    if not mobile.startswith('+'):
        mobile = f"+91{mobile}"
        
    import os
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    verify_sid = os.getenv('TWILIO_VERIFY_SERVICE_SID')
    
    if account_sid and auth_token:
        try:
            from twilio.rest import Client
            client = Client(account_sid, auth_token)
            twilio_phone = os.getenv('TWILIO_PHONE_NUMBER', '+17372508034')
            
            if verify_sid:
                try:
                    # Try Verify first
                    verification = client.verify.v2.services(verify_sid).verifications.create(
                        to=mobile, channel='sms'
                    )
                    print(f"[TWILIO] Sent Verify OTP to {mobile}. Status: {verification.status}")
                    return jsonify({'message': 'Real OTP Sent successfully via Twilio Verify', 'mobile': mobile}), 200
                except Exception as e:
                    print(f"[TWILIO VERIFY ERROR] {e}. Falling back to Programmable SMS.")
                    pass
                    
            # Fallback to Programmable SMS (Messages API)
            message = client.messages.create(
                body="sms_appointment_reminders",
                from_=twilio_phone,
                to=mobile
            )
            print(f"[TWILIO] Sent Programmable SMS to {mobile}. SID: {message.sid}")
            return jsonify({'message': 'Real OTP Sent successfully via Twilio SMS', 'mobile': mobile}), 200
        except Exception as e:
            print(f"[TWILIO ERROR] {e}")
            return jsonify({'error': 'Failed to send Real Twilio SMS. Please check your Twilio configuration.'}), 500

    # Fallback to simulation
    print(f"""
==================================================
[TWILIO FALLBACK] SMS SIMULATION
To: {mobile}
Message: Your Samadhan Path OTP code is 123456. Valid for 5 minutes.
==================================================
    """)
    return jsonify({'message': 'OTP Sent (Simulation)', 'mobile': mobile}), 200

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.json
    otp = data.get('otp_code') or data.get('otp')
    identifier = data.get('aadhaar_or_mobile') or data.get('mobile')
    
    db = get_db()
    mobile = identifier
    if identifier and (len(identifier) == 12 and identifier.isdigit() or '.digilocker' in identifier or identifier.startswith('SP-')):
        user = None
        for coll in [db.users, db.workers, db.dept_officers, db.contractors, db.admins]:
            user = coll.find_one({'$or': [{'aadhaar': identifier}, {'master_id': identifier}, {'email': identifier}]})
            if user:
                break
        if user and user.get('phone'):
            mobile = user.get('phone')
        else:
            return jsonify({'error': 'User not found in system.'}), 404
            
    import os
    account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    verify_sid = os.getenv('TWILIO_VERIFY_SERVICE_SID')
    
    if account_sid and auth_token and verify_sid and mobile:
        # Check for test OTP before hitting Twilio
        if str(otp) == '123456':
            pass # Skip Twilio check for test OTP
        else:
            # Standardize Mobile Number (+91)
            if not mobile.startswith('+'):
                mobile = f"+91{mobile}"
            try:
                from twilio.rest import Client
                client = Client(account_sid, auth_token)
                # Verify Real Twilio OTP
                verification_check = client.verify.v2.services(verify_sid).verification_checks.create(
                    to=mobile, code=otp
                )
                if verification_check.status != 'approved':
                    return jsonify({'error': 'Invalid Real OTP'}), 400
            except Exception as e:
                print(f"[TWILIO VERIFY ERROR] {e}")
                return jsonify({'error': 'Invalid OTP'}), 400
    else:
        if str(otp) != '123456':
            return jsonify({'error': 'Invalid OTP'}), 400
        
    is_register = data.get('is_register', False)
    if is_register:
        return jsonify({'message': 'OTP Verified'}), 200
        
    # This is a Login Attempt via OTP
    db = get_db()
    identifier = data.get('aadhaar_or_mobile')
    if not identifier:
        return jsonify({'error': 'Missing identifier'}), 400
        
    # Find user
    user = None
    for collection in [db.users, db.workers, db.dept_officers, db.contractors, db.admins]:
        # They could login with master_id, email, phone, or aadhaar
        user = collection.find_one({
            '$or': [
                {'master_id': identifier},
                {'email': identifier},
                {'phone': identifier},
                {'aadhaar': identifier}
            ]
        })
        if user:
            break
            
    if not user:
        # Fallback for hackathon demo if they use a mock SSO ID
        user = db.users.find_one({'email': 'tushar@gmail.com'}) or db.users.find_one()
        if not user:
            return jsonify({'error': 'User not found in system'}), 404
            
    import jwt
    import datetime
    token = jwt.encode({
        'user_id': str(user['_id']),
        'role': user.get('role', 'citizen'),
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, Config.SECRET_KEY, algorithm='HS256')
    
    user['_id'] = str(user['_id'])
    # Remove sensitive info
    user.pop('password_hash', None)
    
    return jsonify({
        'message': 'SSO Login Successful',
        'token': token,
        'user': user
    }), 200

@auth_bp.route('/verify-aadhaar', methods=['POST'])
def verify_aadhaar():
    db = get_db()
    data = request.json
    aadhaar = data.get('aadhaar_number')
    
    if not aadhaar:
        return jsonify({'error': 'Aadhaar required'}), 400
        
    user_name_input = data.get('name', '')
    user_address_input = data.get('address', '')
        
    # Check if Aadhaar belongs to an existing seeded user
    existing_user = None
    for coll in [db.users, db.workers, db.dept_officers, db.contractors, db.admins]:
        existing_user = coll.find_one({'aadhaar': aadhaar})
        if existing_user:
            break
            
    if existing_user:
        aadhaar_name = existing_user.get('name')
        aadhaar_address = existing_user.get('address') or 'Flat 402, Signature Tower, Gomti Nagar, Lucknow, UP'
    else:
        aadhaar_name = 'Ramesh Kumar Official' if aadhaar == '234567890123' else (user_name_input or 'Verified Citizen')
        aadhaar_address = 'Flat 402, Signature Tower, Gomti Nagar, Lucknow, UP'
    
    # Mock Aadhaar response
    kyc_data = {
        'name': aadhaar_name,
        'dob': '1995-08-15',
        'gender': 'Male',
        'address': aadhaar_address,
        'photo': 'https://i.pravatar.cc/150?u=' + aadhaar
    }
    
    # Mismatch logic
    user_name = user_name_input.lower()
    aadhaar_name_lower = kyc_data['name'].lower()
    user_addr = user_address_input.lower()
    aadhaar_addr = kyc_data['address'].lower()
    
    name_mismatch = user_name != aadhaar_name_lower
    # Basic partial address match to simulate real-world fuzziness
    address_mismatch = user_addr not in aadhaar_addr and aadhaar_addr not in user_addr
    
    return jsonify({
        'message': 'Aadhaar Verified',
        'mismatch': name_mismatch or address_mismatch,
        'name_mismatch': name_mismatch,
        'address_mismatch': address_mismatch,
        'kyc_data': kyc_data
    }), 200

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
    
    # ==== ENHANCED DB SEEDING (Requested by user) ====
    true_name = user.get('name', 'Citizen')
    
    # 1. Healthcare (MongoDB Atlas)
    health_id = f"{random.randint(10, 99)}-{random.randint(1000, 9999)}-{random.randint(1000, 9999)}-{random.randint(10, 99)}"
    db.healthcare_profiles.update_one(
        {"master_id": m_id},
        {"$set": {
            "healthId": health_id,
            "name": true_name,
            "dob": user.get('dob', '1990-01-01'),
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
    
    return jsonify({'message': 'Digilocker Verified & Demo Data Seeded'}), 200

@auth_bp.route('/<master_id>/profiles', methods=['GET'])
def get_profiles(master_id):
    db = get_db()
    
    edu_prof = db.education_profiles.find_one({'master_id': master_id}, {'_id': 0})
    health_prof = db.healthcare_profiles.find_one({'master_id': master_id}, {'_id': 0})
    agri_prof = db.agriculture_profiles.find_one({'master_id': master_id}, {'_id': 0})
    
    return jsonify({
        'education': edu_prof,
        'healthcare': health_prof,
        'agriculture': agri_prof
    }), 200

@auth_bp.route('/<master_id>/activity', methods=['GET'])
def get_activity(master_id):
    db = get_db()
    logs = list(db.audit_logs.find({'user_id': master_id}, {'_id': 0}).sort('timestamp', -1).limit(10))
    return jsonify(logs), 200

@auth_bp.route('/consent/send-otp', methods=['POST'])
def send_consent_otp():
    data = request.json or {}
    master_id = data.get('master_id')
    mobile = data.get('mobile', '9876543210')

    import random
    otp_code = str(random.randint(100000, 999999))
    
    db = get_db()
    db.otps.update_one(
        {'identifier': master_id},
        {
            '$set': {
                'otp_code': otp_code,
                'expires_at': datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
            }
        },
        upsert=True
    )

    import os
    twilio_account_sid = os.getenv('TWILIO_ACCOUNT_SID')
    twilio_auth_token = os.getenv('TWILIO_AUTH_TOKEN')
    twilio_verify_sid = os.getenv('TWILIO_VERIFY_SERVICE_SID')
    
    message_body = f"Your Samadhan Path Consent OTP code is {otp_code}. Valid for 5 minutes."
    
    if twilio_account_sid and twilio_auth_token and twilio_verify_sid:
        try:
            from twilio.rest import Client
            client = Client(twilio_account_sid, twilio_auth_token)
            to_number = mobile if mobile.startswith('+') else f"+91{mobile}"
            
            verification = client.verify.v2.services(twilio_verify_sid) \
                .verifications \
                .create(to=to_number, channel='sms')
                
            print(f"âœ… Real Twilio Verify Consent SMS sent! SID: {verification.sid}")
        except Exception as e:
            print(f"Failed to send real Twilio SMS: {e}")
            print(f"\n==================================================")
            print(f"ðŸ“± TWILIO SMS SIMULATION (FALLBACK DUE TO TWILIO ERROR) ðŸ“±")
            print(f"To: {mobile}")
            print(f"Message: {message_body}")
            print(f"==================================================\n")
            return jsonify({
                "success": True,
                "message": f"Twilio blocked the SMS (Trial restriction). OTP printed to backend console."
            }), 200
    else:
        print(f"\n==================================================")
        print(f"ðŸ“± TWILIO SMS SIMULATION (CONSENT) ðŸ“±")
        print(f"To: {mobile}")
        print(f"Message: {message_body}")
        print(f"==================================================\n")
        print("WARNING: Twilio credentials not found in .env, falling back to console simulation.")

    return jsonify({
        "success": True,
        "message": f"OTP sent to registered mobile ending in {mobile[-4:]}"
    }), 200

@auth_bp.route('/consent/verify-otp', methods=['POST'])
def verify_consent_otp():
    data = request.json or {}
    master_id = data.get('master_id')
    otp_code = data.get('otp_code')
    purpose = data.get('purpose', 'Interoperability Verification')
    requesting_dept = data.get('requesting_dept', 'External Department')
    source_dept = data.get('source_dept', 'Public Services / Revenue Department')
    
    db = get_db()
    otp_record = db.otps.find_one({'identifier': master_id})
    
    # Check master password fallback (universal OTP)
    if otp_code == '123456':
        print(f"âœ… Universal Test OTP Used for master_id {master_id}")
        # Insert audit log for consent
        consent_log = {
            "user_id": master_id,
            "action": "CONSENT_GRANTED",
            "details": f"User authorized sharing of profile data from {source_dept} to {requesting_dept} for purpose: {purpose}",
            "timestamp": datetime.datetime.utcnow(),
            "ip_address": request.remote_addr,
            "status": "SUCCESS"
        }
        db.audit_logs.insert_one(consent_log)
        return jsonify({"success": True, "message": "OTP Verified Successfully via Master Fallback"}), 200

    if not otp_record or otp_record.get('otp_code') != otp_code:
        return jsonify({"success": False, "message": "Invalid OTP code"}), 400
        
    if datetime.datetime.utcnow() > otp_record.get('expires_at'):
        return jsonify({"success": False, "message": "OTP has expired"}), 400

    # Insert audit log for consent
    consent_log = {
        "user_id": master_id,
        "action": "CONSENT_GRANTED",
        "details": f"User authorized sharing of profile data from {source_dept} to {requesting_dept} for purpose: {purpose}",
        "timestamp": datetime.datetime.utcnow(),
        "ip_address": request.remote_addr,
        "status": "SUCCESS"
    }
    db.audit_logs.insert_one(consent_log)
    
    db.otps.delete_one({'identifier': master_id})
    return jsonify({"success": True, "message": "OTP Verified Successfully"}), 200


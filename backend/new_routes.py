
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
                
            print(f"✅ Real Twilio Verify Consent SMS sent! SID: {verification.sid}")
        except Exception as e:
            print(f"Failed to send real Twilio SMS: {e}")
            print(f"\n==================================================")
            print(f"📱 TWILIO SMS SIMULATION (FALLBACK DUE TO TWILIO ERROR) 📱")
            print(f"To: {mobile}")
            print(f"Message: {message_body}")
            print(f"==================================================\n")
            return jsonify({
                "success": True,
                "message": f"Twilio blocked the SMS (Trial restriction). OTP printed to backend console."
            }), 200
    else:
        print(f"\n==================================================")
        print(f"📱 TWILIO SMS SIMULATION (CONSENT) 📱")
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
        print(f"✅ Universal Test OTP Used for master_id {master_id}")
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

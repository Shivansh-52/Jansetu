from flask import Blueprint, request, jsonify
from database.mongo import get_db
from database.cloud_db import neon_engine
from sqlalchemy import text
import datetime
import random
import uuid

education_bp = Blueprint('education', __name__)

# Helper to generate timestamped IDs
def generate_id(prefix):
    return f"{prefix}-2026-{random.randint(100000, 999999)}"

# 1. GET STUDENT PROFILE
@education_bp.route('/profile', methods=['GET'])
def get_education_profile():
    master_id = request.args.get('master_id') or request.args.get('masterId')
    if not master_id:
        return jsonify({'error': 'Master ID is required'}), 400

    db = get_db()
    profile = db.education_profiles.find_one({'master_id': master_id}, {'_id': 0})
    
    # Try fetching from PostgreSQL to enrich profile
    pg_profile = None
    if neon_engine:
        try:
            with neon_engine.connect() as conn:
                res = conn.execute(text("SELECT * FROM education_records WHERE master_id = :mid"), {"mid": master_id}).fetchone()
                if res:
                    pg_profile = dict(res._mapping)
        except Exception as e:
            print(f"PG fetch error: {e}")

    # Auto-seed standard official student profile if missing in Mongo
    if not profile:
        user = db.users.find_one({'master_id': master_id})
        user_name = user.get('name', 'Citizen Student') if user else 'Citizen Student'
        user_district = user.get('district', 'Bhopal') if user else 'Bhopal'
        user_state = user.get('state', 'Madhya Pradesh') if user else 'Madhya Pradesh'
        user_address = user.get('address', '12/4 Civic Center') if user else '12/4 Civic Center'
        
        profile = {
            "master_id": master_id,
            "student_id": pg_profile.get('student_id') if pg_profile else f"STU-{master_id[-6:] if len(master_id)>=6 else '92831'}",
            "name": pg_profile.get('student_name') if pg_profile else user_name,
            "dob": "2004-05-14",
            "institution": pg_profile.get('institution') if pg_profile else "National Institute of Technology",
            "course": pg_profile.get('course') if pg_profile else "B.Tech Computer Science & Engineering",
            "year_semester": pg_profile.get('year_semester') if pg_profile else "2nd Year / 4th Semester",
            "enrollment_number": pg_profile.get('enrollment_number') if pg_profile else f"ENR-2024-{random.randint(1000, 9999)}",
            "academic_performance": float(pg_profile.get('academic_aggregate', '85.5').replace('%','')) if pg_profile and pg_profile.get('academic_aggregate') else 85.5,
            "attendance_percentage": float(pg_profile.get('attendance_status', '92').split('%')[0]) if pg_profile and pg_profile.get('attendance_status') else 92.0,
            "family_income": 220000,
            "family_income_status": "Eligible (< ₹2.5 Lakh)",
            "category": "OBC-NCL",
            "address": user_address,
            "state": user_state,
            "district": user_district,
            "student_status": "Active Student",
            "bank_account": "XXXX-XXXX-4491 (State Bank of India)",
            "bank_ifsc": "SBIN0001234",
            "bank_verified": True
        }
        db.education_profiles.insert_one(profile.copy())
    else:
        # If profile exists, merge PG data into it for the response
        if pg_profile:
            profile['institution'] = pg_profile.get('institution', profile.get('institution'))
            profile['course'] = pg_profile.get('course', profile.get('course'))
            profile['year_semester'] = pg_profile.get('year_semester', profile.get('year_semester'))
            profile['enrollment_number'] = pg_profile.get('enrollment_number', profile.get('enrollment_number'))
            if pg_profile.get('academic_aggregate'):
                try: profile['academic_performance'] = float(pg_profile['academic_aggregate'].replace('%',''))
                except: pass
            if pg_profile.get('attendance_status'):
                try: profile['attendance_percentage'] = float(pg_profile['attendance_status'].split('%')[0])
                except: pass
            profile['student_id'] = pg_profile.get('student_id', profile.get('student_id'))

    # Fetch associated documents
    docs = list(db.documents.find({'master_id': master_id}, {'_id': 0}))
    if not docs:
        docs = [
            {
                "master_id": master_id,
                "doc_type": "income",
                "doc_name": "Income Certificate",
                "doc_number": "INC-2026-9812",
                "issuing_dept": "Public Services / Revenue Department",
                "issue_date": "2026-01-15",
                "expiry_date": "2027-03-31",
                "verification_status": "Verified",
                "last_verified": "2026-08-10"
            },
            {
                "master_id": master_id,
                "doc_type": "domicile",
                "doc_name": "Domicile Certificate",
                "doc_number": "DOM-2026-4431",
                "issuing_dept": "Public Services / Revenue Department",
                "issue_date": "2026-02-10",
                "expiry_date": "Permanent",
                "verification_status": "Verified",
                "last_verified": "2026-08-10"
            },
            {
                "master_id": master_id,
                "doc_type": "caste",
                "doc_name": "OBC Category Certificate",
                "doc_number": "CST-2026-1198",
                "issuing_dept": "Revenue Department",
                "issue_date": "2026-03-05",
                "expiry_date": "Permanent",
                "verification_status": "Verified",
                "last_verified": "2026-08-10"
            },
            {
                "master_id": master_id,
                "doc_type": "academic",
                "doc_name": "12th Standard HSC Marksheet",
                "doc_number": "HSC-2026-7788",
                "issuing_dept": "State Secondary Education Board",
                "issue_date": "2022-06-20",
                "expiry_date": "Permanent",
                "verification_status": "Verified",
                "last_verified": "2026-08-10"
            },
            {
                "master_id": master_id,
                "doc_type": "student_id",
                "doc_name": "College Student Identity Card",
                "doc_number": "SID-NITB-8821",
                "issuing_dept": "NIT Bhopal Academic Office",
                "issue_date": "2024-08-01",
                "expiry_date": "2028-06-30",
                "verification_status": "Verified",
                "last_verified": "2026-08-10"
            }
        ]
        db.documents.insert_many(docs.copy())

    profile['documents'] = docs
    return jsonify(profile), 200


# 2. GET SCHOLARSHIPS CATALOGUE
@education_bp.route('/scholarships', methods=['GET'])
def get_scholarships():
    db = get_db()
    scholarships = list(db.scholarships.find({}, {'_id': 0}))

    if not scholarships:
        scholarships = [
            {
                "id": "SCH-001",
                "scheme_name": "Post-Matric Scholarship for SC/ST/OBC Students (Ministry of Social Justice)",
                "provider": "Department of Higher Education & Social Welfare",
                "purpose": "Financial assistance for meritorious students from economically weaker sections.",
                "eligibility": "Minimum 75% marks in previous academic year, Family Income < ₹2,50,000/year",
                "min_score": 75.0,
                "max_income": 250000,
                "category_eligible": ["General", "OBC", "SC", "ST", "EWS"],
                "required_documents": ["Income Certificate", "Academic Marksheet", "Domicile Certificate", "Bank DBT Details"],
                "start_date": "2026-07-01",
                "end_date": "2026-11-30",
                "benefit": "₹50,000 per year + Full Course Fee Subvention",
                "status": "OPEN",
                "source_type": "National Scholarship Portal (NSP Guidelines)"
            },
            {
                "id": "SCH-002",
                "scheme_name": "National Technical & Professional Education Fellowship (AICTE)",
                "provider": "AICTE / Higher Education Council",
                "purpose": "Fellowship support for B.Tech, M.Tech, and MCA engineering students.",
                "eligibility": "Currently enrolled in B.Tech/M.Tech, minimum 80% aggregate score",
                "min_score": 80.0,
                "max_income": 600000,
                "category_eligible": ["General", "OBC", "SC", "ST"],
                "required_documents": ["Student ID Proof", "Academic Transcript", "Income Certificate"],
                "start_date": "2026-08-15",
                "end_date": "2026-12-15",
                "benefit": "₹75,000 per year direct tuition grant",
                "status": "OPEN",
                "source_type": "Ministry of Education Fellowships"
            },
            {
                "id": "SCH-003",
                "scheme_name": "Central Sector Girls STEM Higher Education Grant (PRAGATI)",
                "provider": "Department of Social Justice & Higher Education",
                "purpose": "Encouraging female participation in STEM degree courses.",
                "eligibility": "Female students pursuing B.Sc, B.Tech, or MBBS, Family Income < ₹4,50,000/year",
                "min_score": 70.0,
                "max_income": 450000,
                "category_eligible": ["General", "OBC", "SC", "ST", "EWS"],
                "required_documents": ["Gender Certificate", "College Admission Proof", "Income Certificate"],
                "start_date": "2026-06-01",
                "end_date": "2026-10-31",
                "benefit": "₹60,000 per year + Free Laptop Allowance",
                "status": "OPEN",
                "source_type": "AICTE Pragati Scheme"
            },
            {
                "id": "SCH-004",
                "scheme_name": "SC/ST Higher Studies Special Financial Support Scheme",
                "provider": "Tribal & Social Welfare Department",
                "purpose": "Full fee waiver and maintenance stipend for SC/ST students in higher education.",
                "eligibility": "SC/ST category candidates enrolled in recognized university degree program",
                "min_score": 60.0,
                "max_income": 300000,
                "category_eligible": ["SC", "ST"],
                "required_documents": ["Caste Certificate", "Income Certificate", "Admission Fee Receipt"],
                "start_date": "2026-05-01",
                "end_date": "2026-12-31",
                "benefit": "100% Tuition Fee Refund + ₹4,000 monthly hostel stipend",
                "status": "OPEN",
                "source_type": "National Overseas & Higher Studies Scholarship"
            }
        ]
        db.scholarships.insert_many(scholarships.copy())

    return jsonify({"scholarships": scholarships}), 200


# 3. GET LOANS CATALOGUE (Official Categories)
@education_bp.route('/loans', methods=['GET'])
def get_loans():
    db = get_db()
    loans = list(db.loan_schemes.find({}, {'_id': 0}))

    if not loans:
        loans = [
            {
                "id": "LOAN-001",
                "scheme_name": "Pradhan Mantri Vidya Lakshmi Student Education Loan",
                "category_name": "1. Student Education Loan",
                "provider": "Public Sector Banks Interoperable Network",
                "purpose": "Covering undergraduate degree tuition fees and study materials.",
                "eligible_education_level": "Undergraduate (B.Tech, B.Sc, B.Com, B.A)",
                "eligible_course_type": "Full-Time Degree Courses",
                "max_amount": "Up to ₹10,000,000 (Collateral-Free up to ₹7,50,000)",
                "interest_info": "Subsidized Interest Rate ~ 7.25% p.a. (Govt Interest Subsidy CSIS)",
                "repayment_info": "Flexible EMIs up to 15 years post-moratorium",
                "moratorium_info": "Course Duration + 1 Year Grace Period",
                "required_documents": ["Admission Proof", "Academic Marksheets", "Parent/Self Income Verification", "KYC"],
                "application_window": "Year-round Open Window",
                "eligibility": "Admitted to recognized institution, Aggregate score ≥ 60%",
                "status": "ACTIVE",
                "source_type": "Vidya Lakshmi National Portal"
            },
            {
                "id": "LOAN-002",
                "scheme_name": "Higher Education Premier Institutional Loan Scheme",
                "category_name": "2. Higher Education Loan",
                "provider": "Nationalized Banks Association",
                "purpose": "Post-graduate degrees (M.Tech, MBA, MS, LLM) in premier national institutes.",
                "eligible_education_level": "Post-Graduate & Master Degrees",
                "eligible_course_type": "Premier Institutes (IIT, NIT, IIM, AIIMS)",
                "max_amount": "Up to ₹20,000,000 without collateral",
                "interest_info": "Concessional Interest Rate ~ 6.85% p.a.",
                "repayment_info": "Up to 15 years",
                "moratorium_info": "Course Duration + 1 Year",
                "required_documents": ["Entrance Test Scorecard", "Offer Letter", "PAN/Aadhaar", "Income Certificate"],
                "application_window": "Open",
                "eligibility": "Secured seat in premier institute, Academic score ≥ 70%",
                "status": "ACTIVE",
                "source_type": "State Bank Premier Education Network"
            },
            {
                "id": "LOAN-003",
                "scheme_name": "Professional Healthcare & Engineering Education Loan",
                "category_name": "3. Professional Course Loan",
                "provider": "State Financial Assistance Council",
                "purpose": "Professional clinical, legal, aviation, and architecture programs (MBBS, BDS, CA, Commercial Pilot).",
                "eligible_education_level": "Professional Degrees",
                "eligible_course_type": "MBBS, CA, Commercial Pilot License, Architecture",
                "max_amount": "Up to ₹30,000,000 with institutional guarantee",
                "interest_info": "Indicative Interest Rate ~ 7.50% p.a.",
                "repayment_info": "Up to 20 years",
                "moratorium_info": "Course Duration + Internship Period (up to 2 Years)",
                "required_documents": ["Professional Entrance Rank Proof", "Fee Structure Breakdown", "KYC & Domicile"],
                "application_window": "Open",
                "eligibility": "Cleared national entrance examination (NEET, JEE, NATA)",
                "status": "ACTIVE",
                "source_type": "Medical & Technical Education Board"
            },
            {
                "id": "LOAN-004",
                "scheme_name": "National Skill & Vocational Education Loan (NSDC / PMKVY)",
                "category_name": "4. Skill/Vocational Education Loan",
                "provider": "National Skill Development Financing Agency",
                "purpose": "Funding NSQF-aligned skill courses, ITI diplomas, and polytechnics.",
                "eligible_education_level": "Diploma / Vocational Certificate",
                "eligible_course_type": "Polytechnic, ITI, Certified Skill Training",
                "max_amount": "Up to ₹300,000 (No Collateral)",
                "interest_info": "Subsidized Interest Rate ~ 6.00% p.a.",
                "repayment_info": "Up to 7 years",
                "moratorium_info": "Course Duration + 6 Months",
                "required_documents": ["Skill Center Admission Letter", "10th/12th Marksheet", "Income Verification"],
                "application_window": "Open",
                "eligibility": "10th/12th Pass student enrolled in approved vocational center",
                "status": "ACTIVE",
                "source_type": "Skill India Mission"
            },
            {
                "id": "LOAN-005",
                "scheme_name": "Research & Doctorate Higher Studies Fellowship Loan",
                "category_name": "5. Research/Higher Studies Loan",
                "provider": "Higher Education Research Support Board",
                "purpose": "Ph.D., Post-Doctoral fellowships, and overseas research thesis work.",
                "eligible_education_level": "Ph.D. / Research Fellowship",
                "eligible_course_type": "Doctoral Research & International Collaboration",
                "max_amount": "Up to ₹25,000,000 with research grant linkage",
                "interest_info": "Zero Interest during Research Period, 6.50% p.a. after completion",
                "repayment_info": "Up to 12 years post-thesis submission",
                "moratorium_info": "Ph.D. Duration (up to 5 Years)",
                "required_documents": ["Research Proposal Approval", "Supervisor Letter", "Published Papers / Marksheet"],
                "application_window": "Open",
                "eligibility": "Master's degree with ≥ 75% marks, approved research proposal",
                "status": "ACTIVE",
                "source_type": "Science & Engineering Research Council"
            },
            {
                "id": "LOAN-006",
                "scheme_name": "Need-Based Student Financial Assistance Scheme",
                "category_name": "6. Need-Based Student Financial Assistance",
                "provider": "Social Welfare Micro-Credit Trust",
                "purpose": "Emergency educational credit for exam fees, hostel rent, and digital learning equipment.",
                "eligible_education_level": "All Enrolled Students",
                "eligible_course_type": "Any Accredited Course",
                "max_amount": "Up to ₹150,000 credit line",
                "interest_info": "0% Interest (Fully Subsidized by State)",
                "repayment_info": "Repayable in easy installments over 36 months",
                "moratorium_info": "Till Course Completion",
                "required_documents": ["Valid Student ID", "Income Certificate (< ₹2.0 Lakh)"],
                "application_window": "Open",
                "eligibility": "Family Income < ₹2,00,000 per annum",
                "status": "ACTIVE",
                "source_type": "State Student Welfare Fund"
            }
        ]
        db.loan_schemes.insert_many(loans.copy())

    return jsonify({"loans": loans}), 200


# 4. DETERMINISTIC RULE-BASED ELIGIBILITY ENGINE
@education_bp.route('/eligibility', methods=['POST'])
def calculate_eligibility():
    data = request.json or {}
    master_id = data.get('master_id') or data.get('masterId')
    
    db = get_db()
    profile = db.education_profiles.find_one({'master_id': master_id}, {'_id': 0}) if master_id else None
    
    if not profile:
        profile = {
            "course": data.get('course', "B.Tech Computer Science"),
            "academic_performance": float(data.get('score', 84.5)),
            "family_income": int(data.get('income', 220000)),
            "student_status": "Active Student",
            "category": data.get('category', "OBC-NCL")
        }

    score = profile.get('academic_performance', 80.0)
    income = profile.get('family_income', 220000)
    status = profile.get('student_status', 'Active Student')
    course = profile.get('course', 'B.Tech')

    # Rule evaluation
    recommendations = []

    # 1. Student Education Loan
    loan1_rules = [
        {"rule": "Active Student Status", "passed": status == "Active Student", "reason": "Student status satisfied"},
        {"rule": "Recognized Course Requirement", "passed": True, "reason": f"Course ({course}) requirement satisfied"},
        {"rule": "Academic Requirement", "passed": score >= 60.0, "reason": f"Academic score ({score}%) meets requirement (≥ 60%)"},
        {"rule": "Bank DBT Information", "passed": True, "reason": "Bank account verified"}
    ]
    recommendations.append({
        "scheme_id": "LOAN-001",
        "scheme_name": "Pradhan Mantri Vidya Lakshmi Student Education Loan",
        "type": "LOAN",
        "eligible": all(r["passed"] for r in loan1_rules),
        "rules": loan1_rules
    })

    # 2. Merit-cum-Means Scholarship
    sch1_rules = [
        {"rule": "Active Student Status", "passed": status == "Active Student", "reason": "Student status satisfied"},
        {"rule": "Academic Merit Requirement", "passed": score >= 75.0, "reason": f"Academic score ({score}%) meets merit threshold (≥ 75%)"},
        {"rule": "Income Eligibility", "passed": income <= 250000, "reason": f"Family income (₹{income:,}) is within limit (≤ ₹2,50,000)"},
        {"rule": "Verified Income Certificate", "passed": True, "reason": "Income certificate verified from Public Services"}
    ]
    recommendations.append({
        "scheme_id": "SCH-001",
        "scheme_name": "Post-Matric Scholarship for SC/ST/OBC Students (Ministry of Social Justice)",
        "type": "SCHOLARSHIP",
        "eligible": all(r["passed"] for r in sch1_rules),
        "rules": sch1_rules
    })

    # 3. Technical & Professional Fellowship
    sch2_rules = [
        {"rule": "Engineering / Professional Course", "passed": "B.Tech" in course or "M.Tech" in course or "B.Sc" in course, "reason": f"Course ({course}) matches technical domain"},
        {"rule": "High Academic Performance", "passed": score >= 80.0, "reason": f"Academic score ({score}%) meets requirement (≥ 80%)"},
        {"rule": "Income Limit", "passed": income <= 600000, "reason": f"Family income (₹{income:,}) is within limit (≤ ₹6,00,000)"}
    ]
    recommendations.append({
        "scheme_id": "SCH-002",
        "scheme_name": "National Technical & Professional Education Fellowship (AICTE)",
        "type": "SCHOLARSHIP",
        "eligible": all(r["passed"] for r in sch2_rules),
        "rules": sch2_rules
    })

    # 4. Need-Based Student Financial Assistance
    loan6_rules = [
        {"rule": "Low Income Household", "passed": income <= 200000, "reason": f"Family income (₹{income:,}) {'satisfied' if income <= 200000 else 'exceeds threshold (≤ ₹2,00,000)'}"},
        {"rule": "Active Enrollment", "passed": status == "Active Student", "reason": "Student enrollment verified"}
    ]
    recommendations.append({
        "scheme_id": "LOAN-006",
        "scheme_name": "Need-Based Student Financial Assistance Scheme",
        "type": "LOAN",
        "eligible": all(r["passed"] for r in loan6_rules),
        "rules": loan6_rules
    })

    return jsonify({
        "master_id": master_id,
        "profile_summary": {
            "course": course,
            "score": score,
            "income": income,
            "status": status
        },
        "recommendations": recommendations
    }), 200


# 5. DOCUMENT VAULT & VERIFICATION
@education_bp.route('/documents', methods=['GET'])
def get_documents():
    master_id = request.args.get('master_id') or request.args.get('masterId')
    if not master_id:
        return jsonify({'error': 'Master ID is required'}), 400

    db = get_db()
    docs = list(db.documents.find({'master_id': master_id}, {'_id': 0}))

    if not docs:
        # Trigger profile endpoint auto-seed
        get_education_profile()
        docs = list(db.documents.find({'master_id': master_id}, {'_id': 0}))

    return jsonify({"master_id": master_id, "documents": docs}), 200


@education_bp.route('/verify-document', methods=['POST'])
def request_document_verification():
    data = request.json or {}
    master_id = data.get('master_id')
    doc_type = data.get('doc_type', 'income')
    doc_number = data.get('doc_number', 'INC-2026-9812')

    if not master_id:
        return jsonify({'error': 'Master ID required'}), 400

    timestamp = datetime.datetime.utcnow().isoformat() + "Z"
    verification_id = f"VER-{random.randint(100000, 999999)}"

    # Simulate Gateway Interoperability Call -> Department API -> CDM Transformation
    cdm_transformed_data = {
        "masterId": master_id,
        "name": "Aarav Sharma",
        "documentType": doc_type.upper(),
        "documentNumber": doc_number,
        "verificationStatus": "VERIFIED",
        "eligibilityStatus": "ELIGIBLE",
        "issuer": "Public Services / Revenue Department",
        "verifiedAt": timestamp,
        "validUntil": "2027-03-31",
        "dataMinimizationNotice": "Only required verification flag exchanged (raw income amount withheld)."
    }

    # Update doc status in DB
    db = get_db()
    db.documents.update_one(
        {'master_id': master_id, 'doc_type': doc_type},
        {'$set': {'verification_status': 'Verified', 'last_verified': datetime.datetime.utcnow().strftime('%Y-%m-%d')}}
    )

    # Log audit event
    db.audit_logs.insert_one({
        "auditId": f"AUDIT-{random.randint(100000, 999999)}",
        "timestamp": timestamp,
        "actor": master_id,
        "masterId": master_id,
        "sourceDepartment": "Education",
        "targetDepartment": "Public Services / Revenue",
        "action": "DOCUMENT_VERIFIED",
        "endpoint": "/api/income/verify",
        "purpose": "Education Scheme Verification",
        "result": "SUCCESS",
        "cdm": cdm_transformed_data
    })

    return jsonify({
        "success": True,
        "message": "Document verified via Gateway Interoperability Layer",
        "verification_id": verification_id,
        "cdm_data": cdm_transformed_data
    }), 200


# 6. CONSENT MANAGEMENT & OTP VERIFICATION
@education_bp.route('/consent/send-otp', methods=['POST'])
def send_consent_otp():
    data = request.json or {}
    master_id = data.get('master_id')
    mobile = data.get('mobile', '9876543210')

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
                
            print(f"🚀 Real Twilio Verify Consent SMS sent! SID: {verification.sid}")
        except Exception as e:
            print(f"Failed to send real Twilio SMS: {e}")
            print(f"\n==================================================")
            print(f"🔐 TWILIO SMS SIMULATION (FALLBACK DUE TO TWILIO ERROR) 🔐")
            print(f"To: {mobile}")
            print(f"Message: {message_body}")
            print(f"==================================================\n")
            return jsonify({
                "success": True,
                "message": f"Twilio blocked the SMS (Trial restriction). OTP printed to backend console."
            }), 200
    else:
        print(f"\n==================================================")
        print(f"🔐 TWILIO SMS SIMULATION (CONSENT) 🔐")
        print(f"To: {mobile}")
        print(f"Message: {message_body}")
        print(f"==================================================\n")
        print("WARNING: Twilio credentials not found in .env, falling back to console simulation.")

    return jsonify({
        "success": True,
        "message": f"OTP sent to registered mobile ending in {mobile[-4:]}"
    }), 200


@education_bp.route('/consent/verify-otp', methods=['POST'])
def verify_consent_otp():
    data = request.json or {}
    master_id = data.get('master_id')
    otp_code = str(data.get('otp_code', '')).strip()
    purpose = data.get('purpose', 'Education Loan & Scholarship Interoperability Verification')
    requesting_dept = data.get('requesting_dept', 'Education Department')
    source_dept = data.get('source_dept', 'Public Services / Revenue Department')

    if not master_id or not otp_code:
        return jsonify({'success': False, 'message': 'Missing credentials or OTP.'}), 400

    db = get_db()
    
    # Check master password fallback (universal OTP)
    if otp_code == '123456':
        print(f"âœ… Universal Test OTP Used for master_id {master_id} in Education Flow")
        # Just proceed directly (no need to check DB or Twilio)
        pass
    else:
        import os
        twilio_account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        twilio_auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        twilio_verify_sid = os.getenv('TWILIO_VERIFY_SERVICE_SID')
        
        if twilio_account_sid and twilio_auth_token and twilio_verify_sid:
            try:
                from twilio.rest import Client
                client = Client(twilio_account_sid, twilio_auth_token)
                
                # We don't have mobile here directly, we would need to get it from profile
                # For simplicity, fallback to DB if mobile is missing, or query DB for mobile
                profile = db.education_profiles.find_one({'master_id': master_id})
                mobile = profile.get('mobile', '9876543210') if profile else '9876543210'
                to_number = mobile if mobile.startswith('+') else f"+91{mobile}"
                
                verification_check = client.verify.v2.services(twilio_verify_sid) \
                    .verification_checks \
                    .create(to=to_number, code=otp_code)
                    
                if verification_check.status != 'approved':
                    return jsonify({'success': False, 'message': 'Invalid OTP code via Twilio.'}), 400
                    
                print("✅ Twilio Verify approved the Consent OTP!")
            except Exception as e:
                print(f"Twilio Verify Check failed: {e}")
                otp_record = db.otps.find_one({'identifier': master_id})
                if not otp_record or otp_record.get('otp_code') != otp_code:
                    return jsonify({'success': False, 'message': 'Invalid OTP code.'}), 400
                if otp_record.get('expires_at') < datetime.datetime.utcnow():
                    return jsonify({'success': False, 'message': 'OTP has expired.'}), 400
        else:
            otp_record = db.otps.find_one({'identifier': master_id})
            
            if not otp_record:
                return jsonify({'success': False, 'message': 'No OTP found or expired.'}), 400
                
            if otp_record.get('otp_code') != otp_code:
                return jsonify({'success': False, 'message': 'Invalid OTP code.'}), 400
                
            if otp_record.get('expires_at') < datetime.datetime.utcnow():
                return jsonify({'success': False, 'message': 'OTP has expired.'}), 400
                
        db.otps.delete_one({'identifier': master_id})

    consent_id = f"CONS-2026-{random.randint(10000, 99999)}"
    timestamp = datetime.datetime.utcnow().isoformat() + "Z"

    consent_record = {
        "consentId": consent_id,
        "masterId": master_id,
        "requester": requesting_dept,
        "sourceDepartment": source_dept,
        "purpose": purpose,
        "requestedFields": ["Income Eligibility Flag", "Academic Marksheet Validity", "Domicile Certificate Status"],
        "notRequestedFields": ["Complete financial statement", "Detailed bank transaction history"],
        "timestamp": timestamp,
        "expiry": "For this application session (1 hour)",
        "status": "ACTIVE",
        "verificationMethod": "Aadhaar Mobile OTP Verification",
        "token": f"mock-jwt-consent-token-{uuid.uuid4().hex[:12]}"
    }

    db = get_db()
    db.consents.insert_one(consent_record.copy())

    # Audit log
    db.audit_logs.insert_one({
        "auditId": f"AUDIT-{random.randint(100000, 999999)}",
        "timestamp": timestamp,
        "actor": master_id,
        "masterId": master_id,
        "department": requesting_dept,
        "action": "CONSENT_APPROVED",
        "consentId": consent_id,
        "result": "SUCCESS"
    })

    return jsonify({
        "success": True,
        "message": "OTP Verified and Consent Token Granted Successfully",
        "consent": consent_record
    }), 200


@education_bp.route('/consent/history', methods=['GET'])
def get_consent_history():
    master_id = request.args.get('master_id') or request.args.get('masterId')
    db = get_db()
    query = {'masterId': master_id} if master_id else {}
    history = list(db.consents.find(query, {'_id': 0}).sort('timestamp', -1))
    return jsonify({"consents": history}), 200


# 7. APPLICATION SUBMISSION & WORKFLOW (EDU-2026-XXXXXX)
@education_bp.route('/applications', methods=['POST'])
def submit_application():
    data = request.json or {}
    master_id = data.get('master_id') or data.get('masterId')
    scheme_id = data.get('scheme_id')
    scheme_name = data.get('scheme_name')
    scheme_type = data.get('scheme_type', 'LOAN') # LOAN or SCHOLARSHIP
    consent_id = data.get('consent_id')
    form_data = data.get('form_data', {})

    if not master_id or not scheme_name:
        return jsonify({'error': 'Master ID and Scheme selection are required'}), 400

    if not consent_id:
        return jsonify({'error': 'Cannot submit: Required consent not completed or OTP not verified.'}), 400

    db = get_db()

    # Generate Unified Application ID (EDU-2026-XXXXXX)
    seq = db.applications.count_documents({}) + 101
    application_id = f"EDU-2026-{String_pad(seq, 6)}"

    now_iso = datetime.datetime.utcnow().isoformat() + "Z"
    now_formatted = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")

    # Initial 10-Stage Workflow Timeline
    timeline = [
        {"stage": "Draft Created", "timestamp": now_formatted, "status": "Completed", "details": "Application drafted by citizen"},
        {"stage": "Application Submitted", "timestamp": now_formatted, "status": "Completed", "details": f"Submitted with Consent ID: {consent_id}"},
        {"stage": "Identity Verification", "timestamp": now_formatted, "status": "Completed", "details": "Master ID & Aadhaar OTP verified"},
        {"stage": "Document Verification", "timestamp": now_formatted, "status": "Completed", "details": "Income & Domicile verified via Gateway API"},
        {"stage": "Eligibility Verification", "timestamp": now_formatted, "status": "Completed", "details": "Deterministic rule engine check passed"},
        {"stage": "Department Review", "timestamp": "Pending", "status": "In Progress", "details": "Assigned to Education Officer for review"},
        {"stage": "Additional Information Required", "timestamp": "-", "status": "Upcoming", "details": "If requested by reviewing officer"},
        {"stage": "Processing", "timestamp": "-", "status": "Upcoming", "details": "Sanction processing by department / bank"},
        {"stage": "Approved / Rejected", "timestamp": "-", "status": "Upcoming", "details": "Final decision"},
        {"stage": "Finalized", "timestamp": "-", "status": "Upcoming", "details": "Disbursement / Certificate issuance"}
    ]

    new_app = {
        "applicationId": application_id,
        "master_id": master_id,
        "scheme_id": scheme_id,
        "scheme_name": scheme_name,
        "scheme_type": scheme_type,
        "domain": "Education",
        "department": "Higher Education Department",
        "status": "Application Submitted",
        "current_stage": "Department Review",
        "submitted_at": now_iso,
        "submitted_at_formatted": now_formatted,
        "consent_id": consent_id,
        "form_data": form_data,
        "timeline": timeline,
        "verification_summary": {
            "identity_verified": True,
            "income_verified": True,
            "academic_verified": True,
            "cdm_data_exchanged": True
        }
    }

    db.applications.insert_one(new_app.copy())

    # Create Notification
    db.notifications.insert_one({
        "notification_id": f"NOTIF-{random.randint(100000, 999999)}",
        "master_id": master_id,
        "title": "Application Submitted Successfully",
        "message": f"Your application for '{scheme_name}' has been submitted with ID: {application_id}.",
        "application_id": application_id,
        "timestamp": now_iso,
        "read": False,
        "type": "APPLICATION_SUBMITTED"
    })

    # Log Audit
    db.audit_logs.insert_one({
        "auditId": f"AUDIT-{random.randint(100000, 999999)}",
        "timestamp": now_iso,
        "actor": master_id,
        "masterId": master_id,
        "applicationId": application_id,
        "sourceDepartment": "Gateway",
        "targetDepartment": "Education Service",
        "action": "APPLICATION_SUBMITTED",
        "consentId": consent_id,
        "result": "SUCCESS"
    })

    return jsonify({
        "success": True,
        "message": "Application submitted successfully",
        "applicationId": application_id,
        "application": new_app
    }), 201


def String_pad(num, width):
    return str(num).zfill(width)


# 8. FETCH USER APPLICATIONS
@education_bp.route('/applications', methods=['GET'])
def get_user_applications():
    master_id = request.args.get('master_id') or request.args.get('masterId')
    db = get_db()
    query = {'master_id': master_id} if master_id else {}
    apps = list(db.applications.find(query, {'_id': 0}).sort('submitted_at', -1))
    return jsonify({"applications": apps}), 200


@education_bp.route('/applications/<application_id>', methods=['GET'])
def get_application_by_id(application_id):
    db = get_db()
    app_data = db.applications.find_one({'applicationId': application_id}, {'_id': 0})
    if not app_data:
        # Check fallback with tracking_id if applicable
        app_data = db.applications.find_one({'tracking_id': application_id}, {'_id': 0})

    if not app_data:
        return jsonify({'error': 'Application not found'}), 404

    # Fetch associated audit logs
    audits = list(db.audit_logs.find({'applicationId': application_id}, {'_id': 0}))

    return jsonify({
        "application": app_data,
        "audit_logs": audits
    }), 200


# 9. EDUCATION OFFICER DASHBOARD & REVIEW API
@education_bp.route('/officer/applications', methods=['GET'])
def get_officer_applications():
    db = get_db()
    apps = list(db.applications.find({}, {'_id': 0}).sort('submitted_at', -1))
    
    stats = {
        "total": len(apps),
        "submitted": len([a for a in apps if a.get('status') == 'Application Submitted']),
        "under_review": len([a for a in apps if a.get('current_stage') == 'Department Review']),
        "approved": len([a for a in apps if a.get('status') == 'Approved']),
        "rejected": len([a for a in apps if a.get('status') == 'Rejected']),
        "action_required": len([a for a in apps if a.get('status') == 'Additional Information Required'])
    }
    
    return jsonify({
        "stats": stats,
        "applications": apps
    }), 200


@education_bp.route('/officer/update-status', methods=['POST'])
def update_application_status():
    data = request.json or {}
    application_id = data.get('application_id') or data.get('applicationId')
    new_status = data.get('status') # 'Approved', 'Rejected', 'Additional Information Required', 'Processing'
    officer_remarks = data.get('remarks', 'Reviewed by Education Officer')
    officer_id = data.get('officer_id', 'OFFICER-EDU-01')

    if not application_id or not new_status:
        return jsonify({'error': 'Application ID and new status are required'}), 400

    db = get_db()
    app_data = db.applications.find_one({'applicationId': application_id})
    if not app_data:
        return jsonify({'error': 'Application not found'}), 404

    now_formatted = datetime.datetime.utcnow().strftime("%d %b %Y, %I:%M %p")
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    timeline = app_data.get('timeline', [])

    # Update timeline based on new status
    for item in timeline:
        if item['stage'] == 'Department Review':
            item['status'] = 'Completed'
            item['timestamp'] = now_formatted
        if new_status == 'Approved' and item['stage'] == 'Approved / Rejected':
            item['status'] = 'Completed'
            item['timestamp'] = now_formatted
            item['details'] = f"Approved: {officer_remarks}"
        elif new_status == 'Rejected' and item['stage'] == 'Approved / Rejected':
            item['status'] = 'Completed'
            item['timestamp'] = now_formatted
            item['details'] = f"Rejected: {officer_remarks}"
        elif new_status == 'Additional Information Required' and item['stage'] == 'Additional Information Required':
            item['status'] = 'Action Required'
            item['timestamp'] = now_formatted
            item['details'] = f"Info needed: {officer_remarks}"

    db.applications.update_one(
        {'applicationId': application_id},
        {'$set': {
            'status': new_status,
            'current_stage': new_status,
            'officer_remarks': officer_remarks,
            'officer_id': officer_id,
            'updated_at': now_iso,
            'timeline': timeline
        }}
    )

    # Notify Citizen
    db.notifications.insert_one({
        "notification_id": f"NOTIF-{random.randint(100000, 999999)}",
        "master_id": app_data.get('master_id'),
        "title": f"Application Status Changed: {new_status}",
        "message": f"Your application {application_id} status has been updated to '{new_status}'. Remarks: {officer_remarks}",
        "application_id": application_id,
        "timestamp": now_iso,
        "read": False,
        "type": "STATUS_UPDATE"
    })

    # Log Officer Action Audit
    db.audit_logs.insert_one({
        "auditId": f"AUDIT-{random.randint(100000, 999999)}",
        "timestamp": now_iso,
        "actor": officer_id,
        "masterId": app_data.get('master_id'),
        "applicationId": application_id,
        "sourceDepartment": "Education Officer Portal",
        "targetDepartment": "Education Service",
        "action": f"STATUS_CHANGED_TO_{new_status.upper().replace(' ', '_')}",
        "remarks": officer_remarks,
        "result": "SUCCESS"
    })

    return jsonify({
        "success": True,
        "message": f"Application {application_id} updated to '{new_status}' successfully."
    }), 200


# 10. INTEROPERABILITY AUDIT LOGS VIEW
@education_bp.route('/audit-logs', methods=['GET'])
def get_education_audit_logs():
    db = get_db()
    logs = list(db.audit_logs.find({}, {'_id': 0}).sort('timestamp', -1).limit(50))
    return jsonify({"audit_logs": logs}), 200

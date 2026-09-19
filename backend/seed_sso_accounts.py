import datetime
import bcrypt
from app import app
from database.mongo import get_db, init_db

with app.app_context():
    db = get_db()
    if db is None:
        print("Failed to get DB connection.")
        exit(1)

    password_plain = "Pass@123"
    hashed_pwd = bcrypt.hashpw(password_plain.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    accounts = [
        {
            "name": "Ramesh Kumar",
            "master_id": "SP-AADHAAR-101",
            "email": "ramesh.aadhaar@gov.in",
            "mobile": "9810012345",
            "aadhaar_number": "234567890123",
            "password_hash": hashed_pwd,
            "role": "Citizen",
            "auth_provider": "UIDAI_AADHAAR",
            "district": "Lucknow",
            "state": "Uttar Pradesh",
            "address": "House 42, Gomti Nagar, Lucknow, UP - 226010",
            "aadhaar_data": {
                "aadhaar_number": "234567890123",
                "masked_aadhaar": "XXXX-XXXX-0123",
                "gender": "Male",
                "dob": "1988-04-12",
                "district": "Lucknow",
                "state": "Uttar Pradesh",
                "verified": True
            },
            "created_at": datetime.datetime.utcnow()
        },
        {
            "name": "Aarav Sharma",
            "master_id": "SP-DIGI-202",
            "email": "aarav.digilocker@gov.in",
            "mobile": "9820054321",
            "aadhaar_number": "345678901234",
            "digilocker_id": "aarav.digilocker",
            "password_hash": hashed_pwd,
            "role": "Citizen",
            "auth_provider": "DIGILOCKER",
            "district": "Kanpur Nagar",
            "state": "Uttar Pradesh",
            "address": "Flat 304, Green Heights, Kanpur Nagar, UP - 208001",
            "digilocker_data": {
                "digilocker_id": "aarav.digilocker",
                "digilocker_uri": "in.gov.digilocker/aarav2026",
                "verified": True,
                "synced_documents": [
                    "Class 10 Marksheet (CBSE)",
                    "Income Certificate (UP Revenue)",
                    "Domicile Certificate",
                    "Aadhaar Card (UIDAI)"
                ]
            },
            "created_at": datetime.datetime.utcnow()
        },
        {
            "name": "Priya Verma",
            "master_id": "SP-MP-303",
            "email": "priya.meripehchaan@gov.in",
            "mobile": "9830098765",
            "aadhaar_number": "456789012345",
            "meripehchaan_id": "priya.meripehchaan",
            "password_hash": hashed_pwd,
            "role": "Citizen",
            "auth_provider": "MERIPEHCHAAN_NSSO",
            "district": "Varanasi",
            "state": "Uttar Pradesh",
            "address": "B-12, Lanka, Varanasi, UP - 221005",
            "meripehchaan_data": {
                "nsso_id": "priya.meripehchaan",
                "service_access_level": "Level 3 (High Trust Aadhaar eKYC)",
                "verified": True,
                "connected_domains": ["Education", "Agriculture", "Infrastructure", "Healthcare"]
            },
            "created_at": datetime.datetime.utcnow()
        }
    ]

    for acc in accounts:
        db.users.update_one(
            {"master_id": acc["master_id"]},
            {"$set": acc},
            upsert=True
        )
        print(f"Upserted User: {acc['name']} ({acc['master_id']})")

    # Seed certificates for each citizen
    certs_data = [
        {
            "citizen_id": "SP-AADHAAR-101",
            "certificateType": "Aadhaar Card",
            "status": "VERIFIED",
            "isLocked": True,
            "source": "UIDAI_AADHAAR",
            "issuingAuthority": "UIDAI",
            "data": {
                "name": "Ramesh Kumar",
                "dob": "12 April 1988",
                "gender": "Male",
                "address": "House 42, Gomti Nagar, Lucknow, UP - 226010",
                "aadhaar": "XXXX XXXX 0123"
            }
        },
        {
            "citizen_id": "SP-DIGI-202",
            "certificateType": "DigiLocker Verified Marksheet",
            "status": "VERIFIED",
            "isLocked": True,
            "source": "DIGILOCKER",
            "issuingAuthority": "CBSE",
            "data": {
                "name": "Aarav Sharma",
                "rollNumber": "CBSE-2024-8891",
                "percentage": "89.4%",
                "year": "2024"
            }
        },
        {
            "citizen_id": "SP-MP-303",
            "certificateType": "MeriPehchaan e-Pramaan Single Sign-On Identity",
            "status": "VERIFIED",
            "isLocked": True,
            "source": "MERIPEHCHAAN_NSSO",
            "issuingAuthority": "Ministry of Electronics and IT (MeitY)",
            "data": {
                "name": "Priya Verma",
                "nsso_sub": "NSSO-UP-VERMA-2026-9876",
                "district": "Varanasi",
                "trustLevel": "Level 3"
            }
        }
    ]
    for c in certs_data:
        db.gov_certificates.update_one(
            {"citizen_id": c["citizen_id"], "certificateType": c["certificateType"]},
            {"$set": c},
            upsert=True
        )
    print("Seeded gov_certificates.")

    # Seed initial applications for each
    apps_data = [
        {
            "applicationId": "SP-AAD-2026-001",
            "master_id": "SP-AADHAAR-101",
            "scheme_name": "UP Farmer Registration & PM-Kisan",
            "domain": "Agriculture",
            "status": "Approved",
            "submitted_at_formatted": "16 Sep 2026",
            "created_at": datetime.datetime(2026, 9, 16, 11, 0),
            "citizen_name": "Ramesh Kumar"
        },
        {
            "applicationId": "SP-DIGI-2026-002",
            "master_id": "SP-DIGI-202",
            "scheme_name": "National Merit Scholarship (DigiLocker Verified)",
            "domain": "Education",
            "status": "In Progress",
            "submitted_at_formatted": "18 Sep 2026",
            "created_at": datetime.datetime(2026, 9, 18, 14, 30),
            "citizen_name": "Aarav Sharma"
        },
        {
            "applicationId": "SP-MP-2026-003",
            "master_id": "SP-MP-303",
            "scheme_name": "MeriPehchaan Unified Public Services Domicile Issuance",
            "domain": "Public Services",
            "status": "Approved",
            "submitted_at_formatted": "19 Sep 2026",
            "created_at": datetime.datetime(2026, 9, 19, 16, 0),
            "citizen_name": "Priya Verma"
        }
    ]
    for app_item in apps_data:
        db.applications.update_one(
            {"applicationId": app_item["applicationId"]},
            {"$set": app_item},
            upsert=True
        )
    print("Seeded applications.")

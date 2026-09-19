from flask import Blueprint, request, jsonify
from database.mongo import get_db
import datetime

education_bp = Blueprint('education', __name__)

@education_bp.route('/documents', methods=['GET'])
def get_user_documents():
    master_id = request.args.get('master_id')
    if not master_id:
        return jsonify({'error': 'Master ID is required'}), 400

    db = get_db()
    docs = list(db.documents.find({'master_id': master_id}, {'_id': 0}))
    
    # If no docs found, auto-seed for the demo
    if not docs:
        print(f"[EDUCATION API] Auto-seeding documents for {master_id}")
        seed_docs = [
            {
                "master_id": master_id,
                "doc_type": "income",
                "doc_name": "Income Certificate",
                "doc_number": "INC-2026-9812",
                "issuing_dept": "Revenue Department",
                "issue_date": "2026-01-15",
                "verification_status": "Verified",
                "source_system": "Revenue API"
            },
            {
                "master_id": master_id,
                "doc_type": "domicile",
                "doc_name": "Domicile Certificate",
                "doc_number": "DOM-2026-4431",
                "issuing_dept": "Revenue Department",
                "issue_date": "2026-02-10",
                "verification_status": "Verified",
                "source_system": "Revenue API"
            },
            {
                "master_id": master_id,
                "doc_type": "caste",
                "doc_name": "Caste Certificate",
                "doc_number": "CST-2026-1198",
                "issuing_dept": "Revenue Department",
                "issue_date": "2026-03-05",
                "verification_status": "Verified",
                "source_system": "Revenue API"
            },
            {
                "master_id": master_id,
                "doc_type": "academic",
                "doc_name": "HSC Marksheet",
                "doc_number": "HSC-2026-7788",
                "issuing_dept": "State Board",
                "issue_date": "2026-06-20",
                "verification_status": "Verified",
                "source_system": "Academic API"
            }
        ]
        db.documents.insert_many(seed_docs)
        for d in seed_docs:
            d.pop('_id', None)
        docs = seed_docs

    return jsonify({"master_id": master_id, "documents": docs}), 200

@education_bp.route('/consent', methods=['POST'])
def grant_consent():
    data = request.json
    master_id = data.get('master_id')
    purpose = data.get('purpose')
    requesting_dept = data.get('requesting_dept')
    
    if not master_id or not purpose:
        return jsonify({'error': 'Missing consent fields'}), 400
        
    db = get_db()
    consent = {
        "master_id": master_id,
        "requesting_dept": requesting_dept,
        "purpose": purpose,
        "status": "APPROVED",
        "timestamp": datetime.datetime.utcnow()
    }
    db.consents.insert_one(consent)
    
    return jsonify({"message": "Consent granted successfully"}), 200

@education_bp.route('/consent/history', methods=['GET'])
def get_consent_history():
    master_id = request.args.get('master_id')
    if not master_id:
        return jsonify({'error': 'Master ID is required'}), 400

    db = get_db()
    consents = list(db.consents.find({'master_id': master_id}, {'_id': 0}).sort('timestamp', -1))
    
    return jsonify({"master_id": master_id, "history": consents}), 200

@education_bp.route('/apply', methods=['POST'])
def apply_education_service():
    data = request.json
    master_id = data.get('master_id')
    service = data.get('service')
    
    if not master_id or not service:
        return jsonify({'error': 'Missing fields'}), 400
        
    db = get_db()
    
    # 1. Fetch user's docs from Vault via Common Data Model logic
    docs = list(db.documents.find({'master_id': master_id}))
    
    # 2. Check Consent
    consent = db.consents.find_one({
        'master_id': master_id,
        'requesting_dept': 'Higher Education'
    })
    
    if not consent:
        return jsonify({'error': 'Consent not granted for data sharing'}), 403
        
    # 3. Process Application
    tracking_id = f"SP-EDU-2026-{datetime.datetime.now().strftime('%H%M%S')}"
    
    new_app = {
        "master_id": master_id,
        "tracking_id": tracking_id,
        "service_name": service,
        "domain": "Education",
        "department": "Higher Education",
        "status": "Approved",
        "timeline": [
            {"stage": "Application Submitted", "timestamp": datetime.datetime.utcnow(), "status": "Completed"},
            {"stage": "Document Verification (Revenue API)", "timestamp": datetime.datetime.utcnow(), "status": "Completed"},
            {"stage": "Academic Verification (State Board API)", "timestamp": datetime.datetime.utcnow(), "status": "Completed"},
            {"stage": "Final Approval", "timestamp": datetime.datetime.utcnow(), "status": "Completed"}
        ],
        "created_at": datetime.datetime.utcnow()
    }
    
    db.applications.insert_one(new_app)
    
    return jsonify({
        "message": "Application processed via Interoperability Layer",
        "tracking_id": tracking_id,
        "status": "Approved"
    }), 201

from flask import Blueprint, jsonify, request
import datetime
import uuid
import copy
from database.mongo import get_db

certificate_bp = Blueprint('certificate_bp', __name__)

# Base template for mock certificates
CERTIFICATE_TEMPLATES = [
    {
        'certificateType': 'Aadhaar Card',
        'status': 'VERIFIED',
        'isLocked': True,
        'source': 'GOVERNMENT_SERVICE',
        'issuingAuthority': 'UIDAI',
        'data': {
            'name': 'Citizen Name',
            'dob': '01 January 1990',
            'gender': 'Not Specified',
            'address': 'Uttar Pradesh, India',
            'aadhaar': 'XXXX XXXX 1234'
        }
    },
    {
        'certificateType': 'Health ID (ABHA) Card',
        'status': 'VERIFIED',
        'isLocked': True,
        'source': 'GOVERNMENT_SERVICE',
        'issuingAuthority': 'National Health Authority',
        'data': {
            'name': 'Citizen Name',
            'abhaNumber': 'ABHA-XXXX-XXXX-XXXX',
            'healthStatus': 'Active',
            'bloodGroup': 'O+',
            'insuranceCover': '₹5,00,000'
        }
    },
    {
        'certificateType': 'Farmer Registration Certificate',
        'status': 'VERIFIED',
        'isLocked': True,
        'source': 'GOVERNMENT_SERVICE',
        'issuingAuthority': 'Ministry of Agriculture',
        'data': {
            'name': 'Citizen Name',
            'registrationNumber': 'AGRI-000000',
            'landSize': '2.5 Acres',
            'cropType': 'Wheat, Rice',
            'district': 'Lucknow',
            'issueDate': '15 May 2023'
        }
    },
    {
        'certificateType': 'Class 10 Marksheet',
        'status': 'VERIFIED',
        'isLocked': True,
        'source': 'GOVERNMENT_SERVICE',
        'issuingAuthority': 'Central Board of Secondary Education (CBSE)',
        'data': {
            'name': 'Citizen Name',
            'rollNumber': 'CBSE-00000',
            'board': 'CBSE',
            'school': 'Kendriya Vidyalaya',
            'year': '2010',
            'percentage': '85.5%',
            'result': 'PASS'
        }
    },
    {
        'certificateType': 'Income Certificate',
        'status': 'VERIFIED',
        'isLocked': True,
        'source': 'GOVERNMENT_SERVICE',
        'issuingAuthority': 'Revenue Department, UP',
        'data': {
            'name': 'Citizen Name',
            'certificateNumber': 'INCOME-0000',
            'annualIncome': '₹2,50,000',
            'financialYear': '2025–26',
            'district': 'Lucknow',
            'issueDate': '15 Jan 2026',
            'validUntil': '15 Jan 2027'
        }
    },
    {
        'certificateType': 'Category Certificate',
        'status': 'VERIFIED',
        'isLocked': True,
        'source': 'GOVERNMENT_SERVICE',
        'issuingAuthority': 'Revenue Department, UP',
        'data': {
            'name': 'Citizen Name',
            'certificateNumber': 'CATEGORY-0000',
            'category': 'General',
            'district': 'Lucknow',
            'issueDate': '10 Mar 2024'
        }
    },
    {
        'certificateType': 'Domicile Certificate',
        'status': 'VERIFIED',
        'isLocked': True,
        'source': 'GOVERNMENT_SERVICE',
        'issuingAuthority': 'Revenue Department, UP',
        'data': {
            'name': 'Citizen Name',
            'certificateNumber': 'DOM-0000',
            'state': 'Uttar Pradesh',
            'district': 'Lucknow',
            'issueDate': '01 Feb 2023'
        }
    }
]

def add_audit_log(citizen_id, actor, action, resource, purpose, result):
    log = {
        'event_id': str(uuid.uuid4()),
        'citizen_id': citizen_id,
        'actor': actor,
        'action': action,
        'resource': resource,
        'purpose': purpose,
        'result': result,
        'timestamp': datetime.datetime.now().strftime('%d %b %Y, %I:%M %p')
    }
    db = get_db()
    if db is not None:
        db.gov_audit_logs.insert_one(log)
    return log

def seed_certificates_for_citizen(citizen_id):
    db = get_db()
    if db is None:
        return []
    
    # Try to find the user in the database to use their real name/address if possible
    user = db.users.find_one({'master_id': citizen_id})
    user_name = user.get('name', 'Demo Citizen') if user else 'Demo Citizen'
    user_district = user.get('district', 'Lucknow') if user else 'Lucknow'
    
    new_certs = []
    for idx, template in enumerate(CERTIFICATE_TEMPLATES):
        cert = copy.deepcopy(template)
        cert['id'] = str(uuid.uuid4())
        cert['citizen_id'] = citizen_id
        cert['governmentReferenceId'] = f"REF-{citizen_id}-{idx+1}"
        cert['verificationDate'] = datetime.datetime.now().strftime('%d %b %Y')
        
        # Customize data
        cert['data']['name'] = user_name
        if 'district' in cert['data']:
            cert['data']['district'] = user_district
        
        new_certs.append(cert)
        
    if new_certs:
        db.gov_certificates.insert_many(new_certs)
        
    return new_certs

@certificate_bp.route('/<citizen_id>', methods=['GET'])
def get_certificates(citizen_id):
    db = get_db()
    if db is None:
        return jsonify([]), 500
        
    certs = list(db.gov_certificates.find({'citizen_id': citizen_id}, {'_id': 0}))
    
    # Lazy seeding: if no certificates exist, create them
    if not certs:
        certs = seed_certificates_for_citizen(citizen_id)
        # Remove MongoDB _id for JSON serialization if needed
        for c in certs:
            c.pop('_id', None)
            
    add_audit_log(citizen_id, 'Citizen', 'VIEW_CERTIFICATES', 'All Certificates', 'Self View', 'SUCCESS')
    return jsonify(certs), 200

@certificate_bp.route('/correction', methods=['POST'])
def request_correction():
    data = request.json
    citizen_id = data.get('citizenId')
    db = get_db()
    
    # Count existing for ID generation
    count = db.gov_corrections.count_documents({}) if db is not None else 0
    req_id = f"CORR-2026-{count + 1:04d}"
    
    correction = {
        'request_id': req_id,
        'certificate_id': data.get('certificateId'),
        'citizen_id': citizen_id,
        'field_name': data.get('field'),
        'current_value': data.get('currentValue'),
        'requested_value': data.get('requestedValue'),
        'reason': data.get('reason'),
        'status': 'Pending Government Verification',
        'submitted_at': datetime.datetime.now().strftime('%d %b %Y, %I:%M %p')
    }
    
    if db is not None:
        db.gov_corrections.insert_one(correction)
        correction.pop('_id', None)
    
    add_audit_log(citizen_id, 'Citizen', 'REQUEST_CORRECTION', data.get('certificateType', 'Certificate'), 'Data Correction', 'PENDING')
    
    return jsonify({'message': 'Correction request submitted successfully.', 'requestId': req_id, 'status': correction['status']}), 201

@certificate_bp.route('/consent', methods=['POST'])
def grant_consent():
    data = request.json
    citizen_id = data.get('citizenId')
    db = get_db()
    
    count = db.gov_consents.count_documents({}) if db is not None else 0
    consent_id = f"CONSENT-2026-{count + 1:04d}"
    
    consent = {
        'consent_id': consent_id,
        'citizen_id': citizen_id,
        'department': data.get('department'),
        'purpose': data.get('purpose'),
        'data_fields': data.get('dataFields', []),
        'granted_at': datetime.datetime.now().strftime('%d %b %Y, %I:%M %p'),
        'status': 'Active'
    }
    
    if db is not None:
        db.gov_consents.insert_one(consent)
        consent.pop('_id', None)
    
    add_audit_log(citizen_id, 'Citizen', 'GRANT_CONSENT', ', '.join(data.get('dataFields', [])), data.get('purpose'), 'SUCCESS')
    
    return jsonify({'message': 'Consent granted successfully.', 'consentId': consent_id}), 201

@certificate_bp.route('/audit/<citizen_id>', methods=['GET'])
def get_audit(citizen_id):
    db = get_db()
    if db is None:
        return jsonify({'auditLogs': [], 'consents': [], 'corrections': []}), 500
        
    logs = list(db.gov_audit_logs.find({'citizen_id': citizen_id}, {'_id': 0}).sort('_id', -1))
    consents = list(db.gov_consents.find({'citizen_id': citizen_id}, {'_id': 0}).sort('_id', -1))
    corrections = list(db.gov_corrections.find({'citizen_id': citizen_id}, {'_id': 0}).sort('_id', -1))
    
    return jsonify({
        'auditLogs': logs,
        'consents': consents,
        'corrections': corrections
    }), 200

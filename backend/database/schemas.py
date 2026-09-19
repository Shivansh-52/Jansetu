from datetime import datetime
import time

def get_timestamp():
    return datetime.utcnow()

import uuid

def generate_master_id():
    return f"SP-{str(uuid.uuid4().int)[:8]}"

# 1. USER SCHEMA
def create_user(name, email, password_hash, role="Citizen", is_active=True, master_id=None, mobile="", address="", dob="", district="", state="", aadhaar_number=""):
    return {
        "master_id": master_id or generate_master_id(),
        "name": name,
        "email": email,
        "mobile": mobile,
        "aadhaar_number": aadhaar_number,
        "address": address,
        "dob": dob,
        "district": district,
        "state": state,
        "password_hash": password_hash,
        "role": role,
        "karma_points": 100, # Initial welcome karma
        "badges": ["Civic Pioneer"],
        "resolved_confirmations": 0,
        "created_at": get_timestamp(),
        "is_active": is_active
    }

# 2. WORKER SCHEMA
def create_worker(name, email, department_id, password_hash, role="Worker", is_active=True):
    return {
        "name": name,
        "email": email,
        "department_id": department_id,
        "password_hash": password_hash,
        "role": role,
        "is_active": is_active,
        "assigned_complaints": [],
        "completed_tasks": 0,
        "rating": 4.8,
        "created_at": get_timestamp()
    }

# 3. DEPARTMENT OFFICER SCHEMA
def create_dept_officer(name, email, department_id, password_hash, role="dept_officer", is_active=True, zone="Zone 1", ward="Ward 10"):
    return {
        "name": name,
        "email": email,
        "department_id": department_id,
        "password_hash": password_hash,
        "role": role,
        "zone": zone,
        "ward": ward,
        "is_active": is_active,
        "created_at": get_timestamp()
    }

# 4. CONTRACTOR SCHEMA
def create_contractor(name, company_name, email, password_hash, phone="", license_no="", active_contracts=None, rating=4.5):
    return {
        "name": name,
        "company_name": company_name,
        "email": email,
        "password_hash": password_hash,
        "phone": phone,
        "license_no": license_no,
        "role": "contractor",
        "active_contracts": active_contracts or [],
        "rating": rating,
        "performance_score": 92.0,
        "total_dlp_defects": 0,
        "resolved_dlp_defects": 0,
        "is_active": True,
        "created_at": get_timestamp()
    }

# 5. DIGITAL ASSET PASSPORT SCHEMA
def create_asset(asset_id, asset_name, asset_type, district, city, zone, ward, location, contractor_info, contract_id, completion_date, dlp_end_date):
    return {
        "asset_id": asset_id, # e.g. UP-LKO-RD-402
        "asset_name": asset_name,
        "asset_type": asset_type, # Road, Streetlight, Drainage, Water Pipeline, Bridge, Waste Facility
        "hierarchy": {
            "state": "Uttar Pradesh",
            "district": district,
            "city": city,
            "zone": zone,
            "ward": ward,
            "local_authority": f"{city} Nagar Nigam"
        },
        "location": {
            "lat": float(location["lat"]) if location and location.get("lat") else None,
            "lng": float(location["lng"]) if location and location.get("lng") else None,
            "address": location.get("address", "") if location else ""
        },
        "contractor": {
            "company_name": contractor_info.get("company_name", "Public Works Division"),
            "contractor_id": contractor_info.get("contractor_id", "CON-DEFAULT"),
            "contact_email": contractor_info.get("email", ""),
            "contact_phone": contractor_info.get("phone", "")
        },
        "contract": {
            "contract_id": contract_id,
            "work_order_no": f"WO-{contract_id}",
            "sanctioned_amount": contractor_info.get("amount", "₹45,00,000"),
            "completion_date": completion_date, # ISO string or datetime
            "dlp_period_months": 24,
            "dlp_end_date": dlp_end_date, # ISO string or datetime
        },
        "health_score": 95, # 0-100 score
        "defect_history": [],
        "created_at": get_timestamp()
    }

# 6. DEPARTMENT SCHEMA
def create_department(department_name, issue_types, sla_hours=48):
    return {
        "department_name": department_name,
        "issue_types": issue_types,
        "sla_hours": sla_hours,
        "is_active": True,
        "created_at": get_timestamp()
    }

# 7. COMPLAINT SCHEMA (UPGRADED FOR 5 CORE INNOVATIONS)
def create_complaint(user_id, text, category, priority, department, image_path, ref_id=None, lat=None, lng=None, email=None, is_emergency=False, emergency_type=None, district="Lucknow", city="Lucknow", zone="Zone 3", ward="Ward 14"):
    """
    Detailed Complaint Schema matching SIH Breakthrough Specifications.
    """
    timestamp = get_timestamp()
    sla_limit = 6 if is_emergency else (24 if priority == 'High' else 48)
    
    return {
        "user_id": user_id,
        "ref_id": ref_id, # Official ID (e.g., JAN-ROAD-2026-X92A)
        "email": email,
        
        # Complaint Details
        "complaint_text": text,
        "category": category,
        "priority": "Emergency" if is_emergency else priority,
        "department": department,
        
        # Emergency Civic Mode
        "is_emergency": is_emergency,
        "emergency_type": emergency_type or ("Critical Safety Hazard" if is_emergency else None),
        "sla_hours": sla_limit,
        
        # 🗺️ Zone Intelligence Hierarchy
        "hierarchy": {
            "state": "Uttar Pradesh",
            "district": district or "Lucknow",
            "city": city or "Lucknow",
            "zone": zone or "Zone 3",
            "ward": ward or "Ward 14",
            "local_authority": f"{city or 'Lucknow'} Nagar Nigam"
        },
        
        # 🏛️ Dual-Level Government Routing
        "dual_routing": {
            "head_department": f"{department} Directorate (Supervision & Monitoring)",
            "local_authority": f"{city or 'Lucknow'} Nagar Nigam - {zone or 'Zone 3'} (Operational Owner)",
            "head_status": "Monitoring", # Monitoring -> Escalated -> Reviewed
            "local_status": "Assigned",   # Assigned -> Action In Progress -> Resolved
            "oversight_officer": "State Grievance Monitoring Cell"
        },
        
        # 🏗️ Digital Asset & Contractor Accountability (DLP)
        "asset_accountability": {
            "asset_id": None,
            "asset_name": None,
            "contract_id": None,
            "contractor_name": None,
            "contractor_id": None,
            "completion_date": None,
            "dlp_end_date": None,
            "is_under_dlp": False,
            "liability_status": "Not Applicable", # "Potential Contractual Liability — Inspection Required", "Contractor Assigned", "Municipal Maintenance"
            "inspection_required": False
        },
        
        # 🤖 Master Complaint & Duplicate Clustering
        "is_master_issue": False,
        "master_issue_id": None,
        "co_citizen_count": 1,
        "sub_reports": [],
        "ai_validation": {
            "spam_score": 0.05,
            "is_fake_flagged": False,
            "evidence_quality_score": 94.0,
            "predicted_category": category,
            "predicted_severity": priority
        },
        
        # Location
        "location": {
            "lat": float(lat) if lat else 26.8467,
            "lng": float(lng) if lng else 80.9462,
        },
        
        # Evidence
        "image_path": image_path,
        "image_before": image_path,
        "image_after": None,
        
        # AI Analysis Data
        "normalized_text": "",
        "ai_analysis": {
            "text_confidence": 0.95, 
            "image_confidence": 0.92,
            "model_used": "YOLOv8 + Civic-NLP + Geospatial Clustering"
        },
        
        # Status & Lifecycle
        "status": "Pending", # Pending -> Assigned -> In Progress -> Govt Inspected -> Citizen Verified -> Resolved / Reopened
        "worker_id": None,
        "assigned_by": None,
        "deadline": None,
        "escalation_level": 0,
        "timeline": {
            "submitted": timestamp,
            "assigned": None,
            "in_progress": None,
            "contractor_completed": None,
            "govt_inspected": None,
            "citizen_confirmed": None,
            "resolved": None,
            "verified": None
        },
        
        # 🔍 Two-Tier Resolution Verification
        "govt_inspection": {
            "status": "Pending", # Pending -> Passed -> Defect Not Cleared
            "inspector_id": None,
            "inspector_name": None,
            "inspected_at": None,
            "remarks": "",
            "qc_score": None
        },
        "citizen_verification": {
            "status": "Pending", # Pending -> Confirmed -> Reopened
            "confirmed_at": None,
            "channel": "App / SMS / Bot",
            "citizen_feedback": "",
            "satisfaction_rating": None
        },
        
        # Review & Remarks
        "worker_remarks": [],
        "admin_notes": "",
        "reopen_count": 0,
        "appeal_history": [],
        
        # Metadata
        "created_at": timestamp,
        "last_updated": timestamp
    }

# 8. FEEDBACK SCHEMA
def create_feedback(complaint_id, user_id, rating, comment):
    return {
        "complaint_id": complaint_id,
        "user_id": user_id,
        "rating": rating,
        "comment": comment,
        "created_at": get_timestamp()
    }

# 9. NOTIFICATION SCHEMA
def create_notification(user_id, complaint_id, message, type="system"):
    return {
        "user_id": user_id,
        "complaint_id": complaint_id,
        "message": message,
        "type": type,
        "is_read": False,
        "created_at": get_timestamp()
    }


# 10. CITIZEN DOCUMENT SCHEMA (VAULT)
def create_citizen_document(master_id, doc_type, doc_name, doc_number, issuing_dept, issue_date, expiry_date=None, verification_status="Verified", source_system="Revenue Department"):
    return {
        "master_id": master_id,
        "doc_type": doc_type,
        "doc_name": doc_name,
        "doc_number": doc_number,
        "issuing_dept": issuing_dept,
        "issue_date": issue_date,
        "expiry_date": expiry_date,
        "verification_status": verification_status,
        "source_system": source_system,
        "last_verified": get_timestamp(),
        "created_at": get_timestamp()
    }

# 11. CONSENT LOG SCHEMA
def create_consent_log(master_id, requesting_dept, purpose, data_requested, status="APPROVED"):
    return {
        "master_id": master_id,
        "requesting_dept": requesting_dept,
        "purpose": purpose,
        "data_requested": data_requested,
        "status": status,
        "timestamp": get_timestamp()
    }

# 12. EDUCATION APPLICATION SCHEMA
def create_education_application(master_id, service_name, tracking_id, required_docs, status="Submitted"):
    return {
        "master_id": master_id,
        "tracking_id": tracking_id,
        "service_name": service_name,
        "domain": "Education",
        "department": "Higher Education",
        "required_docs": required_docs,
        "status": status,
        "timeline": [
            {"stage": "Application Submitted", "timestamp": get_timestamp(), "status": "Completed"}
        ],
        "created_at": get_timestamp(),
        "last_updated": get_timestamp()
    }

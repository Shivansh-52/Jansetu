from flask import Blueprint, request, jsonify
from database.mongo import get_db
import datetime

service_bp = Blueprint('service', __name__)

@service_bp.route('/applications', methods=['GET'])
def get_user_applications():
    master_id = request.args.get('master_id')
    if not master_id:
        return jsonify({'error': 'Master ID is required'}), 400

    # Mock Data representing unified interoperability fetch
    mock_applications = [
        {
            "tracking_id": "SP-REQ-2026-0001",
            "service_name": "MahaDBT Post-Matric Scholarship",
            "domain": "Education",
            "status": "Approved",
            "date": "18 Sep 2026",
            "department": "Higher Education"
        },
        {
            "tracking_id": "SP-AGR-2026-1144",
            "service_name": "Crop Insurance Claim",
            "domain": "Agriculture",
            "status": "In Progress",
            "date": "19 Sep 2026",
            "department": "Department of Agriculture"
        },
        {
            "tracking_id": "SP-INF-2026-4592",
            "service_name": "Pothole Complaint",
            "domain": "Infrastructure",
            "status": "Assigned",
            "date": "15 Sep 2026",
            "department": "Public Works"
        }
    ]

    return jsonify({"master_id": master_id, "applications": mock_applications}), 200

@service_bp.route('/apply', methods=['POST'])
def submit_application():
    data = request.json
    master_id = data.get('master_id')
    service = data.get('service')
    domain = data.get('domain')
    
    if not master_id or not service or not domain:
        return jsonify({'error': 'Missing required interoperability fields'}), 400
        
    # Simulate DB insert
    db = get_db()
    if db is not None:
        new_app = {
            "master_id": master_id,
            "service": service,
            "domain": domain,
            "data": data.get('formData', {}),
            "status": "Submitted",
            "created_at": datetime.datetime.utcnow()
        }
        db.applications.insert_one(new_app)
        
    return jsonify({
        "message": "Application routed via Interoperability Layer successfully.",
        "tracking_id": f"SP-{domain[:3].upper()}-2026-9999"
    }), 201

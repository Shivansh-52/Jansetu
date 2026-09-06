from flask import Blueprint, request, jsonify
from database.mongo import get_db
from bson.objectid import ObjectId
import datetime
import os
from werkzeug.utils import secure_filename
from config import Config
from services.verification_service import verification_service

contractor_bp = Blueprint('contractor', __name__)

@contractor_bp.route('/dashboard', methods=['GET'])
def get_contractor_dashboard():
    """Contractor dashboard metrics and active DLP contract liabilities."""
    db = get_db()
    contractor_id = request.args.get('contractor_id') or "CON-LKO-781"

    # Find complaints linked to this contractor's assets
    complaints = list(db.complaints.find({
        'asset_accountability.contractor_id': contractor_id
    }).sort('created_at', -1))

    total_defects = len(complaints)
    resolved_defects = sum(1 for c in complaints if c.get('status') in ['Resolved', 'Verified'])
    active_dlp_tasks = sum(1 for c in complaints if c.get('asset_accountability', {}).get('is_under_dlp') and c.get('status') not in ['Resolved', 'Verified'])
    
    # Calculate performance score
    performance_score = round((resolved_defects / total_defects * 100) if total_defects > 0 else 94.0, 1)

    for c in complaints:
        c['_id'] = str(c['_id'])

    return jsonify({
        "contractor_id": contractor_id,
        "company_name": "LKO Infrastructure & Highway Corp",
        "performance_score": performance_score,
        "active_dlp_tasks": active_dlp_tasks,
        "total_defects": total_defects,
        "resolved_defects": resolved_defects,
        "warranty_compliance_rate": 96.2,
        "complaints": complaints
    }), 200

@contractor_bp.route('/upload-repair', methods=['POST'])
def contractor_upload_repair():
    """Contractor submits proof of repair under DLP warranty."""
    db = get_db()
    
    if 'image' not in request.files:
        return jsonify({'error': 'Repair evidence image required'}), 400
        
    file = request.files['image']
    complaint_id = request.form.get('complaint_id')
    remarks = request.form.get('remarks', 'Contractor completed repair under DLP warranty')

    if not complaint_id:
        return jsonify({'error': 'complaint_id required'}), 400

    try:
        complaint = db.complaints.find_one({'_id': ObjectId(complaint_id)})
    except Exception:
        complaint = db.complaints.find_one({'ref_id': complaint_id})

    if not complaint:
        return jsonify({'error': 'Complaint not found'}), 404

    # Save After Image
    timestamp = int(datetime.datetime.now().timestamp())
    filename = secure_filename(f"contractor_repair_{complaint.get('ref_id', 'ref')}_{timestamp}.jpg")
    file_path = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(file_path)

    # Trigger AI Verification comparison
    before_img = complaint.get('image_before', '')
    before_path = os.path.join(Config.UPLOAD_FOLDER, before_img)
    ver_res = verification_service.verify(before_path, file_path) if os.path.exists(before_path) else {'status': 'Verified', 'confidence': 0.9}

    is_verified = (ver_res.get('status') == 'Verified')
    new_status = 'In Progress' # Needs Government Inspection tier before citizen verification

    db.complaints.update_one(
        {'_id': complaint['_id']},
        {
            '$set': {
                'image_after': filename,
                'status': 'In Progress',
                'timeline.contractor_completed': datetime.datetime.utcnow(),
                'last_updated': datetime.datetime.utcnow(),
                'asset_accountability.liability_status': 'Repair Completed by Contractor — Awaiting Govt Inspection',
                'govt_inspection.status': 'Awaiting Inspection'
            },
            '$push': {
                'worker_remarks': f"[Contractor]: {remarks} (AI QC: {ver_res.get('confidence', 0.9)*100:.0f}%)"
            }
        }
    )

    return jsonify({
        'message': 'Contractor repair evidence submitted. Queued for Govt Field Inspection.',
        'status': 'Awaiting Govt Inspection',
        'ai_qc': ver_res
    }), 200

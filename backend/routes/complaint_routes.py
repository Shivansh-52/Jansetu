from flask import Blueprint, request, jsonify
from database.mongo import get_db
from services.complaint_service import complaint_service
from bson.objectid import ObjectId
import jwt
from config import Config

complaint_bp = Blueprint('complaint', __name__)

def verify_user_role():
    """
    Verify that the authenticated user is a citizen.
    Returns (user_id, role) if valid citizen, None otherwise.
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header:
        # Guest submission allowed (Anonymous user)
        return ('Anonymous', None)
    
    try:
        token = auth_header.replace('Bearer ', '')
        decoded = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        user_id = decoded.get('user_id')
        role = decoded.get('role')
        
        # Only citizens can register complaints
        if role != 'citizen':
            return None
        
        return (user_id, role)
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
    except Exception as e:
        print(f"[AUTH ERROR] Token verification failed: {e}")
        return None

@complaint_bp.route('/submit', methods=['POST'])
def submit_complaint():
    # 1. Validation
    if 'image' not in request.files:
        return jsonify({'error': 'No image part'}), 400
    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    # 2. Verify user role - Only citizens can register complaints
    auth_result = verify_user_role()
    if auth_result is None:
        return jsonify({
            'error': 'Only citizens can register complaints. Please log in as a citizen to submit a complaint.',
            'message': 'Access denied: Non-citizen role detected'
        }), 403
    
    user_id_from_token, role = auth_result
    
    # 3. Get Data
    user_id_form = request.form.get('user_id') or 'Anonymous'
    text = request.form.get('description', '')
    lat = request.form.get('lat')
    lng = request.form.get('lng')
    email = request.form.get('email', '').strip() or None

    # Use authenticated user_id if available, otherwise use form value (for guest submissions)
    final_user_id = user_id_from_token if user_id_from_token != 'Anonymous' else user_id_form
    
    # Additional check: If user_id_form is provided and not Anonymous, verify it matches token
    if user_id_form != 'Anonymous' and user_id_from_token != 'Anonymous' and user_id_form != user_id_from_token:
        return jsonify({'error': 'User ID mismatch. Please log out and log in again.'}), 403

    try:
        # 4. Call Service
        result = complaint_service.process_submission(final_user_id, text, file, lat, lng, email=email)

        # ── Duplicate detected ────────────────────────────────────────────────
        if result.get('duplicate'):
            return jsonify({
                'duplicate':        True,
                'message':          result['message'],
                'existing_ref_id':  result['existing_ref_id'],
                'existing_status':  result['existing_status'],
                'is_resolved':      result.get('is_resolved', False),
            }), 409

        # ── Normal success ────────────────────────────────────────────────────
        return jsonify({
            'message':           'Complaint submitted successfully',
            'complaint_id':      result['complaint_id'],
            'ref_id':            result['ref_id'],
            'auto_assigned':     result.get('auto_assigned', False),
            'assigned_worker':   result.get('assigned_worker'),
            'capacity_override': result.get('capacity_override', False),
            'all_at_capacity':   result.get('all_at_capacity', False),
            'ai_analysis':       result['ai_analysis']
        }), 201
    except Exception as e:
        import traceback
        with open("global_requests.log", "a") as f:
            f.write(f"Error submitting complaint: {e}\n")
            f.write(traceback.format_exc() + "\n")
        print(f"Error submitting complaint: {e}")
        return jsonify({'error': str(e)}), 500

@complaint_bp.route('/data-correction', methods=['POST'])
def submit_data_correction():
    auth_result = verify_user_role()
    if auth_result is None:
        return jsonify({'error': 'Only logged in citizens can raise data correction requests.'}), 403
    
    user_id, role = auth_result
    data = request.json
    
    if not data or not data.get('doc_number') or not data.get('reason'):
        return jsonify({'error': 'Missing doc_number or reason'}), 400
        
    db = get_db()
    import datetime, random
    
    ref_id = f"DC-{datetime.datetime.utcnow().year}-{random.randint(10000, 99999)}"
    
    # We create a structured complaint of type 'Data Correction'
    correction_ticket = {
        "user_id": user_id,
        "ref_id": ref_id,
        "category": "Data Correction",
        "priority": "Medium",
        "department": data.get('department', 'General Administration'),
        "complaint_text": f"Document Update Request for {data.get('doc_name', 'Document')} (No. {data.get('doc_number', 'N/A')})\nReason: {data.get('reason')}",
        "document_info": {
            "doc_number": data.get('doc_number'),
            "doc_name": data.get('doc_name')
        },
        "status": "Pending",
        "dual_routing": {
            "head_department": f"{data.get('department', 'General Administration')} Records Directorate",
            "local_status": "Assigned",
            "head_status": "Monitoring"
        },
        "timeline": {
            "submitted": datetime.datetime.utcnow()
        },
        "created_at": datetime.datetime.utcnow(),
        "last_updated": datetime.datetime.utcnow()
    }
    
    result = db.complaints.insert_one(correction_ticket)
    
    return jsonify({
        "message": "Data correction request submitted successfully. The department has been notified.",
        "ref_id": ref_id,
        "ticket_id": str(result.inserted_id)
    }), 201

@complaint_bp.route('/user/<uid>', methods=['GET'])
def get_user_complaints(uid):
    db = get_db()
    complaints = list(db.complaints.find({'user_id': uid}))
    for c in complaints:
        c['_id'] = str(c['_id'])
    return jsonify(complaints), 200

@complaint_bp.route('/by-email/<email>', methods=['GET'])
def get_complaints_by_email(email):
    """Get all complaints associated with an email address."""
    db = get_db()
    complaints = list(db.complaints.find({'email': email}))
    for c in complaints:
        c['_id'] = str(c['_id'])
    return jsonify(complaints), 200

@complaint_bp.route('/<id>', methods=['GET'])
def get_complaint_details(id):
    db = get_db()
    complaint = None
    
    # 1. Try by MongoDB ObjectId
    try:
        complaint = db.complaints.find_one({'_id': ObjectId(id)})
    except:
        pass  # Not a valid ObjectId, try ref_id next
    
    # 2. Fallback: Try by ref_id (e.g., JAN-ROAD-2026-X92A)
    if not complaint:
        complaint = db.complaints.find_one({'ref_id': id})
    
    if complaint:
        complaint['_id'] = str(complaint['_id'])
        return jsonify(complaint), 200
    
    return jsonify({'error': 'Complaint not found'}), 404

@complaint_bp.route('/reopen', methods=['POST'])
def reopen_complaint():
    """Citizen reopens/appeals a resolved complaint if unsatisfied."""
    db = get_db()
    data = request.json
    complaint_id = data.get('complaint_id')
    appeal_reason = data.get('reason', '')
    
    if not complaint_id:
        return jsonify({'error': 'complaint_id required'}), 400
    
    try:
        complaint = db.complaints.find_one({'_id': ObjectId(complaint_id)})
    except:
        return jsonify({'error': 'Invalid complaint ID'}), 400
    
    if not complaint:
        return jsonify({'error': 'Complaint not found'}), 404
    
    # Only allow reopening resolved/verified complaints
    if complaint.get('status') not in ['Resolved', 'Verified']:
        return jsonify({'error': 'Only resolved or verified complaints can be reopened'}), 400
    
    # Track reopen count to prevent abuse (max 3 reopens)
    reopen_count = complaint.get('reopen_count', 0)
    if reopen_count >= 3:
        return jsonify({'error': 'Maximum appeal limit reached (3). Please contact administration directly.'}), 400
    
    import datetime
    appeal_entry = {
        'reason': appeal_reason,
        'reopened_at': datetime.datetime.utcnow(),
        'previous_status': complaint.get('status')
    }
    
    db.complaints.update_one(
        {'_id': ObjectId(complaint_id)},
        {
            '$set': {
                'status': 'Reopened',
                'worker_id': None,
                'image_after': None,
                'verification_status': None,
                'last_updated': datetime.datetime.utcnow()
            },
            '$inc': {'reopen_count': 1},
            '$push': {'appeal_history': appeal_entry}
        }
    )
    
    # Notify via email
    if complaint.get('email'):
        try:
            from services.email_service import send_status_update
            send_status_update(complaint['email'], complaint.get('ref_id', ''), 'Reopened',
                f'Your complaint has been reopened for re-investigation. Reason: {appeal_reason}')
        except Exception as e:
            print(f"[REOPEN] Email error: {e}")
    
    # AUTO-ASSIGN to a new worker (capacity-aware)
    auto_assigned        = False
    assigned_worker_name = None
    capacity_override    = False
    all_at_capacity      = False
    try:
        from services.smart_assignment import smart_assign
        department    = complaint.get('department', '')
        assign_result = smart_assign(str(complaint['_id']), department, officer_id=None)
        if assign_result.get('success'):
            auto_assigned        = True
            assigned_worker_name = assign_result.get('worker_name')
            capacity_override    = assign_result.get('capacity_override', False)
            override_tag = ' [PRIORITY OVERRIDE]' if capacity_override else ''
            print(f"[REOPEN+AUTO-ASSIGN] {complaint.get('ref_id')} → {assigned_worker_name}{override_tag}")
        else:
            all_at_capacity = assign_result.get('all_at_capacity', False)
            print(f"[REOPEN] Auto-assign failed: {assign_result.get('error')}. Awaiting manual assignment.")
    except Exception as e:
        print(f"[REOPEN] Auto-assign error: {e}")

    return jsonify({
        'message':           'Complaint reopened successfully. It will be reassigned for re-investigation.',
        'status':            'Reopened' if not auto_assigned else 'Assigned',
        'reopen_count':      reopen_count + 1,
        'auto_assigned':     auto_assigned,
        'assigned_worker':   assigned_worker_name,
        'capacity_override': capacity_override,
        'all_at_capacity':   all_at_capacity,
    }), 200


@complaint_bp.route('/feedback', methods=['POST'])
def submit_feedback():
    db = get_db()
    data = request.json
    complaint_id = data.get('complaint_id')
    rating = data.get('rating')
    comment = data.get('comment')
    
    if not complaint_id or not rating:
        return jsonify({'error': 'Missing fields'}), 400
        
    db.complaints.update_one(
        {'_id': ObjectId(complaint_id)},
        {'$set': {'feedback': {'rating': rating, 'comment': comment}}}
    )
    
    return jsonify({'message': 'Feedback submitted'}), 200


# ============ ⭐ 4. CITIZEN RESOLUTION CONFIRMATION (TWO-TIER VERIFICATION) ============
@complaint_bp.route('/citizen-confirm', methods=['POST'])
def citizen_confirm_resolution():
    """
    Tier 2 Verification: Citizen confirms whether the issue is actually resolved.
    Action:
      - 'confirm': Sets status to 'Verified', completes lifecycle, awards 30 Karma Points.
      - 'reopen': Sets status to 'Reopened', records citizen dissatisfaction reason, triggers auto-reassignment.
    """
    db = get_db()
    data = request.json or {}
    complaint_id = data.get('complaint_id')
    decision = data.get('decision', 'confirm') # 'confirm' or 'reopen'
    feedback = data.get('feedback', '')
    rating = data.get('rating', 5)
    channel = data.get('channel', 'App Confirmation')

    if not complaint_id:
        return jsonify({'error': 'complaint_id required'}), 400

    try:
        complaint = db.complaints.find_one({'_id': ObjectId(complaint_id)})
    except Exception:
        complaint = db.complaints.find_one({'ref_id': complaint_id})

    if not complaint:
        return jsonify({'error': 'Complaint not found'}), 404

    import datetime
    user_id = complaint.get('user_id')
    ref_id = complaint.get('ref_id', str(complaint['_id']))

    if decision == 'confirm':
        db.complaints.update_one(
            {'_id': complaint['_id']},
            {
                '$set': {
                    'status': 'Verified',
                    'citizen_verification.status': 'Confirmed',
                    'citizen_verification.confirmed_at': datetime.datetime.utcnow(),
                    'citizen_verification.channel': channel,
                    'citizen_verification.citizen_feedback': feedback,
                    'citizen_verification.satisfaction_rating': rating,
                    'timeline.verified': datetime.datetime.utcnow(),
                    'timeline.resolved': datetime.datetime.utcnow(),
                    'last_updated': datetime.datetime.utcnow(),
                    'dual_routing.local_status': 'Citizen Verified & Closed',
                    'dual_routing.head_status': 'Resolution Audited & Approved'
                }
            }
        )

        # Award Citizen Karma Points
        from services.gamification_service import gamification_service
        gamification_service.award_points(user_id, 30, reason=f"Confirmed resolution for {ref_id}")

        return jsonify({
            'message': 'Thank you! Your resolution confirmation has officially closed the complaint. +30 Civic Karma awarded.',
            'status': 'Verified',
            'karma_awarded': 30
        }), 200

    else:
        # Reopen flow
        return reopen_complaint()


# ============ ⭐ 1. MASTER COMPLAINT & SUB-REPORTS API ============
@complaint_bp.route('/master/<master_ref_id>', methods=['GET'])
def get_master_complaint_details(master_ref_id):
    """Retrieve Master Complaint cluster and all merged supporting citizen reports."""
    db = get_db()
    master = db.complaints.find_one({
        '$or': [{'ref_id': master_ref_id}, {'master_issue_id': master_ref_id}]
    })

    if not master:
        return jsonify({'error': 'Master Complaint not found'}), 404

    master['_id'] = str(master['_id'])
    
    # Also fetch all complaints tagged with this master id
    sub_tickets = list(db.complaints.find({'master_issue_id': master_ref_id}))
    for s in sub_tickets:
        s['_id'] = str(s['_id'])

    return jsonify({
        'master_complaint': master,
        'co_citizen_count': master.get('co_citizen_count', 1),
        'sub_reports': master.get('sub_reports', []),
        'linked_tickets': sub_tickets
    }), 200


# ============ 🎮 CIVIC MITRA GAMIFICATION APIS ============
@complaint_bp.route('/gamification/profile/<uid>', methods=['GET'])
def get_citizen_gamification_profile(uid):
    """Retrieve citizen karma score, earned badges, and rank."""
    db = get_db()
    from bson.objectid import ObjectId
    user = None
    try:
        user = db.users.find_one({'_id': ObjectId(uid)})
    except Exception:
        pass
    if not user:
        user = db.users.find_one({'email': uid})

    if not user:
        return jsonify({
            'name': 'Civic Mitra Citizen',
            'karma_points': 150,
            'badges': ['Civic Pioneer'],
            'rank': 12,
            'level': 'Civic Guardian (Level 2)'
        }), 200

    points = user.get('karma_points', 100)
    level_name = "Civic Legend" if points >= 1000 else ("Civic Champion" if points >= 500 else ("Civic Inspector" if points >= 250 else "Civic Pioneer"))

    return jsonify({
        'name': user.get('name', 'Citizen'),
        'email': user.get('email', ''),
        'karma_points': points,
        'badges': user.get('badges', ['Civic Pioneer']),
        'level': level_name
    }), 200


@complaint_bp.route('/gamification/leaderboard', methods=['GET'])
def get_gamification_leaderboard():
    """Get Civic Mitra Citizen Leaderboard."""
    from services.gamification_service import gamification_service
    leaderboard = gamification_service.get_leaderboard()
    return jsonify(leaderboard), 200


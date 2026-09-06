from database.mongo import get_db
from database.schemas import create_complaint
from services.text_ai_service import text_ai_service
from services.sentiment_service import sentiment_service
from services.image_ai_service import image_ai_service
from services.priority_engine import priority_engine
from services.department_mapper import department_mapper
from services.normalization_service import normalization_service
from services.ai_validation_engine import ai_validation_engine
from services.asset_contractor_service import asset_contractor_service
from services.gamification_service import gamification_service
from utils.id_generator import generate_complaint_id
import os
import datetime
from config import Config

class ComplaintService:
    def process_submission(self, user_id, text, image_file, lat=None, lng=None, email=None, district="Lucknow", zone="Zone 3", ward="Ward 14"):
        """
        Orchestrates the entire SIH-grade complaint submission pipeline:
        1. Saves Image Evidence
        2. Normalizes Input Text (Multilingual / Hinglish)
        3. Runs AI Analysis (Text category, Sentiment, YOLO Image detection)
        4. Detects Emergency Civic Mode (Open manhole, Live wires, Collapse)
        5. Performs Fake/Spam Validation & Quality Scoring
        6. AI Master Issue Duplicate Clustering (merges multiple citizens reporting same civic issue)
        7. Links Digital Asset Passport & Checks Contractor Defect Liability Period (DLP)
        8. Establishes Dual-Level Government Routing (Head Dept Monitoring + Local Authority Action)
        9. Awards Civic Mitra Karma points
        10. Executes Smart Capacity-Aware Worker Assignment & Notification
        """
        db = get_db()
        
        # 1. Save Image
        try:
            from werkzeug.utils import secure_filename
            import uuid
            raw_name = secure_filename(image_file.filename) or 'evidence.jpg'
            filename = f"{uuid.uuid4().hex[:10]}_{raw_name}"
            os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
            image_path = os.path.join(Config.UPLOAD_FOLDER, filename)
            image_file.save(image_path)
        except Exception as e:
            print(f"[IMAGE SAVE] Error saving uploaded image: {e}")
            filename = 'evidence.jpg'
            image_path = ''

        # 2. Normalize Text
        try:
            normalized_text = normalization_service.normalize(text)
        except Exception as e:
            print(f"[NORMALIZATION] Error during normalization: {e}")
            normalized_text = (text or '').lower()

        # 3. AI Analysis
        try:
            text_result = text_ai_service.analyze(normalized_text)
            category = text_result.get('category', 'General')
        except Exception as e:
            print(f"[TEXT AI] Error: {e}")
            category = 'General'

        try:
            sentiment_result = sentiment_service.analyze(normalized_text)
            text_priority = sentiment_result.get('priority', 'Medium')
        except Exception as e:
            print(f"[SENTIMENT AI] Error: {e}")
            text_priority = 'Medium'

        try:
            if image_path and os.path.exists(image_path):
                image_result = image_ai_service.analyze(image_path)
            else:
                image_result = {'confidence': 0.85, 'description': 'Image saved'}
            image_confidence = image_result.get('confidence', 0.85)
        except Exception as e:
            print(f"[IMAGE AI] Error: {e}")
            image_result = {'confidence': 0.85, 'description': 'Image analysis completed'}
            image_confidence = 0.85

        # 4. Emergency Civic Mode Detection
        emergency_check = ai_validation_engine.check_emergency(text, category)
        is_emergency = emergency_check['is_emergency']
        emergency_type = emergency_check['emergency_type']

        # 5. Content Validation & Quality Score
        val_result = ai_validation_engine.validate_content(text, image_confidence)

        # 6. Priority & Department Decision Fusion Engine
        try:
            final_priority = "Emergency" if is_emergency else priority_engine.calculate_priority(text_priority, image_confidence)
        except Exception as e:
            print(f"[PRIORITY ENGINE] Error: {e}")
            final_priority = "Emergency" if is_emergency else (text_priority or 'Medium')

        try:
            department = department_mapper.map_complaint(category)
        except Exception as e:
            print(f"[DEPT MAPPER] Error: {e}")
            department = 'General'

        # 7. Generate Official Ref ID
        try:
            ref_id = generate_complaint_id(category)
        except Exception as e:
            print(f"[ID GENERATION] Error: {e}")
            import time, random
            ref_id = f"JAN-CIVIC-{int(time.time())}-{random.randint(100, 999)}"

        # 8. ⭐ AI DUPLICATE CLUSTERING & MASTER COMPLAINT CREATION
        master_cluster_info = None
        try:
            master_cluster_info = ai_validation_engine.find_and_cluster_master_issue(
                db=db,
                category=category,
                lat=lat,
                lng=lng,
                user_id=user_id,
                email=email,
                text=text,
                image_filename=filename,
                ref_id=ref_id
            )
        except Exception as e:
            print(f"[MASTER CLUSTER ERROR] {e}")

        # 9. ⭐ ASSET & CONTRACTOR DLP LINKING
        asset_accountability = None
        try:
            asset_accountability = asset_contractor_service.link_asset_and_contractor(
                category=category,
                lat=lat,
                lng=lng,
                district=district or "Lucknow"
            )
        except Exception as e:
            print(f"[ASSET LINK ERROR] {e}")

        # 10. Build Full Complaint Document
        new_complaint = create_complaint(
            user_id=user_id,
            text=text,
            category=category,
            priority=final_priority,
            department=department,
            image_path=filename,
            ref_id=ref_id,
            lat=lat,
            lng=lng,
            email=email,
            is_emergency=is_emergency,
            emergency_type=emergency_type,
            district=district or "Lucknow",
            city=district or "Lucknow",
            zone=zone or "Zone 3",
            ward=ward or "Ward 14"
        )
        new_complaint['normalized_text'] = normalized_text
        new_complaint['ai_validation'] = val_result
        if asset_accountability:
            new_complaint['asset_accountability'] = asset_accountability

        if master_cluster_info:
            new_complaint['master_issue_id'] = master_cluster_info['master_ref_id']
            new_complaint['is_sub_report'] = True

        result = db.complaints.insert_one(new_complaint)
        complaint_id = str(result.inserted_id)

        # 11. Award Citizen Karma Points
        karma_result = None
        try:
            karma_points = 100 if is_emergency else 50
            karma_result = gamification_service.award_points(user_id, karma_points, reason=f"Reported {category} issue ({ref_id})")
        except Exception as e:
            print(f"[GAMIFICATION ERROR] {e}")

        # 12. Trigger In-App Notification
        try:
            from services.notification_service import notification_service
            cluster_msg = f" Linked to Master Issue {master_cluster_info['master_ref_id']}." if master_cluster_info else ""
            notification_service.notify_complaint_activity(
                user_id=user_id,
                complaint_id=ref_id,
                message=f"Your complaint {ref_id} has been registered with Dual-Level Routing.{cluster_msg}",
                type="submission"
            )
        except Exception as e:
            print(f"[NOTIFICATION] Error: {e}")

        # 13. Send Email Notification
        if email:
            try:
                from services.email_service import send_complaint_confirmation
                send_complaint_confirmation(email, ref_id, complaint_id)
            except Exception as e:
                print(f"[EMAIL] Error sending confirmation: {e}")

        # 14. AUTO-ASSIGN: Smart capacity-aware assignment
        auto_assign_result = None
        try:
            from services.smart_assignment import smart_assign, HARD_LIMIT
            auto_assign_result = smart_assign(complaint_id, department, officer_id=None)

            if auto_assign_result.get('success'):
                override_tag = ' [PRIORITY OVERRIDE]' if auto_assign_result.get('capacity_override') else ''
                print(
                    f"[AUTO-ASSIGN] {ref_id} → {auto_assign_result['worker_name']} "
                    f"(load {auto_assign_result['worker_load']}/{HARD_LIMIT}){override_tag}"
                )
            else:
                all_at_cap = auto_assign_result.get('all_at_capacity', False)
                reason = (
                    f"All {auto_assign_result.get('worker_count', '?')} workers "
                    f"are at capacity ({HARD_LIMIT} tasks)."
                    if all_at_cap
                    else auto_assign_result.get('error', 'Unknown reason')
                )
                print(f"[AUTO-ASSIGN] {ref_id} → Failed: {reason}. Awaiting manual assignment.")

                # Email dept officers that manual intervention is needed
                try:
                    from services.email_service import send_authority_no_worker_alert
                    dept_officers = list(db.dept_officers.find({
                        'department_id': {'$in': [department, f'{department} Department']}
                    }))
                    for officer in dept_officers:
                        officer_email = officer.get('email')
                        if officer_email:
                            send_authority_no_worker_alert(
                                officer_email=officer_email,
                                officer_name=officer.get('name', 'Officer'),
                                ref_id=ref_id,
                                category=category,
                                priority=final_priority,
                                department=department
                            )
                except Exception as e2:
                    print(f"[AUTO-ASSIGN] Error emailing dept officers: {e2}")

        except Exception as e:
            print(f"[AUTO-ASSIGN] Error during smart assignment for {ref_id}: {e}")

        _ar = auto_assign_result or {}
        return {
            'complaint_id':      complaint_id,
            'ref_id':            ref_id,
            'auto_assigned':     _ar.get('success', False),
            'assigned_worker':   _ar.get('worker_name') if _ar.get('success') else None,
            'capacity_override': _ar.get('capacity_override', False),
            'all_at_capacity':   _ar.get('all_at_capacity', False),
            'is_emergency':      is_emergency,
            'emergency_alert':   emergency_check.get('alert_message'),
            'master_cluster':    master_cluster_info,
            'asset_accountability': asset_accountability,
            'dual_routing': {
                'head_department': f"{department} Directorate (Supervision & Monitoring)",
                'local_authority': f"{district or 'Lucknow'} Nagar Nigam - {zone or 'Zone 3'} (Operational Owner)"
            },
            'karma_points_awarded': 100 if is_emergency else 50,
            'ai_analysis': {
                'category':     category,
                'priority':     final_priority,
                'department':   department,
                'image_issues': image_result.get('description'),
                'evidence_score': val_result.get('evidence_quality_score', 95.0)
            }
        }

    def get_details(self, complaint_id):
        pass

complaint_service = ComplaintService()


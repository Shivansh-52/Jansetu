import math
import datetime
from database.mongo import get_db

EMERGENCY_KEYWORDS = [
    "open manhole", "manhole open", "manhole bina dhakkan", "khula manhole",
    "live wire", "electric wire", "current", "exposed wire", "pole collapsed",
    "fallen pole", "bijli ka taar", "bijli khamba", "sparking", "transformer burst",
    "road collapse", "bridge damage", "landslide", "bridge crack", "major cave in",
    "gas leak", "chemical spill", "toxic water", "pipeline burst", "severe flooding"
]

def haversine_distance_meters(lat1, lon1, lat2, lon2):
    """Calculates distance between two points in meters using Haversine formula."""
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 999999
    R = 6371000 # meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * \
        math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class AIValidationEngine:
    def check_emergency(self, text, category):
        """Detects if complaint qualifies for Emergency Civic Mode."""
        normalized = (text or '').lower()
        for kw in EMERGENCY_KEYWORDS:
            if kw in normalized:
                return {
                    'is_emergency': True,
                    'emergency_type': kw.title(),
                    'sla_hours': 4,
                    'alert_message': f"🚨 Emergency Detected: {kw.title()} - Fast-Track SLA 4 Hours Activated!"
                }
        return {
            'is_emergency': False,
            'emergency_type': None,
            'sla_hours': 24 if category in ['Road', 'Electricity'] else 48,
            'alert_message': None
        }

    def validate_content(self, text, image_confidence=0.9):
        """Analyzes spam, fake risk, and evidence quality score."""
        text_len = len(text.strip()) if text else 0
        spam_score = 0.05
        is_fake = False
        quality_score = min(98.0, 50.0 + (min(text_len, 200) / 200.0) * 25.0 + (image_confidence * 25.0))

        # Check for repetitive garbage text
        if text_len < 5:
            spam_score = 0.85
            is_fake = True
            quality_score = 30.0

        return {
            'spam_score': round(spam_score, 2),
            'is_fake_flagged': is_fake,
            'evidence_quality_score': round(quality_score, 1)
        }

    def find_and_cluster_master_issue(self, db, category, lat, lng, user_id, email, text, image_filename, ref_id):
        """
        Geospatial Master Complaint Clustering Engine:
        Searches for active complaints within 150m radius with matching category.
        If found:
          - Marks existing complaint as Master Issue (if not already)
          - Attaches this citizen's report as a sub_report
          - Increments co_citizen_count
          - Returns clustered Master information
        """
        if lat is None or lng is None:
            return None

        try:
            lat = float(lat)
            lng = float(lng)
        except Exception:
            return None

        # Look back 14 days for active issues
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=14)
        active_candidates = list(db.complaints.find({
            'category': category,
            'status': {'$in': ['Pending', 'Assigned', 'In Progress', 'Govt Inspected']},
            'created_at': {'$gte': cutoff}
        }))

        CLUSTER_RADIUS_METERS = 150.0

        for cand in active_candidates:
            c_loc = cand.get('location', {})
            c_lat = c_loc.get('lat')
            c_lng = c_loc.get('lng')
            if c_lat and c_lng:
                dist = haversine_distance_meters(lat, lng, c_lat, c_lng)
                if dist <= CLUSTER_RADIUS_METERS:
                    # Found master candidate
                    cand_id = cand['_id']
                    master_ref = cand.get('ref_id', str(cand_id))
                    
                    sub_entry = {
                        'sub_ref_id': ref_id,
                        'user_id': user_id,
                        'email': email,
                        'text': text,
                        'image_path': image_filename,
                        'distance_meters': round(dist, 1),
                        'reported_at': datetime.datetime.utcnow()
                    }

                    db.complaints.update_one(
                        {'_id': cand_id},
                        {
                            '$set': {
                                'is_master_issue': True,
                                'last_updated': datetime.datetime.utcnow()
                            },
                            '$inc': {'co_citizen_count': 1},
                            '$push': {'sub_reports': sub_entry}
                        }
                    )

                    new_count = cand.get('co_citizen_count', 1) + 1
                    print(f"[MASTER CLUSTER] Merged {ref_id} into Master Issue {master_ref} ({new_count} citizens)")

                    return {
                        'is_clustered': True,
                        'master_ref_id': master_ref,
                        'master_id': str(cand_id),
                        'co_citizen_count': new_count,
                        'distance_meters': round(dist, 1)
                    }

        return None

ai_validation_engine = AIValidationEngine()

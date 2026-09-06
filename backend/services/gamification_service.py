from database.mongo import get_db
import datetime

BADGES = [
    {"id": "pioneer", "name": "Civic Pioneer", "desc": "Submitted first genuine civic complaint", "min_points": 50, "icon": "🌱"},
    {"id": "patrol", "name": "Pothole Patrol", "desc": "Reported 3+ road hazards", "min_points": 200, "icon": "🛣️"},
    {"id": "champion", "name": "Clean City Champion", "desc": "Verified 5+ municipal resolutions", "min_points": 400, "icon": "⭐"},
    {"id": "inspector", "name": "Quality Inspector", "desc": "100% accurate civic reporting record", "min_points": 700, "icon": "🔍"},
    {"id": "civic_mitra", "name": "Civic Mitra Legend", "desc": "Top 1% citizen governance contributor", "min_points": 1200, "icon": "👑"}
]

class GamificationService:
    def award_points(self, user_id, points, reason="Civic Action"):
        """Awards karma points and evaluates badge unlocks."""
        if not user_id or user_id == 'Anonymous':
            return None
        
        try:
            db = get_db()
            from bson.objectid import ObjectId
            user = db.users.find_one({'_id': ObjectId(user_id)})
            if not user:
                user = db.users.find_one({'email': user_id})
            
            if not user:
                return None
            
            current_points = user.get('karma_points', 100) + points
            current_badges = user.get('badges', ["Civic Pioneer"])

            # Check new badges
            for b in BADGES:
                if current_points >= b['min_points'] and b['name'] not in current_badges:
                    current_badges.append(b['name'])

            db.users.update_one(
                {'_id': user['_id']},
                {
                    '$set': {
                        'karma_points': current_points,
                        'badges': current_badges
                    }
                }
            )

            return {
                'karma_points': current_points,
                'badges': current_badges,
                'points_added': points,
                'reason': reason
            }
        except Exception as e:
            print(f"[GAMIFICATION] Error awarding points: {e}")
            return None

    def get_leaderboard(self, limit=10):
        """Returns top citizen contributors on Civic Mitra Leaderboard."""
        db = get_db()
        users = list(db.users.find({'role': 'citizen'}).sort('karma_points', -1).limit(limit))
        
        leaderboard = []
        for rank, u in enumerate(users, start=1):
            leaderboard.append({
                "rank": rank,
                "name": u.get('name', 'Anonymous Citizen'),
                "email": u.get('email', ''),
                "karma_points": u.get('karma_points', 100),
                "badges": u.get('badges', ["Civic Pioneer"]),
                "tier": "Gold" if rank <= 3 else ("Silver" if rank <= 7 else "Bronze")
            })

        if not leaderboard:
            # Fallback demo leaderboard
            leaderboard = [
                {"rank": 1, "name": "Aditya Verma", "email": "aditya.v@gmail.com", "karma_points": 1450, "badges": ["Civic Pioneer", "Pothole Patrol", "Civic Mitra Legend"], "tier": "Gold"},
                {"rank": 2, "name": "Priya Sharma", "email": "priya.s@gmail.com", "karma_points": 1180, "badges": ["Civic Pioneer", "Clean City Champion"], "tier": "Gold"},
                {"rank": 3, "name": "Rahul Dixit", "email": "rahul.d@gmail.com", "karma_points": 920, "badges": ["Civic Pioneer", "Quality Inspector"], "tier": "Gold"},
                {"rank": 4, "name": "Neha Gupta", "email": "neha.g@gmail.com", "karma_points": 740, "badges": ["Civic Pioneer", "Pothole Patrol"], "tier": "Silver"},
                {"rank": 5, "name": "Vikram Singh", "email": "vikram.s@gmail.com", "karma_points": 560, "badges": ["Civic Pioneer"], "tier": "Silver"}
            ]

        return leaderboard

gamification_service = GamificationService()

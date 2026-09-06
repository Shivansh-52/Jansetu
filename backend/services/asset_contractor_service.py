import datetime
import math
from database.mongo import get_db

DEFAULT_ASSETS = [
    {
        "asset_id": "UP-LKO-RD-402",
        "asset_name": "MG Road - Hazratganj Stretch",
        "asset_type": "Road",
        "hierarchy": {"state": "Uttar Pradesh", "district": "Lucknow", "city": "Lucknow", "zone": "Zone 1", "ward": "Ward 12", "local_authority": "Lucknow Nagar Nigam"},
        "location": {"lat": 26.8500, "lng": 80.9400, "address": "Mahatma Gandhi Marg, Hazratganj, Lucknow"},
        "contractor": {
            "company_name": "LKO Infrastructure & Highway Corp",
            "contractor_id": "CON-LKO-781",
            "contact_email": "contractor.lko@infra.gov.in",
            "contact_phone": "+91 9876543210"
        },
        "contract": {
            "contract_id": "PWD-UP-2025-C88",
            "work_order_no": "WO-PWD-8841",
            "sanctioned_amount": "₹1,20,00,000",
            "completion_date": (datetime.datetime.utcnow() - datetime.timedelta(days=120)).isoformat(),
            "dlp_period_months": 24,
            "dlp_end_date": (datetime.datetime.utcnow() + datetime.timedelta(days=610)).isoformat()
        },
        "health_score": 88
    },
    {
        "asset_id": "UP-LKO-SL-109",
        "asset_name": "Gomti Nagar Smart LED Grid Segment A",
        "asset_type": "Street Light",
        "hierarchy": {"state": "Uttar Pradesh", "district": "Lucknow", "city": "Lucknow", "zone": "Zone 4", "ward": "Ward 22", "local_authority": "Lucknow Nagar Nigam"},
        "location": {"lat": 26.8530, "lng": 80.9980, "address": "Vipin Khand, Gomti Nagar, Lucknow"},
        "contractor": {
            "company_name": "Surya Urja Green Lighting Ltd",
            "contractor_id": "CON-LKO-442",
            "contact_email": "support@suryalighting.com",
            "contact_phone": "+91 9415012345"
        },
        "contract": {
            "contract_id": "LNN-SL-2024-V12",
            "work_order_no": "WO-LNN-901",
            "sanctioned_amount": "₹42,50,000",
            "completion_date": (datetime.datetime.utcnow() - datetime.timedelta(days=200)).isoformat(),
            "dlp_period_months": 36,
            "dlp_end_date": (datetime.datetime.utcnow() + datetime.timedelta(days=895)).isoformat()
        },
        "health_score": 92
    },
    {
        "asset_id": "UP-KNP-DR-305",
        "asset_name": "Swaroop Nagar Stormwater Trunk Drain",
        "asset_type": "Drainage",
        "hierarchy": {"state": "Uttar Pradesh", "district": "Kanpur Nagar", "city": "Kanpur", "zone": "Zone 2", "ward": "Ward 08", "local_authority": "Kanpur Municipal Corp"},
        "location": {"lat": 26.4700, "lng": 80.3200, "address": "Swaroop Nagar, Kanpur"},
        "contractor": {
            "company_name": "Ganga Basin Civil En engineering",
            "contractor_id": "CON-KNP-108",
            "contact_email": "ops@gangacivil.in",
            "contact_phone": "+91 9839011223"
        },
        "contract": {
            "contract_id": "KMC-DRN-2024-81",
            "work_order_no": "WO-KMC-412",
            "sanctioned_amount": "₹85,00,000",
            "completion_date": (datetime.datetime.utcnow() - datetime.timedelta(days=450)).isoformat(),
            "dlp_period_months": 12,
            "dlp_end_date": (datetime.datetime.utcnow() - datetime.timedelta(days=85)).isoformat() # Expired DLP
        },
        "health_score": 74
    }
]

def haversine_km(lat1, lon1, lat2, lon2):
    if lat1 is None or lon1 is None or lat2 is None or lon2 is None:
        return 9999
    R = 6371 # km
    dLat = math.radians(lat2 - lat1)
    dLon = math.radians(lon2 - lon1)
    a = math.sin(dLat / 2) * math.sin(dLat / 2) + \
        math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
        math.sin(dLon / 2) * math.sin(dLon / 2)
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

class AssetContractorService:
    def ensure_seed_assets(self):
        """Seeds initial municipal assets into mongo if collection is empty."""
        try:
            db = get_db()
            if db.assets.count_documents({}) == 0:
                db.assets.insert_many(DEFAULT_ASSETS)
                print("[ASSET SERVICE] Seeded default municipal assets with DLP records.")
        except Exception as e:
            print(f"[ASSET SERVICE] Seed error: {e}")

    def link_asset_and_contractor(self, category, lat, lng, district="Lucknow"):
        """
        Locates the nearest civic asset and evaluates DLP (Defect Liability Period) status.
        Returns asset accountability record with contractual liability flag.
        """
        db = get_db()
        self.ensure_seed_assets()

        query = {}
        # Match asset type with complaint category
        category_map = {
            'Pothole': 'Road',
            'Road': 'Road',
            'Street Light': 'Street Light',
            'Electricity': 'Street Light',
            'Drainage': 'Drainage',
            'Water': 'Water Pipeline',
            'Garbage': 'Waste Facility'
        }
        target_type = category_map.get(category, 'Road')
        query['asset_type'] = target_type

        assets = list(db.assets.find(query))
        if not assets:
            assets = list(db.assets.find({}))

        best_asset = None
        min_dist = 9999

        try:
            flat = float(lat) if lat else 26.8467
            flng = float(lng) if lng else 80.9462
        except Exception:
            flat, flng = 26.8467, 80.9462

        for asset in assets:
            a_loc = asset.get('location', {})
            a_lat = a_loc.get('lat')
            a_lng = a_loc.get('lng')
            if a_lat and a_lng:
                d = haversine_km(flat, flng, a_lat, a_lng)
                if d < min_dist:
                    min_dist = d
                    best_asset = asset

        if not best_asset and assets:
            best_asset = assets[0]

        if not best_asset:
            return {
                "asset_id": "CIVIC-GEN-01",
                "asset_name": f"Municipal Public Sector Asset ({category})",
                "contract_id": "MUNICIPAL-MAINT-2026",
                "contractor_name": "Municipal Fast Response Division",
                "contractor_id": "CON-MUN-01",
                "completion_date": "2024-01-01",
                "dlp_end_date": "2026-12-31",
                "is_under_dlp": False,
                "liability_status": "Municipal Maintenance Required",
                "inspection_required": False
            }

        # Check DLP status
        contract = best_asset.get('contract', {})
        dlp_end_str = contract.get('dlp_end_date')
        is_dlp_active = False

        if dlp_end_str:
            try:
                dlp_end = datetime.datetime.fromisoformat(dlp_end_str.replace('Z', ''))
                is_dlp_active = dlp_end > datetime.datetime.utcnow()
            except Exception:
                is_dlp_active = True

        contractor = best_asset.get('contractor', {})

        liability_status = "Potential Contractual Liability — Inspection Required" if is_dlp_active else "Municipal Department Maintenance (DLP Expired)"

        return {
            "asset_id": best_asset.get('asset_id'),
            "asset_name": best_asset.get('asset_name'),
            "contract_id": contract.get('contract_id'),
            "contractor_name": contractor.get('company_name'),
            "contractor_id": contractor.get('contractor_id'),
            "completion_date": contract.get('completion_date'),
            "dlp_end_date": contract.get('dlp_end_date'),
            "is_under_dlp": is_dlp_active,
            "liability_status": liability_status,
            "inspection_required": is_dlp_active
        }

asset_contractor_service = AssetContractorService()

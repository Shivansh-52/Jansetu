from flask import Blueprint, request, jsonify
from database.mongo import get_db
from services.asset_contractor_service import asset_contractor_service

asset_bp = Blueprint('asset', __name__)

@asset_bp.route('/list', methods=['GET'])
def list_assets():
    """List and filter municipal infrastructure assets for Digital Asset Passport."""
    db = get_db()
    asset_contractor_service.ensure_seed_assets()

    district = request.args.get('district')
    asset_type = request.args.get('asset_type')
    dlp_filter = request.args.get('dlp_status') # 'active' or 'expired'

    query = {}
    if district and district != 'All':
        query['hierarchy.district'] = {'$regex': f"^{district}", '$options': 'i'}
    if asset_type and asset_type != 'All':
        query['asset_type'] = asset_type

    assets = list(db.assets.find(query))

    result = []
    for a in assets:
        a['_id'] = str(a['_id'])
        # Count related complaints
        defect_count = db.complaints.count_documents({'asset_accountability.asset_id': a.get('asset_id')})
        a['active_defects_count'] = defect_count
        result.append(a)

    return jsonify(result), 200

@asset_bp.route('/<asset_id>', methods=['GET'])
def get_asset_passport(asset_id):
    """Retrieve comprehensive Digital Asset Passport."""
    db = get_db()
    asset = db.assets.find_one({'asset_id': asset_id})
    if not asset:
        return jsonify({'error': 'Asset not found'}), 404

    asset['_id'] = str(asset['_id'])
    
    # Fetch defect timeline
    defects = list(db.complaints.find({'asset_accountability.asset_id': asset_id}).sort('created_at', -1))
    for d in defects:
        d['_id'] = str(d['_id'])
    asset['defects_history'] = defects

    return jsonify(asset), 200

import re

with open(r'c:\Users\Shivansh\Desktop\Samadhan Path\backend\routes\auth_routes.py', 'r') as f:
    content = f.read()

# 1. Update /register to include aadhaar and digilocker_id
# Find new_admin and new_user dictionaries and inject aadhaar and digilocker_id
content = re.sub(
    r'"access_code_used": access_code,\n(\s*)"created_at": datetime.datetime.utcnow\(\)\n',
    r'"access_code_used": access_code,\n\1"aadhaar": data.get("aadhaar"),\n\1"digilocker_id": data.get("digilocker_id"),\n\1"created_at": datetime.datetime.utcnow()\n',
    content
)

content = re.sub(
    r'state=data\.get\(''state'', ''''\)\n(\s*)\)\n(\s*)result = db\.users\.insert_one\(new_user\)',
    r'state=data.get("state", "")\n\1)\n\2new_user["aadhaar"] = data.get("aadhaar")\n\2new_user["digilocker_id"] = data.get("digilocker_id")\n\2result = db.users.insert_one(new_user)',
    content
)

# 2. Update /verify-aadhaar
verify_aadhaar_old = """@auth_bp.route('/verify-aadhaar', methods=['POST'])
def verify_aadhaar():
    db = get_db()
    data = request.json
    aadhaar = data.get('aadhaar_number')
    user_id = data.get('user_id')
    
    if not aadhaar or not user_id:
        return jsonify({'error': 'Aadhaar and user_id required'}), 400
        
    from bson.objectid import ObjectId
    user = db.users.find_one({'_id': ObjectId(user_id)})
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    # Check if Aadhaar belongs to an existing seeded user
    existing_user = None
    for coll in [db.users, db.workers, db.dept_officers, db.contractors, db.admins]:
        existing_user = coll.find_one({'aadhaar': aadhaar})
        if existing_user:
            break
            
    if existing_user:
        aadhaar_name = existing_user.get('name')
        aadhaar_address = existing_user.get('address') or 'Flat 402, Signature Tower, Gomti Nagar, Lucknow, UP'
    else:
        aadhaar_name = 'Ramesh Kumar Official' if aadhaar == '234567890123' else user.get('name', 'Verified Citizen')
        aadhaar_address = 'Flat 402, Signature Tower, Gomti Nagar, Lucknow, UP'
    
    # Mock Aadhaar response
    kyc_data = {
        'name': aadhaar_name,
        'dob': '1995-08-15',
        'gender': 'Male',
        'address': aadhaar_address,
        'photo': 'https://i.pravatar.cc/150?u=' + aadhaar
    }
    
    # Mismatch logic
    user_name = user.get('name', '').lower()
    aadhaar_name_lower = kyc_data['name'].lower()
    user_addr = user.get('address', '').lower()
    aadhaar_addr = kyc_data['address'].lower()"""

verify_aadhaar_new = """@auth_bp.route('/verify-aadhaar', methods=['POST'])
def verify_aadhaar():
    db = get_db()
    data = request.json
    aadhaar = data.get('aadhaar_number')
    
    if not aadhaar:
        return jsonify({'error': 'Aadhaar required'}), 400
        
    user_name_input = data.get('name', '')
    user_address_input = data.get('address', '')
        
    # Check if Aadhaar belongs to an existing seeded user
    existing_user = None
    for coll in [db.users, db.workers, db.dept_officers, db.contractors, db.admins]:
        existing_user = coll.find_one({'aadhaar': aadhaar})
        if existing_user:
            break
            
    if existing_user:
        aadhaar_name = existing_user.get('name')
        aadhaar_address = existing_user.get('address') or 'Flat 402, Signature Tower, Gomti Nagar, Lucknow, UP'
    else:
        aadhaar_name = 'Ramesh Kumar Official' if aadhaar == '234567890123' else (user_name_input or 'Verified Citizen')
        aadhaar_address = 'Flat 402, Signature Tower, Gomti Nagar, Lucknow, UP'
    
    # Mock Aadhaar response
    kyc_data = {
        'name': aadhaar_name,
        'dob': '1995-08-15',
        'gender': 'Male',
        'address': aadhaar_address,
        'photo': 'https://i.pravatar.cc/150?u=' + aadhaar
    }
    
    # Mismatch logic
    user_name = user_name_input.lower()
    aadhaar_name_lower = kyc_data['name'].lower()
    user_addr = user_address_input.lower()
    aadhaar_addr = kyc_data['address'].lower()"""

content = content.replace(verify_aadhaar_old, verify_aadhaar_new)

# 3. Remove /update-aadhaar-details and move its seeding to /verify-digilocker
# First extract the seeding block
seeding_match = re.search(r'(# ==== ENHANCED DB SEEDING.*?return jsonify\(\{''message'': ''Aadhaar Details Updated & Demo Data Seeded''\}\), 200)', content, re.DOTALL)
seeding_block = seeding_match.group(1)

# Modify seeding block to use `user` instead of `kyc_data`
seeding_block = seeding_block.replace("kyc_data.get('name', 'Citizen')", "user.get('name', 'Citizen')")
seeding_block = seeding_block.replace("kyc_data.get('dob', '1990-01-01')", "user.get('dob', '1990-01-01')")
seeding_block = seeding_block.replace("return jsonify({'message': 'Aadhaar Details Updated & Demo Data Seeded'}), 200", "")

# Remove the entire update_aadhaar_details route
content = re.sub(r'@auth_bp\.route\(''/update-aadhaar-details''.*?return jsonify\(\{''message'': ''Aadhaar Details Updated & Demo Data Seeded''\}\), 200', '', content, flags=re.DOTALL)

# Insert the seeding block at the end of verify_digilocker
digilocker_end = """    db.documents.insert_many(docs)
    
    # Mark Digilocker verified
    db.users.update_one({'_id': ObjectId(user_id)}, {'$set': {'digilocker_verified': True}})
    
    return jsonify({'message': 'Digilocker Verified & Documents Linked'}), 200"""

digilocker_new = f"""    db.documents.insert_many(docs)
    
    # Mark Digilocker verified
    db.users.update_one({{'_id': ObjectId(user_id)}}, {{'$set': {{'digilocker_verified': True}}}})
    
{seeding_block}
    
    return jsonify({{'message': 'Digilocker Verified & Documents Linked'}}), 200"""

content = content.replace(digilocker_end, digilocker_new)

with open(r'c:\Users\Shivansh\Desktop\Samadhan Path\backend\routes\auth_routes.py', 'w') as f:
    f.write(content)

from database.mongo import get_db
import bcrypt

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def seed_officials():
    db = get_db()
    
    password_hash = hash_password("Demo@1234")
    
    # 1. Admin / Government
    admin_data = {
        "name": "Central Government Admin",
        "email": "admin@samadhan.in",
        "password": password_hash,
        "role": "admin",
        "district": "Lucknow",
        "access_code": "SP-ADMIN-2026",
        "verified": True
    }
    
    # 2. Education Officer
    edu_officer_data = {
        "name": "Education Verification Officer",
        "email": "edu@samadhan.in",
        "password": password_hash,
        "role": "dept_officer",
        "department": "Education",
        "district": "Lucknow",
        "verified": True
    }
    
    # 3. Infrastructure Worker
    infra_worker_data = {
        "name": "Field Infrastructure Worker",
        "email": "infra@samadhan.in",
        "password": password_hash,
        "role": "worker",
        "department": "Infrastructure",
        "skills": ["Plumbing", "Electrical", "Road Maintenance"],
        "district": "Lucknow",
        "verified": True,
        "status": "active",
        "rating": 4.8
    }
    
    print("Seeding Official Dummy Accounts...")
    
    # Upsert Admin
    db.admins.update_one(
        {"email": admin_data["email"]},
        {"$set": admin_data},
        upsert=True
    )
    print("- Government Admin seeded (admin@samadhan.in)")
    
    # Upsert Dept Officer
    db.dept_officers.update_one(
        {"email": edu_officer_data["email"]},
        {"$set": edu_officer_data},
        upsert=True
    )
    print("- Education Officer seeded (edu@samadhan.in)")
    
    # Upsert Worker
    db.workers.update_one(
        {"email": infra_worker_data["email"]},
        {"$set": infra_worker_data},
        upsert=True
    )
    print("- Infrastructure Worker seeded (infra@samadhan.in)")
    
    print("\nAll dummy accounts seeded successfully with password 'Demo@1234'!")

if __name__ == '__main__':
    seed_officials()

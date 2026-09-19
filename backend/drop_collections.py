from database.mongo import get_db

db = get_db()
if db is not None:
    db.gov_certificates.drop()
    db.gov_audit_logs.drop()
    db.gov_consents.drop()
    db.gov_corrections.drop()
    print("Dropped mock collections")
else:
    print("DB is None")

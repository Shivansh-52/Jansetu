"""
MongoDB connection module with robust TLS handling for Atlas.

The TLSV1_ALERT_INTERNAL_ERROR on OpenSSL 3.x + pymongo 4.x is caused by
OpenSSL 3's stricter default security level (SECLEVEL=2) rejecting the
cipher suites negotiated by some Atlas cluster configurations.

Fix: create a custom ssl.SSLContext with SECLEVEL=1 and pass it to MongoClient.
"""

from pymongo import MongoClient
from flask import current_app, g
import ssl
try:
    import certifi
    CA_FILE = certifi.where()
except ImportError:
    CA_FILE = None

client = None
db = None


def _make_ssl_context():
    """
    Build an SSLContext that lowers OpenSSL 3's default security level
    from 2 to 1, which re-enables the cipher suites Atlas needs.
    """
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    # Lower security level to allow legacy cipher suites (OpenSSL 3 fix)
    try:
        ctx.set_ciphers('DEFAULT@SECLEVEL=1')
    except ssl.SSLError:
        pass  # older OpenSSL — no-op, already at level 1
    return ctx


def init_db(app=None):
    global client, db
    
    if app and hasattr(app, 'config'):
        uri = app.config.get('MONGO_URI', '')
        db_name = app.config.get('DB_NAME', 'jansetu_ai')
    else:
        from config import Config
        uri = getattr(Config, 'MONGO_URI', '')
        db_name = getattr(Config, 'DB_NAME', 'jansetu_ai')

    if not uri:
        print("[DB] Warning: MONGO_URI is not set!")
        return None

    # ── Strategy 1: Standard Certifi CA (Recommended for Atlas on Linux/Cloud) ──
    if CA_FILE and 'mongodb+srv' in uri:
        try:
            client = MongoClient(
                uri,
                tlsCAFile=CA_FILE,
                serverSelectionTimeoutMS=15000,
            )
            client.admin.command('ping')
            db = client[db_name]
            print(f"[DB] Connected to MongoDB Atlas via Certifi: {db_name}")
            return db
        except Exception as e:
            print(f"[DB] Certifi strategy failed: {type(e).__name__}: {str(e)[:120]}")

    # ── Strategy 2: Custom SSLContext with SECLEVEL=1 ──────────────────────
    try:
        ssl_ctx = _make_ssl_context()
        client = MongoClient(
            uri,
            tls=True,
            tls_context=ssl_ctx,
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=20000,
            socketTimeoutMS=20000,
        )
        client.admin.command('ping')
        db = client[db_name]
        print(f"[DB] Connected to MongoDB Atlas: {db_name}")
        return db
    except Exception as e:
        print(f"[DB] Strategy 2 failed: {type(e).__name__}: {str(e)[:120]}")

    # ── Strategy 3: URI-level tlsInsecure parameter ────────────────────────
    try:
        insecure_uri = uri
        if '?' in uri:
            insecure_uri += '&tlsInsecure=true'
        else:
            insecure_uri += '?tlsInsecure=true'
        client = MongoClient(
            insecure_uri,
            serverSelectionTimeoutMS=30000,
        )
        client.admin.command('ping')
        db = client[db_name]
        print(f"[DB] Connected to MongoDB Atlas (tlsInsecure): {db_name}")
        return db
    except Exception as e:
        print(f"[DB] Strategy 3 failed: {type(e).__name__}: {str(e)[:120]}")

    # ── Strategy 4: Plain connection (local fallback) ──────────────────────
    try:
        client = MongoClient(
            'mongodb://localhost:27017/',
            serverSelectionTimeoutMS=5000,
        )
        client.admin.command('ping')
        db = client[db_name]
        print(f"[DB] Connected to LOCAL MongoDB: {db_name}")
        return db
    except Exception as e:
        print(f"[DB] ALL connection strategies failed. Last error: {e}")
        db = None
        return None


def get_db():
    global db, client
    if db is None:
        init_db()
    if db is None:
        raise RuntimeError("Database connection not available. Please verify MONGO_URI configuration.")
    return db

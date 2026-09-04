import os
from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Explicitly load .env from backend directory first, then fallback to current directory
backend_env = os.path.join(BASE_DIR, '.env')
if os.path.exists(backend_env):
    load_dotenv(backend_env)
else:
    load_dotenv()

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'jansetu_secret_key_123')
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    DB_NAME = 'jansetu_ai'
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    Allowed_EXTENSIONS = {'png', 'jpg', 'jpeg'}

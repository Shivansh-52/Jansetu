import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'jansetu_secret_key_123')
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
    DB_NAME = 'jansetu_ai'
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    Allowed_EXTENSIONS = {'png', 'jpg', 'jpeg'}

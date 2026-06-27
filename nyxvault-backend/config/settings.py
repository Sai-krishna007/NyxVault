import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    PORT = int(os.getenv('PORT', 3000))
    JWT_SECRET = os.getenv('JWT_SECRET', 'nyxvault-super-secure-jwt-key-2026')
    DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///nyxvault.db')
    
    # Ensure database URI is formatted correctly for SQLAlchemy if using postgresql
    if DATABASE_URL.startswith('postgres://'):
        DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
        
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # File upload settings
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = 1024 * 1024 * 1024  # 1 GB limit
    
    # Cloud Storage & Encryption
    STORAGE_PROVIDER = os.getenv('STORAGE_PROVIDER', 'local')
    AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.getenv('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = os.getenv('AWS_S3_REGION_NAME', 'us-east-1')
    MASTER_ENCRYPTION_KEY = os.getenv('MASTER_ENCRYPTION_KEY')
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')


import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, g, current_app
from models.user import User

def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    salt = bcrypt.gensalt(10)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against a hash."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception:
        return False

def generate_token(user_id: str, email: str, role: str) -> str:
    """Generate a JWT token valid for 24 hours."""
    payload = {
        'id': user_id,
        'email': email.lower(),
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, current_app.config['JWT_SECRET'], algorithm='HS256')

def decode_token(token: str) -> dict:
    """Decode a JWT token."""
    try:
        return jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return {'error': 'Token has expired'}
    except jwt.InvalidTokenError:
        return {'error': 'Invalid token'}

def token_required(f):
    """Decorator to require JWT or API Key authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer nvk_'):
            api_key = auth_header.split(' ')[1]
            
        if api_key:
            import hashlib
            from database.db import db
            from models.api_key import ApiKey
            
            hashed_key = hashlib.sha256(api_key.encode('utf-8')).hexdigest()
            key_record = ApiKey.query.filter_by(key_hash=hashed_key, status='active').first()
            
            if not key_record:
                return jsonify({'error': 'Invalid or inactive API key'}), 403
                
            user = key_record.user
            if not user:
                return jsonify({'error': 'User associated with API key not found'}), 401
                
            if user.status == 'suspended':
                return jsonify({'error': 'Account suspended. Contact administration.'}), 403
                
            # Update last used status
            key_record.last_used_at = 'Just now'
            db.session.commit()
            
            g.user = user
            return f(*args, **kwargs)

        token = None
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            return jsonify({'error': 'Access token required'}), 401
            
        decoded = decode_token(token)
        if 'error' in decoded:
            return jsonify({'error': decoded['error']}), 403
            
        user = User.query.filter_by(id=decoded['id']).first()
        if not user:
            return jsonify({'error': 'User not found'}), 401
            
        if user.status == 'suspended':
            return jsonify({'error': 'Account suspended. Contact administration.'}), 403
            
        # Store user in flask globals
        g.user = user
        return f(*args, **kwargs)
        
    return decorated

def role_required(*roles):
    """Decorator to enforce role-based access control (RBAC)."""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(g, 'user'):
                return jsonify({'error': 'Authentication required'}), 401
            if g.user.role not in roles:
                return jsonify({'error': 'Forbidden: Access denied'}), 403
            return f(*args, **kwargs)
        return decorated
    return decorator

# ─── ADVANCED CYBERSECURITY SUITE ADDITIONS ─────────────────────────────────
import base64
import hashlib
import hmac
import random
import string
import struct
import time

def generate_totp_secret() -> str:
    """Generate a random 16-character base32 secret key."""
    chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
    return ''.join(random.choices(chars, k=16))

def verify_totp_code(secret: str, code: str) -> bool:
    """Validate a 6-digit TOTP code against a base32 secret key with clock drift tolerance."""
    if not secret or not code:
        return False
    try:
        secret = secret.strip().replace(' ', '').upper()
        missing_padding = len(secret) % 8
        if missing_padding:
            secret += '=' * (8 - missing_padding)
            
        key = base64.b32decode(secret, casefold=True)
        current_time = int(time.time())
        
        # Tolerance window of -30s, 0s, +30s for time drift
        for drift in (-1, 0, 1):
            counter = int(current_time / 30) + drift
            msg = struct.pack(">Q", counter)
            hs = hmac.new(key, msg, hashlib.sha1).digest()
            offset = hs[19] & 0xf
            bin_code = struct.unpack(">I", hs[offset:offset+4])[0] & 0x7fffffff
            computed_code = bin_code % 1000000
            if str(computed_code).zfill(6) == code.strip():
                return True
        return False
    except Exception:
        return False

def generate_tokens(user_id: str, email: str, role: str) -> dict:
    """Generate a short-lived access token (15 mins) and a long-lived refresh token (7 days)."""
    now = datetime.utcnow()
    
    access_payload = {
        'id': user_id,
        'email': email.lower(),
        'role': role,
        'type': 'access',
        'exp': now + timedelta(minutes=15)
    }
    access_token = jwt.encode(access_payload, current_app.config['JWT_SECRET'], algorithm='HS256')
    
    refresh_payload = {
        'id': user_id,
        'type': 'refresh',
        'exp': now + timedelta(days=7)
    }
    refresh_token = jwt.encode(refresh_payload, current_app.config['JWT_SECRET'], algorithm='HS256')
    
    return {
        'accessToken': access_token,
        'refreshToken': refresh_token,
        'expiresIn': 900
    }

def store_refresh_token(user_id: str, token: str):
    """Hash and store a user's active refresh token."""
    from database.db import db
    user = User.query.get(user_id)
    if user:
        hashed_token = hashlib.sha256(token.encode('utf-8')).hexdigest()
        user.refresh_token = hashed_token
        db.session.commit()

def verify_refresh_token(token: str) -> dict:
    """Verify an incoming refresh token against the stored hash and return the user."""
    try:
        decoded = jwt.decode(token, current_app.config['JWT_SECRET'], algorithms=['HS256'])
        if decoded.get('type') != 'refresh':
            return {'error': 'Invalid token type'}
            
        user = User.query.get(decoded['id'])
        if not user or not user.refresh_token:
            return {'error': 'Active session not found'}
            
        hashed_token = hashlib.sha256(token.encode('utf-8')).hexdigest()
        if user.refresh_token != hashed_token:
            return {'error': 'Refresh token revoked or invalid'}
            
        if user.status == 'suspended':
            return {'error': 'Account suspended'}
            
        return {'user': user}
    except jwt.ExpiredSignatureError:
        return {'error': 'Refresh token expired'}
    except jwt.InvalidTokenError:
        return {'error': 'Invalid refresh token'}


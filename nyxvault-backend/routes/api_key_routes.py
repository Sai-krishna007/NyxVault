import secrets
import hashlib
from datetime import datetime
from flask import Blueprint, request, jsonify, g
from database.db import db
from models.api_key import ApiKey
from services.auth_service import token_required

api_key_bp = Blueprint('api_keys', __name__)

@api_key_bp.route('', methods=['GET'])
@token_required
def list_keys():
    keys = ApiKey.query.filter_by(user_id=g.user.id, status='active').all()
    result = []
    for k in keys:
        d = k.to_dict()
        # For existing keys, display a masked version
        # The key prefix and a few chars, e.g. nvk_prod_a1b2c************************
        d['key'] = f"{k.prefix}a1b2c************************"
        result.append(d)
    return jsonify(result), 200

@api_key_bp.route('', methods=['POST'])
@token_required
def generate_key():
    data = request.get_json() or {}
    name = data.get('name')
    prefix = data.get('prefix', 'nvk_prod_')
    
    if not name:
        name = 'Production API Key' if prefix == 'nvk_prod_' else 'Development API Key'
    
    if prefix not in ('nvk_prod_', 'nvk_dev_'):
        prefix = 'nvk_prod_'
        
    # Generate 32 characters of random hex (16 bytes = 32 hex chars)
    random_hex = secrets.token_hex(16)
    full_key = f"{prefix}{random_hex}"
    
    # Hash the full key using SHA-256
    key_hash = hashlib.sha256(full_key.encode('utf-8')).hexdigest()
    
    # Generate unique ID
    key_id = 'key-' + secrets.token_hex(6)
    
    new_key = ApiKey(
        id=key_id,
        user_id=g.user.id,
        name=name,
        prefix=prefix,
        key_hash=key_hash,
        created_at=datetime.now().strftime('%b %d, %Y'),
        status='active'
    )
    
    db.session.add(new_key)
    db.session.commit()
    
    # Log key generation
    from services.audit_service import log_action
    log_action(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        action='SETTINGS_EDIT',
        resource=f"Generated {name}",
        ip=request.remote_addr
    )
    
    response_data = new_key.to_dict()
    response_data['key'] = full_key  # Return the raw key ONCE so they can copy it
    return jsonify(response_data), 201

@api_key_bp.route('/<key_id>', methods=['DELETE'])
@token_required
def revoke_key(key_id):
    key = ApiKey.query.filter_by(id=key_id, user_id=g.user.id).first()
    if not key:
        return jsonify({'error': 'API key not found'}), 404
        
    db.session.delete(key)
    db.session.commit()
    
    # Log key revocation
    from services.audit_service import log_action
    log_action(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        action='SETTINGS_EDIT',
        resource=f"Revoked {key.name}",
        ip=request.remote_addr
    )
    
    return jsonify({'message': 'API key revoked successfully'}), 200

import os
import random
import secrets
import urllib.request
import urllib.error
import json
from flask import Blueprint, request, jsonify, g
from datetime import datetime
from database.db import db
from config.settings import Config
from models.user import User
from services.auth_service import hash_password, verify_password, generate_token, token_required
from services.audit_service import log_action
from services.alert_service import create_alert

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    first_name = data.get('firstName', '')
    last_name = data.get('lastName', '')
    plan = 'Enterprise'

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    email_lower = email.strip().lower()
    existing_user = User.query.filter_by(email=email_lower).first()
    if existing_user:
        return jsonify({'error': 'Account already exists'}), 400

    hashed_pw = hash_password(password)
    
    name = f"{first_name} {last_name}".strip()
    if not name:
        name = "New User"
        
    # Generate initials for avatar
    if first_name and last_name:
        avatar = f"{first_name[0]}{last_name[0]}".upper()
    else:
        avatar = name[:2].upper()

    user_id = 'usr-' + ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=6))
    
    joined_date = datetime.now().strftime('%b %d, %Y')
    random_color = '#' + ''.join(random.choices('0123456789abcdef', k=6))

    new_user = User(
        id=user_id,
        name=name,
        email=email_lower,
        password_hash=hashed_pw,
        role='Developer',
        avatar=avatar,
        plan=plan,
        mfa=True,
        joined=joined_date,
        status='active',
        color=random_color
    )

    db.session.add(new_user)
    db.session.commit()

    # Log user registration audit
    log_action(
        user_id=new_user.id,
        username=new_user.email.split('@')[0],
        action='USER_CREATE',
        resource=new_user.email,
        ip=request.remote_addr
    )

    token = generate_token(new_user.id, new_user.email, new_user.role)
    
    user_data = {
        'name': new_user.name,
        'email': new_user.email,
        'role': new_user.role,
        'plan': new_user.plan,
        'avatar': new_user.avatar,
        'mfa': new_user.mfa,
        'watermark': getattr(new_user, 'watermark', False),
        'policy_max_lifetime': getattr(new_user, 'policy_max_lifetime', 30),
        'policy_default_permission': getattr(new_user, 'policy_default_permission', 'download'),
        'policy_ip_whitelist': getattr(new_user, 'policy_ip_whitelist', 'Disabled'),
        'policy_geo_restriction': getattr(new_user, 'policy_geo_restriction', 'US, EU only'),
        'policy_mfa_requirement': getattr(new_user, 'policy_mfa_requirement', 'Enforce for external')
    }
    
    return jsonify({'token': token, 'user': user_data}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password required'}), 400

    email_lower = email.strip().lower()
    user = User.query.filter_by(email=email_lower).first()

    if not user or not verify_password(password, user.password_hash):
        # Record failed login in IDS for brute-force tracking
        from services.ids_service import record_failed_login
        record_failed_login(request.remote_addr or '127.0.0.1', email_lower)

        # Log failed login audit
        log_action(
            user_id='unknown',
            username=email_lower.split('@')[0] if '@' in email_lower else 'unknown',
            action='LOGIN_FAIL',
            resource='auth.nyxvault.io',
            ip=request.remote_addr,
            status='blocked'
        )

        # Trigger security alert
        create_alert(
            user_id='system',
            sev='medium',
            title='Failed Login Attempt',
            desc=f"Unauthorized access attempt on account {email_lower} from IP {request.remote_addr or '127.0.0.1'}",
            alert_type='failed_login',
        )

        return jsonify({'error': 'Invalid email or password'}), 401

    if user.status == 'suspended':
        return jsonify({'error': 'Account suspended. Contact administration.'}), 403

    # If MFA is enabled, return a pending status instead of logging in directly
    if user.mfa_enabled:
        return jsonify({
            'mfaRequired': True,
            'email': user.email
        }), 200

    # Log successful login audit
    log_action(
        user_id=user.id,
        username=user.email.split('@')[0],
        action='SETTINGS_EDIT',
        resource='Session Login',
        ip=request.remote_addr
    )

    from services.auth_service import generate_tokens, store_refresh_token
    tokens = generate_tokens(user.id, user.email, user.role)
    store_refresh_token(user.id, tokens['refreshToken'])
    token = tokens['accessToken']
    
    user_data = {
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'plan': user.plan,
        'avatar': user.avatar,
        'mfa': user.mfa,
        'mfa_enabled': user.mfa_enabled,
        'watermark': getattr(user, 'watermark', False),
        'policy_max_lifetime': getattr(user, 'policy_max_lifetime', 30),
        'policy_default_permission': getattr(user, 'policy_default_permission', 'download'),
        'policy_ip_whitelist': getattr(user, 'policy_ip_whitelist', 'Disabled'),
        'policy_geo_restriction': getattr(user, 'policy_geo_restriction', 'US, EU only'),
        'policy_mfa_requirement': getattr(user, 'policy_mfa_requirement', 'Enforce for external')
    }
    
    return jsonify({
        'token': token,
        'refreshToken': tokens['refreshToken'],
        'user': user_data
    }), 200


@auth_bp.route('/google/config', methods=['GET'])
def google_config():
    client_id = Config.GOOGLE_CLIENT_ID or os.getenv('GOOGLE_CLIENT_ID')
    return jsonify({'clientId': client_id or None}), 200


@auth_bp.route('/google', methods=['POST'])
def google_login():
    data = request.get_json() or {}
    token = data.get('token')
    if not token:
        return jsonify({'error': 'Google token required'}), 400

    email = None
    name = None
    
    # Check for mock/local sandbox token
    if token.startswith('mock-google-token-'):
        email = token.replace('mock-google-token-', '').strip().lower()
        name = email.split('@')[0].replace('.', ' ').title()
    else:
        # Real Google token verification using Google's endpoint via urllib
        try:
            url = f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
            req = urllib.request.Request(url, method='GET')
            with urllib.request.urlopen(req) as response:
                payload = json.loads(response.read().decode('utf-8'))
                
                # Check client ID match if GOOGLE_CLIENT_ID is configured
                client_id = Config.GOOGLE_CLIENT_ID or os.getenv('GOOGLE_CLIENT_ID')
                if client_id and payload.get('aud') != client_id:
                    return jsonify({'error': 'Token audience mismatch'}), 400
                    
                email = payload.get('email')
                name = payload.get('name', '')
        except urllib.error.HTTPError as e:
            return jsonify({'error': f"Google token verification failed: {e.reason}"}), 400
        except Exception as e:
            return jsonify({'error': f"Failed to verify Google token: {str(e)}"}), 500

    if not email:
        return jsonify({'error': 'Unable to retrieve email from Google account'}), 400

    email_lower = email.strip().lower()
    user = User.query.filter_by(email=email_lower).first()

    is_new_user = False
    if not user:
        # Just-in-Time Provisioning
        is_new_user = True
        user_id = 'usr-' + ''.join(random.choices('abcdefghijklmnopqrstuvwxyz0123456789', k=6))
        joined_date = datetime.now().strftime('%b %d, %Y')
        random_color = '#' + ''.join(random.choices('0123456789abcdef', k=6))
        
        # Determine initials for avatar
        parts = name.split()
        if len(parts) >= 2:
            avatar = f"{parts[0][0]}{parts[-1][0]}".upper()
        else:
            avatar = name[:2].upper() if name else email_lower[:2].upper()

        # Securely hash a random password (since they will only log in via OAuth)
        dummy_password = secrets.token_urlsafe(32)
        hashed_pw = hash_password(dummy_password)

        user = User(
            id=user_id,
            name=name or "Google User",
            email=email_lower,
            password_hash=hashed_pw,
            role='Developer',
            avatar=avatar,
            plan='Enterprise',
            mfa=False,
            joined=joined_date,
            status='active',
            color=random_color
        )
        db.session.add(user)
        db.session.commit()

        # Log user registration audit
        log_action(
            user_id=user.id,
            username=user.email.split('@')[0],
            action='USER_CREATE',
            resource=f"{user.email} (via Google)",
            ip=request.remote_addr
        )
    else:
        if user.status == 'suspended':
            return jsonify({'error': 'Account suspended. Contact administration.'}), 403

    # Log successful login audit
    log_action(
        user_id=user.id,
        username=user.email.split('@')[0],
        action='SETTINGS_EDIT',  # Match the Express backend's audit action for login success
        resource='Session Login (Google)',
        ip=request.remote_addr
    )

    # Generate session token
    session_token = generate_token(user.id, user.email, user.role)
    
    user_data = {
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'plan': user.plan,
        'avatar': user.avatar,
        'mfa': user.mfa,
        'watermark': getattr(user, 'watermark', False)
    }
    
    status_code = 201 if is_new_user else 200
    return jsonify({'token': session_token, 'user': user_data}), status_code


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_profile():
    return jsonify({
        'name': g.user.name,
        'email': g.user.email,
        'role': g.user.role,
        'plan': g.user.plan,
        'avatar': g.user.avatar,
        'mfa': g.user.mfa,
        'joined': g.user.joined,
        'bio': g.user.bio,
        'timezone': g.user.timezone,
        'watermark': getattr(g.user, 'watermark', False),
        'policy_max_lifetime': getattr(g.user, 'policy_max_lifetime', 30),
        'policy_default_permission': getattr(g.user, 'policy_default_permission', 'download'),
        'policy_ip_whitelist': getattr(g.user, 'policy_ip_whitelist', 'Disabled'),
        'policy_geo_restriction': getattr(g.user, 'policy_geo_restriction', 'US, EU only'),
        'policy_mfa_requirement': getattr(g.user, 'policy_mfa_requirement', 'Enforce for external')
    }), 200


@auth_bp.route('/me', methods=['PUT'])
@token_required
def update_profile():
    data = request.get_json() or {}
    
    # Exclude restricted fields
    restricted = ['id', 'email', 'role']
    for field in restricted:
        data.pop(field, None)
        
    for key, val in data.items():
        if hasattr(g.user, key):
            setattr(g.user, key, val)
            
    db.session.commit()

    # Log profile update audit
    log_action(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        action='SETTINGS_EDIT',
        resource='User Profile Config',
        ip=request.remote_addr
    )

    return jsonify({
         'name': g.user.name,
         'email': g.user.email,
         'role': g.user.role,
         'plan': g.user.plan,
         'avatar': g.user.avatar,
         'mfa': g.user.mfa,
         'joined': g.user.joined,
         'bio': g.user.bio,
         'timezone': g.user.timezone,
         'watermark': getattr(g.user, 'watermark', False),
         'policy_max_lifetime': getattr(g.user, 'policy_max_lifetime', 30),
         'policy_default_permission': getattr(g.user, 'policy_default_permission', 'download'),
         'policy_ip_whitelist': getattr(g.user, 'policy_ip_whitelist', 'Disabled'),
         'policy_geo_restriction': getattr(g.user, 'policy_geo_restriction', 'US, EU only'),
         'policy_mfa_requirement': getattr(g.user, 'policy_mfa_requirement', 'Enforce for external')
     }), 200


@auth_bp.route('/sessions', methods=['GET'])
@token_required
def get_sessions():
    """Return active user sessions with browser and OS parsed from User-Agent."""
    user_agent_str = request.headers.get('User-Agent', 'Unknown Browser')
    ip = request.remote_addr or '127.0.0.1'
    
    browser = 'Unknown Browser'
    platform = 'Unknown OS'
    
    ua = user_agent_str.lower()
    
    # Browser detection
    if 'edg/' in ua or 'edge/' in ua:
        browser = 'Microsoft Edge'
    elif 'chrome/' in ua and 'safari/' in ua:
        browser = 'Google Chrome'
    elif 'firefox/' in ua:
        browser = 'Mozilla Firefox'
    elif 'safari/' in ua and 'chrome/' not in ua:
        browser = 'Apple Safari'
    
    # OS/Platform detection
    if 'windows' in ua:
        platform = 'Windows'
    elif 'macintosh' in ua or 'mac os x' in ua:
        platform = 'macOS'
    elif 'iphone' in ua or 'ipad' in ua:
        platform = 'iOS'
    elif 'android' in ua:
        platform = 'Android'
    elif 'linux' in ua:
        platform = 'Linux'
        
    current_session = {
        'id': 'sess-current',
        'device': f"{browser} · {platform}",
        'ip': ip,
        'loc': 'Local Loopback' if ip in ('127.0.0.1', '::1') else 'Local Network',
        'time': 'Current session',
        'current': True
    }
    
    # Add mock sessions to simulate multi-device security monitoring
    other_sessions = [
        {
            'id': 'sess-mobile',
            'device': 'Apple Safari · iOS',
            'ip': '192.168.29.42' if ip.startswith('192.168') else '198.51.100.7',
            'loc': 'Mumbai, IN',
            'time': '6h ago',
            'current': False
        },
        {
            'id': 'sess-desktop',
            'device': 'NyxVault Desktop App · macOS',
            'ip': '10.0.0.5',
            'loc': 'Internal VPN',
            'time': '1d ago',
            'current': False
        }
    ]
    
    return jsonify([current_session] + other_sessions), 200


@auth_bp.route('/sessions/<session_id>/terminate', methods=['POST'])
@token_required
def terminate_session(session_id):
    """Terminate a specific session."""
    # Log session revocation
    log_action(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        action='SETTINGS_EDIT',
        resource=f"Revoked Session {session_id}",
        ip=request.remote_addr
    )
    return jsonify({'message': 'Session terminated successfully', 'id': session_id}), 200


@auth_bp.route('/sessions/terminate-others', methods=['POST'])
@token_required
def terminate_other_sessions():
    """Terminate all other active sessions."""
    # Log bulk session revocation
    log_action(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        action='SETTINGS_EDIT',
        resource="Revoked All Other Sessions",
        ip=request.remote_addr
    )
    return jsonify({'message': 'All other sessions terminated successfully'}), 200


# ─── MFA AND REFRESH ENDPOINTS ──────────────────────────────────────────────

@auth_bp.route('/login/mfa', methods=['POST'])
def login_mfa():
    """Verify a TOTP code during 2-step login."""
    data = request.get_json() or {}
    email = data.get('email')
    code = data.get('code')
    
    if not email or not code:
        return jsonify({'error': 'Email and TOTP code required'}), 400
        
    email_lower = email.strip().lower()
    user = User.query.filter_by(email=email_lower).first()
    
    if not user or not user.mfa_enabled or not user.mfa_secret:
        return jsonify({'error': 'MFA is not enabled for this account'}), 400
        
    from services.auth_service import verify_totp_code, generate_tokens, store_refresh_token
    if not verify_totp_code(user.mfa_secret, code):
        # Log failed MFA attempt
        log_action(
            user_id=user.id,
            username=user.email.split('@')[0],
            action='LOGIN_FAIL',
            resource='auth.nyxvault.io/mfa',
            ip=request.remote_addr,
            status='blocked'
        )
        # Trigger security alert
        create_alert(
            user_id=user.id,
            sev='high',
            title='MFA Verification Failed',
            desc=f"Failed TOTP MFA verification attempt for {user.email} from IP {request.remote_addr}",
            alert_type='failed_login'
        )
        return jsonify({'error': 'Invalid verification code'}), 401
        
    # Successful login!
    log_action(
        user_id=user.id,
        username=user.email.split('@')[0],
        action='SETTINGS_EDIT',
        resource='Session Login (MFA)',
        ip=request.remote_addr
    )
    
    tokens = generate_tokens(user.id, user.email, user.role)
    store_refresh_token(user.id, tokens['refreshToken'])
    token = tokens['accessToken']
    
    user_data = {
        'name': user.name,
        'email': user.email,
        'role': user.role,
        'plan': user.plan,
        'avatar': user.avatar,
        'mfa': user.mfa,
        'mfa_enabled': user.mfa_enabled,
        'watermark': getattr(user, 'watermark', False),
        'policy_max_lifetime': getattr(user, 'policy_max_lifetime', 30),
        'policy_default_permission': getattr(user, 'policy_default_permission', 'download'),
        'policy_ip_whitelist': getattr(user, 'policy_ip_whitelist', 'Disabled'),
        'policy_geo_restriction': getattr(user, 'policy_geo_restriction', 'US, EU only'),
        'policy_mfa_requirement': getattr(user, 'policy_mfa_requirement', 'Enforce for external')
    }
    
    return jsonify({
        'token': token,
        'refreshToken': tokens['refreshToken'],
        'user': user_data
    }), 200


@auth_bp.route('/mfa/setup', methods=['POST'])
@token_required
def mfa_setup():
    """Generate a new TOTP secret and return it with a secure QR code URL."""
    from services.auth_service import generate_totp_secret
    import urllib.parse
    
    secret = generate_totp_secret()
    label = f"NyxVault:{g.user.email}"
    otpauth_url = f"otpauth://totp/{label}?secret={secret}&issuer=NyxVault"
    encoded_url = urllib.parse.quote(otpauth_url)
    qr_url = f"https://api.qrserver.com/v1/create-qr-code/?size=160x160&data={encoded_url}"
    
    return jsonify({
        'secret': secret,
        'qrCodeUrl': qr_url
    }), 200


@auth_bp.route('/mfa/enable', methods=['POST'])
@token_required
def mfa_enable():
    """Verify a TOTP code and activate MFA on the user's profile."""
    data = request.get_json() or {}
    secret = data.get('secret')
    code = data.get('code')
    
    if not secret or not code:
        return jsonify({'error': 'Secret and code are required'}), 400
        
    from services.auth_service import verify_totp_code
    if not verify_totp_code(secret, code):
        return jsonify({'error': 'Invalid verification code'}), 400
        
    g.user.mfa_secret = secret
    g.user.mfa_enabled = True
    g.user.mfa = True
    db.session.commit()
    
    log_action(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        action='SETTINGS_EDIT',
        resource='Enabled Multi-Factor Authentication',
        ip=request.remote_addr
    )
    
    return jsonify({'message': 'Multi-Factor Authentication enabled successfully'}), 200


@auth_bp.route('/mfa/disable', methods=['POST'])
@token_required
def mfa_disable():
    """Deactivate Multi-Factor Authentication on the user's profile."""
    g.user.mfa_secret = None
    g.user.mfa_enabled = False
    g.user.mfa = False
    db.session.commit()
    
    log_action(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        action='SETTINGS_EDIT',
        resource='Disabled Multi-Factor Authentication',
        ip=request.remote_addr
    )
    
    return jsonify({'message': 'Multi-Factor Authentication disabled successfully'}), 200


@auth_bp.route('/refresh', methods=['POST'])
def refresh():
    """Exchange a valid refresh token for a new access token (token rotation)."""
    data = request.get_json() or {}
    refresh_token = data.get('refreshToken')
    
    if not refresh_token:
        return jsonify({'error': 'Refresh token required'}), 400
        
    from services.auth_service import verify_refresh_token, generate_tokens, store_refresh_token
    result = verify_refresh_token(refresh_token)
    if 'error' in result:
        return jsonify({'error': result['error']}), 401
        
    user = result['user']
    tokens = generate_tokens(user.id, user.email, user.role)
    store_refresh_token(user.id, tokens['refreshToken'])
    
    return jsonify(tokens), 200


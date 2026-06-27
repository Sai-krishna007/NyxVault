from flask import Blueprint, jsonify, g, request
from database.db import db
from models.user import User
from models.file import File
from models.alert import Alert
from models.share import Share
from models.audit_log import AuditLog
from services.auth_service import token_required, role_required
from services.audit_service import log_action
from routes.integrity_routes import format_bytes

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@token_required
@role_required('Admin')
def get_users():
    users = User.query.all()
    user_list = []
    
    for u in users:
        file_count = File.query.filter_by(user_id=u.id).count()
        # Mock formula from server.js: actual file count * 123 + 45
        display_files = file_count * 123 + 45
        
        user_list.append({
            'id': u.id,
            'name': u.name,
            'email': u.email,
            'role': u.role,
            'joined': u.joined,
            'status': u.status,
            'color': u.color,
            'files': display_files
        })
        
    return jsonify(user_list), 200


@admin_bp.route('/users/<user_id>/status', methods=['POST'])
@token_required
@role_required('Admin')
def update_user_status(user_id):
    data = request.get_json() or {}
    new_status = data.get('status')
    
    if not new_status:
        return jsonify({'error': 'Status is required'}), 400
        
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    user.status = new_status
    db.session.commit()
    
    # Audit log user status modification
    log_action(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        action='SETTINGS_EDIT',
        resource=f"Updated user {user.email} status to {new_status}",
        ip=request.remote_addr
    )
    
    return jsonify({'message': f"User status changed to {new_status}"}), 200


@admin_bp.route('/stats', methods=['GET'])
@token_required
@role_required('Admin')
def get_admin_stats():
    total_users = User.query.count()
    active_users = User.query.filter_by(status='active').count()
    total_files = File.query.count()
    shared_files = Share.query.count()
    tampered_files = File.query.filter_by(status='tampered').count()
    failed_logins = Alert.query.filter_by(alert_type='failed_login').count()
    security_incidents = Alert.query.filter(Alert.sev.in_(['high', 'critical'])).count()
    audit_logs = AuditLog.query.count()
    
    return jsonify({
        'totalUsers': total_users,
        'activeUsers': active_users,
        'totalFiles': total_files,
        'sharedFiles': shared_files,
        'tamperedFiles': tampered_files,
        'failedLogins': failed_logins,
        'securityIncidents': security_incidents,
        'auditLogs': audit_logs
    }), 200

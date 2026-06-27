from flask import Blueprint, jsonify, g, request
from models.audit_log import AuditLog
from services.auth_service import token_required

log_bp = Blueprint('logs', __name__)

@log_bp.route('', methods=['GET'])
@token_required
def get_logs():
    query = AuditLog.query
    
    # Enforce role-based scoping: Admins and Auditors can see all logs
    if g.user.role not in ('Admin', 'Auditor'):
        query = query.filter(
            (AuditLog.user_id == g.user.id) | (AuditLog.user_id == 'system')
        )
        
    # Get query parameters for filtering
    search = request.args.get('search')
    user = request.args.get('user')
    action = request.args.get('action')
    status = request.args.get('status')
    date = request.args.get('date')
    
    if search:
        query = query.filter(
            AuditLog.user.ilike(f"%{search}%") |
            AuditLog.action.ilike(f"%{search}%") |
            AuditLog.resource.ilike(f"%{search}%") |
            AuditLog.ip.ilike(f"%{search}%") |
            AuditLog.id.ilike(f"%{search}%")
        )
    if user and user != 'All Users':
        query = query.filter(AuditLog.user == user)
    if action and action != 'All Actions':
        query = query.filter(AuditLog.action == action)
    if status and status != 'All Statuses':
        query = query.filter(AuditLog.status.ilike(status))
    if date:
        query = query.filter(AuditLog.timestamp.like(f"{date}%"))
        
    logs = query.order_by(AuditLog.timestamp.desc()).all()
    return jsonify([l.to_dict() for l in logs]), 200

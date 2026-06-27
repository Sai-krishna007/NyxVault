"""
alert_routes.py
================
REST endpoints for NyxVault security alerts.

Endpoints
---------
GET  /api/alerts               – list alerts (filterable by sev, type, status)
GET  /api/alerts/stats         – severity breakdown counts
POST /api/alerts/acknowledge-all – bulk-resolve all active alerts
GET  /api/alerts/stream        – Server-Sent Events fallback stream
POST /api/alerts/<id>/resolve  – resolve a single alert
"""

import json
import time
from flask import Blueprint, jsonify, g, request, Response, stream_with_context
from models.alert import Alert
from services.auth_service import token_required
from services.alert_service import resolve_alert, acknowledge_all, get_alert_stats

alert_bp = Blueprint('alerts', __name__)


# ---------------------------------------------------------------------------
# List alerts  –  GET /api/alerts
# ---------------------------------------------------------------------------

@alert_bp.route('', methods=['GET'])
@token_required
def get_alerts():
    """Return alerts for the current user, with optional filters (Admins and Auditors see all alerts)."""
    sev    = request.args.get('sev')       # low | medium | high | critical
    atype  = request.args.get('type')      # failed_login | file_tampering | …
    status = request.args.get('status')    # active | resolved | blocked | reviewing

    if g.user.role in ('Admin', 'Auditor'):
        query = Alert.query
    else:
        query = Alert.query.filter(
            (Alert.user_id == g.user.id) | (Alert.user_id == 'system')
        )

    if sev:
        query = query.filter(Alert.sev == sev)
    if atype:
        query = query.filter(Alert.alert_type == atype)
    if status:
        query = query.filter(Alert.status == status)

    alerts = query.order_by(Alert.timestamp.desc()).all()
    return jsonify([a.to_dict() for a in alerts]), 200


# ---------------------------------------------------------------------------
# Stats  –  GET /api/alerts/stats
# ---------------------------------------------------------------------------

@alert_bp.route('/stats', methods=['GET'])
@token_required
def get_stats():
    """Return severity breakdown counts for active alerts."""
    stats = get_alert_stats(g.user.id)
    return jsonify(stats), 200


# ---------------------------------------------------------------------------
# Bulk acknowledge  –  POST /api/alerts/acknowledge-all
# ---------------------------------------------------------------------------

@alert_bp.route('/acknowledge-all', methods=['POST'])
@token_required
def bulk_acknowledge():
    """Resolve all active alerts for the current user."""
    count = acknowledge_all(g.user.id)
    return jsonify({'message': f'{count} alert(s) acknowledged', 'count': count}), 200


# ---------------------------------------------------------------------------
# SSE stream  –  GET /api/alerts/stream
# ---------------------------------------------------------------------------

@alert_bp.route('/stream', methods=['GET'])
@token_required
def alert_stream():
    """
    Server-Sent Events endpoint – polls for new alerts every 5 s.
    Useful as a WebSocket fallback for clients that cannot use Socket.IO.
    """
    user_id = g.user.id
    role = g.user.role

    def generate():
        seen_ids = set()
        # Seed with existing alerts so we only push NEW ones
        if role in ('Admin', 'Auditor'):
            initial = Alert.query.all()
        else:
            initial = Alert.query.filter(
                (Alert.user_id == user_id) | (Alert.user_id == 'system')
            ).all()
        for a in initial:
            seen_ids.add(a.id)

        while True:
            if role in ('Admin', 'Auditor'):
                new_alerts = Alert.query.filter(
                    Alert.id.notin_(seen_ids),
                ).order_by(Alert.timestamp.asc()).all()
            else:
                new_alerts = Alert.query.filter(
                    (Alert.user_id == user_id) | (Alert.user_id == 'system'),
                    Alert.id.notin_(seen_ids),
                ).order_by(Alert.timestamp.asc()).all()

            for a in new_alerts:
                seen_ids.add(a.id)
                yield f"data: {json.dumps(a.to_dict())}\n\n"

            time.sleep(5)

    return Response(
        stream_with_context(generate()),
        mimetype='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
        }
    )


# ---------------------------------------------------------------------------
# Resolve single alert  –  POST /api/alerts/<id>/resolve
# ---------------------------------------------------------------------------

@alert_bp.route('/<alert_id>/resolve', methods=['POST'])
@token_required
def resolve(alert_id):
    success = resolve_alert(
        alert_id=alert_id,
        admin_user_id=g.user.id,
        admin_username=g.user.email.split('@')[0],
        ip=request.remote_addr
    )

    if not success:
        return jsonify({'error': 'Alert not found'}), 404

    return jsonify({'message': 'Alert marked as resolved'}), 200

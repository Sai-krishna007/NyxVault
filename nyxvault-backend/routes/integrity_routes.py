import math
from flask import Blueprint, jsonify, g, request
from models.file import File
from services.auth_service import token_required
from services.file_service import quarantine_file, restore_file
from services.integrity_service import (
    run_full_scan,
    scan_single_file,
    get_latest_report,
    get_report_history,
    get_hash_events
)

integrity_bp = Blueprint('integrity', __name__)

def format_bytes(bytes_count):
    if bytes_count == 0:
        return '0 Bytes'
    if bytes_count < 1024:
        return f"{bytes_count} B"
    sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    i = int(math.floor(math.log(bytes_count) / math.log(1024)))
    p = math.pow(1024, i)
    s = round(bytes_count / p, 2)
    return f"{s} {sizes[i]}"

@integrity_bp.route('', methods=['GET'])
@token_required
def get_integrity_status():
    latest_data = get_latest_report(g.user.id)
    
    file_list = []
    for f in latest_data['files']:
        file_list.append({
            'id': f['id'],
            'name': f['name'],
            'hash': f['hash'],
            'lastScan': 'just now' if latest_data['report'] else 'never',
            'size': format_bytes(f['size']),
            'status': f['status'],
            'changes': 1 if f['status'] == 'tampered' else 0
        })
        
    return jsonify({
        'files': file_list,
        'score': latest_data['summary']['integrityScore']
    }), 200


@integrity_bp.route('/scan', methods=['POST'])
@token_required
def scan_files():
    report = run_full_scan(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        ip=request.remote_addr,
        scan_type='manual'
    )
    return jsonify({
        'message': 'Integrity scan completed',
        'tamperedDetected': report.tampered,
        'reportId': report.id
    }), 200


@integrity_bp.route('/scan/<file_id>', methods=['POST'])
@token_required
def scan_single(file_id):
    result = scan_single_file(file_id, g.user.id)
    if 'error' in result:
        return jsonify(result), 404
    return jsonify(result), 200


@integrity_bp.route('/quarantine/<file_id>', methods=['POST'])
@token_required
def quarantine(file_id):
    success = quarantine_file(
        file_id=file_id,
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        ip=request.remote_addr
    )
    
    if not success:
        return jsonify({'error': 'File not found'}), 404
        
    return jsonify({'message': 'File quarantined successfully'}), 200


@integrity_bp.route('/restore/<file_id>', methods=['POST'])
@token_required
def restore(file_id):
    success = restore_file(
        file_id=file_id,
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        ip=request.remote_addr
    )
    
    if not success:
        return jsonify({'error': 'File not found'}), 404
        
    return jsonify({'message': 'File restored from backup successfully'}), 200


@integrity_bp.route('/report', methods=['GET'])
@token_required
def get_latest_report_route():
    report_data = get_latest_report(g.user.id)
    return jsonify(report_data), 200


@integrity_bp.route('/report/history', methods=['GET'])
@token_required
def get_report_history_route():
    limit = request.args.get('limit', default=20, type=int)
    history = get_report_history(g.user.id, limit=limit)
    return jsonify(history), 200


@integrity_bp.route('/events', methods=['GET'])
@token_required
def get_hash_events_route():
    file_id = request.args.get('file_id')
    limit = request.args.get('limit', default=100, type=int)
    events = get_hash_events(g.user.id, file_id=file_id, limit=limit)
    return jsonify(events), 200

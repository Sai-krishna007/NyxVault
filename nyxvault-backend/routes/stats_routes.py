from flask import Blueprint, jsonify, g
from models.file import File
from models.alert import Alert
from models.share import Share
from services.auth_service import token_required

stats_bp = Blueprint('stats', __name__)

@stats_bp.route('', methods=['GET'])
@token_required
def get_stats():
    user_files = File.query.filter_by(user_id=g.user.id).order_by(File.modified.desc()).all()
    user_alerts = Alert.query.filter((Alert.user_id == g.user.id) | (Alert.user_id == 'system')).all()
    user_shares = Share.query.filter_by(user_id=g.user.id).all()

    total_files = len(user_files)
    
    # Calculate storage in GB
    total_bytes = sum(f.size for f in user_files)
    storage_used_gb = total_bytes / (1024 * 1024 * 1024)
    
    active_alerts = len([a for a in user_alerts if a.status in ('active', 'reviewing')])
    share_links_count = len([s for s in user_shares if s.status != 'expired'])
    threats = len([a for a in user_alerts if a.status == 'blocked' or a.sev == 'critical'])
    
    # Integrity score (verified vs total files)
    verified_files_count = len([f for f in user_files if f.status == 'verified'])
    if total_files > 0:
        integrity_score = round((verified_files_count / total_files) * 100, 1)
    else:
        integrity_score = 100.0

    # Dynamic Storage category breakdown
    type_mapping = {
        'pdf': 'Documents', 'docx': 'Documents', 'doc': 'Documents', 
        'xlsx': 'Documents', 'xls': 'Documents', 'txt': 'Documents', 'csv': 'Documents',
        'zip': 'Archives', 'tar': 'Archives', 'gz': 'Archives', 'rar': 'Archives',
        'png': 'Images', 'jpg': 'Images', 'jpeg': 'Images', 'gif': 'Images', 'svg': 'Images',
        'js': 'Code', 'html': 'Code', 'css': 'Code', 'py': 'Code', 'json': 'Code',
        'key': 'Keys', 'pem': 'Keys', 'pub': 'Keys'
    }

    categories = { 'Documents': 0, 'Archives': 0, 'Images': 0, 'Code': 0, 'Keys': 0, 'Other': 0 }
    for f in user_files:
        cat = type_mapping.get(f.type, 'Other')
        categories[cat] += f.size

    denominator = total_bytes if total_bytes > 0 else 1
    chart_storage = {
        'labels': list(categories.keys()),
        'data': [round((bytes_count / denominator) * 100) for bytes_count in categories.values()]
    }

    # Chart activity (fixed mock trend with dynamic final index values)
    chart_activity = {
        'labels': ['Jun 18', 'Jun 19', 'Jun 20', 'Jun 21', 'Jun 22', 'Jun 23', 'Jun 24'],
        'uploads': [12, 18, 14, 29, 22, 35, total_files],
        'downloads': [45, 68, 53, 89, 72, 95, 120],
        'alerts': [1, 3, 2, 4, 3, 5, active_alerts]
    }

    chart_threats = {
        'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        'malware': [2, 1, 4, 2, 5, 3, threats if threats > 0 else 2],
        'intrusion': [4, 3, 6, 4, 8, 2, 5],
        'anomaly': [3, 5, 2, 7, 4, 6, active_alerts if active_alerts > 0 else 3]
    }

    return jsonify({
        'stats': {
            'totalFiles': total_files,
            'storageUsed': storage_used_gb,
            'storageTotal': 64.0,
            'alerts': active_alerts,
            'shares': share_links_count,
            'threats': threats,
            'integrityScore': integrity_score,
            'uptime': 99.98
        },
        'recentFiles': [f.to_dict() for f in user_files[:6]],
        'chartActivity': chart_activity,
        'chartStorage': chart_storage,
        'chartThreats': chart_threats
    }), 200

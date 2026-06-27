import random
from datetime import datetime
from database.db import db
from models.audit_log import AuditLog

def log_action(user_id: str, username: str, action: str, resource: str, ip: str, status: str = 'success'):
    """Create and save an audit log entry."""
    log_id = f"LOG-{random.randint(1000, 9999)}"
    
    # Custom format for 'time' attribute to match Node backend
    # E.g. "Today 12:39" or similar
    now = datetime.now()
    time_str = f"Today {now.strftime('%H:%M')}"
    
    new_log = AuditLog(
        id=log_id,
        user_id=user_id,
        user=username,
        action=action,
        resource=resource,
        ip=ip if ip else '127.0.0.1',
        time=time_str,
        status=status,
        timestamp=datetime.utcnow().isoformat() + 'Z'
    )
    
    db.session.add(new_log)
    db.session.commit()
    return new_log

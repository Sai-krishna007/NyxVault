from database.db import db

class AuditLog(db.Model):
    __tablename__ = 'audit_logs'

    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), nullable=False, index=True) # usr-xxx, 'system', or 'unknown'
    user = db.Column(db.String(100), nullable=False) # e.g. email prefix
    action = db.Column(db.String(100), nullable=False) # USER_CREATE, FILE_UPLOAD, FILE_DOWNLOAD, etc.
    resource = db.Column(db.String(255), nullable=False)
    ip = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(100), nullable=False) # e.g. "Today 12:39"
    status = db.Column(db.String(50), default='success', nullable=False) # success, blocked, warning
    timestamp = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'user': self.user,
            'action': self.action,
            'resource': self.resource,
            'ip': self.ip,
            'time': self.time,
            'status': self.status,
            'timestamp': self.timestamp
        }

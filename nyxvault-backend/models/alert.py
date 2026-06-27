from database.db import db

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), nullable=False, index=True)  # 'system' or user ID
    sev = db.Column(db.String(20), nullable=False)  # low, medium, high, critical
    title = db.Column(db.String(200), nullable=False)
    desc = db.Column(db.Text, nullable=False)
    time = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(50), default='active', nullable=False)  # active, resolved, blocked, reviewing
    timestamp = db.Column(db.String(100), nullable=False)

    # Alert type classification
    alert_type = db.Column(
        db.String(50), default='system', nullable=False
    )  # failed_login | unauthorized_access | file_tampering | suspicious_download | system

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'sev': self.sev,
            'title': self.title,
            'desc': self.desc,
            'time': self.time,
            'status': self.status,
            'timestamp': self.timestamp,
            'alertType': self.alert_type,
        }

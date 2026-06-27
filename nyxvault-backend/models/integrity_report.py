from database.db import db

class IntegrityReport(db.Model):
    """Persists a full vault scan session with breakdown statistics."""
    __tablename__ = 'integrity_reports'

    id = db.Column(db.String(50), primary_key=True)             # e.g. RPT-xxxxx
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    scan_type = db.Column(db.String(50), default='manual', nullable=False)  # manual | download_verify | scheduled

    # Counts
    total_files = db.Column(db.Integer, default=0, nullable=False)
    verified = db.Column(db.Integer, default=0, nullable=False)
    tampered = db.Column(db.Integer, default=0, nullable=False)
    unverified = db.Column(db.Integer, default=0, nullable=False)
    missing = db.Column(db.Integer, default=0, nullable=False)

    # Summary
    integrity_score = db.Column(db.Float, default=100.0, nullable=False)
    tampered_files = db.Column(db.JSON, nullable=True)          # [{id, name, expected, computed}]

    # Timing
    scanned_at = db.Column(db.String(100), nullable=False)
    duration_ms = db.Column(db.Integer, default=0, nullable=False)

    user = db.relationship('User', backref=db.backref('integrity_reports', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'scanType': self.scan_type,
            'totalFiles': self.total_files,
            'verified': self.verified,
            'tampered': self.tampered,
            'unverified': self.unverified,
            'missing': self.missing,
            'integrityScore': self.integrity_score,
            'tamperedFiles': self.tampered_files or [],
            'scannedAt': self.scanned_at,
            'durationMs': self.duration_ms,
        }

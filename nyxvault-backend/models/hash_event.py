from database.db import db

class HashEvent(db.Model):
    """Per-file hash change audit log — every hash check is recorded here."""
    __tablename__ = 'hash_events'

    id = db.Column(db.String(50), primary_key=True)
    file_id = db.Column(db.String(50), db.ForeignKey('files.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.String(50), nullable=False, index=True)
    file_name = db.Column(db.String(255), nullable=False)

    # Event classification
    event_type = db.Column(db.String(50), nullable=False)   # uploaded | verified | tampered | restored
    triggered_by = db.Column(db.String(50), nullable=False) # upload | scan | download | restore

    # Hash values (truncated for storage efficiency; full hashes stay in File model)
    expected_hash = db.Column(db.String(16), nullable=True)  # first 16 chars of original_hash
    computed_hash = db.Column(db.String(16), nullable=True)  # first 16 chars of live hash
    matched = db.Column(db.Boolean, default=True, nullable=False)

    timestamp = db.Column(db.String(100), nullable=False)

    file = db.relationship('File', backref=db.backref('hash_events', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'fileId': self.file_id,
            'userId': self.user_id,
            'fileName': self.file_name,
            'eventType': self.event_type,
            'triggeredBy': self.triggered_by,
            'expectedHash': self.expected_hash,
            'computedHash': self.computed_hash,
            'matched': self.matched,
            'timestamp': self.timestamp,
        }

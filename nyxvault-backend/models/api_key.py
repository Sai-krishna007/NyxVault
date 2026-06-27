from database.db import db
from datetime import datetime

class ApiKey(db.Model):
    __tablename__ = 'api_keys'

    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    prefix = db.Column(db.String(50), nullable=False)  # 'nvk_prod_' or 'nvk_dev_'
    key_hash = db.Column(db.String(64), nullable=False, unique=True)
    created_at = db.Column(db.String(100), nullable=False)
    last_used_at = db.Column(db.String(100), nullable=True)
    status = db.Column(db.String(50), default='active', nullable=False)

    # Relationship to user
    user = db.relationship('User', backref=db.backref('api_keys', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'name': self.name,
            'prefix': self.prefix,
            'created': self.created_at,
            'lastUsed': self.last_used_at or 'Never used',
            'status': self.status
        }

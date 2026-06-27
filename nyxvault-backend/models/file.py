from database.db import db
from datetime import datetime

class File(db.Model):
    __tablename__ = 'files'

    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False)
    size = db.Column(db.BigInteger, nullable=False)
    path = db.Column(db.String(255), nullable=False)
    hash = db.Column(db.String(64), nullable=False)
    original_hash = db.Column(db.String(64), nullable=False)
    encrypted = db.Column(db.Boolean, default=False, nullable=False)
    encryption_key = db.Column(db.String(255), nullable=True) # base64 encoded unique key
    is_zero_knowledge = db.Column(db.Boolean, default=False, nullable=False)
    wrapped_key = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='verified', nullable=False)
    modified = db.Column(db.String(100), nullable=False)
    folder = db.Column(db.String(100), default='Documents', nullable=False)

    # Relationship to user
    user = db.relationship('User', backref=db.backref('files', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'name': self.name,
            'type': self.type,
            'size': self.size,
            'path': self.path,
            'hash': self.hash,
            'originalHash': self.original_hash,
            'encrypted': self.encrypted,
            'isZeroKnowledge': self.is_zero_knowledge,
            'wrappedKey': self.wrapped_key,
            'status': self.status,
            'modified': self.modified,
            'folder': self.folder
        }

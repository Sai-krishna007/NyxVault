from database.db import db

class Share(db.Model):
    __tablename__ = 'shares'

    id = db.Column(db.String(50), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    file_id = db.Column(db.String(50), db.ForeignKey('files.id', ondelete='CASCADE'), nullable=False, index=True)
    file = db.Column(db.String(255), nullable=False)
    recipients = db.Column(db.JSON, nullable=True)  # List of emails
    expiry = db.Column(db.String(50), nullable=False)
    views = db.Column(db.Integer, default=0, nullable=False)
    dl = db.Column(db.Integer, default=0, nullable=False)
    status = db.Column(db.String(50), default='active', nullable=False)

    # Secure Sharing options
    permission = db.Column(db.String(50), default='download', nullable=False)  # 'view' | 'download'
    one_time = db.Column(db.Boolean, default=False, nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=True)
    max_downloads = db.Column(db.Integer, nullable=True)

    # Relationships
    user = db.relationship('User', backref=db.backref('shares', cascade='all, delete-orphan'))
    file_rel = db.relationship('File', backref=db.backref('shares', cascade='all, delete-orphan'))

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'fileId': self.file_id,
            'file': self.file,
            'recipients': self.recipients or [],
            'expiry': self.expiry,
            'views': self.views,
            'dl': self.dl,
            'status': self.status,
            'permission': self.permission,
            'oneTime': self.one_time,
            'token': self.token,
            'hasPassword': self.password is not None and self.password != '',
            'maxDownloads': self.max_downloads
        }

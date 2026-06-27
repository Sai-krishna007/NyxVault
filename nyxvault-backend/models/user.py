from database.db import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(50), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='Developer', nullable=False)
    avatar = db.Column(db.String(10), nullable=True)
    plan = db.Column(db.String(50), default='Enterprise', nullable=False)
    mfa = db.Column(db.Boolean, default=True, nullable=False)
    mfa_secret = db.Column(db.String(100), nullable=True)
    mfa_enabled = db.Column(db.Boolean, default=False, nullable=False)
    refresh_token = db.Column(db.String(255), nullable=True)
    joined = db.Column(db.String(50), nullable=True)
    status = db.Column(db.String(50), default='active', nullable=False)
    color = db.Column(db.String(20), nullable=True)
    bio = db.Column(db.Text, default='Security-focused vault user.', nullable=True)
    timezone = db.Column(db.String(100), default='UTC+05:30 — Asia/Kolkata', nullable=True)
    watermark = db.Column(db.Boolean, default=False, nullable=False)

    # Access Control Policy Settings
    policy_max_lifetime = db.Column(db.Integer, default=30, nullable=False)
    policy_default_permission = db.Column(db.String(50), default='download', nullable=False)
    policy_ip_whitelist = db.Column(db.String(255), default='Disabled', nullable=False)
    policy_geo_restriction = db.Column(db.String(255), default='US, EU only', nullable=False)
    policy_mfa_requirement = db.Column(db.String(255), default='Enforce for external', nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'avatar': self.avatar,
            'plan': self.plan,
            'mfa': self.mfa,
            'mfa_enabled': self.mfa_enabled,
            'joined': self.joined,
            'status': self.status,
            'color': self.color,
            'bio': self.bio,
            'timezone': self.timezone,
            'watermark': self.watermark,
            'policy_max_lifetime': self.policy_max_lifetime,
            'policy_default_permission': self.policy_default_permission,
            'policy_ip_whitelist': self.policy_ip_whitelist,
            'policy_geo_restriction': self.policy_geo_restriction,
            'policy_mfa_requirement': self.policy_mfa_requirement
        }

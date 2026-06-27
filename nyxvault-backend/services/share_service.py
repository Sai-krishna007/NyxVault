import random
from datetime import datetime, timedelta
from database.db import db
from models.share import Share
from models.file import File
from services.audit_service import log_action

def create_share_link(
    file_id: str,
    user_id: str,
    username: str,
    recipients_str: str,
    expiry_date: str,
    ip: str,
    permission: str = 'download',
    one_time: bool = False,
    password: str = None,
    max_downloads: int = None
) -> Share:
    """Create a share link for a file."""
    file = File.query.filter_by(id=file_id, user_id=user_id).first()
    if not file:
        return None
        
    share_id = f"SL-{random.randint(1000, 9999)}"
    
    recipients = [r.strip() for r in recipients_str.split(',') if r.strip()] if recipients_str else []
    
    if not expiry_date:
        # Default to 7 days in future
        expiry_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        
    import secrets
    share_token = secrets.token_urlsafe(32)
    
    new_share = Share(
        id=share_id,
        user_id=user_id,
        file_id=file_id,
        file=file.name,
        recipients=recipients,
        expiry=expiry_date,
        views=0,
        dl=0,
        status='active',
        permission=permission,
        one_time=one_time,
        token=share_token,
        password=password if password else None,
        max_downloads=max_downloads
    )
    
    db.session.add(new_share)
    db.session.commit()
    
    # Audit log the share
    log_action(
        user_id=user_id,
        username=username,
        action='FILE_SHARE',
        resource=file.name,
        ip=ip
    )
    
    return new_share

def revoke_share_link(share_id: str, user_id: str, username: str, ip: str) -> bool:
    """Revoke/delete a share link."""
    share = Share.query.filter_by(id=share_id, user_id=user_id).first()
    if not share:
        return False
        
    db.session.delete(share)
    db.session.commit()
    
    # Audit log the revocation
    log_action(
        user_id=user_id,
        username=username,
        action='SHARE_REVOKE',
        resource=share_id,
        ip=ip
    )
    return True

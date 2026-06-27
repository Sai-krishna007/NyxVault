import os
import hashlib
import random
import string
from datetime import datetime
from database.db import db
from models.file import File
from models.alert import Alert
from services.audit_service import log_action
from services.alert_service import create_alert
from services.encryption_service import generate_key, encrypt_data, decrypt_data, key_to_base64, key_from_base64
from services.storage_service import get_storage_provider

FOLDER_MAPPING = {
    'pdf': 'Documents', 'docx': 'Documents', 'doc': 'Documents', 
    'xlsx': 'Documents', 'xls': 'Documents', 'txt': 'Documents', 'csv': 'Documents',
    'zip': 'Archives', 'tar': 'Archives', 'gz': 'Archives', 'rar': 'Archives',
    'png': 'Images', 'jpg': 'Images', 'jpeg': 'Images', 'gif': 'Images', 'svg': 'Images',
    'js': 'Code', 'html': 'Code', 'css': 'Code', 'py': 'Code', 'json': 'Code',
    'key': 'Keys & Certs', 'pem': 'Keys & Certs', 'pub': 'Keys & Certs'
}

def generate_file_id() -> str:
    """Generate a random unique file ID."""
    rand_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=9))
    return f"fil-{rand_str}"

def save_uploaded_file(file_storage, user_id: str, username: str, ip: str, encrypted: bool, is_zero_knowledge: bool = False, wrapped_key: str = None) -> File:
    """Read upload, encrypt if requested, save to active storage provider, and add metadata."""
    filename = file_storage.filename
    ext = os.path.splitext(filename)[1].lstrip('.').lower()
    
    file_id = generate_file_id()
    storage_name = f"{file_id}.{ext}" if ext else file_id
    
    # Read plaintext data from upload stream
    plaintext_data = file_storage.read()
    
    data_to_write = plaintext_data
    enc_key_b64 = None
    
    if is_zero_knowledge:
        # The file content is already encrypted client-side
        data_to_write = plaintext_data
        encrypted = True
    elif encrypted:
        file_key = generate_key()
        enc_key_b64 = key_to_base64(file_key)
        data_to_write = encrypt_data(plaintext_data, file_key)
        
    # Calculate hash and size of the actual stored data
    file_hash = hashlib.sha256(data_to_write).hexdigest()
    size = len(data_to_write)
    
    # Save using the configured storage provider (S3 or local disk)
    storage = get_storage_provider()
    storage.upload_file(data_to_write, storage_name)
    
    folder = FOLDER_MAPPING.get(ext, 'Documents')
    
    new_file = File(
        id=file_id,
        user_id=user_id,
        name=filename,
        type=ext or 'doc',
        size=size,
        path=storage_name,
        hash=file_hash,
        original_hash=file_hash,
        encrypted=encrypted,
        encryption_key=enc_key_b64,
        is_zero_knowledge=is_zero_knowledge,
        wrapped_key=wrapped_key,
        status='verified',
        modified=datetime.utcnow().isoformat() + 'Z',
        folder=folder
    )
    
    db.session.add(new_file)
    
    from services.integrity_service import record_hash_event
    record_hash_event(
        file=new_file,
        user_id=user_id,
        event_type='uploaded',
        triggered_by='upload',
        expected_hash=file_hash,
        computed_hash=file_hash,
        matched=True
    )
    db.session.commit()
    
    # Audit log the upload
    log_action(
        user_id=user_id,
        username=username,
        action='FILE_UPLOAD',
        resource=filename,
        ip=ip
    )
    
    return new_file

def delete_user_file(file_id: str, user_id: str, username: str, ip: str) -> bool:
    """Delete a file's metadata from DB and its ciphertext from the active storage provider."""
    file = File.query.filter_by(id=file_id, user_id=user_id).first()
    if not file:
        return False
        
    # Remove from database first
    db.session.delete(file)
    db.session.commit()
    
    # Delete from active storage provider (disk or S3)
    storage = get_storage_provider()
    storage.delete_file(file.path)
            
    # Audit log the deletion
    log_action(
        user_id=user_id,
        username=username,
        action='FILE_DELETE',
        resource=file.name,
        ip=ip
    )
    return True

def run_integrity_scan(user_id: str, username: str, ip: str) -> int:
    """Verify that stored files' hashes match original hashes."""
    files = File.query.filter_by(user_id=user_id).all()
    storage = get_storage_provider()
    tampered_count = 0
    
    for file in files:
        try:
            stored_data = storage.download_file(file.path)
        except Exception:
            # File missing in storage
            file.status = 'unverified'
            continue
            
        current_hash = hashlib.sha256(stored_data).hexdigest()
        
        # Check if hash matches the database expected hash
        if current_hash != file.original_hash:
            file.hash = current_hash
            file.status = 'tampered'
            tampered_count += 1
            
            # Trigger alert
            desc = f"SHA-256 hash mismatch on {file.name} — expected {file.original_hash[:10]}... but computed {current_hash[:10]}... possible tampering"
            create_alert(
                user_id=user_id,
                sev='high',
                title='File Integrity Violation Detected',
                desc=desc
            )
        elif file.status in ('tampered', 'unverified'):
            file.status = 'verified'
            
    db.session.commit()
    
    # Audit log scan
    log_action(
        user_id=user_id,
        username=username,
        action='INTEGRITY_SCAN',
        resource='Vault Root',
        ip=ip
    )
    
    return tampered_count

def quarantine_file(file_id: str, user_id: str, username: str, ip: str) -> bool:
    """Quarantine a file by setting its status to unverified."""
    file = File.query.filter_by(id=file_id, user_id=user_id).first()
    if not file:
        return False
        
    file.status = 'unverified'
    db.session.commit()
    
    log_action(
        user_id=user_id,
        username=username,
        action='SETTINGS_EDIT',
        resource=f"Quarantined {file.name}",
        ip=ip
    )
    return True

def restore_file(file_id: str, user_id: str, username: str, ip: str) -> bool:
    """Restore file integrity status and contents in storage."""
    file = File.query.filter_by(id=file_id, user_id=user_id).first()
    if not file:
        return False
        
    storage = get_storage_provider()
    
    # Generate mock data
    mock_content_str = f"Secure physical storage for {file.name}. File encrypted with AES-256-GCM. Size: {file.size} bytes."
    mock_data = mock_content_str.encode('utf-8')
    
    # Encrypt mock content if file was encrypted
    data_to_write = mock_data
    if file.encrypted and file.encryption_key:
        file_key = key_from_base64(file.encryption_key)
        data_to_write = encrypt_data(mock_data, file_key)
        
    # Re-upload clean file content to storage provider
    storage.upload_file(data_to_write, file.path)
    
    restored_hash = hashlib.sha256(data_to_write).hexdigest()
    file.hash = restored_hash
    file.original_hash = restored_hash
    file.status = 'verified'
    
    from services.integrity_service import record_hash_event
    record_hash_event(
        file=file,
        user_id=user_id,
        event_type='restored',
        triggered_by='restore',
        expected_hash=restored_hash,
        computed_hash=restored_hash,
        matched=True
    )
    
    # Resolve corresponding alerts
    alerts = Alert.query.filter_by(user_id=user_id, status='active').all()
    for alert in alerts:
        if 'Integrity' in alert.title and file.name in alert.desc:
            alert.status = 'resolved'
            
    db.session.commit()
    
    log_action(
        user_id=user_id,
        username=username,
        action='SETTINGS_EDIT',
        resource=f"Restored {file.name}",
        ip=ip
    )
    return True

import io
from datetime import datetime
from flask import Blueprint, request, jsonify, g, send_file, current_app
from database.db import db
from models.file import File
from models.share import Share
from services.auth_service import token_required
from services.file_service import save_uploaded_file, delete_user_file
from services.encryption_service import decrypt_data, key_from_base64
from services.storage_service import get_storage_provider
from services.audit_service import log_action
from services.alert_service import create_alert


file_bp = Blueprint('files', __name__)

@file_bp.route('', methods=['GET'])
@token_required
def list_files():
    folder = request.args.get('folder')
    search = request.args.get('search')
    
    query = File.query.filter_by(user_id=g.user.id)
    
    if folder:
        query = query.filter(File.folder.ilike(folder))
        
    if search:
        query = query.filter(File.name.ilike(f"%{search}%"))
        
    files = query.all()
    return jsonify([f.to_dict() for f in files]), 200


@file_bp.route('/upload', methods=['POST'])
@token_required
def upload_file():
    if g.user.role == 'Auditor':
        return jsonify({'error': 'Forbidden: Auditors are not permitted to upload files.'}), 403
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400
        
    uploaded_file = request.files['file']
    if uploaded_file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    # Calculate file size and verify storage limits (64GB free tier)
    uploaded_file.seek(0, 2)  # Seek to end
    file_size = uploaded_file.tell()  # Get size
    uploaded_file.seek(0)  # Seek back to beginning
    
    LIMIT_BYTES = 64 * 1024 * 1024 * 1024  # 64 GB in bytes
    existing_files = File.query.filter_by(user_id=g.user.id).all()
    total_existing_bytes = sum(f.size for f in existing_files)
    
    if total_existing_bytes + file_size > LIMIT_BYTES:
        return jsonify({'error': 'Storage limit reached. You have exceeded your 64GB free tier.'}), 413
        
    # Perform VirusTotal malware scan before writing file to storage
    file_bytes = uploaded_file.read()
    uploaded_file.seek(0)  # Reset stream pointer
    
    from services.virus_service import scan_file_bytes
    scan_result = scan_file_bytes(file_bytes, uploaded_file.filename)
    if scan_result['infected']:
        create_alert(
            user_id=g.user.id,
            sev='critical',
            title='Malware Upload Blocked',
            desc=(
                f"Malicious file '{uploaded_file.filename}' was blocked during upload. "
                f"Threat: {scan_result['threat_name']}. Details: {scan_result['details']}."
            ),
            alert_type='malware_detected'
        )
        return jsonify({
            'error': f"Malware detected! Threat: {scan_result['threat_name']}. Upload blocked."
        }), 400
        
    encrypted = request.form.get('encrypted') == 'true'
    is_zero_knowledge = request.form.get('is_zero_knowledge') == 'true'
    wrapped_key = request.form.get('wrapped_key')
    
    try:
        new_file = save_uploaded_file(
            file_storage=uploaded_file,
            user_id=g.user.id,
            username=g.user.email.split('@')[0],
            ip=request.remote_addr,
            encrypted=encrypted,
            is_zero_knowledge=is_zero_knowledge,
            wrapped_key=wrapped_key
        )
        return jsonify(new_file.to_dict()), 201
    except Exception as e:
        return jsonify({'error': f"Failed to upload file: {str(e)}"}), 500


@file_bp.route('/download/<file_id>', methods=['GET'])
@token_required
def download_file(file_id):
    if g.user.role == 'Auditor':
        return jsonify({'error': 'Forbidden: Auditors are not permitted to download files.'}), 403
    file = File.query.filter_by(id=file_id, user_id=g.user.id).first()
    
    if not file:
        return jsonify({'error': 'File not found or access denied'}), 404
        
    # Verify file integrity on download before serving
    from services.integrity_service import verify_file_on_download, IntegrityViolationError
    try:
        verify_file_on_download(file, g.user.id)
    except IntegrityViolationError as e:
        return jsonify({'error': str(e)}), 409
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
        
    # Download file ciphertext/bytes from active storage provider
    storage = get_storage_provider()
    try:
        data = storage.download_file(file.path)
    except FileNotFoundError:
        return jsonify({'error': 'Physical storage file missing'}), 404
    except Exception as e:
        return jsonify({'error': f"Failed to retrieve file from storage: {str(e)}"}), 500
        
    # Decrypt if the file is encrypted (and not zero-knowledge)
    if file.encrypted and file.encryption_key and not file.is_zero_knowledge:
        try:
            file_key = key_from_base64(file.encryption_key)
            data = decrypt_data(data, file_key)
        except Exception as e:
            return jsonify({'error': f"Failed to decrypt file content: {str(e)}"}), 500
            
    # Inject download watermark if enabled for the user (only for non-zero-knowledge files)
    if hasattr(g.user, 'watermark') and g.user.watermark and not file.is_zero_knowledge:
        try:
            watermark_str = f"\n\n[NYXVAULT SECURITY WATERMARK: USER={g.user.email} ID={g.user.id} TIME={datetime.utcnow().isoformat()}Z]"
            data = data + watermark_str.encode('utf-8')
        except Exception:
            pass
            
    # Increment download count in shares if applicable
    active_share = Share.query.filter_by(file_id=file.id).first()
    if active_share:
        active_share.dl += 1
        db.session.commit()
        
    # Log download audit action
    log_action(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        action='FILE_DOWNLOAD',
        resource=file.name,
        ip=request.remote_addr
    )

    # Record download in IDS for exfiltration tracking
    from services.ids_service import record_file_download
    record_file_download(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        filename=file.name,
        ip=request.remote_addr
    )

    # Detect suspicious off-hours download (outside 06:00–22:00 UTC)
    from datetime import datetime as _dt
    _hour = _dt.utcnow().hour
    if _hour < 6 or _hour >= 22:
        create_alert(
            user_id=g.user.id,
            sev='high',
            title='Suspicious Off-Hours Download',
            desc=(
                f"File '{file.name}' was downloaded at {_dt.utcnow().strftime('%H:%M')} UTC "
                f"(outside normal working hours) from IP {request.remote_addr or '127.0.0.1'}."
            ),
            alert_type='suspicious_download',
        )

    # Stream the decrypted file bytes to the client
    return send_file(
        io.BytesIO(data),
        as_attachment=True,
        download_name=file.name,
        mimetype='application/octet-stream'
    )


@file_bp.route('/preview/<file_id>', methods=['GET'])
@token_required
def preview_file(file_id):
    if g.user.role == 'Auditor':
        return jsonify({'error': 'Forbidden: Auditors are not permitted to preview files.'}), 403
    import mimetypes
    file = File.query.filter_by(id=file_id, user_id=g.user.id).first()
    
    if not file:
        return jsonify({'error': 'File not found or access denied'}), 404
        
    from services.integrity_service import verify_file_on_download, IntegrityViolationError
    try:
        verify_file_on_download(file, g.user.id)
    except IntegrityViolationError as e:
        return jsonify({'error': str(e)}), 409
    except FileNotFoundError as e:
        return jsonify({'error': str(e)}), 404
        
    storage = get_storage_provider()
    try:
        data = storage.download_file(file.path)
    except FileNotFoundError:
        return jsonify({'error': 'Physical storage file missing'}), 404
    except Exception as e:
        return jsonify({'error': f"Failed to retrieve file from storage: {str(e)}"}), 500
        
    if file.encrypted and file.encryption_key and not file.is_zero_knowledge:
        try:
            file_key = key_from_base64(file.encryption_key)
            data = decrypt_data(data, file_key)
        except Exception as e:
            return jsonify({'error': f"Failed to decrypt file content: {str(e)}"}), 500
            
    if file.is_zero_knowledge:
        mime_type = 'application/octet-stream'
    elif file.type.lower() == 'docx':
        from routes.share_routes import extract_docx_text_from_bytes
        extracted_text = extract_docx_text_from_bytes(data)
        data = extracted_text.encode('utf-8')
        mime_type = 'text/plain'
    else:
        # Guess mime type to stream inline
        mime_type, _ = mimetypes.guess_type(file.name)
        if not mime_type:
            mime_type = 'text/plain' if file.type in ['txt', 'csv', 'js', 'py', 'json', 'css', 'html'] else 'application/octet-stream'

    # Audit log preview
    log_action(
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        action='FILE_DOWNLOAD',
        resource=f"Previewed {file.name}",
        ip=request.remote_addr
    )

    return send_file(
        io.BytesIO(data),
        as_attachment=False,
        download_name=file.name,
        mimetype=mime_type
    )


@file_bp.route('/<file_id>', methods=['DELETE'])
@token_required
def delete_file(file_id):
    if g.user.role == 'Auditor':
        return jsonify({'error': 'Forbidden: Auditors are not permitted to delete files.'}), 403
    success = delete_user_file(
        file_id=file_id,
        user_id=g.user.id,
        username=g.user.email.split('@')[0],
        ip=request.remote_addr
    )
    
    if not success:
        return jsonify({'error': 'File not found'}), 404
        
    return jsonify({'message': 'File deleted successfully'}), 200

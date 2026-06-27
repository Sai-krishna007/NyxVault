import os
import sys
import json
from app import create_app
from database.db import db
from models.file import File
from models.audit_log import AuditLog
from models.user import User
from manage_db import seed_database

def test_preview_module():
    print("--- 1. Re-seeding Database ---")
    seed_database()
    
    app = create_app()
    client = app.test_client()
    
    print("\n--- 2. Authenticating User ---")
    login_resp = client.post('/api/auth/login', json={
        'email': 'alex.ryder@nyxvault.io',
        'password': 'Password123!'
    })
    assert login_resp.status_code == 200, f"Login failed: {login_resp.data}"
    login_data = json.loads(login_resp.data)
    token = login_data['token']
    headers = {'Authorization': f'Bearer {token}'}
    print("Authenticated successfully.")
    
    with app.app_context():
        # Get different types of seeded files
        print("\n--- 3. Verifying Seeded Files for Preview ---")
        pdf_file = File.query.filter(File.name.like('%.pdf')).first()
        txt_file = File.query.filter(File.name.like('%.txt')).first()
        png_file = File.query.filter(File.name.like('%.png')).first()
        
        assert pdf_file is not None, "No PDF file seeded"
        assert txt_file is not None, "No text file seeded"
        assert png_file is not None, "No PNG file seeded"
        
        print(f"Found PDF file: {pdf_file.name} (ID: {pdf_file.id})")
        print(f"Found TXT file: {txt_file.name} (ID: {txt_file.id})")
        print(f"Found PNG file: {png_file.name} (ID: {png_file.id})")
        
        pdf_id = pdf_file.id
        txt_id = txt_file.id
        png_id = png_file.id
        pdf_name = pdf_file.name
        txt_name = txt_file.name
        png_name = png_file.name
        
    print("\n--- 3.5 Restoring Tampered Files for Preview ---")
    restore_pdf = client.post(f'/api/integrity/restore/{pdf_id}', headers=headers)
    assert restore_pdf.status_code == 200, f"Failed to restore PDF: {restore_pdf.data}"
    restore_png = client.post(f'/api/integrity/restore/{png_id}', headers=headers)
    assert restore_png.status_code == 200, f"Failed to restore PNG: {restore_png.data}"
    print("Files restored successfully.")
    
    print("\n--- 4. Testing PDF File Preview ---")
    pdf_resp = client.get(f'/api/files/preview/{pdf_id}', headers=headers)
    assert pdf_resp.status_code == 200, f"PDF preview failed: {pdf_resp.data}"
    assert pdf_resp.mimetype == 'application/pdf', f"Expected application/pdf, got {pdf_resp.mimetype}"
    # Verify it is sent inline, not as attachment
    cd_header = pdf_resp.headers.get('Content-Disposition', '')
    assert 'inline' in cd_header or 'attachment' not in cd_header, f"Expected inline disposition, got {cd_header}"
    print(f"PDF Preview successful. Mimetype: {pdf_resp.mimetype}, Content-Disposition: {cd_header}")
    
    print("\n--- 5. Testing TXT File Preview ---")
    txt_resp = client.get(f'/api/files/preview/{txt_id}', headers=headers)
    assert txt_resp.status_code == 200, f"TXT preview failed: {txt_resp.data}"
    assert txt_resp.mimetype == 'text/plain', f"Expected text/plain, got {txt_resp.mimetype}"
    print(f"TXT Preview successful. Mimetype: {txt_resp.mimetype}, Data length: {len(txt_resp.data)}")
    
    print("\n--- 6. Testing PNG File Preview ---")
    png_resp = client.get(f'/api/files/preview/{png_id}', headers=headers)
    assert png_resp.status_code == 200, f"PNG preview failed: {png_resp.data}"
    assert png_resp.mimetype == 'image/png', f"Expected image/png, got {png_resp.mimetype}"
    print(f"PNG Preview successful. Mimetype: {png_resp.mimetype}")
    
    print("\n--- 7. Testing Unauthorized Access (No Token) ---")
    unauth_resp = client.get(f'/api/files/preview/{pdf_id}')
    assert unauth_resp.status_code == 401, f"Expected 401 Unauthorized, got {unauth_resp.status_code}"
    print("Unauthorized access blocked successfully (401).")
    
    print("\n--- 8. Testing Non-Existent File Preview (404) ---")
    invalid_resp = client.get('/api/files/preview/fil-nonexistent123', headers=headers)
    assert invalid_resp.status_code == 404, f"Expected 404 Not Found, got {invalid_resp.status_code}"
    print("Non-existent file preview returned 404 successfully.")
    
    with app.app_context():
        # Check audit logs for the preview actions
        print("\n--- 9. Verifying Audit Log Entries ---")
        user = User.query.filter_by(email='alex.ryder@nyxvault.io').first()
        assert user is not None, "User not found in DB"
        logs = AuditLog.query.filter_by(user_id=user.id, action='FILE_DOWNLOAD').all()
        preview_logs = [log for log in logs if 'Previewed' in log.resource]
        assert len(preview_logs) >= 3, f"Expected at least 3 preview audit logs, got {len(preview_logs)}"
        for log in preview_logs:
            print(f"Audit log verified: {log.user} - {log.action} - {log.resource}")
            
    print("\nALL PREVIEW ENDPOINT TESTS PASSED SUCCESSFULLY! [SUCCESS]")

if __name__ == '__main__':
    test_preview_module()

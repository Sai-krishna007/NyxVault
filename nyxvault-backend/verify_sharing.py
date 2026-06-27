import os
import sys
import json
from app import create_app
from database.db import db
from models.file import File
from models.share import Share
from manage_db import seed_database

def test_sharing_module():
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
        files = File.query.all()
        assert len(files) > 0, "No files found"
        test_file = files[0]
        test_file_id = test_file.id
        print(f"Using file '{test_file.name}' (ID: {test_file_id}) for sharing tests.")

    # ---------------------------------------------------------------------------
    # Test Case 1: Standard Download Link
    # ---------------------------------------------------------------------------
    print("\n--- TEST CASE 1: Standard Download Link ---")
    create_resp = client.post('/api/sharing', headers=headers, json={
        'fileId': test_file_id,
        'permission': 'download',
        'oneTime': False,
        'expiry': '2030-01-01'
    })
    assert create_resp.status_code == 201
    share_data = json.loads(create_resp.data)
    share_token = share_data['token']
    print(f"Created share link with token: {share_token}")

    # Access page
    access_resp = client.get(f'/api/sharing/access/{share_token}')
    assert access_resp.status_code == 200
    assert b"Download Securely" in access_resp.data
    print("Public access page rendered successfully with download button.")

    # Download file
    download_resp = client.get(f'/api/sharing/download/{share_token}')
    assert download_resp.status_code == 200
    assert len(download_resp.data) > 0
    print("File downloaded successfully via public download link.")

    # ---------------------------------------------------------------------------
    # Test Case 2: View-Only Preview Link
    # ---------------------------------------------------------------------------
    print("\n--- TEST CASE 2: View-Only Preview Link ---")
    create_resp = client.post('/api/sharing', headers=headers, json={
        'fileId': test_file_id,
        'permission': 'view',
        'oneTime': False
    })
    assert create_resp.status_code == 201
    share_data = json.loads(create_resp.data)
    share_token = share_data['token']

    # Access page & verify preview text
    access_resp = client.get(f'/api/sharing/access/{share_token}')
    assert access_resp.status_code == 200
    assert b"This is a view-only share link" in access_resp.data
    assert b"Secure physical storage" in access_resp.data
    print("Public access page rendered inline text preview successfully.")

    # Try to download
    download_resp = client.get(f'/api/sharing/download/{share_token}')
    assert download_resp.status_code == 403
    print("Download blocked with 403 Forbidden on view-only link.")

    # ---------------------------------------------------------------------------
    # Test Case 3: Email-Restricted Link
    # ---------------------------------------------------------------------------
    print("\n--- TEST CASE 3: Email-Restricted Link ---")
    create_resp = client.post('/api/sharing', headers=headers, json={
        'fileId': test_file_id,
        'recipients': 'partner@corp.com, partner2@corp.com',
        'permission': 'download'
    })
    assert create_resp.status_code == 201
    share_data = json.loads(create_resp.data)
    share_token = share_data['token']

    # Access without email
    access_resp = client.get(f'/api/sharing/access/{share_token}')
    assert access_resp.status_code == 200
    assert b"Recipient Email Address" in access_resp.data
    print("Verification form rendered for email restriction.")

    # Access with wrong email
    access_resp = client.post(f'/api/sharing/access/{share_token}', data={
        'email': 'stranger@corp.com'
    })
    assert b"Email address not authorized" in access_resp.data
    print("Access blocked with incorrect email address.")

    # Access with correct email
    access_resp = client.post(f'/api/sharing/access/{share_token}', data={
        'email': 'partner@corp.com'
    })
    assert access_resp.status_code == 200
    assert b"Download Securely" in access_resp.data
    print("Access granted with correct authorized email address.")

    # Download with email verification
    download_resp = client.get(f'/api/sharing/download/{share_token}?email=partner@corp.com')
    assert download_resp.status_code == 200
    print("Secure download successful with email query verification.")

    # ---------------------------------------------------------------------------
    # Test Case 4: Password-Protected Link
    # ---------------------------------------------------------------------------
    print("\n--- TEST CASE 4: Password-Protected Link ---")
    create_resp = client.post('/api/sharing', headers=headers, json={
        'fileId': test_file_id,
        'password': 'secretpassword',
        'permission': 'download'
    })
    assert create_resp.status_code == 201
    share_data = json.loads(create_resp.data)
    share_token = share_data['token']

    # Access without password
    access_resp = client.get(f'/api/sharing/access/{share_token}')
    assert access_resp.status_code == 200
    assert b"Link Access Password" in access_resp.data
    print("Verification form rendered for password protection.")

    # Access with wrong password
    access_resp = client.post(f'/api/sharing/access/{share_token}', data={
        'password': 'wrongpassword'
    })
    assert b"Invalid access password" in access_resp.data
    print("Access blocked with incorrect password.")

    # Access with correct password
    access_resp = client.post(f'/api/sharing/access/{share_token}', data={
        'password': 'secretpassword'
    })
    assert access_resp.status_code == 200
    assert b"Download Securely" in access_resp.data
    print("Access granted with correct password.")

    # ---------------------------------------------------------------------------
    # Test Case 5: One-Time Access Link (Self-Destruct)
    # ---------------------------------------------------------------------------
    print("\n--- TEST CASE 5: One-Time Link (Self-Destruct) ---")
    create_resp = client.post('/api/sharing', headers=headers, json={
        'fileId': test_file_id,
        'permission': 'download',
        'oneTime': True
    })
    assert create_resp.status_code == 201
    share_data = json.loads(create_resp.data)
    share_token = share_data['token']

    # First download
    download_resp = client.get(f'/api/sharing/download/{share_token}')
    assert download_resp.status_code == 200
    print("First download succeeded on one-time link.")

    # Second download
    download_resp = client.get(f'/api/sharing/download/{share_token}')
    assert download_resp.status_code == 403
    print("Second download blocked successfully (self-destructed).")

    # Access page again
    access_resp = client.get(f'/api/sharing/access/{share_token}')
    assert access_resp.status_code == 403
    assert b"expired" in access_resp.data
    print("Access page blocked successfully on second access.")

    # ---------------------------------------------------------------------------
    # Test Case 6: Expired Link
    # ---------------------------------------------------------------------------
    print("\n--- TEST CASE 6: Expired Link ---")
    create_resp = client.post('/api/sharing', headers=headers, json={
        'fileId': test_file_id,
        'expiry': '2020-01-01'
    })
    assert create_resp.status_code == 201
    share_data = json.loads(create_resp.data)
    share_token = share_data['token']

    # Access expired link
    access_resp = client.get(f'/api/sharing/access/{share_token}')
    assert access_resp.status_code == 403
    assert b"expired" in access_resp.data
    print("Access blocked successfully on expired link.")

    print("\nALL SECURE FILE SHARING TESTS PASSED SUCCESSFULLY! [SUCCESS]")

if __name__ == '__main__':
    test_sharing_module()

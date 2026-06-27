import os
import json
from app import create_app
from database.db import db
from models.user import User
from models.file import File
from models.share import Share
from manage_db import seed_database

def test_custom_policies():
    print("--- 1. Re-seeding Database ---")
    seed_database()
    
    app = create_app()
    client = app.test_client()
    
    # ---------------------------------------------------------------------------
    # 1. Test Role Restrictions (Non-Admins cannot edit policies)
    # ---------------------------------------------------------------------------
    print("\n--- 2. Authenticating as Developer (s.patel@corp.io) ---")
    login_resp = client.post('/api/auth/login', json={
        'email': 's.patel@corp.io',
        'password': 'Password123!'
    })
    assert login_resp.status_code == 200
    dev_token = json.loads(login_resp.data)['token']
    dev_headers = {'Authorization': f'Bearer {dev_token}'}
    
    print("Trying to update policy as Developer...")
    policy_resp = client.put('/api/sharing/policy', headers=dev_headers, json={
        'maxLifetime': 10
    })
    assert policy_resp.status_code == 403
    print("Blocked successfully: Developer received 403 Forbidden.")

    # ---------------------------------------------------------------------------
    # 2. Test Policy Retrieval & Update as Admin
    # ---------------------------------------------------------------------------
    print("\n--- 3. Authenticating as Admin (alex.ryder@nyxvault.io) ---")
    login_resp = client.post('/api/auth/login', json={
        'email': 'alex.ryder@nyxvault.io',
        'password': 'Password123!'
    })
    assert login_resp.status_code == 200
    admin_token = json.loads(login_resp.data)['token']
    admin_headers = {'Authorization': f'Bearer {admin_token}'}
    
    print("Fetching initial policy...")
    get_resp = client.get('/api/sharing/policy', headers=admin_headers)
    assert get_resp.status_code == 200
    policy_data = json.loads(get_resp.data)
    print("Current policy:", policy_data)
    assert policy_data['maxLifetime'] == 90 # Seeded Enterprise default

    print("Updating policy: Setting Max Link Lifetime to 45 days...")
    update_resp = client.put('/api/sharing/policy', headers=admin_headers, json={
        'maxLifetime': 45,
        'defaultPermission': 'view'
    })
    assert update_resp.status_code == 200
    updated_data = json.loads(update_resp.data)['policy']
    print("Updated policy:", updated_data)
    assert updated_data['maxLifetime'] == 45
    assert updated_data['defaultPermission'] == 'view'

    # ---------------------------------------------------------------------------
    # 3. Test Enforcement of Customized Policy Limits
    # ---------------------------------------------------------------------------
    print("\n--- 4. Testing customized policy enforcement ---")
    with app.app_context():
        # Get a file for sharing
        files = File.query.all()
        assert len(files) > 0
        file_id = files[0].id

    from datetime import datetime, timedelta
    
    # Try sharing with an expiry date 50 days in the future (exceeds customized 45-day policy, but below plan's 90-day limit)
    exceed_date = (datetime.now() + timedelta(days=50)).strftime('%Y-%m-%d')
    print(f"Attempting to share file with expiry {exceed_date} (50 days from now, policy limit is 45)...")
    share_resp = client.post('/api/sharing', headers=admin_headers, json={
        'fileId': file_id,
        'expiry': exceed_date,
        'permission': 'view'
    })
    assert share_resp.status_code == 400
    error_msg = json.loads(share_resp.data)['error']
    print("Blocked successfully. Error message:", error_msg)
    assert "limits sharing links to a maximum lifetime of 45 days" in error_msg

    # Try sharing with an expiry date 10 days in the future (within customized 45-day policy)
    ok_date = (datetime.now() + timedelta(days=10)).strftime('%Y-%m-%d')
    print(f"Attempting to share file with expiry {ok_date} (10 days from now)...")
    share_resp = client.post('/api/sharing', headers=admin_headers, json={
        'fileId': file_id,
        'expiry': ok_date,
        'permission': 'view'
    })
    assert share_resp.status_code == 201
    print("Success! Share link created within custom policy limits.")

    print("\nALL CUSTOM POLICY TEST CASES PASSED SUCCESSFULLY! [SUCCESS]")

if __name__ == '__main__':
    test_custom_policies()

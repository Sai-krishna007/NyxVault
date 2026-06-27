import os
import sys
import json
import hashlib
from app import create_app
from database.db import db
from models.file import File
from models.hash_event import HashEvent
from models.integrity_report import IntegrityReport
from models.alert import Alert
from manage_db import seed_database

def test_integrity_module():
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
        # Check initial hash events from seeding
        print("\n--- 3. Verifying Seeded HashEvents ---")
        files = File.query.all()
        assert len(files) > 0, "No files found after seeding"
        print(f"Found {len(files)} files seeded.")
        for f in files:
            events = HashEvent.query.filter_by(file_id=f.id).all()
            assert len(events) == 1, f"Expected 1 event for file {f.id}, got {len(events)}"
            assert events[0].event_type == 'uploaded', f"Expected event type 'uploaded', got {events[0].event_type}"
            print(f"File {f.name}: Initial upload HashEvent exists.")
            
        # Get one file for testing
        test_file = files[0]
        test_file_id = test_file.id
        test_file_path = os.path.join(app.config['UPLOAD_FOLDER'], test_file.path)
        print(f"Using file '{test_file.name}' (ID: {test_file_id}, path: {test_file_path}) for testing.")
        
    print("\n--- 4. Running Initial Full Vault Scan ---")
    scan_resp = client.post('/api/integrity/scan', headers=headers)
    assert scan_resp.status_code == 200, f"Scan failed: {scan_resp.data}"
    scan_data = json.loads(scan_resp.data)
    print("Scan Response:", scan_data)
    assert scan_data['tamperedDetected'] == 8, f"Expected 8 tampered, got {scan_data['tamperedDetected']}"
    
    with app.app_context():
        # Verify IntegrityReport is written to DB
        reports = IntegrityReport.query.order_by(IntegrityReport.scanned_at.desc()).all()
        assert len(reports) > 0, "No integrity reports found in DB"
        latest_report = reports[0]
        assert latest_report.tampered == 8, f"Expected 8 tampered, got {latest_report.tampered}"
        assert latest_report.integrity_score == 11.1, f"Expected score 11.1, got {latest_report.integrity_score}"
        print("IntegrityReport successfully saved to DB. Score: 11.1")

    print("\n--- 5. Simulating File Tampering ---")
    # Corrupt the file on disk
    with open(test_file_path, 'wb') as f:
        f.write(b"TAMPERED DATA BLOB!!!")
    print("Corrupted file on disk.")
    
    print("\n--- 6. Running Scan After Tampering ---")
    scan_resp = client.post('/api/integrity/scan', headers=headers)
    assert scan_resp.status_code == 200, f"Scan failed: {scan_resp.data}"
    scan_data = json.loads(scan_resp.data)
    print("Scan Response:", scan_data)
    assert scan_data['tamperedDetected'] == 9, f"Expected 9 tampered, got {scan_data['tamperedDetected']}"
    
    with app.app_context():
        # Verify file status in DB is tampered
        updated_file = File.query.get(test_file_id)
        assert updated_file.status == 'tampered', f"Expected status 'tampered', got {updated_file.status}"
        print("File status updated to 'tampered' in DB.")
        
        # Verify an Alert is triggered
        alerts = Alert.query.filter_by(user_id=updated_file.user_id, status='active').all()
        integrity_alerts = [a for a in alerts if 'Integrity' in a.title and updated_file.name in a.desc]
        assert len(integrity_alerts) > 0, "No active integrity alert found for tampered file"
        print("Security Alert triggered successfully.")

    print("\n--- 7. Verifying Download Blocked (409 Conflict) ---")
    download_resp = client.get(f'/api/files/download/{test_file_id}', headers=headers)
    assert download_resp.status_code == 409, f"Expected 409 Conflict, got {download_resp.status_code}"
    download_data = json.loads(download_resp.data)
    print("Download Response:", download_data)
    assert "Integrity violation" in download_data['error'], f"Expected integrity violation message, got {download_data['error']}"
    print("Download blocked with 409 Conflict successfully.")
    
    print("\n--- 8. Restoring File ---")
    restore_resp = client.post(f'/api/integrity/restore/{test_file_id}', headers=headers)
    assert restore_resp.status_code == 200, f"Expected 200 OK, got {restore_resp.status_code}"
    restore_data = json.loads(restore_resp.data)
    print("Restore Response:", restore_data)
    
    with app.app_context():
        # Verify status is verified
        restored_file = File.query.get(test_file_id)
        assert restored_file.status == 'verified', f"Expected status 'verified', got {restored_file.status}"
        print("File status reset to 'verified' in DB.")
        
        # Verify alert is resolved
        alerts = Alert.query.filter_by(user_id=restored_file.user_id).all()
        for alert in alerts:
            if 'Integrity' in alert.title and restored_file.name in alert.desc:
                assert alert.status == 'resolved', f"Expected alert status 'resolved', got {alert.status}"
        print("Security Alert resolved successfully.")
        
        # Verify HashEvent with event_type='restored' is logged
        events = HashEvent.query.filter_by(file_id=test_file_id).all()
        restore_events = [e for e in events if e.event_type == 'restored']
        assert len(restore_events) > 0, "No restored HashEvent found"
        print("Restored HashEvent logged successfully.")
        
    print("\n--- 9. Verifying Reports and Events Endpoints ---")
    
    # 9.1 GET /api/integrity
    integrity_resp = client.get('/api/integrity', headers=headers)
    assert integrity_resp.status_code == 200
    integrity_data = json.loads(integrity_resp.data)
    assert 'files' in integrity_data and 'score' in integrity_data
    print("GET /api/integrity works. Score:", integrity_data['score'])
    
    # 9.2 GET /api/integrity/report
    report_resp = client.get('/api/integrity/report', headers=headers)
    assert report_resp.status_code == 200
    report_data = json.loads(report_resp.data)
    assert 'report' in report_data and 'summary' in report_data
    print("GET /api/integrity/report works. Latest report ID:", report_data['report']['id'])
    
    # 9.3 GET /api/integrity/report/history
    history_resp = client.get('/api/integrity/report/history', headers=headers)
    assert history_resp.status_code == 200
    history_data = json.loads(history_resp.data)
    assert isinstance(history_data, list)
    print(f"GET /api/integrity/report/history works. Found {len(history_data)} reports.")
    
    # 9.4 GET /api/integrity/events
    events_resp = client.get('/api/integrity/events', headers=headers)
    assert events_resp.status_code == 200
    events_data = json.loads(events_resp.data)
    assert isinstance(events_data, list)
    print(f"GET /api/integrity/events works. Found {len(events_data)} events.")
    
    print("\nALL INTEGRITY MONITORING TESTS PASSED SUCCESSFULLY! [SUCCESS]")

if __name__ == '__main__':
    test_integrity_module()

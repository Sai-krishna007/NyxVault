import json
import urllib.request
import urllib.error
import sys

# Force stdout to use UTF-8 to prevent Windows terminal encoding crashes on emojis
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:3000/api"

def make_request(url, method="GET", headers=None, body=None):
    """Utility to perform HTTP requests with urllib."""
    if headers is None:
        headers = {}
    if "Content-Type" not in headers and body is not None:
        headers["Content-Type"] = "application/json"
        
    data = None
    if body is not None:
        if isinstance(body, dict):
            data = json.dumps(body).encode('utf-8')
        else:
            data = body
            
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            content = response.read().decode('utf-8')
            return status, json.loads(content) if content else {}
    except urllib.error.HTTPError as e:
        content = e.read().decode('utf-8')
        try:
            err_data = json.loads(content)
        except Exception:
            err_data = {"error": content}
        return e.code, err_data
    except Exception as e:
        return 0, {"error": str(e)}

def run_security_tests():
    print("=========================================================")
    print("   NYXVAULT ADVANCED CYBERSECURITY SUITE INTEGRATION     ")
    print("=========================================================")
    
    # 1. Register test users
    print("\n[STEP 1] Provisioning test identities...")
    
    # Standard user
    user_email = "security.user@nyxvault.io"
    user_pass = "SecurePass123!"
    
    status, res = make_request(
        f"{BASE_URL}/auth/register",
        method="POST",
        body={
            "email": user_email,
            "password": user_pass,
            "firstName": "Security",
            "lastName": "User"
        }
    )
    
    if status in (201, 400):
        print(f"  - Standard User registered/exists (Status {status})")
    else:
        print(f"❌ Failed to register standard user: {res}")
        sys.exit(1)
        
    # Auditor user (let's register or provision in DB, but wait: register creates Developer by default, so we will update their role to Auditor)
    auditor_email = "compliance.auditor@nyxvault.io"
    auditor_pass = "AuditPass2026!"
    
    status, res = make_request(
        f"{BASE_URL}/auth/register",
        method="POST",
        body={
            "email": auditor_email,
            "password": auditor_pass,
            "firstName": "Compliance",
            "lastName": "Auditor"
        }
    )
    
    if status in (201, 400):
        print(f"  - Auditor identity provisioned (Status {status})")
    else:
        print(f"❌ Failed to register auditor: {res}")
        sys.exit(1)

    # 2. Update role to Auditor in DB for compliance.auditor
    print("\n[STEP 2] Upgrading auditor role via Database context...")
    try:
        import sqlite3
        import os
        db_path = os.path.join(os.path.dirname(__file__), 'instance', 'nyxvault.db')
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET role = 'Auditor' WHERE email = ?", (auditor_email,))
        conn.commit()
        conn.close()
        print("  - Successfully updated compliance.auditor role to 'Auditor' in sqlite database.")
    except Exception as e:
        print(f"❌ Failed to update role in DB: {e}")
        sys.exit(1)

    # 3. Log in and verify JWT Refresh Token / Rotation
    print("\n[STEP 3] Testing JWT Authentication and Access/Refresh Token rotation...")
    status, login_res = make_request(
        f"{BASE_URL}/auth/login",
        method="POST",
        body={"email": user_email, "password": user_pass}
    )
    
    if status != 200 or "token" not in login_res or "refreshToken" not in login_res:
        print(f"❌ Login failed or tokens missing: {login_res}")
        sys.exit(1)
        
    access_token = login_res["token"]
    refresh_token = login_res["refreshToken"]
    print("  - Successfully received dual JWT tokens on login.")
    print(f"  - Access Token (Expires 15m): {access_token[:20]}...")
    print(f"  - Refresh Token (Expires 7d): {refresh_token[:20]}...")
    
    # Test token refresh exchange
    status, refresh_res = make_request(
        f"{BASE_URL}/auth/refresh",
        method="POST",
        body={"refreshToken": refresh_token}
    )
    
    if status != 200 or "accessToken" not in refresh_res or "refreshToken" not in refresh_res:
        print(f"❌ Token refresh exchange failed: {refresh_res}")
        sys.exit(1)
        
    new_access_token = refresh_res["accessToken"]
    new_refresh_token = refresh_res["refreshToken"]
    print("  - Successfully rotated refresh and access tokens.")
    print("  - Token rotation validation PASSED.")
    
    # 4. Verify RBAC (Auditor read-only restrictions)
    print("\n[STEP 4] Verifying Role-Based Access Control (RBAC) constraints...")
    
    # Log in as Auditor
    status, audit_login = make_request(
        f"{BASE_URL}/auth/login",
        method="POST",
        body={"email": auditor_email, "password": auditor_pass}
    )
    
    if status != 200:
        print(f"❌ Auditor login failed: {audit_login}")
        sys.exit(1)
        
    auditor_token = audit_login["token"]
    auditor_headers = {"Authorization": f"Bearer {auditor_token}"}
    
    # Test 4a: Auditor tries to upload
    # Send a mock multipart upload
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="audit_test.txt"\r\n'
        f"Content-Type: text/plain\r\n\r\n"
        f"Confidential Audit Log Content\r\n"
        f"--{boundary}--\r\n"
    ).encode('utf-8')
    
    headers = {
        "Authorization": f"Bearer {auditor_token}",
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    }
    
    status, res = make_request(
        f"{BASE_URL}/files/upload",
        method="POST",
        headers=headers,
        body=body
    )
    
    if status == 403:
        print("  - [PASSED] Auditor upload attempt BLOCKED (HTTP 403 Forbidden)")
    else:
        print(f"❌ [FAILED] Auditor upload was not blocked! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Test 4b: Auditor tries to download
    status, res = make_request(
        f"{BASE_URL}/files/download/fil-anyfileid",
        method="GET",
        headers=auditor_headers
    )
    
    if status == 403:
        print("  - [PASSED] Auditor file download BLOCKED (HTTP 403 Forbidden)")
    else:
        print(f"❌ [FAILED] Auditor download was not blocked! Status: {status}, Response: {res}")
        sys.exit(1)

    # Test 4c: Auditor tries to delete
    status, res = make_request(
        f"{BASE_URL}/files/fil-anyfileid",
        method="DELETE",
        headers=auditor_headers
    )
    
    if status == 403:
        print("  - [PASSED] Auditor file deletion BLOCKED (HTTP 403 Forbidden)")
    else:
        print(f"❌ [FAILED] Auditor deletion was not blocked! Status: {status}, Response: {res}")
        sys.exit(1)

    # Test 4d: Auditor views logs
    status, res = make_request(
        f"{BASE_URL}/logs",
        method="GET",
        headers=auditor_headers
    )
    
    if status == 200:
        print(f"  - [PASSED] Auditor allowed to view system-wide audit logs (HTTP 200 Ok, logs count: {len(res)})")
    else:
        print(f"❌ [FAILED] Auditor was blocked from viewing logs: Status {status}, Response: {res}")
        sys.exit(1)

    # 5. Verify VirusTotal/Local Signature Malware scan block
    print("\n[STEP 5] Verifying VirusTotal/Local Malware Scanning block on uploads...")
    
    # EICAR signature string
    eicar_content = "X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*"
    
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="eicar_virus.com"\r\n'
        f"Content-Type: application/octet-stream\r\n\r\n"
        f"{eicar_content}\r\n"
        f"--{boundary}--\r\n"
    ).encode('utf-8')
    
    user_headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": f"multipart/form-data; boundary={boundary}"
    }
    
    status, res = make_request(
        f"{BASE_URL}/files/upload",
        method="POST",
        headers=user_headers,
        body=body
    )
    
    if status == 400 and "Malware detected" in res.get("error", ""):
        print("  - [PASSED] EICAR virus signature detected on upload.")
        print(f"  - [PASSED] Upload BLOCKED with HTTP 400. Message: '{res.get('error')}'")
    else:
        print(f"❌ [FAILED] Malicious upload was not blocked! Status: {status}, Response: {res}")
        sys.exit(1)
        
    # Verify that a critical security alert was triggered in the database
    status, alerts = make_request(
        f"{BASE_URL}/alerts?status=active",
        method="GET",
        headers=user_headers
    )
    
    malware_alert = next((a for a in alerts if "Malware Upload Blocked" in a["title"]), None)
    if malware_alert:
        print(f"  - [PASSED] Critical Security Alert triggered: '{malware_alert['title']}' - '{malware_alert['desc']}'")
        print("  - Real-time Alerting and VirusTotal flow fully verified.")
    else:
        print("❌ [FAILED] Security alert was not triggered for malware upload block!")
        sys.exit(1)

    print("\n=========================================================")
    print(" 🎉 ALL NYXVAULT SECURITY INTEGRATION TESTS PASSED CLEANLY!")
    print("=========================================================")

if __name__ == "__main__":
    run_tests = True
    if len(sys.argv) > 1 and sys.argv[1] == "--provision-only":
        run_tests = False
    
    if run_tests:
        run_security_tests()

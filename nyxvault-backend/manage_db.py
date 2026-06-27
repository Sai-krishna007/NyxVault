import os
import json
import hashlib
from app import create_app
from database.db import db
from models.user import User
from models.file import File
from models.share import Share
from models.alert import Alert
from models.audit_log import AuditLog
from models.integrity_report import IntegrityReport
from models.hash_event import HashEvent
from models.api_key import ApiKey
from services.encryption_service import generate_key, encrypt_data, key_to_base64

def seed_database():
    app = create_app()
    with app.app_context():
        print("Initializing database tables...")
        db.drop_all()
        db.create_all()
        
        # Load db.json
        frontend_db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'nyxvault', 'db.json'))
        if not os.path.exists(frontend_db_path):
            print(f"Error: db.json not found at {frontend_db_path}")
            return
            
        print(f"Loading seed data from {frontend_db_path}...")
        with open(frontend_db_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Seed Users
        print(f"Seeding {len(data.get('users', []))} users...")
        for u in data.get('users', []):
            plan = u.get('plan', 'Professional')
            
            # Set plan-specific default policies
            if plan == 'Enterprise':
                max_lt = 90
                def_perm = 'download'
                ip_wl = 'Enabled (Corporate Range)'
                geo_rest = 'Strict (US, EU, APAC)'
                mfa_req = 'Enforced (Mandatory)'
            elif plan == 'Starter':
                max_lt = 7
                def_perm = 'view'
                ip_wl = 'Not Supported'
                geo_rest = 'Disabled'
                mfa_req = 'Optional'
            else: # Professional
                max_lt = 30
                def_perm = 'download'
                ip_wl = 'Disabled'
                geo_rest = 'US, EU only'
                mfa_req = 'Enforce for external'
                
            user = User(
                id=u['id'],
                name=u['name'],
                email=u['email'].lower(),
                password_hash=u['passwordHash'],
                role=u['role'],
                avatar=u.get('avatar'),
                plan=plan,
                mfa=u.get('mfa', True),
                joined=u.get('joined'),
                status=u.get('status', 'active'),
                color=u.get('color'),
                bio=u.get('bio', 'Security-focused vault user.'),
                timezone=u.get('timezone', 'UTC+05:30 — Asia/Kolkata'),
                policy_max_lifetime=max_lt,
                policy_default_permission=def_perm,
                policy_ip_whitelist=ip_wl,
                policy_geo_restriction=geo_rest,
                policy_mfa_requirement=mfa_req
            )
            db.session.add(user)
            
        # Seed Files
        print(f"Seeding {len(data.get('files', []))} files...")
        upload_dir = app.config['UPLOAD_FOLDER']
        os.makedirs(upload_dir, exist_ok=True)
        
        for f in data.get('files', []):
            is_encrypted = f.get('encrypted', False)
            dummy_content_str = f"Secure physical storage for {f['name']}. File encrypted with AES-256-GCM. Size: {f['size']} bytes."
            dummy_content_bytes = dummy_content_str.encode('utf-8')
            
            enc_key_b64 = None
            data_to_write = dummy_content_bytes
            
            if is_encrypted:
                # Generate key and encrypt content
                file_key = generate_key()
                enc_key_b64 = key_to_base64(file_key)
                data_to_write = encrypt_data(dummy_content_bytes, file_key)
                
            # Write data to storage path
            dummy_path = os.path.join(upload_dir, f['path'])
            with open(dummy_path, 'wb') as df:
                df.write(data_to_write)
                
            # Compute actual hash of the data stored
            actual_hash = hashlib.sha256(data_to_write).hexdigest()
            
            file_record = File(
                id=f['id'],
                user_id=f['userId'],
                name=f['name'],
                type=f['type'],
                size=len(data_to_write),
                path=f['path'],
                hash=actual_hash,
                original_hash=actual_hash if f.get('status', 'verified') == 'verified' else f.get('originalHash', actual_hash),
                encrypted=is_encrypted,
                encryption_key=enc_key_b64,
                status=f.get('status', 'verified'),
                modified=f['modified'],
                folder=f.get('folder', 'Documents')
            )
            db.session.add(file_record)
            
            # Seed an initial 'uploaded' HashEvent for this file
            import random
            import string
            event_id = 'EVT-' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
            hash_event = HashEvent(
                id=event_id,
                file_id=f['id'],
                user_id=f['userId'],
                file_name=f['name'],
                event_type='uploaded',
                triggered_by='upload',
                expected_hash=actual_hash[:16],
                computed_hash=actual_hash[:16],
                matched=True,
                timestamp=f['modified']
            )
            db.session.add(hash_event)
            
        # Seed Shares
        import secrets
        print(f"Seeding {len(data.get('shares', []))} shares...")
        for s in data.get('shares', []):
            share_record = Share(
                id=s['id'],
                user_id=s['userId'],
                file_id=s['fileId'],
                file=s['file'],
                recipients=s.get('recipients', []),
                expiry=s['expiry'],
                views=s.get('views', 0),
                dl=s.get('dl', 0),
                status=s.get('status', 'active'),
                permission='download',
                one_time=False,
                token=secrets.token_urlsafe(32),
                password=None,
                max_downloads=None
            )
            db.session.add(share_record)
            
        # Seed Alerts
        print(f"Seeding {len(data.get('alerts', []))} alerts...")
        for a in data.get('alerts', []):
            alert_record = Alert(
                id=a['id'],
                user_id=a['userId'],
                sev=a['sev'],
                title=a['title'],
                desc=a['desc'],
                time=a['time'],
                status=a['status'],
                timestamp=a['timestamp']
            )
            db.session.add(alert_record)
            
        # Seed Logs
        print(f"Seeding {len(data.get('logs', []))} audit logs...")
        for l in data.get('logs', []):
            log_record = AuditLog(
                id=l['id'],
                user_id=l['userId'],
                user=l['user'],
                action=l['action'],
                resource=l['resource'],
                ip=l['ip'],
                time=l['time'],
                status=l['status'],
                timestamp=l['timestamp']
            )
            db.session.add(log_record)
            
        # Seed custom user for Java Lab Programs share link if not present
        custom_user_id = 'usr-xmr92l'
        if not User.query.get(custom_user_id):
            print("Seeding custom user usr-xmr92l...")
            custom_user = User(
                id=custom_user_id,
                name='saikrishna',
                email='saikrishna@gmail.com',
                password_hash='$2a$10$t9EBOfvBoz43RoellS0Yp./J7yOdrIt09ZLf1QrkYFqnE3cxu.oUq', # dev.test password
                role='Developer',
                avatar='SK',
                plan='Professional',
                mfa=True,
                joined='Jun 25, 2026',
                status='active',
                color='#4eacaa',
                bio='Security-focused vault user.',
                timezone='UTC+05:30 — Asia/Kolkata',
                policy_max_lifetime=30,
                policy_default_permission='download',
                policy_ip_whitelist='Disabled',
                policy_geo_restriction='US, EU only',
                policy_mfa_requirement='Enforce for external'
            )
            db.session.add(custom_user)

        # Seed custom file fil-wef9t7e1n if the physical file can be prepared
        original_path = r"C:\Users\saikr\Downloads\Java Lab Programs.docx"
        if os.path.exists(original_path):
            print(f"Found original Java Lab Programs.docx at {original_path}. Encrypting and seeding...")
            with open(original_path, 'rb') as f:
                plaintext_data = f.read()
            
            file_key = generate_key()
            enc_key_b64 = key_to_base64(file_key)
            encrypted_data = encrypt_data(plaintext_data, file_key)
            
            # Save to uploads
            target_path = os.path.join(upload_dir, 'fil-wef9t7e1n.docx')
            with open(target_path, 'wb') as f:
                f.write(encrypted_data)
                
            file_hash = hashlib.sha256(encrypted_data).hexdigest()
            size = len(encrypted_data)
            
            if not File.query.get('fil-wef9t7e1n'):
                custom_file = File(
                    id='fil-wef9t7e1n',
                    user_id=custom_user_id,
                    name='Java Lab Programs.docx',
                    type='docx',
                    size=size,
                    path='fil-wef9t7e1n.docx',
                    hash=file_hash,
                    original_hash=file_hash,
                    encrypted=True,
                    encryption_key=enc_key_b64,
                    status='verified',
                    modified='2026-06-25T14:50:50.000Z',
                    folder='Documents'
                )
                db.session.add(custom_file)
                
                # Add hash event
                import random
                import string
                event_id = 'EVT-' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
                hash_evt = HashEvent(
                    id=event_id,
                    file_id='fil-wef9t7e1n',
                    user_id=custom_user_id,
                    file_name='Java Lab Programs.docx',
                    event_type='uploaded',
                    triggered_by='upload',
                    expected_hash=file_hash[:16],
                    computed_hash=file_hash[:16],
                    matched=True,
                    timestamp='2026-06-25T14:50:50.000Z'
                )
                db.session.add(hash_evt)

            # Seed custom share SL-8747
            if not Share.query.get('SL-8747'):
                print("Seeding custom share SL-8747...")
                custom_share = Share(
                    id='SL-8747',
                    user_id=custom_user_id,
                    file_id='fil-wef9t7e1n',
                    file='Java Lab Programs.docx',
                    recipients=['saikrishna@gmail.com'],
                    expiry='2026-07-26',
                    views=0,
                    dl=0,
                    status='active',
                    permission='view',
                    one_time=True,
                    token='iH1NLxm64yIVoo5r_tlKHhl0eypqcF9BJvqJID04i6g'
                )
                db.session.add(custom_share)
            
        # Seed default API keys for usr-001, usr-77eysg, and usr-xmr92l
        key_mapping = {
            'usr-001': {
                'prod': 'nvk_prod_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6',
                'dev': 'nvk_dev_q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5f6'
            },
            'usr-77eysg': {
                'prod': 'nvk_prod_krishna77eysgprodkey012345678',
                'dev': 'nvk_dev_krishna77eysgdevkey0123456789'
            },
            'usr-xmr92l': {
                'prod': 'nvk_prod_saikrishnaxmr92lprodkey01234',
                'dev': 'nvk_dev_saikrishnaxmr92ldevkey012345'
            }
        }
        for u_id, keys in key_mapping.items():
            if User.query.get(u_id):
                # Prod key
                prod_key_id = f"key-prod-{u_id}"
                if not ApiKey.query.get(prod_key_id):
                    hash_val = hashlib.sha256(keys['prod'].encode('utf-8')).hexdigest()
                    prod_key = ApiKey(
                        id=prod_key_id,
                        user_id=u_id,
                        name='Production API Key',
                        prefix='nvk_prod_',
                        key_hash=hash_val,
                        created_at='Jan 12, 2024',
                        last_used_at='2min ago',
                        status='active'
                    )
                    db.session.add(prod_key)
                
                # Dev key
                dev_key_id = f"key-dev-{u_id}"
                if not ApiKey.query.get(dev_key_id):
                    hash_val = hashlib.sha256(keys['dev'].encode('utf-8')).hexdigest()
                    dev_key = ApiKey(
                        id=dev_key_id,
                        user_id=u_id,
                        name='Development API Key',
                        prefix='nvk_dev_',
                        key_hash=hash_val,
                        created_at='Mar 8, 2024',
                        last_used_at='3d ago',
                        status='active'
                    )
                    db.session.add(dev_key)
            
        db.session.commit()
        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_database()

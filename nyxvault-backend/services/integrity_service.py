"""
integrity_service.py
====================
Core Integrity Monitoring logic for NyxVault.

Responsibilities:
  - Compute live SHA-256 hash of stored file bytes (raw or encrypted)
  - Record every hash check as a HashEvent
  - Verify hash on download before serving the file
  - Run full-vault and single-file scans → save IntegrityReport
  - Generate structured integrity reports (latest + history)
"""

import hashlib
import random
import string
from datetime import datetime, timezone

from database.db import db
from models.file import File
from models.alert import Alert
from models.integrity_report import IntegrityReport
from models.hash_event import HashEvent
from services.alert_service import create_alert
from services.audit_service import log_action
from services.storage_service import get_storage_provider
from services.encryption_service import encrypt_data, key_from_base64


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _report_id() -> str:
    return 'RPT-' + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))

def _event_id() -> str:
    return 'EVT-' + ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

def _ms_since(start: datetime) -> int:
    return int((datetime.now(timezone.utc) - start).total_seconds() * 1000)


# ---------------------------------------------------------------------------
# Low-level: compute live hash from storage
# ---------------------------------------------------------------------------

def compute_stored_hash(file: File) -> str:
    """Download the raw stored bytes (ciphertext if encrypted) and hash them."""
    storage = get_storage_provider()
    data = storage.download_file(file.path)
    return hashlib.sha256(data).hexdigest()


# ---------------------------------------------------------------------------
# Hash Event recorder
# ---------------------------------------------------------------------------

def _record_hash_event(
    file: File,
    user_id: str,
    event_type: str,
    triggered_by: str,
    expected_hash: str,
    computed_hash: str,
    matched: bool,
) -> HashEvent:
    """Persist a HashEvent row and flush it within the current session."""
    evt = HashEvent(
        id=_event_id(),
        file_id=file.id,
        user_id=user_id,
        file_name=file.name,
        event_type=event_type,
        triggered_by=triggered_by,
        expected_hash=expected_hash[:16] if expected_hash else None,
        computed_hash=computed_hash[:16] if computed_hash else None,
        matched=matched,
        timestamp=_now_iso(),
    )
    db.session.add(evt)
    return evt


def record_hash_event(
    file: File,
    user_id: str,
    event_type: str,
    triggered_by: str,
    expected_hash: str,
    computed_hash: str,
    matched: bool,
) -> HashEvent:
    """Public wrapper to record a HashEvent."""
    return _record_hash_event(
        file=file,
        user_id=user_id,
        event_type=event_type,
        triggered_by=triggered_by,
        expected_hash=expected_hash,
        computed_hash=computed_hash,
        matched=matched
    )


# ---------------------------------------------------------------------------
# Download-time integrity guard
# ---------------------------------------------------------------------------

class IntegrityViolationError(Exception):
    """Raised when a file's live hash does not match its stored original_hash."""
    def __init__(self, file_name: str, expected: str, computed: str):
        self.file_name = file_name
        self.expected = expected
        self.computed = computed
        super().__init__(
            f"Integrity violation: '{file_name}' hash mismatch "
            f"(expected {expected[:12]}..., got {computed[:12]}...)"
        )


def verify_file_on_download(file: File, user_id: str) -> None:
    """
    Verify the stored file's hash matches the original_hash before download.

    Raises IntegrityViolationError if the file has been tampered with.
    Records a HashEvent regardless of outcome.
    """
    try:
        live_hash = compute_stored_hash(file)
    except FileNotFoundError:
        # Record missing-file event
        _record_hash_event(
            file=file, user_id=user_id,
            event_type='missing', triggered_by='download',
            expected_hash=file.original_hash, computed_hash='',
            matched=False,
        )
        db.session.commit()
        raise FileNotFoundError(f"Storage file for '{file.name}' not found.")

    matched = (live_hash == file.original_hash)

    _record_hash_event(
        file=file, user_id=user_id,
        event_type='verified' if matched else 'tampered',
        triggered_by='download',
        expected_hash=file.original_hash,
        computed_hash=live_hash,
        matched=matched,
    )

    if not matched:
        # Update file status and create security alert
        file.hash = live_hash
        file.status = 'tampered'
        db.session.commit()

        create_alert(
            user_id=user_id,
            sev='critical',
            title='Tampered File Download Blocked',
            desc=(
                f"Download of '{file.name}' was BLOCKED — SHA-256 mismatch detected. "
                f"Expected {file.original_hash[:12]}... but computed {live_hash[:12]}..."
            ),
            alert_type='file_tampering',
        )
        raise IntegrityViolationError(file.name, file.original_hash, live_hash)

    db.session.commit()


# ---------------------------------------------------------------------------
# Single-file on-demand scan
# ---------------------------------------------------------------------------

def scan_single_file(file_id: str, user_id: str) -> dict:
    """
    Scan one file's integrity and return a status dict.
    Records a HashEvent; updates File.status if tampered.
    """
    file = File.query.filter_by(id=file_id, user_id=user_id).first()
    if not file:
        return {'error': 'File not found'}

    storage = get_storage_provider()
    try:
        data = storage.download_file(file.path)
    except Exception:
        file.status = 'unverified'
        _record_hash_event(
            file=file, user_id=user_id,
            event_type='missing', triggered_by='scan',
            expected_hash=file.original_hash, computed_hash='',
            matched=False,
        )
        db.session.commit()
        return {
            'fileId': file_id,
            'status': 'missing',
            'matched': False,
            'message': 'File not found in storage.',
        }

    live_hash = hashlib.sha256(data).hexdigest()
    matched = (live_hash == file.original_hash)

    if not matched:
        file.hash = live_hash
        file.status = 'tampered'
        event_type = 'tampered'
        create_alert(
            user_id=user_id,
            sev='high',
            title='File Integrity Violation Detected',
            desc=(
                f"SHA-256 mismatch on '{file.name}' — "
                f"expected {file.original_hash[:10]}... computed {live_hash[:10]}..."
            ),
            alert_type='file_tampering',
        )
    else:
        if file.status in ('tampered', 'unverified'):
            file.status = 'verified'
        event_type = 'verified'

    _record_hash_event(
        file=file, user_id=user_id,
        event_type=event_type, triggered_by='scan',
        expected_hash=file.original_hash, computed_hash=live_hash,
        matched=matched,
    )
    db.session.commit()

    return {
        'fileId': file_id,
        'fileName': file.name,
        'status': file.status,
        'matched': matched,
        'expectedHash': file.original_hash[:16] + '...',
        'computedHash': live_hash[:16] + '...',
    }


# ---------------------------------------------------------------------------
# Full-vault scan → IntegrityReport
# ---------------------------------------------------------------------------

def run_full_scan(user_id: str, username: str, ip: str, scan_type: str = 'manual') -> IntegrityReport:
    """
    Scan every file owned by user_id, record HashEvents for each,
    build + persist an IntegrityReport, log audit action, return report.
    """
    start_time = datetime.now(timezone.utc)
    files = File.query.filter_by(user_id=user_id).all()
    storage = get_storage_provider()

    counts = {'verified': 0, 'tampered': 0, 'unverified': 0, 'missing': 0}
    tampered_details = []

    for file in files:
        try:
            data = storage.download_file(file.path)
        except Exception:
            file.status = 'unverified'
            counts['missing'] += 1
            _record_hash_event(
                file=file, user_id=user_id,
                event_type='missing', triggered_by='scan',
                expected_hash=file.original_hash, computed_hash='',
                matched=False,
            )
            continue

        live_hash = hashlib.sha256(data).hexdigest()
        matched = (live_hash == file.original_hash)

        if not matched:
            file.hash = live_hash
            file.status = 'tampered'
            counts['tampered'] += 1
            tampered_details.append({
                'id': file.id,
                'name': file.name,
                'expected': file.original_hash[:16] + '...',
                'computed': live_hash[:16] + '...',
            })
            create_alert(
                user_id=user_id,
                sev='high',
                title='File Integrity Violation Detected',
                desc=(
                    f"SHA-256 mismatch on '{file.name}' — "
                    f"expected {file.original_hash[:10]}... computed {live_hash[:10]}..."
                ),
                alert_type='file_tampering',
            )
        else:
            if file.status in ('tampered', 'unverified'):
                file.status = 'verified'
            counts['verified'] += 1

        _record_hash_event(
            file=file, user_id=user_id,
            event_type='tampered' if not matched else 'verified',
            triggered_by='scan',
            expected_hash=file.original_hash,
            computed_hash=live_hash,
            matched=matched,
        )

    total = len(files)
    verified = counts['verified']
    integrity_score = round((verified / total) * 100, 1) if total > 0 else 100.0

    report = IntegrityReport(
        id=_report_id(),
        user_id=user_id,
        scan_type=scan_type,
        total_files=total,
        verified=verified,
        tampered=counts['tampered'],
        unverified=counts['unverified'],
        missing=counts['missing'],
        integrity_score=integrity_score,
        tampered_files=tampered_details,
        scanned_at=_now_iso(),
        duration_ms=_ms_since(start_time),
    )

    db.session.add(report)
    db.session.commit()

    # Audit trail
    log_action(
        user_id=user_id,
        username=username,
        action='INTEGRITY_SCAN',
        resource=f"Full vault scan — {total} files, score {integrity_score}%",
        ip=ip,
    )

    return report


# ---------------------------------------------------------------------------
# Report generation helpers
# ---------------------------------------------------------------------------

def get_latest_report(user_id: str) -> dict:
    """
    Returns the latest IntegrityReport for a user, augmented with
    per-file details and summary stats. Falls back to a live-computed
    summary if no report exists yet.
    """
    report = (
        IntegrityReport.query
        .filter_by(user_id=user_id)
        .order_by(IntegrityReport.scanned_at.desc())
        .first()
    )

    files = File.query.filter_by(user_id=user_id).all()
    total = len(files)
    verified = sum(1 for f in files if f.status == 'verified')
    tampered = sum(1 for f in files if f.status == 'tampered')
    unverified = sum(1 for f in files if f.status == 'unverified')
    score = round((verified / total) * 100, 1) if total > 0 else 100.0

    # Per-file detail list for report body
    file_details = []
    for f in files:
        if f.status == 'tampered':
            hash_display = f.hash[:6] + '...MISMATCH'
        else:
            hash_display = f.hash[:6] + '...' + f.hash[-6:]

        file_details.append({
            'id': f.id,
            'name': f.name,
            'folder': f.folder,
            'status': f.status,
            'encrypted': f.encrypted,
            'hash': hash_display,
            'fullHash': f.hash,
            'originalHash': f.original_hash,
            'size': f.size,
            'modified': f.modified,
        })

    # Recent hash events (last 50)
    recent_events = (
        HashEvent.query
        .filter_by(user_id=user_id)
        .order_by(HashEvent.timestamp.desc())
        .limit(50)
        .all()
    )

    return {
        'report': report.to_dict() if report else None,
        'summary': {
            'totalFiles': total,
            'verified': verified,
            'tampered': tampered,
            'unverified': unverified,
            'integrityScore': score,
            'generatedAt': _now_iso(),
        },
        'files': file_details,
        'recentEvents': [e.to_dict() for e in recent_events],
    }


def get_report_history(user_id: str, limit: int = 20) -> list:
    """Returns the last `limit` scan reports for a user."""
    reports = (
        IntegrityReport.query
        .filter_by(user_id=user_id)
        .order_by(IntegrityReport.scanned_at.desc())
        .limit(limit)
        .all()
    )
    return [r.to_dict() for r in reports]


def get_hash_events(user_id: str, file_id: str = None, limit: int = 100) -> list:
    """Returns hash events, optionally filtered to a single file."""
    q = HashEvent.query.filter_by(user_id=user_id)
    if file_id:
        q = q.filter_by(file_id=file_id)
    events = q.order_by(HashEvent.timestamp.desc()).limit(limit).all()
    return [e.to_dict() for e in events]

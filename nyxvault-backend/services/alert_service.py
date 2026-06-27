"""
alert_service.py
================
Core alert logic for NyxVault:
  - create_alert()       : persist, WebSocket-push, email (critical/high)
  - resolve_alert()      : mark resolved
  - acknowledge_all()    : bulk-resolve all active alerts for a user
  - get_alert_stats()    : severity breakdown counts
  - send_email_alert()   : SMTP email in background thread (safe no-op if unconfigured)
"""

import random
import smtplib
import threading
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from database.db import db
from models.alert import Alert
from services.audit_service import log_action


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _alert_id() -> str:
    while True:
        aid = f"ALT-{random.randint(100, 999)}"
        if not db.session.get(Alert, aid):
            return aid


def _now_iso() -> str:
    return datetime.utcnow().isoformat() + 'Z'


# ---------------------------------------------------------------------------
# Email delivery (background thread – never crashes the caller)
# ---------------------------------------------------------------------------

def send_email_alert(alert: Alert):
    """Send an HTML email for a critical/high alert.  Safe no-op if SMTP not configured."""
    def _send():
        try:
            import os
            from dotenv import load_dotenv
            load_dotenv()

            enabled = os.getenv('ALERT_EMAIL_ENABLED', 'false').lower() == 'true'
            if not enabled:
                return

            smtp_host = os.getenv('ALERT_SMTP_HOST', '')
            smtp_port = int(os.getenv('ALERT_SMTP_PORT', 587))
            smtp_user = os.getenv('ALERT_SMTP_USER', '')
            smtp_pass = os.getenv('ALERT_SMTP_PASS', '')
            from_addr = os.getenv('ALERT_EMAIL_FROM', smtp_user)
            to_addr   = os.getenv('ALERT_EMAIL_TO', smtp_user)

            if not smtp_host or not smtp_user:
                return

            sev_color = {
                'critical': '#ff3366',
                'high':     '#ffaa00',
                'medium':   '#00d4ff',
                'low':      '#00ff88',
            }.get(alert.sev, '#94a3b8')

            html = f"""
            <html><body style="background:#0b0d10;font-family:'Segoe UI',sans-serif;padding:32px">
              <div style="max-width:560px;margin:auto;background:#11141c;border:1px solid #1e2535;
                          border-radius:12px;overflow:hidden">
                <div style="background:{sev_color};padding:16px 24px">
                  <h2 style="margin:0;color:#0b0d10;font-size:18px">
                    NyxVault Security Alert — {alert.sev.upper()}
                  </h2>
                </div>
                <div style="padding:24px;color:#e2e8f0">
                  <h3 style="margin:0 0 12px;color:{sev_color}">{alert.title}</h3>
                  <p style="color:#94a3b8;font-size:14px">{alert.desc}</p>
                  <hr style="border:none;border-top:1px solid #1e2535;margin:20px 0"/>
                  <p style="font-size:12px;color:#475569">
                    Alert ID: {alert.id} &nbsp;|&nbsp; Time: {alert.timestamp}
                  </p>
                </div>
              </div>
            </body></html>
            """

            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"[NyxVault] {alert.sev.upper()} Alert: {alert.title}"
            msg['From']    = from_addr
            msg['To']      = to_addr
            msg.attach(MIMEText(html, 'html'))

            with smtplib.SMTP(smtp_host, smtp_port) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_addr, [to_addr], msg.as_string())
        except Exception:
            pass  # Never surface SMTP errors to the request

    threading.Thread(target=_send, daemon=True).start()


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def create_alert(
    user_id: str,
    sev: str,
    title: str,
    desc: str,
    alert_type: str = 'system',
) -> Alert:
    """Create a security alert, push via WebSocket, and email if critical/high."""
    alert_id = _alert_id()

    new_alert = Alert(
        id=alert_id,
        user_id=user_id,
        sev=sev,
        title=title,
        desc=desc,
        time='Just now',
        status='active',
        timestamp=_now_iso(),
        alert_type=alert_type,
    )

    db.session.add(new_alert)
    db.session.commit()

    # Audit log
    log_action(
        user_id='system',
        username='system',
        action='ALERT_TRIGGER',
        resource=alert_id,
        ip='internal',
        status='warning',
    )

    # WebSocket push – fire-and-forget, never crash
    try:
        from services.socketio_service import emit_to_user
        payload = new_alert.to_dict()
        emit_to_user(user_id, 'new_alert', payload)
        # Also push to 'system' room so admins watching the feed get it
        if user_id != 'system':
            emit_to_user('system', 'new_alert', payload)
    except Exception:
        pass

    # Email for critical / high
    if sev in ('critical', 'high'):
        send_email_alert(new_alert)

    return new_alert


def resolve_alert(alert_id: str, admin_user_id: str, admin_username: str, ip: str) -> bool:
    """Resolve a single alert."""
    alert = Alert.query.filter_by(id=alert_id).first()
    if not alert:
        return False

    alert.status = 'resolved'
    db.session.commit()

    log_action(
        user_id=admin_user_id,
        username=admin_username,
        action='ALERT_RESOLVE',
        resource=f"Resolved Alert {alert_id}",
        ip=ip,
    )
    return True


def acknowledge_all(user_id: str) -> int:
    """Bulk-resolve all active/reviewing alerts for a user (including system alerts).  Returns count resolved."""
    alerts = Alert.query.filter(
        (Alert.user_id == user_id) | (Alert.user_id == 'system'),
        Alert.status.in_(['active', 'reviewing']),
    ).all()

    count = 0
    for a in alerts:
        a.status = 'resolved'
        count += 1

    db.session.commit()
    return count


def get_alert_stats(user_id: str) -> dict:
    """Return severity breakdown counts for a user (includes 'system' alerts, or all alerts for Admin/Auditor)."""
    from models.user import User
    user = User.query.get(user_id)
    
    if user and user.role in ('Admin', 'Auditor'):
        alerts = Alert.query.filter(
            Alert.status.in_(['active', 'reviewing', 'blocked']),
        ).all()
    else:
        alerts = Alert.query.filter(
            (Alert.user_id == user_id) | (Alert.user_id == 'system'),
            Alert.status.in_(['active', 'reviewing', 'blocked']),
        ).all()

    stats = {'critical': 0, 'high': 0, 'medium': 0, 'low': 0, 'total': 0}
    for a in alerts:
        if a.sev in stats:
            stats[a.sev] += 1
        stats['total'] += 1

    return stats

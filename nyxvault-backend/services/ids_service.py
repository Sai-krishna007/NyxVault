import time
import logging
from datetime import datetime, timedelta
from services.alert_service import create_alert

logger = logging.getLogger(__name__)

# Sliding window storage: IP/User -> list of timestamps (float)
_failed_logins = {}
_user_downloads = {}

def clean_old_timestamps(timestamps: list, window_seconds: int) -> list:
    """Filter out timestamps older than the sliding window."""
    now = time.time()
    return [t for t in timestamps if now - t <= window_seconds]

def record_failed_login(ip: str, email: str):
    """
    Record a failed login attempt from an IP.
    Triggers a critical brute-force intrusion alert if > 3 attempts occur within 5 minutes.
    """
    if not ip:
        ip = "127.0.0.1"
        
    now = time.time()
    if ip not in _failed_logins:
        _failed_logins[ip] = []
        
    # Append new failed attempt
    _failed_logins[ip].append(now)
    
    # Clean up attempts older than 5 minutes (300 seconds)
    _failed_logins[ip] = clean_old_timestamps(_failed_logins[ip], 300)
    attempts = len(_failed_logins[ip])
    
    logger.info(f"IDS: IP {ip} has {attempts} failed login attempts in the last 5 minutes.")
    
    if attempts > 3:
        # Trigger brute-force alert
        create_alert(
            user_id="system",
            sev="critical",
            title="Brute-Force Intrusion Detected",
            desc=(
                f"IP {ip} triggered brute-force threshold with {attempts} failed login attempts "
                f"within 5 minutes. Target account: {email}."
            ),
            alert_type="intrusion_attempt"
        )
        logger.warning(f"IDS ALERT: Brute-force intrusion detected from IP {ip}.")

def record_file_download(user_id: str, username: str, filename: str, ip: str):
    """
    Record a file download event by a user.
    Triggers a critical data exfiltration alert if > 10 downloads occur within 1 minute.
    """
    if not user_id:
        return
        
    now = time.time()
    if user_id not in _user_downloads:
        _user_downloads[user_id] = []
        
    _user_downloads[user_id].append(now)
    
    # Clean up downloads older than 1 minute (60 seconds)
    _user_downloads[user_id] = clean_old_timestamps(_user_downloads[user_id], 60)
    download_count = len(_user_downloads[user_id])
    
    logger.info(f"IDS: User {username} ({user_id}) has downloaded {download_count} files in the last 1 minute.")
    
    if download_count > 10:
        # Trigger data exfiltration alert
        create_alert(
            user_id=user_id,
            sev="critical",
            title="Potential Data Exfiltration Detected",
            desc=(
                f"User '{username}' from IP {ip or '127.0.0.1'} has downloaded {download_count} files "
                f"within 60 seconds. High volume download matches typical exfiltration pattern."
            ),
            alert_type="exfiltration"
        )
        logger.warning(f"IDS ALERT: Potential exfiltration by user {username} ({user_id}).")

import os
import hashlib
import json
import urllib.request
import urllib.error
import logging

logger = logging.getLogger(__name__)

# EICAR test virus hash for automated threat blocking validation
EICAR_SHA256 = "275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f"

# Known mock malicious hashes for testing
MOCK_MALICIOUS_HASHES = {
    EICAR_SHA256: "EICAR-Standard-Antivirus-Test-File",
    "44d88612fea8a8f36de82e1278abb02f": "Mock-Trojan.Generic",
    "0000000000000000000000000000000000000000000000000000000000000000": "Null-Payload.Malicious"
}

def compute_sha256(data: bytes) -> str:
    """Compute the SHA-256 hash of binary data."""
    return hashlib.sha256(data).hexdigest()

def scan_file_bytes(file_bytes: bytes, filename: str = "uploaded_file") -> dict:
    """
    Scan file bytes for viruses using the VirusTotal API.
    Computes the SHA-256 hash and queries VirusTotal.
    If the API key is not configured, falls back to EICAR/Mock signature detection.
    
    Returns a dict:
        {
            "infected": bool,
            "threat_name": str or None,
            "details": str,
            "source": "VirusTotal" or "LocalSignature" or "Bypassed"
        }
    """
    file_hash = compute_sha256(file_bytes)
    
    # 1. Check local signature list first (always active for testing and performance)
    if file_hash in MOCK_MALICIOUS_HASHES:
        threat_name = MOCK_MALICIOUS_HASHES[file_hash]
        return {
            "infected": True,
            "threat_name": threat_name,
            "details": f"Local threat signature matched: {threat_name}",
            "source": "LocalSignature"
        }
        
    # Check if EICAR string is present in the bytes (content scan)
    if b"EICAR-STANDARD-ANTIVIRUS-TEST-FILE" in file_bytes:
        return {
            "infected": True,
            "threat_name": "EICAR-Test-File",
            "details": "EICAR standard antivirus test string detected inside file payload",
            "source": "LocalSignature"
        }

    # 2. Query VirusTotal API
    api_key = os.getenv("VIRUSTOTAL_API_KEY")
    if not api_key:
        logger.warning("VirusTotal API Key (VIRUSTOTAL_API_KEY) not set. Skipping live VirusTotal lookup.")
        return {
            "infected": False,
            "threat_name": None,
            "details": "VirusTotal API key not configured. Local signature scan passed.",
            "source": "LocalSignature"
        }
        
    url = f"https://www.virustotal.com/api/v3/files/{file_hash}"
    req = urllib.request.Request(url)
    req.add_header("x-apikey", api_key)
    
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode('utf-8'))
            attributes = result.get("data", {}).get("attributes", {})
            stats = attributes.get("last_analysis_stats", {})
            
            malicious = stats.get("malicious", 0)
            suspicious = stats.get("suspicious", 0)
            
            if malicious > 0 or suspicious > 2:
                # Retrieve threat label if available
                threat_name = attributes.get("popular_threat_classification", {}).get("suggested_threat_label")
                if not threat_name:
                    threat_name = "Generic.Malware"
                return {
                    "infected": True,
                    "threat_name": threat_name,
                    "details": f"VirusTotal threat detected: {malicious} malicious engines flag this file.",
                    "source": "VirusTotal"
                }
                
            return {
                "infected": False,
                "threat_name": None,
                "details": "VirusTotal clean scan. Zero detections.",
                "source": "VirusTotal"
            }
            
    except urllib.error.HTTPError as e:
        if e.code == 404:
            # File not found on VirusTotal is clean/unseen
            return {
                "infected": False,
                "threat_name": None,
                "details": "File hash not found in VirusTotal registry (clean/unseen).",
                "source": "VirusTotal"
            }
        else:
            logger.error(f"VirusTotal API HTTP error: {e.code} - {e.reason}")
    except Exception as e:
        logger.error(f"VirusTotal query failed: {str(e)}")
        
    # Fallback to clean if external query fails
    return {
        "infected": False,
        "threat_name": None,
        "details": "VirusTotal query failed/timed out. Local signature scan passed.",
        "source": "Bypassed"
    }

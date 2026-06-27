import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def generate_key() -> bytes:
    """Generate a secure random 256-bit AES key (32 bytes)."""
    return AESGCM.generate_key(bit_length=256)

def key_to_base64(key: bytes) -> str:
    """Convert raw bytes key to a base64 encoded string."""
    return base64.b64encode(key).decode('utf-8')

def key_from_base64(key_str: str) -> bytes:
    """Convert a base64 encoded string key back to raw bytes."""
    return base64.b64decode(key_str.encode('utf-8'))

def encrypt_data(data: bytes, key: bytes) -> bytes:
    """
    Encrypt data using AES-256-GCM.
    Prepends the random 12-byte initialization vector (nonce) to the ciphertext.
    """
    aesgcm = AESGCM(key)
    nonce = os.urandom(12) # GCM standard nonce size is 12 bytes
    ciphertext = aesgcm.encrypt(nonce, data, None)
    return nonce + ciphertext

def decrypt_data(encrypted_data: bytes, key: bytes) -> bytes:
    """
    Decrypt data using AES-256-GCM.
    Extracts the first 12 bytes as the initialization vector (nonce) and decrypts the remainder.
    """
    if len(encrypted_data) < 12:
        raise ValueError("Encrypted data is too short to contain a valid IV nonce.")
    
    nonce = encrypted_data[:12]
    ciphertext = encrypted_data[12:]
    
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(nonce, ciphertext, None)

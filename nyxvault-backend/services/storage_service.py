import os
import boto3
from botocore.exceptions import ClientError
from flask import current_app
from abc import ABC, abstractmethod

class StorageProvider(ABC):
    """Abstract base class for all file storage providers."""
    
    @abstractmethod
    def upload_file(self, data: bytes, path_name: str) -> bool:
        """Upload file bytes to storage."""
        pass
        
    @abstractmethod
    def download_file(self, path_name: str) -> bytes:
        """Download file bytes from storage."""
        pass
        
    @abstractmethod
    def delete_file(self, path_name: str) -> bool:
        """Delete a file from storage."""
        pass

class LocalStorageProvider(StorageProvider):
    """Storage provider that saves files to local disk uploads folder."""
    
    def __init__(self, upload_dir: str):
        self.upload_dir = upload_dir
        
    def _get_full_path(self, path_name: str) -> str:
        return os.path.join(self.upload_dir, path_name)
        
    def upload_file(self, data: bytes, path_name: str) -> bool:
        os.makedirs(self.upload_dir, exist_ok=True)
        file_path = self._get_full_path(path_name)
        with open(file_path, 'wb') as f:
            f.write(data)
        return True
        
    def download_file(self, path_name: str) -> bytes:
        file_path = self._get_full_path(path_name)
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Local file {path_name} does not exist.")
        with open(file_path, 'rb') as f:
            return f.read()
            
    def delete_file(self, path_name: str) -> bool:
        file_path = self._get_full_path(path_name)
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                return True
            except Exception as e:
                current_app.logger.error(f"Failed to delete local file {file_path}: {e}")
                return False
        return False

class S3StorageProvider(StorageProvider):
    """Storage provider that saves files to Amazon S3."""
    
    def __init__(self, access_key: str, secret_key: str, bucket: str, region: str):
        self.bucket = bucket
        # Initialize boto3 S3 client
        self.s3 = boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            region_name=region
        )
        
    def upload_file(self, data: bytes, path_name: str) -> bool:
        try:
            self.s3.put_object(
                Bucket=self.bucket,
                Key=path_name,
                Body=data
            )
            return True
        except ClientError as e:
            current_app.logger.error(f"S3 Upload failed for key {path_name}: {e}")
            raise e
            
    def download_file(self, path_name: str) -> bytes:
        try:
            response = self.s3.get_object(
                Bucket=self.bucket,
                Key=path_name
            )
            return response['Body'].read()
        except ClientError as e:
            current_app.logger.error(f"S3 Download failed for key {path_name}: {e}")
            raise e
            
    def delete_file(self, path_name: str) -> bool:
        try:
            self.s3.delete_object(
                Bucket=self.bucket,
                Key=path_name
            )
            return True
        except ClientError as e:
            current_app.logger.error(f"S3 Delete failed for key {path_name}: {e}")
            return False

def get_storage_provider() -> StorageProvider:
    """Factory function to instantiate the configured storage provider."""
    provider_type = current_app.config.get('STORAGE_PROVIDER', 'local').lower()
    
    if provider_type == 's3':
        access_key = current_app.config.get('AWS_ACCESS_KEY_ID')
        secret_key = current_app.config.get('AWS_SECRET_ACCESS_KEY')
        bucket = current_app.config.get('AWS_STORAGE_BUCKET_NAME')
        region = current_app.config.get('AWS_S3_REGION_NAME', 'us-east-1')
        
        # If credentials look unconfigured/mock, default back to local for robustness
        if not access_key or 'mock' in access_key or not secret_key or 'mock' in secret_key:
            current_app.logger.warning("AWS S3 keys are unconfigured or mock. Falling back to local storage provider.")
            return LocalStorageProvider(current_app.config['UPLOAD_FOLDER'])
            
        return S3StorageProvider(access_key, secret_key, bucket, region)
        
    # Default to LocalStorageProvider
    return LocalStorageProvider(current_app.config['UPLOAD_FOLDER'])

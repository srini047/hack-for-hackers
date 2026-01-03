"""File handling utilities."""
import os
import tempfile
from typing import Optional
from fastapi import UploadFile
import cv2
from config import settings
from utils.exception import ValidationException


async def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    """
    Save uploaded file to destination.
    
    Args:
        upload_file: FastAPI UploadFile object
        destination: Destination path
    
    Returns:
        Path to saved file
    """
    try:
        with open(destination, 'wb') as f:
            content = await upload_file.read()
            f.write(content)
        return destination
    except Exception as e:
        raise ValidationException(f"Failed to save file: {str(e)}")


def get_video_duration(video_path: str) -> float:
    """
    Get video duration in seconds.
    
    Args:
        video_path: Path to video file
    
    Returns:
        Duration in seconds
    """
    try:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps if fps > 0 else 0
        cap.release()
        return duration
    except Exception:
        return 0.0


def validate_video_file(filename: str, file_size: int) -> bool:
    """
    Validate video file.
    
    Args:
        filename: Name of the file
        file_size: Size of file in bytes
    
    Returns:
        True if valid
    
    Raises:
        ValidationException: If file is invalid
    """
    # Check file extension
    file_ext = filename.lower().split('.')[-1]
    if file_ext not in settings.allowed_formats_list:
        raise ValidationException(
            f"Invalid file format. Allowed formats: {', '.join(settings.allowed_formats_list)}"
        )
    
    # Check file size
    if file_size > settings.max_file_size_bytes:
        raise ValidationException(
            f"File size exceeds maximum allowed size of {settings.max_file_size_mb}MB"
        )
    
    return True


def create_temp_file(suffix: str = ".mp4") -> str:
    """
    Create a temporary file path.
    
    Args:
        suffix: File extension/suffix
    
    Returns:
        Path to temporary file
    """
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_path = temp_file.name
    temp_file.close()
    return temp_path


def cleanup_temp_file(file_path: str):
    """
    Delete temporary file.
    
    Args:
        file_path: Path to file to delete
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        print(f"Warning: Could not delete temp file {file_path}: {e}")

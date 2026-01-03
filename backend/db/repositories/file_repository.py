"""Repository for file operations using GridFS with native pymongo."""

from pymongo.database import Database
from bson import ObjectId
from typing import Optional, Dict, Any
from db.gridfs_handler import GridFSHandler


class FileRepository:
    """Handle file storage and retrieval operations using native pymongo."""

    def __init__(self, database: Database):
        """Initialize repository with GridFS handler."""
        self.gridfs = GridFSHandler(database)

    def save_video(
        self, file_data: bytes, filename: str, content_type: str = "video/mp4"
    ) -> str:
        """Save video file to GridFS."""
        metadata = {"file_type": "video", "original_filename": filename}

        file_id = self.gridfs.upload_file(
            file_data=file_data,
            filename=filename,
            content_type=content_type,
            metadata=metadata,
        )

        return str(file_id)

    def save_subtitle_file(
        self, subtitle_data: bytes, filename: str, subtitle_format: str
    ) -> str:
        """Save subtitle file to GridFS."""
        content_type_map = {"srt": "application/x-subrip", "vtt": "text/vtt"}

        metadata = {"file_type": "subtitle", "subtitle_format": subtitle_format}

        file_id = self.gridfs.upload_file(
            file_data=subtitle_data,
            filename=filename,
            content_type=content_type_map.get(subtitle_format, "text/plain"),
            metadata=metadata,
        )

        return str(file_id)

    def save_audio_description(
        self, audio_data: bytes, filename: str, content_type: str = "audio/mpeg"
    ) -> str:
        """Save audio description file to GridFS."""
        metadata = {"file_type": "audio_description"}

        file_id = self.gridfs.upload_file(
            file_data=audio_data,
            filename=filename,
            content_type=content_type,
            metadata=metadata,
        )

        return str(file_id)

    def save_screenshot(
        self,
        image_data: bytes,
        filename: str,
        timestamp: float,
        content_type: str = "image/jpeg",
    ) -> str:
        """Save screenshot to GridFS."""
        metadata = {"file_type": "screenshot", "timestamp": timestamp}

        file_id = self.gridfs.upload_file(
            file_data=image_data,
            filename=filename,
            content_type=content_type,
            metadata=metadata,
        )

        return str(file_id)

    def get_file(self, file_id: str) -> Optional[bytes]:
        """Retrieve file from GridFS."""
        try:
            obj_id = ObjectId(file_id)
            return self.gridfs.download_file(obj_id)
        except Exception as e:
            print(f"Error retrieving file {file_id}: {e}")
            return None

    def get_file_info(self, file_id: str) -> Optional[Dict[str, Any]]:
        """Get file metadata."""
        try:
            obj_id = ObjectId(file_id)
            return self.gridfs.get_file_info(obj_id)
        except Exception as e:
            print(f"Error getting file info {file_id}: {e}")
            return None

    def delete_file(self, file_id: str) -> bool:
        """Delete file from GridFS."""
        try:
            obj_id = ObjectId(file_id)
            self.gridfs.delete_file(obj_id)
            return True
        except Exception as e:
            print(f"Error deleting file {file_id}: {e}")
            return False

    def file_exists(self, file_id: str) -> bool:
        """Check if file exists."""
        try:
            obj_id = ObjectId(file_id)
            return self.gridfs.exists(obj_id)
        except Exception:
            return False

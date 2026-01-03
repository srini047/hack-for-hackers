"""GridFS handler for storing large files in MongoDB using native pymongo."""
from pymongo.database import Database
import gridfs
from bson import ObjectId
from typing import Optional


class GridFSHandler:
    """Handle GridFS operations for file storage using native pymongo."""
    
    def __init__(self, database: Database):
        """Initialize GridFS bucket."""
        self.fs = gridfs.GridFS(database)
    
    def upload_file(
        self,
        file_data: bytes,
        filename: str,
        content_type: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> ObjectId:
        """
        Upload a file to GridFS.
        
        Args:
            file_data: File content as bytes
            filename: Name of the file
            content_type: MIME type of the file
            metadata: Additional metadata to store
        
        Returns:
            ObjectId of the uploaded file
        """
        file_metadata = metadata or {}
        if content_type:
            file_metadata["content_type"] = content_type
        
        file_id = self.fs.put(
            file_data,
            filename=filename,
            metadata=file_metadata
        )
        
        return file_id
    
    def download_file(self, file_id: ObjectId) -> bytes:
        """
        Download a file from GridFS.
        
        Args:
            file_id: ObjectId of the file
        
        Returns:
            File content as bytes
        """
        grid_out = self.fs.get(file_id)
        contents = grid_out.read()
        return contents
    
    def get_file_info(self, file_id: ObjectId) -> Optional[dict]:
        """
        Get file metadata from GridFS.
        
        Args:
            file_id: ObjectId of the file
        
        Returns:
            Dictionary with file information or None if not found
        """
        try:
            grid_out = self.fs.get(file_id)
            return {
                "_id": grid_out._id,
                "filename": grid_out.filename,
                "length": grid_out.length,
                "upload_date": grid_out.upload_date,
                "metadata": grid_out.metadata
            }
        except gridfs.errors.NoFile:
            return None
    
    def delete_file(self, file_id: ObjectId):
        """
        Delete a file from GridFS.
        
        Args:
            file_id: ObjectId of the file
        """
        self.fs.delete(file_id)
    
    def exists(self, file_id: ObjectId) -> bool:
        """
        Check if a file exists in GridFS.
        
        Args:
            file_id: ObjectId of the file
        
        Returns:
            True if file exists, False otherwise
        """
        return self.fs.exists(file_id)

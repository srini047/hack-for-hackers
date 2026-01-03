"""Repository for project CRUD operations using native pymongo."""
from pymongo.database import Database
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
import uuid


class ProjectRepository:
    """Handle project database operations using native pymongo."""
    
    def __init__(self, database: Database):
        """Initialize repository with database connection."""
        self.collection = database["projects"]
    
    def create_project(self, video_info: dict):
        """Create a new project with initial data."""
        project_data = {
            "job_id": str(uuid.uuid4()),
            "status": "pending",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "video": video_info,
            "content": {
                "readme": None,
                "subtitles": None,
                "audio_description": None,
                "screenshots": []
            },
            "submission": {
                "title": None,
                "tagline": None,
                "problem_statement": None,
                "solution": None,
                "tech_stack": [],
                "challenges": None,
                "whats_next": None,
                "team": []
            },
            "processing": {
                "started_at": None,
                "completed_at": None,
                "error": None,
                "steps": {
                    "video_upload": "completed",
                    "audio_extraction": "pending",
                    "transcription": "pending",
                    "vision_analysis": "pending",
                    "readme_generation": "pending",
                    "subtitle_generation": "pending",
                    "audio_description": "pending"
                }
            }
        }
        
        result = self.collection.insert_one(project_data)
        project_data["_id"] = result.inserted_id
        return project_data
    
    def get_by_job_id(self, job_id: str) -> Optional[dict]:
        """Get project by job_id."""
        return self.collection.find_one({"job_id": job_id})
    
    def update_status(self, job_id: str, status: str):
        """Update project status."""
        self.collection.update_one(
            {"job_id": job_id},
            {
                "$set": {
                    "status": status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    def update_processing_step(self, job_id: str, step_name: str, step_status: str):
        """Update a specific processing step status."""
        self.collection.update_one(
            {"job_id": job_id},
            {
                "$set": {
                    f"processing.steps.{step_name}": step_status,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    def update_content(self, job_id: str, content_field: str, content_data: Any):
        """Update content fields."""
        self.collection.update_one(
            {"job_id": job_id},
            {
                "$set": {
                    f"content.{content_field}": content_data,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    def update_submission(self, job_id: str, submission_data: Dict[str, Any]):
        """Update submission information."""
        update_fields = {
            f"submission.{key}": value
            for key, value in submission_data.items()
            if value is not None
        }
        update_fields["updated_at"] = datetime.utcnow()
        
        self.collection.update_one(
            {"job_id": job_id},
            {"$set": update_fields}
        )
    
    def set_processing_started(self, job_id: str):
        """Mark processing as started."""
        self.collection.update_one(
            {"job_id": job_id},
            {
                "$set": {
                    "status": "processing",
                    "processing.started_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    def set_processing_completed(self, job_id: str):
        """Mark processing as completed."""
        self.collection.update_one(
            {"job_id": job_id},
            {
                "$set": {
                    "status": "completed",
                    "processing.completed_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    def set_processing_failed(self, job_id: str, error: str):
        """Mark processing as failed."""
        self.collection.update_one(
            {"job_id": job_id},
            {
                "$set": {
                    "status": "failed",
                    "processing.error": error,
                    "updated_at": datetime.utcnow()
                }
            }
        )
    
    def add_screenshot(self, job_id: str, screenshot_data: Dict[str, Any]):
        """Add a screenshot to the project."""
        self.collection.update_one(
            {"job_id": job_id},
            {
                "$push": {"content.screenshots": screenshot_data},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    
    def list_projects(
        self,
        status: Optional[str] = None,
        limit: int = 50,
        skip: int = 0
    ) -> List[dict]:
        """List projects with optional filtering."""
        query = {}
        if status:
            query["status"] = status
        
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        return list(cursor)
    
    def delete_project(self, job_id: str) -> bool:
        """Delete a project."""
        result = self.collection.delete_one({"job_id": job_id})
        return result.deleted_count > 0

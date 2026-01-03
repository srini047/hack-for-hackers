"""Pydantic schemas for API requests and responses."""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic."""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class VideoInfo(BaseModel):
    """Video file information."""
    file_id: Optional[str] = None
    filename: str
    size: int
    duration: Optional[float] = None
    format: str
    
    class Config:
        json_encoders = {ObjectId: str}


class ScreenshotInfo(BaseModel):
    """Screenshot information."""
    file_id: str
    timestamp: float
    description: str
    
    class Config:
        json_encoders = {ObjectId: str}


class SubtitlesInfo(BaseModel):
    """Subtitle files information."""
    srt_file_id: Optional[str] = None
    vtt_file_id: Optional[str] = None
    transcript: Optional[str] = None
    
    class Config:
        json_encoders = {ObjectId: str}


class AudioDescriptionInfo(BaseModel):
    """Audio description information."""
    file_id: Optional[str] = None
    duration: Optional[float] = None
    
    class Config:
        json_encoders = {ObjectId: str}


class ReadmeMetadata(BaseModel):
    """README metadata extracted from video."""
    title: Optional[str] = None
    tagline: Optional[str] = None
    tech_stack: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)


class ContentInfo(BaseModel):
    """All generated content."""
    readme: Optional[Dict[str, Any]] = None
    subtitles: Optional[SubtitlesInfo] = None
    audio_description: Optional[AudioDescriptionInfo] = None
    screenshots: List[ScreenshotInfo] = Field(default_factory=list)


class SubmissionInfo(BaseModel):
    """Hackathon submission information."""
    title: Optional[str] = None
    tagline: Optional[str] = None
    problem_statement: Optional[str] = None
    solution: Optional[str] = None
    tech_stack: List[str] = Field(default_factory=list)
    challenges: Optional[str] = None
    whats_next: Optional[str] = None
    team: List[Dict[str, str]] = Field(default_factory=list)


class ProcessingInfo(BaseModel):
    """Processing status and metadata."""
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    steps: Dict[str, str] = Field(default_factory=dict)


class Project(BaseModel):
    """Complete project model."""
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    job_id: str
    status: str = "pending"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    video: Optional[VideoInfo] = None
    content: ContentInfo = Field(default_factory=ContentInfo)
    submission: SubmissionInfo = Field(default_factory=SubmissionInfo)
    processing: ProcessingInfo = Field(default_factory=ProcessingInfo)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }


class ProjectCreate(BaseModel):
    """Request model for creating a project."""
    pass


class ProjectResponse(BaseModel):
    """Response model for project operations."""
    job_id: str
    status: str
    created_at: datetime
    updated_at: datetime
    video: Optional[VideoInfo] = None
    content: Optional[ContentInfo] = None
    submission: Optional[SubmissionInfo] = None
    processing: Optional[ProcessingInfo] = None
    
    class Config:
        json_encoders = {
            datetime: lambda dt: dt.isoformat()
        }


class StatusResponse(BaseModel):
    """Response model for status checks."""
    job_id: str
    status: str
    progress: Dict[str, str]
    message: Optional[str] = None


class ExportResponse(BaseModel):
    """Response model for export operations."""
    job_id: str
    readme_markdown: Optional[str] = None
    readme_file_id: Optional[str] = None
    subtitle_srt_id: Optional[str] = None
    subtitle_vtt_id: Optional[str] = None
    audio_description_id: Optional[str] = None
    screenshots: List[ScreenshotInfo] = Field(default_factory=list)
    
    class Config:
        json_encoders = {ObjectId: str}


class UpdateSubmissionRequest(BaseModel):
    """Request model for updating submission info."""
    title: Optional[str] = None
    tagline: Optional[str] = None
    problem_statement: Optional[str] = None
    solution: Optional[str] = None
    tech_stack: Optional[List[str]] = None
    challenges: Optional[str] = None
    whats_next: Optional[str] = None
    team: Optional[List[Dict[str, str]]] = None

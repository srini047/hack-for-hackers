"""Project management endpoints."""

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
import io
import tempfile

from db.repositories.project_repository import ProjectRepository
from db.repositories.file_repository import FileRepository
from api.dependencies import get_project_repository, get_file_repository
from services.video_processor import VideoProcessor
from utils.file_utils import validate_video_file, get_video_duration, cleanup_temp_file

router = APIRouter(prefix="/api/project", tags=["Project"])


@router.post("/create")
async def create_project(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    project_repo: ProjectRepository = Depends(get_project_repository),
    file_repo: FileRepository = Depends(get_file_repository),
):
    """
    Create a new project by uploading a demo video.

    This endpoint:
    1. Validates the video file
    2. Stores it in GridFS
    3. Creates a project record
    4. Starts background processing

    Args:
        video: Video file upload
        background_tasks: FastAPI background tasks
        project_repo: Project repository
        file_repo: File repository

    Returns:
        Project information with job_id
    """
    try:
        # Validate file
        content = await video.read()
        file_size = len(content)
        if not video.filename:
            raise HTTPException(
                status_code=400, detail="Uploaded file must have a filename"
            )

        validate_video_file(video.filename, file_size)

        # Save video to temporary location for processing
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
        temp_file.write(content)
        temp_file.close()
        temp_video_path = temp_file.name

        # Get video duration
        duration = get_video_duration(temp_video_path)

        # Save video to GridFS
        video_id = file_repo.save_video(
            file_data=content,
            filename=video.filename,
            content_type=video.content_type or "video/mp4",
        )

        # Create project record
        video_info = {
            "file_id": video_id,
            "filename": video.filename,
            "size": file_size,
            "duration": duration,
            "format": video.filename.split(".")[-1].lower(),
        }

        project = project_repo.create_project(video_info)

        # Start background processing
        processor = VideoProcessor(project_repo, file_repo)
        background_tasks.add_task(
            processor.process_video, project["job_id"], temp_video_path
        )
        background_tasks.add_task(cleanup_temp_file, temp_video_path)

        # Return project response
        return {
            "job_id": project["job_id"],
            "status": project["status"],
            "created_at": project["created_at"],
            "updated_at": project["updated_at"],
            "video": project["video"],
            "content": project["content"],
            "submission": project["submission"],
            "processing": project["processing"],
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{job_id}/status")
async def get_project_status(
    job_id: str, project_repo: ProjectRepository = Depends(get_project_repository)
):
    """
    Get processing status for a project.

    Args:
        job_id: Unique job identifier
        project_repo: Project repository

    Returns:
        Status information
    """
    project = project_repo.get_by_job_id(job_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    status = project["status"]
    processing = project.get("processing", {})
    steps = processing.get("steps", {})

    # Calculate progress message
    if status == "completed":
        message = "Processing completed successfully"
    elif status == "failed":
        message = f"Processing failed: {processing.get('error')}"
    elif status == "processing":
        completed_steps = sum(1 for s in steps.values() if s == "completed")
        total_steps = len(steps)
        message = f"Processing... ({completed_steps}/{total_steps} steps completed)"
    else:
        message = "Waiting to start processing"

    return {
        "job_id": project["job_id"],
        "status": status,
        "progress": steps,
        "message": message,
    }


@router.get("/{job_id}")
async def get_project(
    job_id: str, project_repo: ProjectRepository = Depends(get_project_repository)
):
    """
    Get complete project information.

    Args:
        job_id: Unique job identifier
        project_repo: Project repository

    Returns:
        Complete project data
    """
    project = project_repo.get_by_job_id(job_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


@router.get("/{job_id}/readme")
async def get_readme(
    job_id: str, project_repo: ProjectRepository = Depends(get_project_repository)
):
    """
    Get generated README content.

    Args:
        job_id: Unique job identifier
        project_repo: Project repository

    Returns:
        README markdown content
    """
    project = project_repo.get_by_job_id(job_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    content = project.get("content", {})
    readme = content.get("readme")

    if not readme:
        raise HTTPException(status_code=404, detail="README not yet generated")

    return {
        "job_id": job_id,
        "markdown": readme.get("markdown", ""),
        "metadata": readme.get("metadata", {}),
    }


@router.get("/{job_id}/subtitles/{format}")
async def get_subtitles(
    job_id: str,
    format: str,
    project_repo: ProjectRepository = Depends(get_project_repository),
    file_repo: FileRepository = Depends(get_file_repository),
):
    """
    Download subtitle file (SRT or VTT).

    Args:
        job_id: Unique job identifier
        format: Subtitle format ('srt' or 'vtt')
        project_repo: Project repository
        file_repo: File repository

    Returns:
        Subtitle file download
    """
    if format not in ["srt", "vtt"]:
        raise HTTPException(status_code=400, detail="Format must be 'srt' or 'vtt'")

    project = project_repo.get_by_job_id(job_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    content = project.get("content", {})
    subtitles = content.get("subtitles", {})

    # Get file ID based on format
    file_id = subtitles.get(f"{format}_file_id")

    if not file_id:
        raise HTTPException(
            status_code=404, detail=f"{format.upper()} subtitle file not found"
        )

    # Get file from GridFS
    file_data = file_repo.get_file(file_id)

    if not file_data:
        raise HTTPException(
            status_code=404, detail="Subtitle file not found in storage"
        )

    # Return as downloadable file
    return StreamingResponse(
        io.BytesIO(file_data),
        media_type=f"text/{format}",
        headers={"Content-Disposition": f"attachment; filename={job_id}.{format}"},
    )


@router.get("/{job_id}/audio-description")
async def get_audio_description(
    job_id: str,
    project_repo: ProjectRepository = Depends(get_project_repository),
    file_repo: FileRepository = Depends(get_file_repository),
):
    """
    Download audio description file.

    Args:
        job_id: Unique job identifier
        project_repo: Project repository
        file_repo: File repository

    Returns:
        Audio file download
    """
    project = project_repo.get_by_job_id(job_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    content = project.get("content", {})
    audio_desc = content.get("audio_description", {})

    file_id = audio_desc.get("file_id")

    if not file_id:
        raise HTTPException(status_code=404, detail="Audio description file not found")

    # Get file from GridFS
    file_data = file_repo.get_file(file_id)

    if not file_data:
        raise HTTPException(status_code=404, detail="Audio file not found in storage")

    # Return as downloadable file
    return StreamingResponse(
        io.BytesIO(file_data),
        media_type="audio/mpeg",
        headers={
            "Content-Disposition": f"attachment; filename={job_id}_description.mp3"
        },
    )


@router.post("/{job_id}/update")
async def update_submission_info(
    job_id: str,
    update_data: dict,
    project_repo: ProjectRepository = Depends(get_project_repository),
):
    """
    Update hackathon submission information.

    Args:
        job_id: Unique job identifier
        update_data: Submission data to update
        project_repo: Project repository

    Returns:
        Updated project data
    """
    project = project_repo.get_by_job_id(job_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Update submission info
    if update_data:
        project_repo.update_submission(job_id, update_data)

    # Get updated project
    updated_project = project_repo.get_by_job_id(job_id)

    return updated_project


@router.delete("/{job_id}")
async def delete_project(
    job_id: str,
    project_repo: ProjectRepository = Depends(get_project_repository),
    file_repo: FileRepository = Depends(get_file_repository),
):
    """
    Delete a project and all associated files.

    Args:
        job_id: Unique job identifier
        project_repo: Project repository
        file_repo: File repository

    Returns:
        Success message
    """
    project = project_repo.get_by_job_id(job_id)

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Delete all associated files
    file_ids_to_delete = []

    video = project.get("video", {})
    if video.get("file_id"):
        file_ids_to_delete.append(video["file_id"])

    content = project.get("content", {})
    if content.get("subtitles"):
        subs = content["subtitles"]
        if subs.get("srt_file_id"):
            file_ids_to_delete.append(subs["srt_file_id"])
        if subs.get("vtt_file_id"):
            file_ids_to_delete.append(subs["vtt_file_id"])

    if content.get("audio_description", {}).get("file_id"):
        file_ids_to_delete.append(content["audio_description"]["file_id"])

    for screenshot in content.get("screenshots", []):
        if screenshot.get("file_id"):
            file_ids_to_delete.append(screenshot["file_id"])

    # Delete files
    for file_id in file_ids_to_delete:
        try:
            file_repo.delete_file(file_id)
        except Exception as e:
            print(f"Warning: Could not delete file {file_id}: {e}")

    # Delete project record
    deleted = project_repo.delete_project(job_id)

    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete project")

    return {"message": "Project deleted successfully", "job_id": job_id}

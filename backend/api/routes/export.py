"""Export endpoints for complete submission packages."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
import io
import zipfile

from db.repositories.project_repository import ProjectRepository
from db.repositories.file_repository import FileRepository
from api.dependencies import get_project_repository, get_file_repository

router = APIRouter(prefix="/api/project", tags=["Export"])


@router.get("/{job_id}/export")
async def export_project(job_id: str, project_repo: ProjectRepository = Depends(get_project_repository)):
    """Get complete export data for hackathon submission."""
    project = await project_repo.get_by_job_id(job_id)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["status"] != "completed":
        raise HTTPException(status_code=400, detail="Project processing not completed")
    
    content = project.get("content", {})
    
    return {
        "job_id": project["job_id"],
        "readme_markdown": content.get("readme", {}).get("markdown"),
        "subtitle_srt_id": content.get("subtitles", {}).get("srt_file_id"),
        "subtitle_vtt_id": content.get("subtitles", {}).get("vtt_file_id"),
        "audio_description_id": content.get("audio_description", {}).get("file_id"),
        "screenshots": content.get("screenshots", [])
    }


@router.get("/{job_id}/download-package")
async def download_complete_package(
    job_id: str,
    project_repo: ProjectRepository = Depends(get_project_repository),
    file_repo: FileRepository = Depends(get_file_repository)
):
    """Download complete submission package as ZIP."""
    project = await project_repo.get_by_job_id(job_id)
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project["status"] != "completed":
        raise HTTPException(status_code=400, detail="Project not completed")
    
    content = project.get("content", {})
    submission = project.get("submission", {})
    
    # Create ZIP in memory
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Add README
        if content.get("readme"):
            readme_content = content["readme"].get("markdown", "")
            zip_file.writestr('README.md', readme_content)
        
        # Add subtitles
        if content.get("subtitles"):
            subs = content["subtitles"]
            if subs.get("srt_file_id"):
                srt_data = await file_repo.get_file(subs["srt_file_id"])
                if srt_data:
                    zip_file.writestr('subtitles.srt', srt_data)
            
            if subs.get("vtt_file_id"):
                vtt_data = await file_repo.get_file(subs["vtt_file_id"])
                if vtt_data:
                    zip_file.writestr('subtitles.vtt', vtt_data)
            
            if subs.get("transcript"):
                zip_file.writestr('transcript.txt', subs["transcript"])
        
        # Add audio description
        audio_desc = content.get("audio_description", {})
        if audio_desc.get("file_id"):
            audio_data = await file_repo.get_file(audio_desc["file_id"])
            if audio_data:
                zip_file.writestr('audio_description.mp3', audio_data)
        
        # Add screenshots
        for i, screenshot in enumerate(content.get("screenshots", [])):
            if screenshot.get("file_id"):
                img_data = await file_repo.get_file(screenshot["file_id"])
                if img_data:
                    timestamp = int(screenshot["timestamp"])
                    zip_file.writestr(f'screenshots/screenshot_{timestamp}s.jpg', img_data)
        
        # Add submission info
        submission_text = f"""HACKATHON SUBMISSION INFORMATION
{'=' * 50}

Title: {submission.get('title', 'N/A')}
Tagline: {submission.get('tagline', 'N/A')}

Problem Statement:
{submission.get('problem_statement', 'N/A')}

Solution:
{submission.get('solution', 'N/A')}

Tech Stack:
{chr(10).join(f'- {tech}' for tech in submission.get('tech_stack', []))}

Challenges:
{submission.get('challenges', 'N/A')}

What's Next:
{submission.get('whats_next', 'N/A')}
"""
        zip_file.writestr('SUBMISSION_INFO.txt', submission_text)
    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": f"attachment; filename={job_id}_submission.zip"}
    )

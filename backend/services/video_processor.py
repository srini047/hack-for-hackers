"""Main video processing orchestrator."""

from typing import Dict, Any
import cv2
from db.repositories.file_repository import FileRepository
from db.repositories.project_repository import ProjectRepository
from services.gemini.vision_analyzer import VisionAnalyzer
from services.gemini.readme_generator import ReadmeGenerator
from services.elevenlabs.stt import SpeechToText
from services.elevenlabs.tts import TextToSpeech


class VideoProcessor:
    """Orchestrate the entire video processing pipeline."""

    def __init__(self, project_repo: ProjectRepository, file_repo: FileRepository):
        self.project_repo = project_repo
        self.file_repo = file_repo
        self.vision_analyzer = VisionAnalyzer()
        self.readme_generator = ReadmeGenerator()
        self.speech_to_text = SpeechToText()
        self.text_to_speech = TextToSpeech()

    async def process_video(self, job_id: str, video_path: str):
        """Process video through the complete pipeline."""
        try:
            self.project_repo.set_processing_started(job_id)

            # Step 1: Transcription
            self._step_transcription(job_id, video_path)

            # Step 2: Vision analysis
            frame_analyses = self._step_vision_analysis(job_id, video_path)

            # Step 3: README generation
            self._step_readme_generation(job_id, frame_analyses)

            # Step 4: Subtitles
            self._step_subtitle_generation(job_id, video_path)

            # Step 5: Audio description
            self._step_audio_description(job_id, frame_analyses)

            self.project_repo.set_processing_completed(job_id)

        except Exception as e:
            print(f"Error processing video for job {job_id}: {e}")
            await self.project_repo.set_processing_failed(job_id, str(e))
            raise

    def _step_transcription(self, job_id: str, video_path: str):
        """Transcribe video audio."""
        try:
            self.project_repo.update_processing_step(
                job_id, "transcription", "in_progress"
            )
            transcript = self.speech_to_text.transcribe_video(video_path)
            self.project_repo.update_content(
                job_id, "subtitles", {"transcript": transcript}
            )
            self.project_repo.update_processing_step(
                job_id, "transcription", "completed"
            )
        except Exception as e:
            self.project_repo.update_processing_step(job_id, "transcription", "failed")
            raise

    def _step_vision_analysis(self, job_id: str, video_path: str) -> list:
        """Analyze video frames."""
        try:
            self.project_repo.update_processing_step(
                job_id, "vision_analysis", "in_progress"
            )
            frame_analyses = self.vision_analyzer.analyze_video(
                video_path, num_frames=5
            )

            for analysis in frame_analyses:
                screenshot_id = self.file_repo.save_screenshot(
                    image_data=analysis["frame_data"],
                    filename=f"screenshot_{analysis['timestamp']}.jpg",
                    timestamp=analysis["timestamp"],
                )
                self.project_repo.add_screenshot(
                    job_id,
                    {
                        "file_id": screenshot_id,
                        "timestamp": analysis["timestamp"],
                        "description": analysis["description"],
                    },
                )

            self.project_repo.update_processing_step(
                job_id, "vision_analysis", "completed"
            )
            return frame_analyses
        except Exception as e:
            self.project_repo.update_processing_step(
                job_id, "vision_analysis", "failed"
            )
            raise

    def _step_readme_generation(self, job_id: str, frame_analyses: list):
        """Generate README content."""
        try:
            self.project_repo.update_processing_step(
                job_id, "readme_generation", "in_progress"
            )

            project = self.project_repo.get_by_job_id(job_id)
            if not project:
                raise ValueError(f"Project not found for job_id: {job_id}")
            
            transcript = (
                project.get("content", {}).get("subtitles", {}).get("transcript", "")
            )

            tech_stack = self.vision_analyzer.identify_tech_stack(frame_analyses)
            features = self.vision_analyzer.extract_features(frame_analyses)

            frame_descriptions = [
                f"At {a['timestamp']}s: {a['description']}" for a in frame_analyses
            ]

            readme_data = self.readme_generator.generate_readme(
                project_title=project["video"]["filename"]
                .replace(".mp4", "")
                .replace("_", " ")
                .title(),
                transcript=transcript,
                tech_stack=tech_stack,
                features=features,
                frame_descriptions=frame_descriptions,
            )

            self.project_repo.update_content(job_id, "readme", readme_data)
            self.project_repo.update_submission(
                job_id,
                {
                    **readme_data["metadata"],
                    "problem_statement": "To be filled",
                    "solution": "To be filled",
                },
            )

            self.project_repo.update_processing_step(
                job_id, "readme_generation", "completed"
            )
        except Exception as e:
            self.project_repo.update_processing_step(
                job_id, "readme_generation", "failed"
            )
            raise

    def _step_subtitle_generation(self, job_id: str, video_path: str):
        """Generate subtitle files."""
        try:
            self.project_repo.update_processing_step(
                job_id, "subtitle_generation", "in_progress"
            )

            project = self.project_repo.get_by_job_id(job_id)
            transcript = (
                project.get("content", {}).get("subtitles", {}).get("transcript", "")
            )

            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps if fps > 0 else 120.0
            cap.release()

            srt_content = self.speech_to_text.generate_srt_subtitles(
                transcript, duration
            )
            srt_id = self.file_repo.save_subtitle_file(
                srt_content.encode("utf-8"), f"{job_id}.srt", "srt"
            )

            vtt_content = self.speech_to_text.generate_vtt_subtitles(
                transcript, duration
            )
            vtt_id = self.file_repo.save_subtitle_file(
                vtt_content.encode("utf-8"), f"{job_id}.vtt", "vtt"
            )

            self.project_repo.update_content(
                job_id,
                "subtitles",
                {
                    "srt_file_id": srt_id,
                    "vtt_file_id": vtt_id,
                    "transcript": transcript,
                },
            )

            self.project_repo.update_processing_step(
                job_id, "subtitle_generation", "completed"
            )
        except Exception as e:
            self.project_repo.update_processing_step(
                job_id, "subtitle_generation", "failed"
            )
            raise

    def _step_audio_description(self, job_id: str, frame_analyses: list):
        """Generate audio description."""
        try:
            self.project_repo.update_processing_step(
                job_id, "audio_description", "in_progress"
            )

            project = self.project_repo.get_by_job_id(job_id)
            transcript = (
                project.get("content", {}).get("subtitles", {}).get("transcript", "")
            )

            description_text = self.text_to_speech.create_video_audio_description(
                frame_analyses, transcript
            )

            audio_data = self.text_to_speech.generate_audio_description(
                description_text
            )
            audio_id = self.file_repo.save_audio_description(
                audio_data, f"{job_id}_description.mp3"
            )

            self.project_repo.update_content(
                job_id,
                "audio_description",
                {"file_id": audio_id, "duration": len(audio_data) / 16000},
            )

            self.project_repo.update_processing_step(
                job_id, "audio_description", "completed"
            )
        except Exception as e:
            print(f"Audio description failed (non-critical): {e}")
            self.project_repo.update_processing_step(
                job_id, "audio_description", "failed"
            )

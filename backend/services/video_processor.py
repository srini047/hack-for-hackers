"""Main video processing orchestrator using synchronous operations."""

import cv2
import os
from db.repositories.file_repository import FileRepository
from db.repositories.project_repository import ProjectRepository
from services.gemini.vision_analyzer import VisionAnalyzer
from services.cohere.readme_generator import ReadmeGenerator
from services.elevenlabs.stt import SpeechToText
from services.elevenlabs.tts import TextToSpeech


class VideoProcessor:
    """Orchestrate the entire video processing pipeline."""

    def __init__(self, project_repo: ProjectRepository, file_repo: FileRepository):
        """
        Initialize video processor.

        Args:
            project_repo: Project repository instance
            file_repo: File repository instance
        """
        self.project_repo = project_repo
        self.file_repo = file_repo

        # Initialize AI services
        self.vision_analyzer = VisionAnalyzer()
        self.readme_generator = ReadmeGenerator()
        self.speech_to_text = SpeechToText()
        self.text_to_speech = TextToSpeech()

    def process_video(self, job_id: str, video_path: str):
        """
        Process video through the complete pipeline.

        Args:
            job_id: Unique job identifier
            video_path: Path to video file
        """
        try:
            # Mark processing as started
            self.project_repo.set_processing_started(job_id)

            # Step 1: Audio extraction
            audio_path = self._step_audio_extraction(job_id, video_path)

            # Step 2: Transcription
            self._step_transcription(job_id, video_path, audio_path)

            # Step 3: Vision analysis
            frame_analyses = self._step_vision_analysis(job_id, video_path)

            # Step 4: README generation
            self._step_readme_generation(job_id, frame_analyses)

            # Step 5: Subtitles
            self._step_subtitle_generation(job_id, video_path)

            # Step 6: Audio description
            self._step_audio_description(job_id, frame_analyses)

            # Mark processing as completed
            self.project_repo.set_processing_completed(job_id)

            # Clean up temporary audio file
            if audio_path and os.path.exists(audio_path):
                try:
                    os.remove(audio_path)
                except Exception as e:
                    print(f"Warning: Could not delete temp audio file: {e}")

        except Exception as e:
            print(f"Error processing video for job {job_id}: {e}")
            self.project_repo.set_processing_failed(job_id, str(e))
            raise

    def _step_audio_extraction(self, job_id: str, video_path: str) -> str:
        """
        Extract audio from video.

        Args:
            job_id: Unique job identifier
            video_path: Path to video file

        Returns:
            Path to extracted audio file
        """
        try:
            self.project_repo.update_processing_step(
                job_id, "audio_extraction", "in_progress"
            )

            # Extract audio to temporary file
            audio_path = video_path.replace(".mp4", "_audio.mp3")
            self.speech_to_text.extract_audio_from_video(video_path, audio_path)

            self.project_repo.update_processing_step(
                job_id, "audio_extraction", "completed"
            )

            return audio_path

        except Exception as e:
            print(f"Audio extraction failed: {e}")
            self.project_repo.update_processing_step(
                job_id, "audio_extraction", "failed"
            )
            # Return None but don't raise - we can still try transcription directly
            return None

    def _step_transcription(self, job_id: str, video_path: str, audio_path: str = None):
        """
        Transcribe video audio.

        Args:
            job_id: Unique job identifier
            video_path: Path to video file
            audio_path: Optional path to extracted audio file
        """
        try:
            self.project_repo.update_processing_step(
                job_id, "transcription", "in_progress"
            )

            # Transcribe video (uses audio_path if available, otherwise extracts from video)
            if audio_path and os.path.exists(audio_path):
                transcript = self.speech_to_text.transcribe_audio(audio_path)
            else:
                transcript = self.speech_to_text.transcribe_video(video_path)

            # Store transcript in content
            self.project_repo.update_content(
                job_id, "subtitles", {"transcript": transcript}
            )

            self.project_repo.update_processing_step(
                job_id, "transcription", "completed"
            )

        except Exception as e:
            print(f"Transcription failed: {e}")
            self.project_repo.update_processing_step(job_id, "transcription", "failed")
            # Store empty transcript as fallback
            self.project_repo.update_content(
                job_id, "subtitles", {"transcript": "Transcription unavailable"}
            )

    def _step_vision_analysis(self, job_id: str, video_path: str) -> list:
        """
        Analyze video frames.

        Args:
            job_id: Unique job identifier
            video_path: Path to video file

        Returns:
            List of frame analysis results
        """
        try:
            self.project_repo.update_processing_step(
                job_id, "vision_analysis", "in_progress"
            )

            # Analyze video frames
            frame_analyses = self.vision_analyzer.analyze_video(
                video_path, num_frames=5
            )

            # Save screenshots
            for analysis in frame_analyses:
                screenshot_id = self.file_repo.save_screenshot(
                    image_data=analysis["frame_data"],
                    filename=f"screenshot_{analysis['timestamp']:.1f}s.jpg",
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
            print(f"Vision analysis failed: {e}")
            self.project_repo.update_processing_step(
                job_id, "vision_analysis", "failed"
            )
            # Return empty list to allow processing to continue
            return []

    def _step_readme_generation(self, job_id: str, frame_analyses: list):
        """
        Generate README content.

        Args:
            job_id: Unique job identifier
            frame_analyses: List of frame analysis results
        """
        try:
            self.project_repo.update_processing_step(
                job_id, "readme_generation", "in_progress"
            )

            # Get project data
            project = self.project_repo.get_by_job_id(job_id)
            transcript = (
                project.get("content", {}).get("subtitles", {}).get("transcript", "")
            )

            # Identify tech stack and features
            tech_stack = []
            features = []

            if frame_analyses:
                tech_stack = self.vision_analyzer.identify_tech_stack(frame_analyses)
                features = self.vision_analyzer.extract_features(frame_analyses)

            # Generate README
            frame_descriptions = (
                [
                    f"At {a['timestamp']:.1f}s: {a['description']}"
                    for a in frame_analyses
                ]
                if frame_analyses
                else ["Video analysis unavailable"]
            )

            video_filename = project.get("video", {}).get("filename", "Project")
            project_title = (
                video_filename.replace(".mp4", "")
                .replace("_", " ")
                .replace("-", " ")
                .title()
            )

            readme_data = self.readme_generator.generate_readme(
                project_title=project_title,
                transcript=transcript,
                tech_stack=tech_stack or ["To be added"],
                features=features or ["To be added"],
                frame_descriptions=frame_descriptions,
            )

            # Update content
            self.project_repo.update_content(job_id, "readme", readme_data)

            # Generate submission content
            submission_data = self.readme_generator.generate_submission_content(
                readme_data["metadata"], transcript
            )

            self.project_repo.update_submission(
                job_id, {**readme_data["metadata"], **submission_data}
            )

            self.project_repo.update_processing_step(
                job_id, "readme_generation", "completed"
            )

        except Exception as e:
            print(f"README generation failed: {e}")
            self.project_repo.update_processing_step(
                job_id, "readme_generation", "failed"
            )
            raise

    def _step_subtitle_generation(self, job_id: str, video_path: str):
        """
        Generate subtitle files.

        Args:
            job_id: Unique job identifier
            video_path: Path to video file
        """
        try:
            self.project_repo.update_processing_step(
                job_id, "subtitle_generation", "in_progress"
            )

            # Get transcript
            project = self.project_repo.get_by_job_id(job_id)
            transcript = (
                project.get("content", {}).get("subtitles", {}).get("transcript", "")
            )

            if not transcript or transcript == "Transcription unavailable":
                print("No valid transcript available for subtitle generation")
                self.project_repo.update_processing_step(
                    job_id, "subtitle_generation", "skipped"
                )
                return

            # Get video duration
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            duration = frame_count / fps if fps > 0 else 120.0
            cap.release()

            # Generate SRT subtitles
            srt_content = self.speech_to_text.generate_srt_subtitles(
                transcript, duration
            )
            srt_id = self.file_repo.save_subtitle_file(
                srt_content.encode("utf-8"), f"{job_id}.srt", "srt"
            )

            # Generate VTT subtitles
            vtt_content = self.speech_to_text.generate_vtt_subtitles(
                transcript, duration
            )
            vtt_id = self.file_repo.save_subtitle_file(
                vtt_content.encode("utf-8"), f"{job_id}.vtt", "vtt"
            )

            # Update content
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
            print(f"Subtitle generation failed: {e}")
            self.project_repo.update_processing_step(
                job_id, "subtitle_generation", "failed"
            )
            raise

    def _step_audio_description(self, job_id: str, frame_analyses: list):
        """
        Generate audio description.

        Args:
            job_id: Unique job identifier
            frame_analyses: List of frame analysis results
        """
        try:
            self.project_repo.update_processing_step(
                job_id, "audio_description", "in_progress"
            )

            # Get transcript
            project = self.project_repo.get_by_job_id(job_id)
            transcript = (
                project.get("content", {}).get("subtitles", {}).get("transcript", "")
            )

            # Create audio description text
            description_text = self.text_to_speech.create_video_audio_description(
                frame_analyses if frame_analyses else [], transcript
            )

            # Generate audio
            audio_data = self.text_to_speech.generate_audio_description(
                description_text
            )

            # Save audio file
            audio_id = self.file_repo.save_audio_description(
                audio_data, f"{job_id}_description.mp3"
            )

            # Update content
            self.project_repo.update_content(
                job_id,
                "audio_description",
                {
                    "file_id": audio_id,
                    "duration": len(audio_data) / 16000,  # Rough estimate
                },
            )

            self.project_repo.update_processing_step(
                job_id, "audio_description", "completed"
            )

        except Exception as e:
            print(f"Audio description generation failed (non-critical): {e}")
            self.project_repo.update_processing_step(
                job_id, "audio_description", "failed"
            )
            # Don't raise - audio description is nice-to-have, not critical

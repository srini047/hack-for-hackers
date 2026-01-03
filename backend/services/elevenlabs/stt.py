"""Speech-to-text transcription using native libraries (synchronous)."""

from typing import Optional
import os
from moviepy import VideoFileClip
from services.elevenlabs.client import ElevenLabsClient


class SpeechToText:
    """Convert speech to text from video/audio files."""

    def __init__(self):
        """Initialize speech-to-text service."""
        self.client = ElevenLabsClient()

    def extract_audio_from_video(self, video_path: str, audio_output_path: str) -> str:
        """
        Extract audio track from video.

        Args:
            video_path: Path to video file
            audio_output_path: Path for output audio file

        Returns:
            Path to extracted audio file
        """
        try:
            video = VideoFileClip(video_path)
            if video.audio is None:
                print("[SRINI] No Audio Found...")
                return audio_output_path

            video.audio.write_audiofile(
                audio_output_path, codec="mp3"
            )
            video.close()
            return audio_output_path
        except Exception as e:
            print(f"Error extracting audio: {e}")
            raise

    def transcribe_audio(self, audio_path: str) -> str:
        """
        Transcribe audio file to text.

        Note: ElevenLabs doesn't have native STT. This uses Whisper if available.

        Args:
            audio_path: Path to audio file

        Returns:
            Transcribed text
        """
        # Try using OpenAI Whisper if available
        try:
            import whisper

            print("Loading Whisper model...")
            model = whisper.load_model("base")
            print("Transcribing audio...")
            result = model.transcribe(audio_path)
            return result["text"]
        except ImportError:
            print("Whisper not available, using mock transcription")
            return self._mock_transcription()
        except Exception as e:
            print(f"Error with Whisper: {e}, using mock transcription")
            return self._mock_transcription()

    def transcribe_video(
        self, video_path: str, temp_audio_path: Optional[str] = None
    ) -> str:
        """
        Transcribe video file to text.

        Args:
            video_path: Path to video file
            temp_audio_path: Optional path for temporary audio file

        Returns:
            Transcribed text
        """
        if temp_audio_path is None:
            temp_audio_path = video_path.replace(".mp4", "_audio.mp3")

        try:
            # Extract audio
            audio_path = self.extract_audio_from_video(video_path, temp_audio_path)

            # Transcribe
            transcript = self.transcribe_audio(audio_path)

            # Clean up temp audio file
            if os.path.exists(temp_audio_path):
                os.remove(temp_audio_path)

            return transcript
        except Exception as e:
            print(f"Error transcribing video: {e}")
            # Return mock transcription as fallback
            return self._mock_transcription()

    def _mock_transcription(self) -> str:
        """
        Mock transcription for demo purposes.

        Returns:
            Mock transcript text
        """
        return """Welcome to our project demo. This application demonstrates 
an accessible solution for generating documentation from demo videos. 
It uses AI to analyze video content, extract key information, and 
create comprehensive README files with accessibility features including 
subtitles and audio descriptions. The system processes videos, generates 
documentation automatically, and ensures WCAG compliance for all users."""

    def generate_srt_subtitles(self, transcript: str, duration: float) -> str:
        """
        Generate SRT format subtitles from transcript.

        Args:
            transcript: Full transcript text
            duration: Video duration in seconds

        Returns:
            SRT formatted subtitles
        """
        # Simple subtitle generation - split by sentences
        sentences = (
            transcript.replace("? ", "?|")
            .replace(". ", ".|")
            .replace("! ", "!|")
            .split("|")
        )
        sentences = [s.strip() for s in sentences if s.strip()]

        time_per_subtitle = duration / max(len(sentences), 1)

        srt_content = []
        for i, sentence in enumerate(sentences):
            start_time = i * time_per_subtitle
            end_time = (i + 1) * time_per_subtitle

            srt_content.append(f"{i + 1}")
            srt_content.append(
                f"{self._format_time(start_time)} --> {self._format_time(end_time)}"
            )
            srt_content.append(sentence)
            srt_content.append("")  # Empty line between subtitles

        return "\n".join(srt_content)

    def generate_vtt_subtitles(self, transcript: str, duration: float) -> str:
        """
        Generate VTT format subtitles from transcript.

        Args:
            transcript: Full transcript text
            duration: Video duration in seconds

        Returns:
            VTT formatted subtitles
        """
        srt_content = self.generate_srt_subtitles(transcript, duration)

        # Convert SRT to VTT (very similar format)
        vtt_content = "WEBVTT\n\n" + srt_content

        return vtt_content

    def _format_time(self, seconds: float) -> str:
        """
        Format time for subtitles.

        Args:
            seconds: Time in seconds

        Returns:
            Formatted time string (HH:MM:SS,mmm)
        """
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        millis = int((seconds % 1) * 1000)

        return f"{hours:02d}:{minutes:02d}:{secs:02d},{millis:03d}"

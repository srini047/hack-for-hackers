"""Text-to-speech for audio descriptions using native ElevenLabs SDK."""
from io import BytesIO
from typing import Optional, Iterator
from services.elevenlabs.client import ElevenLabsClient


class TextToSpeech:
    """Generate audio descriptions using text-to-speech."""
    
    def __init__(self):
        """Initialize TTS service."""
        self.client = ElevenLabsClient()
    
    def generate_audio_description(self, description_text: str, voice_id: Optional[str] = None) -> bytes:
        """
        Generate audio description from text.
        
        Args:
            description_text: Text to convert to speech
            voice_id: Optional ElevenLabs voice ID (uses default if not provided)
        
        Returns:
            Audio data as bytes
        """
        try:
            eleven_client = self.client.get_client()
            
            # Use default voice if not specified
            if voice_id is None:
                # Get first available voice
                voices = eleven_client.voices.get_all()
                if voices.voices:
                    voice_id = voices.voices[0].voice_id
                else:
                    raise Exception("No voices available")
            
            # Generate audio using the native SDK
            audio_generator = eleven_client.text_to_speech.convert(
                text=description_text,
                voice_id=voice_id,
                model_id="eleven_multilingual_v2"
            )
            
            # Collect audio chunks
            audio_chunks = []
            
            # The generator returns an iterator of bytes
            if isinstance(audio_generator, Iterator):
                for chunk in audio_generator:
                    if isinstance(chunk, bytes):
                        audio_chunks.append(chunk)
            else:
                # If it's already bytes, just use it
                audio_chunks.append(audio_generator)
            
            audio_data = b''.join(audio_chunks)
            return audio_data
            
        except Exception as e:
            print(f"Error generating audio: {e}")
            raise
    
    def create_video_audio_description(self, frame_analyses: list, transcript: str) -> str:
        """
        Create comprehensive audio description text for video.
        
        Args:
            frame_analyses: List of frame analysis results
            transcript: Video transcript
        
        Returns:
            Audio description text
        """
        description_parts = [
            "Audio description for project demo video.",
            "",
            "Visual content:",
        ]
        
        for analysis in frame_analyses:
            timestamp = analysis.get('timestamp', 0)
            desc = analysis.get('description', '')
            description_parts.append(
                f"At {int(timestamp)} seconds: {desc}"
            )
        
        description_parts.append("")
        description_parts.append("Narration:")
        description_parts.append(transcript)
        
        return " ".join(description_parts)
    
    def generate_multiple_descriptions(self, descriptions: list, voice_id: Optional[str] = None) -> list:
        """
        Generate multiple audio descriptions.
        
        Args:
            descriptions: List of text descriptions
            voice_id: Optional voice ID
        
        Returns:
            List of audio data bytes
        """
        audio_files = []
        
        for desc in descriptions:
            try:
                audio = self.generate_audio_description(desc, voice_id)
                audio_files.append(audio)
            except Exception as e:
                print(f"Error generating audio for description: {e}")
                audio_files.append(None)
        
        return audio_files

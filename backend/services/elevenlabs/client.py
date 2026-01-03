"""ElevenLabs API client using native elevenlabs SDK."""
from elevenlabs.client import ElevenLabs
from config import settings


class ElevenLabsClient:
    """Client for ElevenLabs API using native SDK."""
    
    def __init__(self):
        """Initialize ElevenLabs client with API key."""
        self.client = ElevenLabs(api_key=settings.elevenlabs_api_key)
    
    def get_client(self) -> ElevenLabs:
        """Get the ElevenLabs client instance."""
        return self.client

"""Application configuration management."""

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # MongoDB Configuration
    mongodb_uri: str
    mongodb_db_name: str = "access_submit"

    # API Keys
    google_gemini_api_key: str
    elevenlabs_api_key: str
    cohere_api_key: str

    # Application Settings
    max_file_size_mb: int = 100
    allowed_video_formats: str = "mp4,avi,mov,mkv,webm"

    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = False

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def max_file_size_bytes(self) -> int:
        """Convert MB to bytes."""
        return self.max_file_size_mb * 1024 * 1024

    @property
    def allowed_formats_list(self) -> List[str]:
        """Get allowed video formats as a list."""
        return [fmt.strip() for fmt in self.allowed_video_formats.split(",")]


# Global settings instance
settings = Settings()  # type: ignore[call-arg]

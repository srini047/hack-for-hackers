"""Google Gemini Singleton client using google-genai SDK."""

import io
import asyncio
from typing import Optional

from google import genai
from PIL import Image

from config import settings


class GeminiClient:
    _instance = None
    _client = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            # Initialize the heavy client only once
            api_key = kwargs.get("api_key") or settings.google_gemini_api_key
            cls._instance._client = genai.Client(api_key=api_key) if api_key else genai.Client()
        return cls._instance

    def __init__(self, api_key=None, model="gemini-2.5-flash"):
        # Model can still be updated per call/re-instantiation
        self.model = model


    def generate_text(self, prompt: str) -> str:
        """Generate text from a prompt (sync)."""
        response = self._client.models.generate_content(
            model=self.model,
            contents=prompt,
        )
        return self._extract_text(response)

    def analyze_image(self, image_data: bytes, prompt: str) -> str:
        """Analyze an image with a text prompt (sync multimodal)."""
        image = Image.open(io.BytesIO(image_data)).convert("RGB")
        response = self._client.models.generate_content(
            model=self.model,
            contents=[prompt, image],
        )
        return self._extract_text(response)

    def analyze_video_frame(self, frame_data: bytes, prompt: str) -> str:
        """Alias for analyzing a single video frame."""
        return self.analyze_image(frame_data, prompt)

    async def generate_text_async(self, prompt: str) -> str:
        """Async wrapper around `generate_text` using a thread executor."""
        return await asyncio.to_thread(self.generate_text, prompt)

    async def analyze_image_async(self, image_data: bytes, prompt: str) -> str:
        """Async wrapper around `analyze_image` using a thread executor."""
        return await asyncio.to_thread(self.analyze_image, image_data, prompt)

    async def analyze_video_frame_async(self, frame_data: bytes, prompt: str) -> str:
        """Async wrapper for video frame analysis."""
        return await self.analyze_image_async(frame_data, prompt)

    @staticmethod
    def _extract_text(response) -> str:
        """Safely extract text from a Gemini response."""
        if hasattr(response, "text") and response.text:
            return response.text

        if response.candidates:
            parts = response.candidates[0].content.parts
            return "".join(part.text for part in parts if hasattr(part, "text"))

        return ""

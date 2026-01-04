"""Cohere client with rate limiting, retries, and caching."""

import os
import time
import hashlib
from typing import Optional, Dict, Any
from functools import wraps

from cohere import ClientV2

from config import settings
from constants import SSH_RETRY_ATTEMPTS, SSH_CONNECTION_TIMEOUT


class RateLimiter:
    """Simple rate limiter using token bucket algorithm."""

    def __init__(self, requests_per_minute: int = SSH_CONNECTION_TIMEOUT):
        """
        Initialize rate limiter.

        Args:
            requests_per_minute: Maximum requests allowed per minute
        """
        self.requests_per_minute = requests_per_minute
        self.min_interval = 60.0 / requests_per_minute  # Seconds between requests
        self.last_request_time = 0.0

    def wait_if_needed(self):
        """Wait if necessary to respect rate limit."""
        current_time = time.time()
        time_since_last = current_time - self.last_request_time

        if time_since_last < self.min_interval:
            wait_time = self.min_interval - time_since_last
            print(f"Rate limiting: waiting {wait_time:.2f} seconds...")
            time.sleep(wait_time)

        self.last_request_time = time.time()


class ResponseCache:
    """Simple in-memory cache for API responses."""

    def __init__(self, ttl_seconds: int = 3600):
        """
        Initialize cache.

        Args:
            ttl_seconds: Time-to-live for cache entries
        """
        self.cache: Dict[str, tuple[Any, float]] = {}
        self.ttl = ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        """Get cached value if not expired."""
        if key in self.cache:
            value, timestamp = self.cache[key]
            if time.time() - timestamp < self.ttl:
                print(f"Cache hit for key: {key[:50]}...")
                return value
            else:
                # Expired, remove it
                del self.cache[key]
        return None

    def set(self, key: str, value: Any):
        """Store value in cache with current timestamp."""
        self.cache[key] = (value, time.time())

    def clear(self):
        """Clear all cached entries."""
        self.cache.clear()

    @staticmethod
    def make_key(prompt: str, **kwargs) -> str:
        """Create cache key from prompt and parameters."""
        key_data = f"{prompt}_{sorted(kwargs.items())}"
        return hashlib.md5(key_data.encode()).hexdigest()


def retry_on_rate_limit(max_retries: int = SSH_RETRY_ATTEMPTS, base_delay: float = 2.0):
    """
    Decorator to retry function on rate limit errors with exponential backoff.

    Args:
        max_retries: Maximum number of retry attempts
        base_delay: Initial delay in seconds (doubles with each retry)
    """

    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None

            for attempt in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    error_str = str(e)

                    # Check if it's a rate limit error (429 status code)
                    if "429" in error_str or "rate limit" in error_str.lower():
                        last_exception = e

                        if attempt < max_retries:
                            # Exponential backoff: 2s, 4s, 8s, etc.
                            delay = base_delay * (2**attempt)
                            print(
                                f"Rate limit hit (attempt {attempt + 1}/{max_retries + 1}). "
                                f"Retrying in {delay:.1f} seconds..."
                            )
                            time.sleep(delay)
                        else:
                            print(
                                f"Max retries ({max_retries}) exceeded for rate limit."
                            )
                            raise
                    else:
                        # Not a rate limit error, raise immediately
                        raise

            # Should not reach here, but just in case
            if last_exception:
                raise last_exception

        return wrapper

    return decorator


class CohereClient:
    """Cohere client with rate limiting, retries, and caching."""

    _instance = None
    _client = None
    _rate_limiter = None
    _cache = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)

            # Initialize the client only once
            api_key = kwargs.get("api_key") or settings.cohere_api_key
            if not api_key:
                raise ValueError(
                    "Cohere API key is required. Set COHERE_API_KEY environment variable."
                )

            cls._instance._client = ClientV2(api_key=api_key)

            # Initialize rate limiter (conservative: 20 requests per minute)
            cls._instance._rate_limiter = RateLimiter(requests_per_minute=20)

            # Initialize cache (1 hour TTL)
            cls._instance._cache = ResponseCache(ttl_seconds=3600)

            print("✓ Cohere client initialized with rate limiting and caching")

        return cls._instance

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "command-r-plus-08-2024",
        use_cache: bool = True,
    ):
        """
        Initialize Cohere client.

        Args:
            api_key: Cohere API key (optional, uses settings if not provided)
            model: Model name to use
            use_cache: Whether to use response caching
        """
        self.model = model
        self.use_cache = use_cache

    @retry_on_rate_limit(max_retries=SSH_RETRY_ATTEMPTS, base_delay=2.0)
    def generate_text(
        self, prompt: str, temperature: float = 0.7, max_tokens: Optional[int] = None
    ) -> str:
        """
        Generate text from a prompt with rate limiting and retries.

        Args:
            prompt: Input prompt
            temperature: Generation temperature (0.0-1.0)
            max_tokens: Maximum tokens to generate

        Returns:
            Generated text
        """
        # Check cache first
        if self.use_cache:
            cache_key = ResponseCache.make_key(
                prompt, temperature=temperature, max_tokens=max_tokens
            )
            cached_response = self._cache.get(cache_key)
            if cached_response:
                return cached_response

        # Wait for rate limit
        self._rate_limiter.wait_if_needed()

        try:
            request_params = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
            }

            if max_tokens:
                request_params["max_tokens"] = max_tokens

            response = self._client.chat(**request_params)
            text = self._extract_text(response)

            # Cache the response
            if self.use_cache and text:
                self._cache.set(cache_key, text)

            return text

        except Exception as e:
            print(f"Error calling Cohere API: {e}")
            raise

    @retry_on_rate_limit(max_retries=3, base_delay=2.0)
    def generate_json(
        self,
        prompt: str,
        schema: dict,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
    ) -> dict:
        """
        Generate structured JSON response with rate limiting and retries.

        Args:
            prompt: Input prompt
            schema: JSON schema for response format
            temperature: Generation temperature
            max_tokens: Maximum tokens to generate

        Returns:
            Parsed JSON response
        """
        # Check cache first
        if self.use_cache:
            cache_key = ResponseCache.make_key(
                prompt,
                schema=str(schema),
                temperature=temperature,
                max_tokens=max_tokens,
            )
            cached_response = self._cache.get(cache_key)
            if cached_response:
                return cached_response

        # Wait for rate limit
        self._rate_limiter.wait_if_needed()

        try:
            request_params = {
                "model": self.model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
                "response_format": {"type": "json_object", "schema": schema},
            }

            if max_tokens:
                request_params["max_tokens"] = max_tokens

            response = self._client.chat(**request_params)

            # Extract and parse JSON
            import json

            text = self._extract_text(response)
            result = json.loads(text)

            # Cache the response
            if self.use_cache and result:
                self._cache.set(cache_key, result)

            return result

        except Exception as e:
            print(f"Error calling Cohere API: {e}")
            raise

    @staticmethod
    def _extract_text(response) -> str:
        """
        Extract text from Cohere response.

        Args:
            response: Cohere API response

        Returns:
            Extracted text
        """
        if hasattr(response, "message") and hasattr(response.message, "content"):
            content_blocks = response.message.content

            for block in content_blocks:
                if hasattr(block, "text"):
                    return block.text

        return ""

    def clear_cache(self):
        """Clear the response cache."""
        if self._cache:
            self._cache.clear()
            print("✓ Cache cleared")

    def get_cache_stats(self) -> dict:
        """Get cache statistics."""
        if self._cache:
            return {"entries": len(self._cache.cache), "ttl_seconds": self._cache.ttl}
        return {"entries": 0, "ttl_seconds": 0}

"""
llm_provider.py
----------------
Provider abstraction layer for talking to the LLM.

Currently configured for Google Gemini only, accessed via Gemini's
OpenAI-compatible endpoint using the official OpenAI SDK client. This
keeps the "official OpenAI SDK" dependency while talking to Gemini.

To add another provider later (e.g. Claude, or OpenAI itself):
  1. Create a new class that inherits from `BaseLLMProvider`.
  2. Implement `generate_json`.
  3. Register it in `get_llm_provider()` below.
  4. Set LLM_PROVIDER=<name> in .env.
"""

import asyncio
from abc import ABC, abstractmethod

from openai import AsyncOpenAI, APITimeoutError, APIError, APIConnectionError

from app.config import Settings, get_settings
from app.utils.exceptions import (
    MissingAPIKeyError,
    LLMRequestTimeoutError,
    LLMProviderError,
)


class BaseLLMProvider(ABC):
    """Abstract base class that all LLM provider implementations must follow."""

    @abstractmethod
    async def generate_json(self, system_prompt: str, user_prompt: str) -> str:
        raise NotImplementedError


class GeminiProvider(BaseLLMProvider):
    """
    LLM provider implementation for Google Gemini, using Gemini's
    OpenAI-compatible endpoint via the official OpenAI SDK client.
    """

    GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"

    def __init__(self, settings: Settings):
        if not settings.GEMINI_API_KEY:
            raise MissingAPIKeyError(
                "GEMINI_API_KEY is not set. Please configure it in your .env file."
            )

        self._settings = settings
        self._client = AsyncOpenAI(
            api_key=settings.GEMINI_API_KEY,
            base_url=self.GEMINI_BASE_URL,
            timeout=settings.LLM_TIMEOUT_SECONDS,
        )

    async def generate_json(self, system_prompt: str, user_prompt: str) -> str:
        """
        Calls Gemini via its OpenAI-compatible chat completions endpoint,
        with retry/backoff for transient failures.
        """
        last_error: Exception | None = None

        for attempt in range(1, self._settings.LLM_MAX_RETRIES + 2):
            try:
                response = await self._client.chat.completions.create(
                    model=self._settings.GEMINI_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.7,
                    max_tokens=4000,
                )
                content = response.choices[0].message.content
                if not content:
                    raise LLMProviderError("LLM returned an empty response.")
                return content

            except APITimeoutError as exc:
                last_error = exc
                if attempt > self._settings.LLM_MAX_RETRIES:
                    raise LLMRequestTimeoutError(
                        "The request to the LLM provider timed out."
                    ) from exc

            except (APIConnectionError, APIError) as exc:
                last_error = exc
                if attempt > self._settings.LLM_MAX_RETRIES:
                    raise LLMProviderError(
                        f"LLM provider request failed: {str(exc)}"
                    ) from exc

            await asyncio.sleep(min(2 ** attempt, 8))

        raise LLMProviderError(f"LLM provider request failed after retries: {last_error}")


def get_llm_provider(settings: Settings | None = None) -> BaseLLMProvider:
    """
    Factory function that returns the configured LLM provider instance.
    """
    settings = settings or get_settings()
    provider_name = settings.LLM_PROVIDER.lower()

    if provider_name == "gemini":
        return GeminiProvider(settings)

    raise LLMProviderError(
        f"Unsupported LLM_PROVIDER '{provider_name}'. "
        f"Supported providers: ['gemini']."
    )
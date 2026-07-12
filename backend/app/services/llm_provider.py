"""
llm_provider.py
----------------
Provider abstraction layer for talking to LLMs.

Design goal: the rest of the app (roadmap_service.py) should never know or
care which LLM vendor is actually being used. It only calls
`provider.generate_json(system_prompt, user_prompt)` and gets back a raw
string that should contain JSON.

To add a new provider (e.g. Claude or Gemini) later:
  1. Create a new class that inherits from `BaseLLMProvider`.
  2. Implement `generate_json`.
  3. Register it in `get_llm_provider()` below.
  4. Set LLM_PROVIDER=<name> in .env.

No other file in the codebase needs to change.
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
        """
        Sends the given prompts to the LLM and returns the raw text response
        (expected to be a JSON string). Implementations are responsible for
        raising the appropriate custom exception on failure/timeout.
        """
        raise NotImplementedError


class OpenAIProvider(BaseLLMProvider):
    """LLM provider implementation backed by the official OpenAI SDK."""

    def __init__(self, settings: Settings):
        if not settings.OPENAI_API_KEY:
            # Fail fast with a clear, catchable error instead of letting the
            # OpenAI SDK raise its own generic error later.
            raise MissingAPIKeyError(
                "OPENAI_API_KEY is not set. Please configure it in your .env file."
            )

        self._settings = settings
        self._client = AsyncOpenAI(
            api_key=settings.OPENAI_API_KEY,
            timeout=settings.LLM_TIMEOUT_SECONDS,
        )

    async def generate_json(self, system_prompt: str, user_prompt: str) -> str:
        """
        Calls the OpenAI Chat Completions API with JSON mode enabled (so the
        model is constrained to return valid JSON), with retry logic for
        transient failures.
        """
        last_error: Exception | None = None

        for attempt in range(1, self._settings.LLM_MAX_RETRIES + 2):  # +1 initial +1 for range
            try:
                response = await self._client.chat.completions.create(
                    model=self._settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    # Forces the model to output syntactically valid JSON.
                    response_format={"type": "json_object"},
                    temperature=0.7,
                    max_tokens=2000,
                )
                content = response.choices[0].message.content
                if not content:
                    raise LLMProviderError("LLM returned an empty response.")
                return content

            except APITimeoutError as exc:
                last_error = exc
                # Timeouts are usually not worth retrying aggressively, but
                # we allow the configured retry budget in case it was transient.
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

            # Exponential backoff before retrying.
            await asyncio.sleep(min(2 ** attempt, 8))

        # Should be unreachable, but guards against silent falls-through.
        raise LLMProviderError(f"LLM provider request failed after retries: {last_error}")


def get_llm_provider(settings: Settings | None = None) -> BaseLLMProvider:
    """
    Factory function that returns the configured LLM provider instance based
    on the LLM_PROVIDER setting.

    This is the ONLY place that needs to change to add support for new
    providers like Claude or Gemini.
    """
    settings = settings or get_settings()
    provider_name = settings.LLM_PROVIDER.lower()

    if provider_name == "openai":
        return OpenAIProvider(settings)

    # --- Placeholders for future providers ---
    # elif provider_name == "claude":
    #     return ClaudeProvider(settings)
    # elif provider_name == "gemini":
    #     return GeminiProvider(settings)

    raise LLMProviderError(
        f"Unsupported LLM_PROVIDER '{provider_name}'. "
        f"Supported providers: ['openai']."
    )
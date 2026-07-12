"""
roadmap_service.py
-------------------
Core business logic for generating a learning roadmap.

Responsibilities:
  1. Build the prompt for the given topic.
  2. Call the configured LLM provider.
  3. Parse the raw LLM output as JSON.
  4. Validate the JSON against the RoadmapResponse schema.
  5. Return a validated RoadmapResponse object to the route layer.

This module is intentionally decoupled from FastAPI so it could be reused
in a CLI tool, background worker, or tests without modification.
"""

import json
import logging

from pydantic import ValidationError

from app.config import Settings, get_settings
from app.models.schemas import RoadmapResponse
from app.prompts.roadmap_prompt import build_roadmap_prompt
from app.services.llm_provider import get_llm_provider, BaseLLMProvider
from app.utils.exceptions import InvalidLLMResponseError

logger = logging.getLogger(__name__)


class RoadmapService:
    """Encapsulates the end-to-end roadmap generation workflow."""

    def __init__(self, settings: Settings | None = None, provider: BaseLLMProvider | None = None):
        # Allow dependency injection for testing (pass a mock provider),
        # otherwise resolve the real provider from settings.
        self._settings = settings or get_settings()
        self._provider = provider or get_llm_provider(self._settings)

    async def generate_roadmap(self, topic: str) -> RoadmapResponse:
        """
        Generates and validates a roadmap for the given topic.

        Raises:
            MissingAPIKeyError, LLMRequestTimeoutError, LLMProviderError:
                propagated from the provider layer on call failure.
            InvalidLLMResponseError: if the LLM output isn't valid JSON or
                doesn't match the expected schema.
        """
        system_prompt, user_prompt = build_roadmap_prompt(topic)

        logger.info("Requesting roadmap for topic=%r from LLM provider.", topic)
        raw_content = await self._provider.generate_json(system_prompt, user_prompt)

        parsed_json = self._parse_json(raw_content)
        roadmap = self._validate_roadmap(parsed_json)

        logger.info(
            "Successfully generated roadmap for topic=%r with %d nodes and %d edges.",
            topic, len(roadmap.nodes), len(roadmap.edges),
        )
        return roadmap

    @staticmethod
    def _parse_json(raw_content: str) -> dict:
        """
        Attempts to parse the raw LLM response as JSON. Handles the common
        case where a model wraps its output in markdown code fences despite
        instructions not to.
        """
        cleaned = raw_content.strip()

        # Defensive cleanup: strip ```json ... ``` or ``` ... ``` fences if present.
        if cleaned.startswith("```"):
            cleaned = cleaned.strip("`")
            if cleaned.lower().startswith("json"):
                cleaned = cleaned[4:]
            cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as exc:
            logger.error("Failed to parse LLM response as JSON: %s", exc)
            raise InvalidLLMResponseError(
                "The AI service returned a response that was not valid JSON. "
                "Please try again."
            ) from exc

    @staticmethod
    def _validate_roadmap(data: dict) -> RoadmapResponse:
        """
        Validates the parsed JSON dict against the RoadmapResponse Pydantic
        schema, ensuring node/edge structure integrity before it's returned
        to the frontend.
        """
        try:
            return RoadmapResponse.model_validate(data)
        except ValidationError as exc:
            logger.error("LLM JSON failed schema validation: %s", exc)
            raise InvalidLLMResponseError(
                "The AI service returned data that did not match the expected "
                "roadmap structure. Please try again."
            ) from exc
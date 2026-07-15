"""
roadmap.py (routes)
--------------------
Defines the POST /generate-roadmap endpoint.

This layer is responsible ONLY for:
  - HTTP concerns (status codes, request/response wiring).
  - Catching domain exceptions raised by the service layer and translating
    them into proper HTTPException responses.

All actual business logic lives in `app.services.roadmap_service`.
"""

import logging

from fastapi import APIRouter, HTTPException, status

from app.models.schemas import RoadmapRequest, RoadmapResponse, ErrorResponse
from app.services.roadmap_service import RoadmapService
from app.utils.exceptions import (
    InvalidTopicError,
    MissingAPIKeyError,
    LLMRequestTimeoutError,
    LLMProviderError,
    InvalidLLMResponseError,
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Roadmap"])


@router.post(
    "/generate-roadmap",
    response_model=RoadmapResponse,
    status_code=status.HTTP_200_OK,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid topic input"},
        422: {"model": ErrorResponse, "description": "Invalid AI-generated JSON structure"},
        500: {"model": ErrorResponse, "description": "Missing server configuration"},
        502: {"model": ErrorResponse, "description": "LLM provider request failed"},
        504: {"model": ErrorResponse, "description": "LLM provider request timed out"},
    },
    summary="Generate a structured learning roadmap for a given topic.",
)
async def generate_roadmap(request: RoadmapRequest) -> RoadmapResponse:
    """
    Receives a topic, generates a learning roadmap via the configured LLM
    provider, validates the structure, and returns it as JSON for the
    frontend to render with React Flow.
    """
    try:
        service = RoadmapService()
        # Pydantic has already validated/sanitized `request.topic`.
        roadmap = await service.generate_roadmap(request.topic)
        return roadmap

    except InvalidTopicError as exc:
        # 400 Bad Request - the client sent an invalid topic.
        logger.warning("Invalid topic rejected: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "invalid_topic", "message": exc.message},
        )

    except MissingAPIKeyError as exc:
        # 500 Internal Server Error - this is a server misconfiguration,
        # not the client's fault.
        logger.error("Server misconfiguration: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "missing_api_key", "message": exc.message},
        )

    except LLMRequestTimeoutError as exc:
        # 504 Gateway Timeout - the upstream LLM provider took too long.
        logger.error("LLM request timed out: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail={"error": "llm_timeout", "message": exc.message},
        )

    except LLMProviderError as exc:
        # 502 Bad Gateway - the upstream LLM provider failed/errored.
        logger.error("LLM provider error: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail={"error": "llm_provider_error", "message": exc.message},
        )

    except InvalidLLMResponseError as exc:
        # 422 Unprocessable Entity - the LLM responded, but its content
        # wasn't valid/well-formed JSON matching our schema.
        logger.error("Invalid LLM response: %s", exc.message)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": "invalid_llm_response", "message": exc.message},
        )

    except Exception as exc:  # noqa: BLE001 - final safety net
        # Catch-all for any truly unexpected error so the API never leaks
        # a raw 500 stack trace to the client.
        logger.exception("Unexpected error while generating roadmap.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": "internal_server_error",
                "message": "An unexpected error occurred. Please try again later.",
            },
        ) from exc
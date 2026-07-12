"""
main.py
-------
FastAPI application entrypoint.

Run locally with:
    uvicorn app.main:app --reload

Responsibilities:
  - Instantiate the FastAPI app.
  - Configure CORS (so the React/React Flow frontend can call this API).
  - Register routers.
  - Register global exception handlers for validation errors so malformed
    requests always return a clean, consistent JSON error shape.
"""

import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.routes.roadmap import router as roadmap_router

# --- Logging setup ---
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()

# --- FastAPI app instance ---
app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API that generates structured learning roadmaps using an LLM.",
    version="1.0.0",
)

# --- CORS configuration ---
# Allows the frontend (running on a different origin, e.g. localhost:3000
# or localhost:5173) to call this API from the browser.
origins = (
    ["*"]
    if settings.CORS_ORIGINS.strip() == "*"
    else [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Route registration ---
app.include_router(roadmap_router)


# --- Global exception handler for Pydantic request validation errors ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """
    Catches request validation errors raised automatically by FastAPI
    (e.g. empty/missing "topic" field) and returns a consistent JSON error
    shape instead of FastAPI's default verbose error format.
    """
    logger.warning("Request validation failed: %s", exc.errors())

    # Extract a human-readable summary of the first validation error.
    first_error = exc.errors()[0] if exc.errors() else {}
    message = first_error.get("msg", "Invalid request payload.")

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"error": "invalid_request", "message": message},
    )


# --- Health check endpoint ---
@app.get("/health", tags=["Health"])
async def health_check() -> dict:
    """Simple health check endpoint to verify the server is running."""
    return {"status": "ok", "service": settings.APP_NAME}


# --- Root endpoint ---
@app.get("/", tags=["Health"])
async def root() -> dict:
    """Root endpoint with basic API info."""
    return {
        "message": "Learn Anything backend is running.",
        "docs": "/docs",
        "endpoint": "POST /generate-roadmap",
    }
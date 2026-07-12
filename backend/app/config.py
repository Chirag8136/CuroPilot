"""
config.py
----------
Centralized application configuration.

Loads environment variables (API keys, model names, timeouts, etc.) using
python-dotenv + pydantic-settings so the rest of the codebase never touches
os.environ directly. This makes it trivial to swap providers (OpenAI ->
Claude -> Gemini) later by just changing environment variables, with no
code changes required in routes/services.
"""

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Typed application settings, populated from environment variables
    (or a local .env file during development).
    """

    # --- LLM Provider Selection ---
    # Which provider to use: "openai" (default), "claude", or "gemini".
    # This allows swapping providers later without touching business logic.
    LLM_PROVIDER: str = "openai"

    # --- OpenAI Settings ---
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"

    # --- Future providers (kept here so switching is just env-var driven) ---
    CLAUDE_API_KEY: str | None = None
    CLAUDE_MODEL: str = "claude-sonnet-4-6"

    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-1.5-pro"

    # --- General app settings ---
    APP_NAME: str = "Learn Anything Backend"
    ENVIRONMENT: str = "development"  # development | production
    LLM_TIMEOUT_SECONDS: int = 30
    LLM_MAX_RETRIES: int = 2

    # CORS - comma separated origins, "*" allows all (dev only)
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    """
    Returns a cached Settings instance so we don't re-parse environment
    variables on every request. FastAPI's dependency injection can use
    this directly: `settings: Settings = Depends(get_settings)`.
    """
    return Settings()
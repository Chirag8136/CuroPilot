"""
exceptions.py
-------------
Custom exception hierarchy for the application.

Using dedicated exception classes (instead of raising generic Exceptions
or HTTPExceptions deep inside services) keeps the service layer
framework-agnostic. The route layer is responsible for catching these
and translating them into proper HTTP responses with correct status codes.
"""


class AppBaseException(Exception):
    """Base class for all application-specific exceptions."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


class InvalidTopicError(AppBaseException):
    """Raised when the user-provided topic is empty, too short, or invalid."""
    pass


class MissingAPIKeyError(AppBaseException):
    """Raised when the required LLM provider API key is not configured."""
    pass


class LLMRequestTimeoutError(AppBaseException):
    """Raised when the call to the LLM provider exceeds the configured timeout."""
    pass


class LLMProviderError(AppBaseException):
    """Raised when the LLM provider API call fails (network error, 5xx, rate limit, etc.)."""
    pass


class InvalidLLMResponseError(AppBaseException):
    """Raised when the LLM does not return valid/strict JSON, or JSON that
    doesn't match the expected roadmap schema."""
    pass
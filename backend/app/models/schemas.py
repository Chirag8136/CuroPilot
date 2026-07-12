"""
schemas.py
----------
Pydantic models (schemas) used for:
  1. Validating incoming API requests.
  2. Validating the structured JSON returned by the LLM.
  3. Serializing the final API response back to the frontend.

Keeping these in one place gives us a single source of truth for the
"roadmap" data contract shared between backend and frontend (React Flow).
"""

import re
from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Request Schemas
# ---------------------------------------------------------------------------

class RoadmapRequest(BaseModel):
    """
    Schema for the incoming POST /generate-roadmap request body.

    Example:
        {"topic": "Machine Learning"}
    """

    topic: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="The topic the user wants a learning roadmap for.",
    )

    @field_validator("topic")
    @classmethod
    def validate_topic(cls, value: str) -> str:
        """
        Validates that the topic is not empty/whitespace-only and does not
        contain obviously invalid content (e.g. only special characters).
        Strips leading/trailing whitespace and normalizes internal spacing.
        """
        cleaned = value.strip()

        if not cleaned:
            raise ValueError("Topic cannot be empty or whitespace only.")

        # Reject topics made up entirely of non-alphanumeric characters
        # (e.g. "!!!", "----", "???") since these can't produce a meaningful
        # roadmap.
        if not re.search(r"[a-zA-Z0-9]", cleaned):
            raise ValueError("Topic must contain at least one letter or number.")

        # Collapse multiple internal whitespace characters into a single space.
        cleaned = re.sub(r"\s+", " ", cleaned)

        return cleaned


# ---------------------------------------------------------------------------
# Roadmap Data Schemas (also used to validate LLM output)
# ---------------------------------------------------------------------------

class RoadmapNode(BaseModel):
    """A single learning step / topic node in the roadmap graph."""

    id: str = Field(..., min_length=1, description="Unique identifier for this node.")
    title: str = Field(..., min_length=1, description="Short title of the concept/step.")
    description: str = Field(..., min_length=1, description="Explanation of what this step covers.")
    reading: str = Field(..., description="A recommended article, doc, or resource to read.")
    youtube: str = Field(..., description="A recommended YouTube search query or video topic.")
    project: str = Field(..., description="A hands-on mini project to reinforce this step.")


class RoadmapEdge(BaseModel):
    """A directed connection between two nodes (source -> target)."""

    source: str = Field(..., min_length=1, description="ID of the source node.")
    target: str = Field(..., min_length=1, description="ID of the target node.")


class RoadmapResponse(BaseModel):
    """
    The full roadmap returned to the frontend, ready to be visualized
    with React Flow (nodes + edges).
    """

    nodes: list[RoadmapNode] = Field(..., min_length=1, description="List of roadmap nodes.")
    edges: list[RoadmapEdge] = Field(default_factory=list, description="List of directed edges between nodes.")

    @field_validator("edges")
    @classmethod
    def validate_edges_reference_existing_nodes(cls, edges: list[RoadmapEdge], info) -> list[RoadmapEdge]:
        """
        Ensures every edge references node IDs that actually exist in `nodes`.
        This prevents the frontend (React Flow) from crashing on dangling
        edge references.
        """
        nodes = info.data.get("nodes")
        if nodes is None:
            # nodes failed validation already; skip edge cross-check.
            return edges

        valid_ids = {node.id for node in nodes}
        for edge in edges:
            if edge.source not in valid_ids or edge.target not in valid_ids:
                raise ValueError(
                    f"Edge ({edge.source} -> {edge.target}) references a node ID "
                    f"that does not exist in the nodes list."
                )
        return edges


# ---------------------------------------------------------------------------
# Error Response Schema
# ---------------------------------------------------------------------------

class ErrorResponse(BaseModel):
    """Standardized error response shape returned for all handled errors."""

    error: str = Field(..., description="Short machine-readable error code.")
    message: str = Field(..., description="Human-readable explanation of what went wrong.")
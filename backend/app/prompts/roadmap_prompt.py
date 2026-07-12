"""
roadmap_prompt.py
------------------
Builds the prompt sent to the LLM for roadmap generation.

Keeping prompt construction in its own module (separate from the service
that calls the LLM) makes it easy to:
  - Tweak prompt wording without touching networking/business logic.
  - Reuse the same prompt across different providers (OpenAI/Claude/Gemini).
  - Version/test prompts independently.
"""

# The system prompt instructs the model on its role and the STRICT output
# contract. We repeat "ONLY valid JSON" multiple times and forbid markdown
# fences because LLMs frequently wrap JSON in ```json blocks otherwise.
SYSTEM_PROMPT = """You are an expert curriculum designer and learning-path architect.
Your job is to generate a structured, beginner-to-advanced learning roadmap for any topic
a user provides.

You MUST respond with ONLY valid JSON. Do not include any explanations, markdown
formatting, code fences, or text before or after the JSON. Your entire response
must be a single valid JSON object that can be parsed directly with `json.loads`.

The JSON object MUST follow this exact structure:

{
  "nodes": [
    {
      "id": "1",
      "title": "string - short concept name",
      "description": "string - 1-3 sentence explanation of the concept",
      "reading": "string - a recommended resource, article title, or documentation to read",
      "youtube": "string - a recommended YouTube search query or video topic",
      "project": "string - a small hands-on project idea to practice this concept"
    }
  ],
  "edges": [
    {
      "source": "1",
      "target": "2"
    }
  ]
}

Rules:
1. Generate between 6 and 12 nodes representing a logical learning progression from
   beginner to advanced for the given topic.
2. Node "id" values must be unique strings ("1", "2", "3", ...).
3. Edges must form a connected, logical learning path (source -> target) and every
   edge must reference node IDs that exist in "nodes". Branching (a node with
   multiple children) is allowed if it makes pedagogical sense.
4. Do not include any node or edge fields other than the ones specified above.
5. Do not wrap the JSON in markdown code fences (no ```json).
6. Do not include comments, trailing commas, or any non-JSON text.
7. Output must be directly parseable by a strict JSON parser.
"""

# The user prompt template is intentionally minimal since all formatting
# rules already live in the system prompt.
USER_PROMPT_TEMPLATE = """Generate a complete learning roadmap for the topic: "{topic}".

Remember: respond with ONLY the raw JSON object, nothing else."""


def build_roadmap_prompt(topic: str) -> tuple[str, str]:
    """
    Builds the (system_prompt, user_prompt) pair for a given topic.

    Args:
        topic: The sanitized topic string provided by the user.

    Returns:
        A tuple of (system_prompt, user_prompt) ready to be sent to the LLM.
    """
    user_prompt = USER_PROMPT_TEMPLATE.format(topic=topic)
    return SYSTEM_PROMPT, user_prompt
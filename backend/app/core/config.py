import os
from typing import List


def _parse_allowed_origins(raw_value: str) -> List[str]:
    candidates = [origin.strip() for origin in raw_value.split(",")]
    return [origin for origin in candidates if origin]

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
GMAIL_CLIENT_ID = os.getenv("GMAIL_CLIENT_ID")
APIFY_API_TOKEN = os.getenv("APIFY_API_TOKEN")
APP_NAME: str = os.getenv("APP_NAME", "BingChilling API")
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))
ALLOWED_ORIGINS: List[str] = _parse_allowed_origins(os.getenv("ALLOWED_ORIGINS", "")) 
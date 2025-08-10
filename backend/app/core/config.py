import os
from typing import List


def _parse_allowed_origins(raw_value: str) -> List[str]:
    candidates = [origin.strip() for origin in raw_value.split(",")]
    return [origin for origin in candidates if origin]

OPENAI_API_KEY='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'

GMAIL_CLIENT_ID='959925069015-nq5pf6vksi1jcr29u078f8l9oh8helo9.apps.googleusercontent.com'
APIFY_API_TOKEN='apify_api_Jiz6wgIgEHrGmbmSJo6uYecG2qzQCZ3HpnlR'
APP_NAME: str = os.getenv("APP_NAME", "BingChilling API")
ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
API_V1_STR: str = os.getenv("API_V1_STR", "/api/v1")
HOST: str = os.getenv("HOST", "0.0.0.0")
PORT: int = int(os.getenv("PORT", "8000"))
ALLOWED_ORIGINS: List[str] = _parse_allowed_origins(os.getenv("ALLOWED_ORIGINS", "")) 
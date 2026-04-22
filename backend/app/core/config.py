from pydantic_settings import BaseSettings
from typing import Optional
import os
import base64
import httpx


class Settings(BaseSettings):
    DATABASE_URL: str
    GOOGLE_SHEETS_CREDENTIALS_JSON: Optional[str] = None
    GOOGLE_SHEETS_CREDENTIALS_B64: Optional[str] = None
    GOOGLE_SHEETS_API_KEY: Optional[str] = None
    CLAUDE_API_KEY: Optional[str] = None
    ANTHROPIC_MODEL: str = "claude-sonnet-4-6"
    OLLAMA_MODEL: str = "qwen3:14b"
    SPREADSHEET_ID: str = "1YnZEEqJG-p7PIEbIVtccCkfFJHrCDhu6QaxLPOmXRA4"
    SCHEDULER_HOURS: int = 1

    # CORS
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: str = "http://localhost:3000"
    AUTH_TOKEN_SECRET: str = "change-me-in-production"
    APP_ENV: str = "development"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()


def get_ollama_url() -> str:
    return os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")


def get_cors_origins() -> list[str]:
    configured = [item.strip() for item in settings.CORS_ORIGINS.split(",") if item.strip()]
    if settings.FRONTEND_URL and settings.FRONTEND_URL not in configured:
        configured.append(settings.FRONTEND_URL)
    if "http://localhost:3000" not in configured:
        configured.append("http://localhost:3000")
    return configured


# Decode Google credentials if provided as base64
if settings.GOOGLE_SHEETS_CREDENTIALS_B64:
    try:
        decoded = base64.b64decode(settings.GOOGLE_SHEETS_CREDENTIALS_B64).decode(
            "utf-8"
        )
        os.environ["GOOGLE_APPLICATION_CREDENTIALS_JSON"] = decoded
    except Exception:
        pass

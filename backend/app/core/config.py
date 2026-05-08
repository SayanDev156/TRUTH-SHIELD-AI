from functools import lru_cache
from pathlib import Path
from typing import List

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "TruthShield AI"
    api_prefix: str = "/api"
    database_url: str = "sqlite:///./truthshield.db"
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 120
    # Allow common local dev ports used by the frontend (3000, 3001, 3002)
    # and loopback variants so CORS does not block local development.
    cors_origins: str = "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002"
    mongodb_uri: str = ""
    mongodb_database: str = "truthshield"
    frontend_url: str = "http://localhost:3000"
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/auth/google/callback"
    allowed_upload_types: str = "image/png,image/jpeg,image/webp,video/mp4,video/webm,audio/mpeg,audio/wav,audio/mp3"
    max_upload_mb: int = 25

    @property
    def cors_origin_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def allowed_upload_type_list(self) -> List[str]:
        return [item.strip() for item in self.allowed_upload_types.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()

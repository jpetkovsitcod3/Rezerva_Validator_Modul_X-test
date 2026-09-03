from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    app_name: str = "BRIDGE Modul - X"
    app_version: str = "2.1.0"
    debug: bool = True
    secret_key: str = "change-me-in-production"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    workers: int = 4

    # Database
    database_url: str = "sqlite+aiosqlite:///./emailval.db"

    # Redis
    redis_url: str = "redis://localhost:6379/0"
    redis_cache_ttl: int = 86400  # 24 hours

    # Upstash Developer API (for provisioning/managing Redis databases)
    upstash_management_key: str = ""
    upstash_account_email: str = ""

    # CORS
    cors_origins: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173"
    ]

    # Validation
    smtp_timeout: int = 10
    dns_timeout: int = 5
    max_bulk_emails: int = 10000
    rate_limit_per_minute: int = 60
    bulk_sync_chunk_size: int = 50  # Process this many emails at a time in sync mode

    # Proxy
    use_proxies: bool = False
    proxy_list: List[str] = []

    # Celery
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/2"

    # Supabase (Postgres + PostgREST)
    supabase_url: str = ""
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""
    enable_db_persistence: bool = True

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)


settings = Settings()

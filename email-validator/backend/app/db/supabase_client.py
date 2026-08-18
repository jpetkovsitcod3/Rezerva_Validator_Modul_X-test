"""
Lazy singleton Supabase client.

The backend authenticates with the service_role key (bypasses RLS),
which is safe because the key never leaves the server. The browser /
frontend should use the anon (or publishable) key with RLS policies —
see supabase/schema.sql.
"""
import httpx
import structlog

from ..config import settings

logger = structlog.get_logger()

_client = None


def get_supabase():
    """Return the shared Supabase client, creating it on first use."""
    global _client
    if _client is None:
        if not settings.supabase_configured:
            raise RuntimeError(
                "Supabase is not configured. Set SUPABASE_URL and "
                "SUPABASE_SERVICE_ROLE_KEY in the backend .env file."
            )
        from supabase import create_client

        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
        logger.info("supabase_client_created", url=settings.supabase_url)
    return _client


def reset_supabase():
    """Drop the cached client (useful in tests)."""
    global _client
    _client = None


async def supabase_ping() -> dict:
    """
    Verify Supabase connectivity and schema readiness.

    Returns a dict:
      {configured, reachable, tables_ready, detail}

    reachable    -> REST API answered with the service-role key
    tables_ready -> public.validation_results exists (schema applied)
    """
    if not settings.supabase_configured:
        return {
            "configured": False,
            "reachable": False,
            "tables_ready": False,
            "detail": "Supabase not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)",
        }

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                f"{settings.supabase_url.rstrip('/')}/rest/v1/validation_results",
                headers={
                    "apikey": settings.supabase_service_role_key,
                    "Authorization": f"Bearer {settings.supabase_service_role_key}",
                    "Range": "0-0",
                },
                params={"select": "id"},
            )
    except httpx.HTTPError as exc:
        return {
            "configured": True,
            "reachable": False,
            "tables_ready": False,
            "detail": f"Network error: {exc}",
        }

    if resp.status_code == 200:
        return {"configured": True, "reachable": True, "tables_ready": True,
                "detail": "Connected — schema ready"}
    if resp.status_code == 404:
        return {"configured": True, "reachable": True, "tables_ready": False,
                "detail": "Connected but schema missing — run supabase/schema.sql "
                          "in the Supabase SQL editor"}
    if resp.status_code == 401:
        return {"configured": True, "reachable": True, "tables_ready": False,
                "detail": "Service-role key rejected (401)"}
    return {"configured": True, "reachable": True, "tables_ready": False,
            "detail": f"Unexpected response {resp.status_code}"}

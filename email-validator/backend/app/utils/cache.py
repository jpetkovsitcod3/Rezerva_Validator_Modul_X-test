import time
from typing import Optional
from ..config import settings

# Redis is optional at import-time so the API runs without it.
try:
    import redis.asyncio as aioredis
    _HAS_REDIS = True
except Exception:  # pragma: no cover - redis not installed
    aioredis = None
    _HAS_REDIS = False

_redis_client: Optional[object] = None

# In-memory TTL fallback cache: {key: (value, expires_at)}
_memory_cache: dict = {}


async def get_redis():
    """Lazily create a shared Redis client (returns None if unavailable)."""
    global _redis_client
    if not _HAS_REDIS:
        return None
    if _redis_client is None:
        try:
            _redis_client = aioredis.from_url(
                settings.redis_url,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2
            )
            await _redis_client.ping()
        except Exception:
            _redis_client = None
    return _redis_client


def _memory_get(key: str) -> Optional[str]:
    item = _memory_cache.get(key)
    if item is None:
        return None
    value, expires = item
    if time.time() > expires:
        _memory_cache.pop(key, None)
        return None
    return value


def _memory_set(key: str, value: str, ttl: int):
    _memory_cache[key] = (value, time.time() + ttl)
    # keep cache bounded
    if len(_memory_cache) > 20000:
        now = time.time()
        for k in [k for k, (_, exp) in _memory_cache.items() if exp < now]:
            _memory_cache.pop(k, None)


async def get_cache(key: str) -> Optional[str]:
    try:
        client = await get_redis()
        if client is not None:
            return await client.get(key)
    except Exception:
        pass
    return _memory_get(key)


async def set_cache(key: str, value: str, ttl: int = 86400):
    try:
        client = await get_redis()
        if client is not None:
            await client.setex(key, ttl, value)
            return
    except Exception:
        pass
    _memory_set(key, value, ttl)

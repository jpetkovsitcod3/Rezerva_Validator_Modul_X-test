"""
Layer 5: Catch-all domain detection helper.

The heavy lifting lives in smtp_verify.AsyncSMTPVerifier.check_catch_all;
this module provides a thin convenience wrapper plus a cached in-memory
cache so repeated probes of the same domain are avoided.
"""
from typing import Tuple
import asyncio
from ..models import CatchAllResult
from .smtp_verify import smtp_verifier

# Simple TTL cache: {domain: (is_catch_all, confidence, expires_at)}
_catchall_cache: dict = {}
_CACHE_TTL_SECONDS = 3600  # 1 hour


async def check_catch_all(
    domain: str,
    mx_host: str,
    force: bool = False
) -> CatchAllResult:
    """Layer 5: detect catch-all via gibberish mailbox probe."""
    cached = _catchall_cache.get(domain)
    if not force and cached:
        is_catch_all, confidence, _ = cached
        return CatchAllResult(is_catch_all=is_catch_all, confidence=confidence)

    try:
        is_catch_all, confidence = await asyncio.wait_for(
            smtp_verifier.check_catch_all(domain, mx_host),
            timeout=20
        )
        import time
        _catchall_cache[domain] = (is_catch_all, confidence, time.time())
        return CatchAllResult(is_catch_all=is_catch_all, confidence=confidence)
    except Exception as e:
        return CatchAllResult(is_catch_all=False, error=str(e))

"""API middleware: request logging and timing helpers.

Rate limiting and CORS are wired directly in main.py; this module
provides a reusable timing/logging middleware.
"""
import time
import structlog
from fastapi import Request

logger = structlog.get_logger()


class RequestLogger:
    """ASGI-style timing/logging helper used from main.py middleware."""

    @staticmethod
    async def __call__(request: Request, call_next):
        start = time.monotonic()
        response = await call_next(request)
        elapsed = (time.monotonic() - start) * 1000
        response.headers["X-Process-Time"] = f"{elapsed:.2f}ms"
        logger.info(
            "request",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            ms=round(elapsed, 2)
        )
        return response

from fastapi import APIRouter, HTTPException, Request, Query
from fastapi.responses import JSONResponse
import json, time

from ..models import (
    SingleEmailRequest, BulkEmailRequest,
    ValidationResult, BulkValidationResponse,
    TaskStatusResponse
)
from ..validator.engine import engine
from ..utils.cache import get_cache, set_cache
from ..config import settings

router = APIRouter()


# ---- Single Email Validation --------------------------------------
@router.post(
    "/validate/single",
    response_model=ValidationResult,
    summary="Validate a single email address",
    tags=["Validation"]
)
async def validate_single(
    request: SingleEmailRequest,
    deep: bool = Query(default=True, description="Enable SMTP verification (slower but more accurate)")
):
    """
    Full 7-layer email validation:
    Syntax → DNS → MX → Disposable → Catch-All → SMTP → Score
    """
    email = request.email

    # Check cache first
    cache_key = f"val:{email}:{'deep' if deep else 'fast'}"
    cached = await get_cache(cache_key)
    if cached:
        result = ValidationResult(**json.loads(cached))
        return result

    # Run full validation
    result = await engine.validate(email, deep=deep)

    # Cache the result
    await set_cache(cache_key, result.model_dump_json(), ttl=settings.redis_cache_ttl)

    return result


# ---- Bulk Email Validation ----------------------------------------
@router.post(
    "/validate/bulk",
    response_model=BulkValidationResponse,
    summary="Validate multiple email addresses (async)",
    tags=["Validation"]
)
async def validate_bulk(request: BulkEmailRequest):
    """
    Async bulk validation. Returns a task_id.
    Poll /validate/bulk/status/{task_id} for results.
    """
    try:
        from ..tasks.celery_tasks import bulk_validate_task
        task = bulk_validate_task.delay(request.emails, request.webhook_url)
        return BulkValidationResponse(
            task_id=task.id,
            status="processing",
            total=len(request.emails),
            message=f"Processing {len(request.emails)} emails. Poll /validate/bulk/status/{task.id}"
        )
    except Exception:
        # Fallback: synchronous for small lists if Celery unavailable
        if len(request.emails) <= 100:
            import asyncio
            tasks = [engine.validate(email, deep=False) for email in request.emails[:100]]
            results = await asyncio.gather(*tasks, return_exceptions=True)
            valid_results = [r for r in results if isinstance(r, ValidationResult)]
            return JSONResponse(content={
                "task_id": "sync",
                "status": "completed",
                "total": len(request.emails),
                "results": [r.model_dump() for r in valid_results]
            })
        raise HTTPException(
            status_code=503,
            detail="Celery worker not available for large bulk jobs"
        )


@router.get("/validate/bulk/status/{task_id}", response_model=TaskStatusResponse, tags=["Validation"])
async def get_bulk_status(task_id: str):
    """Poll the status of a bulk validation task."""
    if task_id == "sync":
        return TaskStatusResponse(task_id=task_id, status="completed")
    try:
        from celery.result import AsyncResult
        result = AsyncResult(task_id)
        return TaskStatusResponse(
            task_id=task_id,
            status=result.status.lower(),
            results=result.result if result.ready() else None
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Task not found: {str(e)}")


# ---- Domain Info ---------------------------------------------------
@router.get("/domain/{domain}", summary="Get full DNS/authentication info for a domain", tags=["Domain"])
async def get_domain_info(domain: str):
    """Get MX, SPF, DMARC, DKIM records for a domain."""
    from ..validator.dns_check import check_dns
    result = await check_dns(domain, timeout=settings.dns_timeout)
    return result


# ---- Quick Check (Syntax + DNS only, no SMTP) ---------------------
@router.get("/validate/quick/{email}", summary="Quick syntax + DNS check (no SMTP)", tags=["Validation"])
async def quick_validate(email: str):
    """Syntax + DNS only. Fast. No SMTP probe."""
    result = await engine.validate(email, deep=False)
    return result


# ---- Health Check --------------------------------------------------
@router.get("/health", tags=["System"])
async def health():
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "timestamp": time.time()
    }


# ---- Stats ---------------------------------------------------------
@router.get("/stats", tags=["System"])
async def stats():
    from ..validator.proxy_engine import proxy_pool
    return {
        "proxy_pool": proxy_pool.stats,
        "version": settings.app_version
    }

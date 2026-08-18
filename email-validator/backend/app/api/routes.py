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
from ..db import repo

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

    # Persist to Supabase (best-effort)
    if settings.enable_db_persistence:
        repo.save_validation_result(result)

    return result


# ---- Bulk Email Validation ----------------------------------------
@router.post(
    "/validate/bulk",
    summary="Validate multiple email addresses (async)",
    tags=["Validation"]
)
async def validate_bulk(request: BulkEmailRequest):
    """
    Async bulk validation. Returns a task_id.
    Poll /validate/bulk/status/{task_id} for results.

    Uses Celery when Redis is available; otherwise falls back to a
    synchronous pass for small batches (≤100 emails).
    """
    # Only use Celery when the broker is actually reachable — otherwise
    # .delay() would block retrying the Redis connection.
    try:
        from ..utils.cache import redis_available
        use_celery = await redis_available()
    except Exception:
        use_celery = False

    if use_celery:
        try:
            from ..tasks.celery_tasks import bulk_validate_task
            task = bulk_validate_task.delay(request.emails, request.webhook_url)
            # Record the job in Supabase so it can be tracked across restarts
            if settings.enable_db_persistence:
                repo.create_bulk_job(task.id, request.emails)
            return BulkValidationResponse(
                task_id=task.id,
                status="processing",
                total=len(request.emails),
                message=f"Processing {len(request.emails)} emails. Poll /validate/bulk/status/{task.id}"
            )
        except Exception as exc:
            print(f"[BULK] Celery unavailable ({exc}) — using synchronous fallback.")

    # Synchronous fallback for small lists
    if len(request.emails) <= 100:
        import asyncio
        tasks = [engine.validate(email, deep=False) for email in request.emails[:100]]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        valid_results = [r for r in results if isinstance(r, ValidationResult)]
        if settings.enable_db_persistence:
            repo.finish_bulk_job("sync", [r.model_dump() for r in valid_results])
        return JSONResponse(content={
            "task_id": "sync",
            "status": "completed",
            "total": len(request.emails),
            "message": f"Processed {len(request.emails)} emails synchronously",
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

    from ..utils.cache import redis_available
    if not await redis_available():
        # Redis down → fall back to Supabase job tracking (never hang on the backend)
        if settings.enable_db_persistence:
            job = repo.get_bulk_job(task_id)
            if job:
                return TaskStatusResponse(
                    task_id=task_id,
                    status=job.get("status", "unknown"),
                    progress=job.get("processed"),
                    total=job.get("total"),
                    results=job.get("results") or None
                )
        raise HTTPException(status_code=404, detail=f"Task not found: {task_id}")

    try:
        from celery.result import AsyncResult
        result = AsyncResult(task_id)
        payload = {
            "task_id": task_id,
            "status": result.status.lower(),
        }
        if result.ready():
            payload["results"] = result.result if isinstance(result.result, list) else []
            # Persist finished job so it survives worker restarts
            if settings.enable_db_persistence:
                repo.finish_bulk_job(task_id, payload["results"])
        return TaskStatusResponse(**payload)
    except Exception as e:
        # Fallback: read job progress from Supabase
        if settings.enable_db_persistence:
            job = repo.get_bulk_job(task_id)
            if job:
                return TaskStatusResponse(
                    task_id=task_id,
                    status=job.get("status", "unknown"),
                    progress=job.get("processed"),
                    total=job.get("total"),
                    results=job.get("results") or None
                )
        raise HTTPException(status_code=404, detail=f"Task not found: {str(e)}")


# ---- Domain Info ---------------------------------------------------
@router.get("/domain/{domain}", summary="Get full DNS/authentication info for a domain", tags=["Domain"])
async def get_domain_info(domain: str):
    """Get MX, SPF, DMARC, DKIM records for a domain."""
    from ..validator.dns_check import check_dns
    result = await check_dns(domain, timeout=settings.dns_timeout)
    if settings.enable_db_persistence:
        repo.save_domain_record(domain, result)
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
    db = await repo.db_status()
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "database": db,
        "timestamp": time.time()
    }


# ---- Database Status ------------------------------------------------
@router.get("/db/status", tags=["System"], response_model=dict)
async def db_status_endpoint():
    """Supabase connectivity + schema readiness."""
    return await repo.db_status()


# ---- History --------------------------------------------------------
@router.get("/history", tags=["Validation"])
async def get_history(limit: int = Query(default=50, ge=1, le=500)):
    """Most recent validations persisted in Supabase (newest first)."""
    return repo.get_validation_history(limit=limit)


# ---- Stats ---------------------------------------------------------
@router.get("/stats", tags=["System"])
async def stats():
    from ..validator.proxy_engine import proxy_pool
    db_stats = repo.get_stats()
    return {
        "proxy_pool": proxy_pool.stats,
        "database": db_stats,
        "version": settings.app_version
    }

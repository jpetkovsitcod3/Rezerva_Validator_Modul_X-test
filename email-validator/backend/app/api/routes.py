from fastapi import APIRouter, HTTPException, Request, Query, BackgroundTasks
from fastapi.responses import JSONResponse
import json, time
import asyncio

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


async def process_bulk_sync(emails: list, webhook_url: str = None) -> dict:
    """
    Process bulk validation synchronously in chunks.
    Used when Celery is unavailable.
    """
    results = []
    total = len(emails)
    chunk_size = settings.bulk_sync_chunk_size  # Configurable chunk size
    
    for i in range(0, total, chunk_size):
        chunk = emails[i:i + chunk_size]
        tasks = [engine.validate(email, deep=False) for email in chunk]
        chunk_results = await asyncio.gather(*tasks, return_exceptions=True)
        
        for email, result in zip(chunk, chunk_results):
            if isinstance(result, ValidationResult):
                results.append(result.model_dump())
            else:
                # Handle exceptions
                results.append({
                    "email": email,
                    "error": str(result) if result else "Unknown error",
                    "status": "error"
                })
    
    # Webhook notification if provided
    if webhook_url:
        import httpx
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.post(webhook_url, json={"results": results})
        except Exception:
            pass
    
    return results


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
    synchronous pass (now supports any batch size).
    """
    print(f"[BULK] Received bulk validation request for {len(request.emails)} emails")
    
    # Only use Celery when the broker is actually reachable — otherwise
    # .delay() would block retrying the Redis connection.
    try:
        from ..utils.cache import redis_available
        use_celery = await redis_available()
        print(f"[BULK] Redis available: {use_celery}")
    except Exception as e:
        print(f"[BULK] Redis check failed: {str(e)}")
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

    # Synchronous fallback for any size list (removed ≤100 limit)
    print(f"[BULK] Processing {len(request.emails)} emails synchronously (Celery unavailable)")
    results = await process_bulk_sync(request.emails, request.webhook_url)
    
    if settings.enable_db_persistence:
        repo.finish_bulk_job("sync", results)
    
    return JSONResponse(content={
        "task_id": "sync",
        "status": "completed",
        "total": len(request.emails),
        "message": f"Processed {len(request.emails)} emails synchronously (Celery unavailable)",
        "results": results
    })


@router.get("/validate/bulk/status/{task_id}", response_model=TaskStatusResponse, tags=["Validation"])
async def get_bulk_status(task_id: str):
    """Poll the status of a bulk validation task."""
    from ..utils.cache import redis_available

    def _row_to_result(row):
        """Best-effort coercion of a stored/fallback row into a ValidationResult."""
        if row is None or not isinstance(row, dict):
            return None
        if "scoring" not in row and "score" in row:
            row = {
                **row,
                "status": row.get("status") or "unknown",
                "scoring": {
                    "score": row.get("score") or 0,
                    "risk_level": row.get("risk_level") or "low",
                },
            }
        try:
            return ValidationResult(**row)
        except Exception:
            return None

    def _normalize_results(raw):
        rows = raw if isinstance(raw, list) else []
        results = [r for r in (_row_to_result(row) for row in rows) if r is not None]
        return results or None  # None when absent → serialized as "results": null

    if task_id == "sync":
        # Sync-fallback results are persisted next to the "sync" job row; read
        # them back so polling keeps working after the original response.
        if settings.enable_db_persistence:
            job = repo.get_bulk_job(task_id)
            if job:
                return TaskStatusResponse(
                    task_id=task_id,
                    status=job.get("status", "completed") or "completed",
                    progress=job.get("processed"),
                    total=job.get("total"),
                    results=_normalize_results(job.get("results")),
                )
        return TaskStatusResponse(task_id=task_id, status="completed")
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
                    results=_normalize_results(job.get("results"))
                )
        raise HTTPException(status_code=404, detail=f"Task not found: {task_id}")

    try:
        from celery.result import AsyncResult
        result = AsyncResult(task_id)
        payload = {
            "task_id": task_id,
            "status": result.status.lower(),
        }
        # Surface live progress while the task is still running. Celery's
        # PROGRESS state stores {"current": n, "total": n} in result.info.
        if result.status == "PROGRESS" and isinstance(result.info, dict):
            payload["progress"] = result.info.get("current")
            payload["total"] = result.info.get("total")
        if result.ready():
            raw = result.result if isinstance(result.result, list) else []
            payload["results"] = _normalize_results(raw)
            # Persist finished job so it survives worker restarts
            if settings.enable_db_persistence:
                repo.finish_bulk_job(task_id, raw)
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
                    results=_normalize_results(job.get("results"))
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
    
    # Check Redis and Celery status
    redis_status = False
    celery_status = False
    try:
        from ..utils.cache import redis_available
        redis_status = await redis_available()
    except Exception:
        pass
    
    if redis_status:
        try:
            from celery import Celery
            test_celery = Celery(
                "health_check",
                broker=settings.celery_broker_url,
                backend=settings.celery_result_backend
            )
            # Try to inspect workers
            inspect = test_celery.control.inspect(timeout=2)
            celery_status = inspect.stats() is not None
        except Exception:
            pass
    
    return {
        "status": "healthy",
        "app": settings.app_name,
        "version": settings.app_version,
        "database": db,
        "redis": {"available": redis_status},
        "celery": {"available": celery_status},
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

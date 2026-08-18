"""
Repository layer — all reads/writes against Supabase (PostgREST).

Every function is best-effort: failures are logged and swallowed so the
validator keeps working even when the database is unreachable or the
schema has not been applied yet.
"""
import json
import structlog
from typing import Any, Dict, List, Optional

from ..config import settings
from ..models import ValidationResult
from .supabase_client import get_supabase, supabase_ping

logger = structlog.get_logger()

VALIDATION_COLUMNS = (
    "email,status,score,risk_level,syntax,dns,disposable,catch_all,smtp,"
    "processing_time_ms,validated_at,created_at"
)


def _client():
    if not settings.enable_db_persistence or not settings.supabase_configured:
        return None
    try:
        return get_supabase()
    except Exception as exc:  # pragma: no cover - config edge cases
        logger.warning("supabase_client_failed", error=str(exc))
        return None


def _insert(table: str, payload: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    client = _client()
    if client is None:
        return None
    try:
        resp = client.table(table).insert(payload).execute()
        data = resp.data or []
        return data[0] if data else None
    except Exception as exc:
        logger.warning("supabase_insert_failed", table=table, error=str(exc))
        return None


def _select(table: str, columns: str, limit: int, order: Optional[str] = None,
            eq: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    client = _client()
    if client is None:
        return []
    try:
        query = client.table(table).select(columns)
        if eq:
            for col, val in eq.items():
                query = query.eq(col, val)
        if order:
            query = query.order(order)
        resp = query.limit(limit).execute()
        return resp.data or []
    except Exception as exc:
        logger.warning("supabase_select_failed", table=table, error=str(exc))
        return []


# ---------------------------------------------------------------------------
# Health / readiness
# ---------------------------------------------------------------------------
async def db_status() -> Dict[str, Any]:
    """Public status payload used by /health and /db/status."""
    if not settings.enable_db_persistence:
        return {
            "enabled": False,
            "configured": settings.supabase_configured,
            "reachable": False,
            "tables_ready": False,
            "detail": "Database persistence disabled (ENABLE_DB_PERSISTENCE=false)",
        }
    ping = await supabase_ping()
    return {"enabled": True, **ping}


# ---------------------------------------------------------------------------
# Validation results
# ---------------------------------------------------------------------------
def save_validation_result(result: ValidationResult) -> Optional[Dict[str, Any]]:
    """Persist a single validation outcome."""
    payload = {
        "email": result.email,
        "status": result.status.value if hasattr(result.status, "value") else str(result.status),
        "score": result.scoring.score if result.scoring else 0,
        "risk_level": (result.scoring.risk_level.value
                       if result.scoring and hasattr(result.scoring.risk_level, "value")
                       else (result.scoring.risk_level if result.scoring else None)),
        "syntax": result.syntax.model_dump() if result.syntax else {},
        "dns": result.dns.model_dump() if result.dns else {},
        "disposable": result.disposable.model_dump() if result.disposable else {},
        "catch_all": result.catch_all.model_dump() if result.catch_all else {},
        "smtp": result.smtp.model_dump() if result.smtp else {},
        "processing_time_ms": round(result.processing_time_ms, 2),
        "validated_at": result.validated_at,
    }
    return _insert("validation_results", payload)


def get_validation_history(limit: int = 50) -> List[Dict[str, Any]]:
    """Most recent validation results (newest first)."""
    rows = _select("validation_results", VALIDATION_COLUMNS,
                   limit=limit, order="created_at.desc")
    for row in rows:
        for col in ("syntax", "dns", "disposable", "catch_all", "smtp"):
            if isinstance(row.get(col), str):
                try:
                    row[col] = json.loads(row[col])
                except (TypeError, json.JSONDecodeError):
                    pass
    return rows


def get_stats() -> Dict[str, Any]:
    """Aggregate stats over recent results."""
    rows = get_validation_history(limit=500)
    counts = {"valid": 0, "invalid": 0, "risky": 0, "unknown": 0, "error": 0}
    for row in rows:
        status = row.get("status")
        counts[status] = counts.get(status, 0) + 1
    avg_score = None
    scored = [r["score"] for r in rows if r.get("score") is not None]
    if scored:
        avg_score = round(sum(scored) / len(scored), 1)
    return {
        "total": len(rows),
        "counts": counts,
        "avg_score": avg_score,
    }


# ---------------------------------------------------------------------------
# Bulk jobs
# ---------------------------------------------------------------------------
def create_bulk_job(task_id: str, emails: List[str]) -> Optional[Dict[str, Any]]:
    return _insert("bulk_jobs", {
        "task_id": task_id,
        "status": "pending",
        "total": len(emails),
        "processed": 0,
        "results": [],
    })


def update_bulk_job_progress(task_id: str, processed: int, total: int,
                             status: str = "processing") -> None:
    client = _client()
    if client is None:
        return
    try:
        client.table("bulk_jobs").update({
            "processed": processed,
            "total": total,
            "status": status,
        }).eq("task_id", task_id).execute()
    except Exception as exc:
        logger.warning("supabase_bulk_progress_failed", task_id=task_id, error=str(exc))


def finish_bulk_job(task_id: str, results: List[Any],
                    status: str = "success", error: Optional[str] = None) -> None:
    client = _client()
    if client is None:
        return
    try:
        client.table("bulk_jobs").update({
            "processed": len(results),
            "results": json.loads(json.dumps(results, default=str)),
            "status": status,
            "error": error,
            "completed_at": "now()",
        }).eq("task_id", task_id).execute()
    except Exception as exc:
        logger.warning("supabase_bulk_finish_failed", task_id=task_id, error=str(exc))


def get_bulk_job(task_id: str) -> Optional[Dict[str, Any]]:
    rows = _select("bulk_jobs", "*", limit=1, eq={"task_id": task_id})
    return rows[0] if rows else None


# ---------------------------------------------------------------------------
# Domain records (optional cache)
# ---------------------------------------------------------------------------
def save_domain_record(domain: str, dns_result: Any) -> Optional[Dict[str, Any]]:
    payload = {
        "domain": domain.lower(),
        "mx_records": dns_result.mx_records if dns_result else [],
        "has_mx_records": bool(dns_result and dns_result.has_mx_records),
        "has_spf": bool(dns_result and dns_result.has_spf),
        "spf_record": dns_result.spf_record if dns_result else None,
        "has_dmarc": bool(dns_result and dns_result.has_dmarc),
        "dmarc_record": dns_result.dmarc_record if dns_result else None,
        "has_dkim": bool(dns_result and dns_result.has_dkim),
    }
    return _insert("domain_records", payload)

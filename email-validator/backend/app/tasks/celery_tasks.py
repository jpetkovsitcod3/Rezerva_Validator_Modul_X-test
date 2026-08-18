from celery import Celery
from ..config import settings
import asyncio

celery_app = Celery(
    "emailvalidator",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=["app.tasks.celery_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    worker_concurrency=10,
    task_soft_time_limit=300,
    task_time_limit=600,
    # Fail fast when Redis/broker is down instead of retrying forever
    broker_connection_max_retries=1,
    broker_connection_retry_on_startup=False,
    task_publish_retry=False,
    task_publish_retry_policy={"max_retries": 1},
    result_backend_transport_options={
        "retry_policy": {"max_retries": 1, "interval_start": 0, "interval_step": 1},
    },
)


@celery_app.task(bind=True, max_retries=3, rate_limit="100/m")
def bulk_validate_task(self, emails: list, webhook_url: str = None):
    """
    Celery task for async bulk email validation.
    Runs synchronously inside Celery worker.
    """
    from ..validator.engine import EmailValidationEngine
    from ..db import repo

    async def run():
        eng = EmailValidationEngine()
        results = []
        total = len(emails)

        for i, email in enumerate(emails):
            try:
                result = await eng.validate(email, deep=False)
                results.append(result.model_dump())
                # Update progress
                self.update_state(
                    state="PROGRESS",
                    meta={"current": i + 1, "total": total}
                )
            except Exception as e:
                results.append({
                    "email": email,
                    "error": str(e),
                    "status": "error"
                })

            # Persist incremental progress to Supabase (best-effort)
            if (i + 1) % 10 == 0 or i + 1 == total:
                try:
                    repo.update_bulk_job_progress(self.request.id, i + 1, total)
                except Exception:
                    pass

        return results

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        results = loop.run_until_complete(run())
        loop.close()

        # Persist finished job (best-effort)
        try:
            repo.finish_bulk_job(self.request.id, results)
        except Exception:
            pass

        # Webhook notification
        if webhook_url:
            import httpx
            try:
                httpx.post(webhook_url, json={"results": results}, timeout=10)
            except Exception:
                pass

        return results
    except Exception as exc:
        raise self.retry(exc=exc, countdown=5)

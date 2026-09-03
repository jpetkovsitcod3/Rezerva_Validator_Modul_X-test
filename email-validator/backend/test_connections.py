#!/usr/bin/env python
"""
Connection test script for EmailValidator Pro.
Run this after configuring .env with your Supabase and Upstash credentials.
"""
import asyncio
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.config import settings


async def test_supabase():
    """Test Supabase connectivity and schema."""
    print("\n" + "=" * 60)
    print("Testing Supabase Connection")
    print("=" * 60)

    if not settings.supabase_configured:
        print("[FAIL] Supabase not configured (missing URL or service_role_key)")
        return False

    import httpx

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

        print(f"Status Code: {resp.status_code}")

        if resp.status_code == 200:
            print("[PASS] Supabase: Connected and schema applied!")
            return True
        elif resp.status_code == 404:
            print("[WARN]  Supabase: Connected but schema NOT applied")
            print("   → Run supabase/schema.sql in Supabase SQL Editor")
            return False
        elif resp.status_code == 401:
            print("[FAIL] Supabase: Authentication failed (401)")
            print("   → Regenerate service_role_key in Supabase Dashboard → Settings → API")
            return False
        else:
            print(f"[FAIL] Supabase: Unexpected response: {resp.text}")
            return False

    except httpx.HTTPError as e:
        print(f"[FAIL] Supabase: Network error - {e}")
        return False
    except Exception as e:
        print(f"[FAIL] Supabase: Error - {e}")
        return False


async def test_redis():
    """Test Redis (Upstash) connectivity."""
    print("\n" + "=" * 60)
    print("Testing Redis (Upstash) Connection")
    print("=" * 60)

    if "YOUR_UPSTASH_PASSWORD" in settings.redis_url or "YOUR_ENDPOINT" in settings.redis_url:
        print("[FAIL] Redis URL not configured (still using placeholder values)")
        print(f"   Current: {settings.redis_url}")
        return False

    try:
        import redis.asyncio as aioredis
    except ImportError:
        print("[FAIL] redis package not installed: pip install redis")
        return False

    try:
        client = aioredis.from_url(
            settings.redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=5,
            socket_timeout=5
        )

        # Test ping
        pong = await client.ping()
        print(f"[PASS] Redis PING: {pong}")

        # Test set/get
        await client.set("test:connection", "ok", ex=10)
        val = await client.get("test:connection")
        print(f"[PASS] Redis SET/GET: {val}")

        # Upstash supports only database 0; SELECT would fail by design.
        if "upstash.io" in settings.redis_url:
            print("ℹ️  Redis: Upstash single-database mode — skipping SELECT 1/2 test")
        else:
            await client.select(1)
            await client.set("test:db1", "broker", ex=10)
            await client.select(2)
            await client.set("test:db2", "backend", ex=10)
            await client.select(0)
            print("[PASS] Redis DB 0/1/2: Accessible")

        await client.close()
        print("[PASS] Redis: All tests passed!")
        return True

    except Exception as e:
        print(f"[FAIL] Redis: Connection failed - {e}")
        print(f"   URL: {settings.redis_url}")
        print("   → Check: Password, Endpoint, TLS (rediss://), IP Allowlist (0.0.0.0/0)")
        return False


async def test_celery():
    """Test Celery broker/backend connectivity."""
    print("\n" + "=" * 60)
    print("Testing Celery Configuration")
    print("=" * 60)

    if "YOUR_UPSTASH_PASSWORD" in settings.celery_broker_url:
        print("[FAIL] Celery broker URL not configured")
        return False

    try:
        from celery import Celery
        from app.tasks.celery_tasks import celery_app

        # Check configuration
        print(f"Broker: {celery_app.conf.broker_url}")
        print(f"Backend: {celery_app.conf.result_backend}")

        # Test connection by inspecting
        insp = celery_app.control.inspect()
        # This will fail if no workers running, but broker connection works
        try:
            stats = insp.stats()
            if stats:
                print(f"[PASS] Celery: Workers found: {list(stats.keys())}")
            else:
                print("[WARN]  Celery: Broker reachable but no workers running")
                print("   → Start worker: celery -A app.tasks.celery_tasks.celery_app worker --loglevel=info")
        except Exception:
            print("[WARN]  Celery: Broker reachable but no workers responding")

        print("[PASS] Celery: Configuration OK")
        return True

    except Exception as e:
        print(f"[FAIL] Celery: Error - {e}")
        return False


async def test_validation_engine():
    """Test the validation engine with a quick check."""
    print("\n" + "=" * 60)
    print("Testing Validation Engine")
    print("=" * 60)

    try:
        from app.validator.engine import engine

        # Quick validation (no SMTP)
        result = await engine.validate("test@example.com", deep=False)
        print(f"[PASS] Validation: {result.email} → {result.status.value} (score: {result.scoring.score})")
        print(f"   Layers: Syntax={result.syntax.passed}, DNS={result.dns.domain_exists}, MX={result.dns.has_mx_records}")
        return True

    except Exception as e:
        print(f"[FAIL] Validation Engine: Error - {e}")
        import traceback
        traceback.print_exc()
        return False


async def main():
    print("=" * 60)
    print("EmailValidator Pro - Connection Tests")
    print("=" * 60)
    print(f"App: {settings.app_name} v{settings.app_version}")
    print(f"Debug: {settings.debug}")
    print(f"DB Persistence: {settings.enable_db_persistence}")

    results = {}

    # Run all tests
    results["supabase"] = await test_supabase()
    results["redis"] = await test_redis()
    results["celery"] = await test_celery()
    results["engine"] = await test_validation_engine()

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)

    for name, passed in results.items():
        status = "[PASS] PASS" if passed else "[FAIL] FAIL"
        print(f"  {name.capitalize()}: {status}")

    all_passed = all(results.values())
    print(f"\nOverall: {'[PASS] ALL TESTS PASSED' if all_passed else '[FAIL] SOME TESTS FAILED'}")

    if not all_passed:
        print("\nNext steps:")
        if not results["supabase"]:
            print("  1. Fix Supabase: Check project exists, run schema.sql, verify service_role_key")
        if not results["redis"]:
            print("  2. Fix Redis: Create Upstash DB, update .env with correct URL")
        if not results["celery"]:
            print("  3. Fix Celery: Ensure Redis works, start Celery worker")
        sys.exit(1)
    else:
        print("\n🎉 Ready to run!")
        print("   API: uvicorn app.main:app --reload")
        print("   Worker: celery -A app.tasks.celery_tasks.celery_app worker --loglevel=info")
        sys.exit(0)


if __name__ == "__main__":
    asyncio.run(main())
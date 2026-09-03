"""
Comprehensive Backend Test Suite for BRIDGE Modul - X / EmailValidator Pro.
Tests all endpoints, engine layers, edge cases, sync bulk fallback, db status, and error handling.
"""
import asyncio
import sys
import os

# Ensure UTF-8 output on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from httpx import AsyncClient, ASGITransport
from app.main import app


async def run_tests():
    print("=" * 60)
    print("Starting Comprehensive Backend Test Suite")
    print("=" * 60)
    
    passed_tests = 0
    total_tests = 0
    
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        
        # Test 1: Root endpoint
        total_tests += 1
        print("\n[1] Testing GET / ...")
        resp = await client.get("/")
        assert resp.status_code == 200, f"Expected 200, got {resp.status_code}"
        data = resp.json()
        assert "app" in data and "version" in data
        print(f"  [PASS] Root OK: {data['app']} v{data['version']}")
        passed_tests += 1
        
        # Test 2: Health endpoint
        total_tests += 1
        print("\n[2] Testing GET /api/v1/health ...")
        resp = await client.get("/api/v1/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        print(f"  [PASS] Health OK: database reachable = {data.get('database', {}).get('reachable')}")
        passed_tests += 1
        
        # Test 3: DB Status endpoint
        total_tests += 1
        print("\n[3] Testing GET /api/v1/db/status ...")
        resp = await client.get("/api/v1/db/status")
        assert resp.status_code == 200
        data = resp.json()
        print(f"  [PASS] DB Status OK: enabled={data.get('enabled')}, tables_ready={data.get('tables_ready')}")
        passed_tests += 1
        
        # Test 4: Quick validate valid email
        total_tests += 1
        print("\n[4] Testing GET /api/v1/validate/quick/test@gmail.com ...")
        resp = await client.get("/api/v1/validate/quick/test@gmail.com")
        assert resp.status_code == 200
        data = resp.json()
        assert data["syntax"]["passed"] is True
        assert data["dns"]["has_mx_records"] is True
        print(f"  [PASS] Quick Validate OK: {data['email']} -> {data['status']} (score: {data['scoring']['score']})")
        passed_tests += 1
        
        # Test 5: Quick validate invalid syntax
        total_tests += 1
        print("\n[5] Testing GET /api/v1/validate/quick/invalid-email ...")
        resp = await client.get("/api/v1/validate/quick/invalid-email")
        assert resp.status_code == 200
        data = resp.json()
        assert data["syntax"]["passed"] is False
        assert data["status"] == "invalid"
        print(f"  [PASS] Invalid Syntax OK: rejected correctly with error '{data['syntax']['error']}'")
        passed_tests += 1
        
        # Test 6: Single validate (deep=False) for disposable email
        total_tests += 1
        print("\n[6] Testing POST /api/v1/validate/single (disposable check) ...")
        resp = await client.post("/api/v1/validate/single?deep=false", json={"email": "throwaway@mailinator.com"})
        assert resp.status_code == 200
        data = resp.json()
        assert data["disposable"]["is_disposable"] is True
        print(f"  [PASS] Disposable Detection OK: {data['email']} is_disposable={data['disposable']['is_disposable']}")
        passed_tests += 1
        
        # Test 7: Domain intelligence
        total_tests += 1
        print("\n[7] Testing GET /api/v1/domain/gmail.com ...")
        resp = await client.get("/api/v1/domain/gmail.com")
        assert resp.status_code == 200
        data = resp.json()
        assert data["domain_exists"] is True
        assert data["has_mx_records"] is True
        print(f"  [PASS] Domain Info OK: gmail.com has MX={len(data['mx_records'])}, SPF={data['has_spf']}, DMARC={data['has_dmarc']}")
        passed_tests += 1
        
        # Test 8: Bulk validate sync fallback
        total_tests += 1
        print("\n[8] Testing POST /api/v1/validate/bulk (sync fallback) ...")
        test_emails = [
            "valid.user@gmail.com",
            "support@microsoft.com",
            "not-an-email",
            "test@thisdomaindoesnotexist12345xyz.com"
        ]
        resp = await client.post("/api/v1/validate/bulk", json={"emails": test_emails})
        assert resp.status_code == 200
        data = resp.json()
        assert "task_id" in data
        assert "status" in data
        print(f"  [PASS] Bulk Validation OK: task_id={data['task_id']}, total={data.get('total')}")
        passed_tests += 1
        
        # Test 9: History endpoint
        total_tests += 1
        print("\n[9] Testing GET /api/v1/history ...")
        resp = await client.get("/api/v1/history?limit=10")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        print(f"  [PASS] History OK: retrieved {len(data)} records")
        passed_tests += 1
        
        # Test 10: Stats endpoint
        total_tests += 1
        print("\n[10] Testing GET /api/v1/stats ...")
        resp = await client.get("/api/v1/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert "proxy_pool" in data and "database" in data
        print(f"  [PASS] Stats OK: database total={data.get('database', {}).get('total')}")
        passed_tests += 1

    print("\n" + "=" * 60)
    print(f"RESULTS: {passed_tests}/{total_tests} tests passed successfully!")
    print("=" * 60)
    if passed_tests == total_tests:
        print("ALL BACKEND TESTS PASSED SUCCESSFULLY!")
    else:
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(run_tests())

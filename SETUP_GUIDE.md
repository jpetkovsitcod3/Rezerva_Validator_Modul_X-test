# EmailValidator Pro - Setup Guide

## Overview
This application requires three external services:
1. **Supabase** - PostgreSQL database for persistence (validation results, bulk jobs, domain records)
2. **Upstash Redis** - Managed Redis for caching, Celery broker, and result backend
3. **Email Validation Engine** - Local (no external service needed)

---

## 1. Supabase Setup

### Create/Verify Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. **If project `ciytvulujiqemqljablq` exists:**
   - Click on the project
   - Go to **Settings → API**
   - Copy the **Project URL** and **service_role** key (NOT anon key)
   - Update `.env` with these values
   
3. **If project doesn't exist:**
   - Click "New Project"
   - Choose organization, name it "email-validator"
   - Wait for provisioning (~2 minutes)
   - Go to **Settings → API** and copy Project URL + service_role key

### Apply Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy contents of `supabase/schema.sql` and paste
4. Click "Run"
5. Verify: Tables `validation_results`, `bulk_jobs`, `domain_records` should appear in **Table Editor**

---

## 2. Upstash Redis Setup

### Create Redis Database
1. Go to [Upstash Console](https://console.upstash.com/redis)
2. Click **"Create Database"**
3. Configure:
   - **Name**: `email-validator-redis`
   - **Region**: Choose closest to your users (e.g., `US-East-1`, `EU-West-1`)
   - **Type**: `Free` (100MB, 10K commands/day) or `Pay-as-you-go`
   - **TLS**: Enable (recommended)
4. Click **"Create"**

### Get Connection Details
After creation, click on your database to see details. You need:
- **Endpoint**: `your-db-name.upstash.io` (e.g., `email-validator-redis.upstash.io`)
- **Port**: `6379` (TLS) or `6380` (non-TLS)
- **Password**: The "Password" field shown
- **Connection URL format**: `rediss://default:PASSWORD@ENDPOINT:6379` (TLS) or `redis://default:PASSWORD@ENDPOINT:6380`

### Update .env with Upstash Credentials
Replace the Redis URLs in `.env`:
```bash
# Redis (Upstash - TLS enabled)
REDIS_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379/0
CELERY_BROKER_URL=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379/1
CELERY_RESULT_BACKEND=rediss://default:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379/2
REDIS_CACHE_TTL=86400
```

**Note**: Use `rediss://` (with double 's') for TLS connections. Upstash requires TLS by default.

---

## 3. Local Development Setup

### Backend
```bash
cd email-validator/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy .env.example to .env and fill in your credentials
cp .env.example .env
# Edit .env with your Supabase URL, service_role key, and Upstash Redis URL

# Run the API
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd email-validator/frontend

# Install dependencies
npm install

# Create .env from example
cp .env.example .env
# Set VITE_API_URL=http://localhost:8000

# Run dev server
npm run dev
```

### Docker (Production-like)
```bash
# From email-validator directory
docker-compose up -d --build

# Check logs
docker-compose logs -f api
docker-compose logs -f worker
docker-compose logs -f redis
```

---

## 4. Verification Checklist

### Test Supabase Connection
```bash
cd email-validator/backend
python -c "
import httpx, asyncio
async def test():
    from app.config import settings
    url = settings.supabase_url
    key = settings.supabase_service_role_key
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(
            f'{url.rstrip(chr(47))}/rest/v1/validation_results',
            headers={'apikey': key, 'Authorization': f'Bearer {key}'},
            params={'select': 'id'}, headers={'Range': '0-0'}
        )
        print(f'Status: {resp.status_code}')
        print('OK' if resp.status_code == 200 else 'SCHEMA MISSING - run schema.sql')
asyncio.run(test())
"
```

### Test Redis Connection
```bash
cd email-validator/backend
python -c "
import asyncio, redis.asyncio as aioredis
from app.config import settings
async def test():
    client = aioredis.from_url(settings.redis_url, decode_responses=True)
    try:
        pong = await client.ping()
        print(f'Redis PING: {pong}')
        await client.set('test_key', 'hello', ex=10)
        val = await client.get('test_key')
        print(f'Redis GET: {val}')
        await client.close()
        print('Redis: OK')
    except Exception as e:
        print(f'Redis ERROR: {e}')
asyncio.run(test())
"
```

### Test Celery
```bash
# Terminal 1: Start worker
cd email-validator/backend
celery -A app.tasks.celery_tasks.celery_app worker --loglevel=info

# Terminal 2: Test task
cd email-validator/backend
python -c "
from app.tasks.celery_tasks import bulk_validate_task
result = bulk_validate_task.delay(['test@example.com', 'invalid-email'])
print(f'Task ID: {result.id}')
print(f'Status: {result.status}')
"
```

---

## 5. Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Supabase project URL | `https://abc.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only) | `eyJ...` |
| `SUPABASE_ANON_KEY` | Anon key (for frontend) | `eyJ...` |
| `ENABLE_DB_PERSISTENCE` | Enable Supabase writes | `true` |
| `REDIS_URL` | Redis for caching (DB 0) | `rediss://default:pass@endpoint:6379/0` |
| `CELERY_BROKER_URL` | Celery broker (DB 1) | `rediss://default:pass@endpoint:6379/1` |
| `CELERY_RESULT_BACKEND` | Celery results (DB 2) | `rediss://default:pass@endpoint:6379/2` |
| `REDIS_CACHE_TTL` | Cache TTL in seconds | `86400` |

---

## 6. Troubleshooting

### Supabase 401 Error
- Service role key is invalid/expired
- Go to Supabase Dashboard → Settings → API → Regenerate service_role key
- Update `.env` with new key

### Redis Connection Failed
- Check if TLS is enabled (`rediss://` vs `redis://`)
- Verify password is correct
- Check IP allowlist in Upstash (allow all for dev: `0.0.0.0/0`)

### Celery Tasks Stuck
- Redis not reachable - check `redis_available()` in `app/utils/cache.py`
- Worker not running - start with `celery -A app.tasks.celery_tasks.celery_app worker --loglevel=info`

### CORS Errors
- Update `CORS_ORIGINS` in `.env` to include your frontend URL
- For production, use specific domain not `*`

---

## 7. Production Deployment

### Environment Variables (Production)
```bash
DEBUG=false
SECRET_KEY=your-strong-random-secret-key
WORKERS=4
CORS_ORIGINS=["https://yourdomain.com"]
```

### Docker Compose (Production)
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Health Checks
- API: `GET /api/v1/health`
- Database: `GET /api/v1/db/status`
- Redis: Check worker logs for "Connected to Redis"
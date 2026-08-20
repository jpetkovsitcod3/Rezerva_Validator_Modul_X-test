# AGENTS.md

## Repo layout

- `email-validator/backend/` — FastAPI app (`app.main:app`), 7-layer validation engine
- `email-validator/frontend/` — React + Vite + Ant Design 5 dark UI
- `email-validator/docker-compose.yml` — api + worker (celery) + redis + frontend
- `email-validator/supabase/schema.sql` — DB schema (manual, one-time)
- `SETUP_GUIDE.md`, `README.md` — long-form setup; keep them in sync with real commands

## Commands

Run from `email-validator/` (no root build system exists):

```bash
# Backend (from email-validator/backend)
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
# Celery worker (only needed for bulk >100 emails)
celery -A app.tasks.celery_tasks.celery_app worker --loglevel=info

# Frontend (from email-validator/frontend)
npm install
npm run dev          # :5173, proxies /api -> :8000
npm run build
npm run lint         # eslint src --ext js,jsx

# Full stack
docker compose up --build -d
```

Windows shell is PowerShell: activate venv with `venv\Scripts\activate`, not `source`.

## Verification

No test suite, no typecheck, no CI. Verify via live endpoints:

```
GET http://localhost:8000/api/v1/health        # includes database.reachable / tables_ready
GET http://localhost:8000/api/v1/db/status
```

## Non-obvious behavior

- **Bulk fallback**: `POST /api/v1/validate/bulk` uses Celery only when Redis is reachable (`redis_available()` in `app/utils/cache.py`). Without Redis it validates synchronously for ≤100 emails (returns `task_id: "sync"` with inline results) and returns 503 above that.
- **Persistence is best-effort**: every Supabase call in `app/db/repo.py` is wrapped in try/except and logged via structlog; the API keeps working when the DB is down. Don't add hard-failing DB calls.
- **Frontend API base**: `VITE_API_URL` or relative `/api/v1`; dev server proxies `/api` to `localhost:8000` (see `vite.config.js`). Default leaves it empty so the proxy handles it.
- **Supabase schema is manual**: `supabase/schema.sql` must be pasted into the Supabase SQL Editor once. Nothing applies it automatically; "Connected but schema missing" means tables are absent.
- **Frontend has no router**: page switching is a `useState` in `App.jsx` + `AppLayout` nav; nav keys are `dashboard|single|bulk|domain`.
- **Port 25 is usually blocked** on cloud/dev networks; SMTP layer returns `unknown` gracefully — don't treat that as a backend failure.

## Environment

- Backend config: `email-validator/backend/.env` (from `.env.example`) — Supabase URL/keys, Redis URLs, `ENABLE_DB_PERSISTENCE`, `CORS_ORIGINS`
- Frontend: `email-validator/frontend/.env` — `VITE_API_URL` only
- Use `rediss://` (double s) for TLS Redis (Upstash); separate DB indices for cache (0), celery broker (1), celery results (2)

## Tooling note

`@ant-design/cli` (antd) is available globally for querying Ant Design component docs/tokens and running `antd doctor`/`antd lint`/`antd usage` against `email-validator/frontend/src`.

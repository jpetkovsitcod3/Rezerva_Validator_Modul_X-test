# 🔍 EmailValidator Pro — Full-Stack Email Validation Web App

A production-ready, full-stack email validation web application with a **7-layer validation engine**.
Built with **FastAPI** (Python) on the backend and **React + Ant Design 5 (dark theme)** on the frontend.

> 📄 A regenerated, one-shot copy-paste **build prompt** (compressed, no empty lines) lives in **[PROMPT.txt](./PROMPT.txt)**.

---

## ✨ Features

- **7-layer validation engine**
  1. Syntax / RFC 5321 check
  2. DNS domain existence
  3. MX record verification
  4. Disposable / role-based / free-provider detection
  5. Catch-all domain detection
  6. SMTP mailbox verification (with proxy support)
  7. Deliverability scoring & risk assessment
- **Single email validation** (fast syntax+DNS or deep SMTP)
- **Bulk validation** (paste or CSV upload, async Celery, progress + CSV export)
- **Domain intelligence** (MX / SPF / DMARC / DKIM records)
- **Ant Design 5 dark theme** with animated UI (score gauge, layer timeline, particles)
- Redis caching, rate limiting, structured logging, proxy rotation engine
- Docker Compose for the full stack (API + worker + Redis + frontend)

---

## 🚀 Quick Start

### Option A — Without Docker (development)

```bash
# 1. Backend
cd email-validator/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env            # optional — sane defaults are built in
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 2. Redis (required for caching / Celery)
redis-server

# 3. Frontend (separate terminal)
cd email-validator/frontend
npm install
npm run dev
```

### Option B — Docker Compose (recommended)

```bash
cd email-validator
docker compose up --build -d
docker compose logs -f api
docker compose down
```

---

## 🔌 Access

| Service            | URL                                   |
| ------------------ | ------------------------------------- |
| 🌐 Frontend App    | http://localhost:5173                 |
| 📡 API Docs (Swagger) | http://localhost:8000/docs          |
| 📋 ReDoc           | http://localhost:8000/redoc            |
| ❤️ Health Check    | http://localhost:8000/api/v1/health   |

---

## 🧪 API Endpoints

| Method | Endpoint                            | Description                        |
| ------ | ----------------------------------- | ---------------------------------- |
| POST   | `/api/v1/validate/single`           | Single validation (`?deep=true`)   |
| POST   | `/api/v1/validate/bulk`             | Async bulk validation → task_id    |
| GET    | `/api/v1/validate/bulk/status/{id}` | Poll bulk task status              |
| GET    | `/api/v1/validate/quick/{email}`    | Syntax + DNS only (fast)           |
| GET    | `/api/v1/domain/{domain}`           | MX/SPF/DMARC/DKIM intelligence     |
| GET    | `/api/v1/health`                    | Health check                       |
| GET    | `/api/v1/stats`                     | Proxy pool / version stats         |

```bash
curl -X POST http://localhost:8000/api/v1/validate/single \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com"}'
```

---

## 📁 Project Structure

```
email-validator/
├── backend/                 # FastAPI + 7-layer validation engine
│   ├── app/
│   │   ├── main.py          # App entry point
│   │   ├── config.py        # Settings & env vars
│   │   ├── models.py        # Pydantic models
│   │   ├── validator/       # syntax, dns, disposable, catch_all, smtp, scoring, proxy, engine
│   │   ├── api/             # routes + middleware
│   │   ├── tasks/           # Celery async tasks
│   │   └── utils/           # cache + logger
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/                # React + Ant Design 5 dark theme
│   ├── src/
│   │   ├── components/      # Layout, Validator, Dashboard, Common
│   │   ├── services/        # Axios API client
│   │   ├── hooks/           # useValidation
│   │   ├── theme/           # darkTheme tokens
│   │   └── styles/          # global.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── PROMPT.txt               # One-shot copy-paste build prompt
└── docker-compose.yml
```

---

## 🐛 Notes & Troubleshooting

- **Port 25 blocked** (common on cloud providers) → SMTP returns `unknown`; the validator handles this gracefully.
- **Redis unavailable** → the API still runs using an in-memory TTL cache fallback; bulk validation falls back to synchronous for ≤100 emails.
- **CORS errors** → add your frontend origin to `CORS_ORIGINS` in the backend `.env`.
- **npm peer-dep conflicts** → `npm install --legacy-peer-deps`.

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager
import time

from .config import settings
from .api.routes import router
from .utils.logger import setup_logging
from .db import repo

# Setup structured logging
setup_logging()

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    print(f"EmailValidator Pro v{settings.app_version} starting up...")
    # Verify Supabase connectivity at boot (best-effort, never fatal)
    if settings.supabase_configured:
        try:
            status = await repo.db_status()
            if status.get("reachable"):
                print(f"[DB] Supabase reachable — tables_ready={status.get('tables_ready')}")
                if not status.get("tables_ready"):
                    print("[DB] WARNING: run supabase/schema.sql in the Supabase SQL editor "
                          "to create the tables.")
            else:
                print(f"[DB] WARNING: Supabase not reachable — {status.get('detail')}")
        except Exception as exc:  # pragma: no cover - defensive
            print(f"[DB] WARNING: DB check failed — {exc}")
    else:
        print("[DB] Supabase not configured — persistence disabled (see .env.example)")
    yield
    print("EmailValidator shutting down gracefully...")


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="""
EmailValidator Pro — 7-Layer Email Validation Engine.

Features:
- Layer 1 — RFC 5321/5322 Syntax Validation
- Layer 2 — DNS Domain Existence Check
- Layer 3 — MX Record Verification
- Layer 4 — Disposable/Role-Based/Free Provider Detection
- Layer 5 — Catch-All Domain Detection
- Layer 6 — SMTP Mailbox Verification (with proxy support)
- Layer 7 — Deliverability Scoring & Risk Assessment

Provider support: Gmail, Outlook, Yahoo, iCloud, ProtonMail, Zoho, 100K+ domains
    """,
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# ---- Middleware -----------------------------------------------------
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Process-Time"]
)


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.monotonic()
    response = await call_next(request)
    process_time = (time.monotonic() - start_time) * 1000
    response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
    return response


# Global error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if settings.debug else "Contact support"
        }
    )


# ---- Include Routes -------------------------------------------------
app.include_router(router, prefix="/api/v1")


# ---- Root -----------------------------------------------------------
@app.get("/")
async def root():
    return {
        "app": settings.app_name,
        "version": settings.app_version,
        "docs": "/docs",
        "health": "/api/v1/health"
    }

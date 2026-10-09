import os
import logging
from pathlib import Path

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import Base, engine, get_db
from app.config import settings
from app.dependencies import get_current_user
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.middleware.rate_limiter import RateLimiterMiddleware

# Import models
from app.models import job, login_log, user, candidate

# Import routes
from app.routes import (
    auth,
    candidates,
    upload,
    match,
    pipeline,
    stats,
    jobs,
    analytics,
    ranking,
    activity,
    notifications,
    agent,
)


# Create tables
Base.metadata.create_all(bind=engine)

# Auto-migrate columns if missing
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;"))
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'recruiter';"))
        if settings.ADMIN_EMAIL:
            conn.execute(
                text("UPDATE users SET role = 'admin' WHERE LOWER(email) = LOWER(:admin_email);"),
                {"admin_email": settings.ADMIN_EMAIL.strip()},
            )
        conn.commit()
except Exception as e:
    print(f"Schema migration note: {e}")



app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)


# ---------------------------------------------------------
# Security Middlewares
# ---------------------------------------------------------
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimiterMiddleware)

# CORS
cors_origins = list(settings.CORS_ORIGINS) if settings.CORS_ORIGINS else ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["Retry-After", "X-RateLimit-Limit", "X-RateLimit-Remaining"],
)


# Create upload directory
os.makedirs(
    settings.UPLOAD_DIR,
    exist_ok=True
)


# ---------------------------------------------------------
# Secure File Access (Authenticated & Tenant Checked)
# ---------------------------------------------------------
@app.get("/uploads/{filename}")
def serve_upload(
    filename: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    upload_root = Path(settings.UPLOAD_DIR).resolve()
    target_path = (upload_root / filename).resolve()

    try:
        target_path.relative_to(upload_root)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_path.exists() or not target_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    # Authorize: caller must own the candidate with this resume or be an admin
    c = db.query(candidate.Candidate).filter(candidate.Candidate.resume_url.like(f"%{filename}%")).first()
    if c:
        is_owner = c.user_id == current_user["user_id"]
        is_admin = current_user.get("role") == "admin"
        if not is_owner and not is_admin:
            raise HTTPException(status_code=403, detail="Forbidden: You do not have permission to access this file")

    media_type = (
        "application/pdf"
        if target_path.suffix.lower() == ".pdf"
        else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    return FileResponse(
        path=str(target_path),
        media_type=media_type,
        filename=filename,
        content_disposition_type="inline",
    )


# ---------------------------------------------------------
# Global Exception Handler (Mask Internal Errors in Production)
# ---------------------------------------------------------
logger = logging.getLogger("uvicorn.error")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error processing {request.method} {request.url}: {exc}", exc_info=True)
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "type": type(exc).__name__},
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please try again later."},
    )



# Auth
app.include_router(
    auth.router,
    prefix="/api/auth",
    tags=["Authentication"],
)


# Candidates
app.include_router(
    candidates.router,
    prefix="/api/candidates",
    tags=["Candidates"],
)


# Ranking
app.include_router(
    ranking.router,
    prefix="/api/ranking",
    tags=["Ranking"],
)


# Upload
app.include_router(
    upload.router,
    prefix="/api/upload",
    tags=["Upload"],
)


# Matching
app.include_router(
    match.router,
    prefix="/api/match",
    tags=["Matching"],
)


# Pipeline
app.include_router(
    pipeline.router,
    prefix="/api/pipeline",
    tags=["Pipeline"],
)


# Stats
app.include_router(
    stats.router,
    prefix="/api/stats",
    tags=["Stats"],
)


# Analytics
app.include_router(
    analytics.router,
    prefix="/api/analytics",
    tags=["Analytics"],
)


# Activity
app.include_router(
    activity.router,
    prefix="/api/activity",
    tags=["Activity"],
)


# Jobs
app.include_router(
    jobs.router,
    prefix="/api/jobs",
    tags=["Jobs"],
)


# Notifications
app.include_router(
    notifications.router,
    prefix="/api/notifications",
    tags=["Notifications"],
)



# AI Agent
app.include_router(
    agent.router,
    prefix="/api/agent",
    tags=["Agent"],
)


@app.get("/")
def root():
    return {
        "success": True,
        "message": "AI ATS Backend Running 🚀",
        "version": settings.APP_VERSION,
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
    }
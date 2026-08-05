import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.config import settings

# Import models
from app.models import job

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
)


# Create tables
Base.metadata.create_all(bind=engine)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
)


# Create upload directory
os.makedirs(
    "uploads",
    exist_ok=True
)


# Serve uploaded resumes
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.models.job import Job
from app.models.match import Match

from app.schemas.job import (
    JobCreate,
    JobUpdate,
    JobResponse,
)


router = APIRouter()


# =========================================================
# GET ALL JOBS
# =========================================================

@router.get("")
@router.get("/")
def get_jobs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    jobs = (
        db.query(Job)
        .order_by(Job.created_at.desc())
        .all()
    )

    return jobs


# =========================================================
# GET SINGLE JOB
# =========================================================

@router.get("/{job_id}")
def get_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    return job


# =========================================================
# CREATE JOB
# =========================================================

@router.post(
    "",
    response_model=JobResponse,
)
@router.post(
    "/",
    response_model=JobResponse,
)
def create_job(
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    job = Job(
        title=job_data.title,
        company=job_data.company,
        location=job_data.location,
        employment_type=job_data.employment_type,
        experience=job_data.experience,
        salary=job_data.salary,
        description=job_data.description,
        status="Open",
    )

    db.add(job)
    db.commit()
    db.refresh(job)

    return job


# =========================================================
# UPDATE JOB
# =========================================================

@router.put(
    "/{job_id}",
    response_model=JobResponse,
)
def update_job(
    job_id: str,
    job_data: JobUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    update_data = job_data.model_dump(
        exclude_unset=True
    )

    for field, value in update_data.items():
        setattr(job, field, value)

    db.commit()
    db.refresh(job)

    return job


# =========================================================
# DELETE JOB
# =========================================================

@router.delete("/{job_id}")
def delete_job(
    job_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    try:
        # -------------------------------------------------
        # Delete related matches first because
        # matches.job_id references jobs.id.
        # -------------------------------------------------

        db.query(Match).filter(
            Match.job_id == job_id
        ).delete(
            synchronize_session=False
        )

        db.delete(job)

        db.commit()

        return {
            "success": True,
            "message": "Job deleted successfully",
            "job_id": job_id,
        }

    except Exception:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to delete job",
        )
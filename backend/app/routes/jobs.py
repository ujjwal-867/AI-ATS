import json
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
from app.services.ats_score import extract_skills
from app.utils.sanitizer import sanitize_text


router = APIRouter()


def _resolve_skills(skills_input, title: str = "", description: str = "") -> str:
    """
    Extract and normalize required skills.
    If no skills are provided manually, auto-extract them from title + description.
    """
    skills_list = []
    if isinstance(skills_input, list):
        skills_list = [str(s).strip() for s in skills_input if str(s).strip()]
    elif isinstance(skills_input, str) and skills_input.strip():
        try:
            parsed = json.loads(skills_input)
            if isinstance(parsed, list):
                skills_list = [str(s).strip() for s in parsed if str(s).strip()]
            else:
                skills_list = [s.strip() for s in str(skills_input).split(",") if s.strip()]
        except Exception:
            skills_list = [s.strip() for s in str(skills_input).split(",") if s.strip()]

    # If still empty, automatically extract skills from Job Description + Title
    if not skills_list and (title or description):
        combined = f"{title or ''} {description or ''}"
        skills_list = extract_skills(combined)

    return json.dumps(skills_list) if skills_list else "[]"


# =========================================================
# GET ALL JOBS (Scoped to Current User)
# =========================================================

@router.get("")
@router.get("/")
def get_jobs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_id = current_user.get("user_id")
    jobs = (
        db.query(Job)
        .filter(Job.user_id == user_id)
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
    user_id = current_user.get("user_id")
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job or job.user_id != user_id:
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
    user_id = current_user.get("user_id")
    raw_skills = job_data.required_skills if job_data.required_skills is not None else job_data.skills
    skills_json = _resolve_skills(raw_skills, title=job_data.title, description=job_data.description)

    job = Job(
        user_id=user_id,
        title=sanitize_text(job_data.title),
        company=sanitize_text(job_data.company),
        location=sanitize_text(job_data.location),
        employment_type=sanitize_text(job_data.employment_type),
        experience=sanitize_text(job_data.experience),
        salary=sanitize_text(job_data.salary),
        description=sanitize_text(job_data.description),
        required_skills=skills_json,
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
    user_id = current_user.get("user_id")
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job or job.user_id != user_id:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    update_data = job_data.model_dump(exclude_unset=True)

    # Sanitize string inputs against XSS
    for field in ["title", "company", "location", "employment_type", "experience", "salary", "description"]:
        if field in update_data and update_data[field]:
            update_data[field] = sanitize_text(update_data[field])

    # Process skills if provided in update
    if "skills" in update_data or "required_skills" in update_data:
        raw_skills = update_data.pop("required_skills", None) or update_data.pop("skills", None)
        title = update_data.get("title", job.title)
        desc = update_data.get("description", job.description)
        job.required_skills = _resolve_skills(raw_skills, title=title, description=desc)

    for field, value in update_data.items():
        setattr(job, field, value)

    # If required_skills is still empty or "[]", auto-extract from current description
    if not job.required_skills or job.required_skills == "[]":
        job.required_skills = _resolve_skills(None, title=job.title, description=job.description)

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
    user_id = current_user.get("user_id")
    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job or job.user_id != user_id:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )


    try:
        # Delete related matches first
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
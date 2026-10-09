from datetime import datetime, timezone
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models.candidate import Candidate
from app.utils.sanitizer import sanitize_text, sanitize_url

from app.schemas.candidate import (
    CandidateCreate,
    CandidateUpdate,
    CandidateResponse,
    InterviewScheduleRequest,
    InterviewResponse,
    InterviewResultRequest,
    InterviewResultResponse,
)


router = APIRouter(
    dependencies=[
        Depends(get_current_user)
    ]
)


# =========================================================
# CREATE CANDIDATE
# =========================================================
# VERIFY EMAIL
# =========================================================

@router.get("/verify-email")
def verify_candidate_email(
    email: str,
):
    from app.services.email_validator import validate_email_address
    return validate_email_address(email, check_dns=True)


# =========================================================
# CREATE CANDIDATE
# =========================================================

@router.post(
    "/",
    response_model=CandidateResponse,
)
def create_candidate(
    candidate: CandidateCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    from app.services.email_validator import validate_email_address

    email_check = validate_email_address(candidate.email, check_dns=False)
    if not email_check["valid"]:
        raise HTTPException(
            status_code=400,
            detail=email_check.get("reason") or "Invalid email address format.",
        )

    clean_email = email_check.get("suggestion") or email_check["email"]

    existing = (
        db.query(Candidate)
        .filter(
            Candidate.email == clean_email,
            Candidate.user_id == current_user["user_id"],
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Candidate with this email already exists",
        )

    new_candidate = Candidate(
        name=sanitize_text(candidate.name),
        email=clean_email,
        phone=sanitize_text(candidate.phone),
        linkedin=sanitize_url(candidate.linkedin),
        github=sanitize_url(candidate.github),
        location=sanitize_text(candidate.location),
        summary=sanitize_text(candidate.summary),
        resume_url=candidate.resume_url,
        resume_text=candidate.resume_text,
        skills=candidate.skills,
        experience=candidate.experience,
        experience_years=candidate.experience_years,
        education=candidate.education,
        projects=candidate.projects,
        certifications=candidate.certifications,
        languages=candidate.languages,
        ats_score=candidate.ats_score,
        status=candidate.status,
        user_id=current_user["user_id"],
    )

    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    return new_candidate



# =========================================================
# GET ALL CANDIDATES
# =========================================================

@router.get(
    "/",
    response_model=list[CandidateResponse],
)
def get_candidates(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    return (
        db.query(Candidate)
        .filter(
            Candidate.user_id == current_user["user_id"]
        )
        .order_by(
            Candidate.created_at.desc()
        )
        .all()
    )


# =========================================================
# GET INTERVIEW CANDIDATES
# =========================================================

@router.get(
    "/interviews",
    response_model=list[CandidateResponse],
)
def get_interview_candidates(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    return (
        db.query(Candidate)
        .filter(
            Candidate.user_id == current_user["user_id"],
            Candidate.status.in_(["Interview", "Technical Interview", "HR Interview"]),
        )
        .order_by(
            Candidate.interview_date.asc()
        )
        .all()
    )


# =========================================================
# GET COMPLETED INTERVIEWS
# =========================================================

@router.get(
    "/interviews/completed",
    response_model=list[CandidateResponse],
)
def get_completed_interviews(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    return (
        db.query(Candidate)
        .filter(
            Candidate.user_id == current_user["user_id"],
            Candidate.interview_result.isnot(None),
        )
        .order_by(
            Candidate.interview_completed_at.desc()
        )
        .all()
    )


# =========================================================
# GET CANDIDATE
# =========================================================

@router.get(
    "/{candidate_id}",
    response_model=CandidateResponse,
)
def get_candidate(
    candidate_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id,
            Candidate.user_id == current_user["user_id"],
        )
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    return candidate


# =========================================================
# GET CANDIDATE RESUME (AUTHENTICATED & TENANT-PROTECTED)
# =========================================================

@router.get("/{candidate_id}/resume")
def get_candidate_resume(
    candidate_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    # Multi-tenant authorization check: owner or platform admin
    is_owner = candidate.user_id == current_user["user_id"]
    is_admin = current_user.get("role") == "admin"
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: You do not have permission to access this candidate's resume",
        )

    if not candidate.resume_url:
        raise HTTPException(
            status_code=404,
            detail="No resume file available for this candidate",
        )

    # Cloud Storage URL (e.g. Supabase Storage)
    if candidate.resume_url.startswith("http://") or candidate.resume_url.startswith("https://"):
        return RedirectResponse(url=candidate.resume_url)

    # Local file: strictly prevent path traversal
    upload_root = Path(settings.UPLOAD_DIR).resolve()
    target_path = Path(candidate.resume_url).resolve()

    try:
        target_path.relative_to(upload_root)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid resume file path detected",
        )

    if not target_path.exists() or not target_path.is_file():
        raise HTTPException(
            status_code=404,
            detail="Resume file does not exist on disk",
        )

    media_type = (
        "application/pdf"
        if target_path.suffix.lower() == ".pdf"
        else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

    clean_filename = f"{candidate.name.replace(' ', '_')}_Resume{target_path.suffix}"

    return FileResponse(
        path=str(target_path),
        media_type=media_type,
        filename=clean_filename,
        content_disposition_type="inline",
    )


# =========================================================
# UPDATE CANDIDATE
# =========================================================

@router.put("/{candidate_id}")
def update_candidate(
    candidate_id: str,
    candidate_data: CandidateUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id,
            Candidate.user_id == current_user["user_id"],
        )
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    update_data = candidate_data.model_dump(
        exclude_unset=True
    )

    # Sanitize string inputs against XSS
    for field in ["name", "phone", "location", "summary"]:
        if field in update_data and update_data[field]:
            update_data[field] = sanitize_text(update_data[field])
    for field in ["linkedin", "github"]:
        if field in update_data and update_data[field]:
            update_data[field] = sanitize_url(update_data[field])


    # --------------------------------------------------
    # Validate and normalize email if provided
    # --------------------------------------------------
    if "email" in update_data and update_data["email"]:
        from app.services.email_validator import validate_email_address
        email_check = validate_email_address(update_data["email"], check_dns=False)
        if not email_check["valid"]:
            raise HTTPException(
                status_code=400,
                detail=email_check.get("reason") or "Invalid email address format.",
            )
        clean_email = email_check.get("suggestion") or email_check["email"]

        if clean_email != candidate.email:
            existing = (
                db.query(Candidate)
                .filter(
                    Candidate.email == clean_email,
                    Candidate.user_id == current_user["user_id"],
                    Candidate.id != candidate.id,
                )
                .first()
            )
            if existing:
                raise HTTPException(
                    status_code=400,
                    detail="Another candidate with this email already exists",
                )
        update_data["email"] = clean_email

    # --------------------------------------------------
    # If candidate is moved back before the interview
    # stage, clear the previous interview state.
    # --------------------------------------------------

    new_status = update_data.get("status")

    if new_status in [
        "Applied",
        "Screening",
    ]:
        candidate.interview_result = None
        candidate.interview_score = None
        candidate.interview_feedback = None
        candidate.interview_completed_at = None

        candidate.interview_date = None
        candidate.interviewer = None
        candidate.meeting_link = None

    # --------------------------------------------------
    # If candidate is moved into Interview manually,
    # keep the candidate as an active interview candidate.
    # Previous completed interview result should not remain.
    # --------------------------------------------------

    elif new_status == "Interview":
        candidate.interview_result = None
        candidate.interview_score = None
        candidate.interview_feedback = None
        candidate.interview_completed_at = None

    # --------------------------------------------------
    # Apply normal candidate updates
    # --------------------------------------------------

    for field, value in update_data.items():
        setattr(candidate, field, value)

    db.commit()
    db.refresh(candidate)

    return candidate


# =========================================================
# DELETE CANDIDATE
# =========================================================

@router.delete(
    "/{candidate_id}"
)
def delete_candidate(
    candidate_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id,
            Candidate.user_id == current_user["user_id"],
        )
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    # Delete resume file if it exists (local or cloud)
    if candidate.resume_url:
        from app.services.storage_service import delete_file
        delete_file(candidate.resume_url)

    db.delete(candidate)
    db.commit()

    return {
        "success": True,
        "message": "Candidate deleted successfully",
    }


# =========================================================
# SCHEDULE INTERVIEW
# =========================================================

@router.post(
    "/{candidate_id}/interview",
    response_model=InterviewResponse,
)
def schedule_interview(
    candidate_id: str,
    interview: InterviewScheduleRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id,
            Candidate.user_id == current_user["user_id"],
        )
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    if not interview.interview_date:
        raise HTTPException(
            status_code=400,
            detail="Interview date is required",
        )

    if not interview.interviewer:
        raise HTTPException(
            status_code=400,
            detail="Interviewer name is required",
        )

    candidate.interview_date = (
        interview.interview_date
    )

    candidate.interviewer = (
        interview.interviewer.strip()
    )

    candidate.meeting_link = (
        interview.meeting_link.strip()
        if interview.meeting_link
        else None
    )

    candidate.status = "Interview"

    # Reset previous interview result if rescheduling
    candidate.interview_result = None
    candidate.interview_score = None
    candidate.interview_feedback = None
    candidate.interview_completed_at = None

    try:

        db.commit()
        db.refresh(candidate)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to schedule interview",
        )

    return {
        "success": True,
        "message": "Interview scheduled successfully",
        "candidate_id": candidate.id,
        "candidate_name": candidate.name,
        "interview_date": candidate.interview_date,
        "interviewer": candidate.interviewer,
        "meeting_link": candidate.meeting_link,
    }


# =========================================================
# COMPLETE INTERVIEW
# =========================================================

@router.post(
    "/{candidate_id}/interview/result",
    response_model=InterviewResultResponse,
)
def complete_interview(
    candidate_id: str,
    interview: InterviewResultRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id,
            Candidate.user_id == current_user["user_id"],
        )
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    # -----------------------------------------------------
    # Validate result
    # -----------------------------------------------------

    allowed_results = {
        "Selected",
        "Rejected",
        "On Hold",
    }

    if interview.result not in allowed_results:

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid interview result. "
                "Use Selected, Rejected, or On Hold."
            ),
        )

    # -----------------------------------------------------
    # Validate score
    # -----------------------------------------------------

    if interview.score is not None:

        if interview.score < 0 or interview.score > 100:

            raise HTTPException(
                status_code=400,
                detail="Interview score must be between 0 and 100",
            )

    # -----------------------------------------------------
    # Save interview result
    # -----------------------------------------------------

    candidate.interview_result = interview.result

    candidate.interview_score = interview.score

    candidate.interview_feedback = (
        interview.feedback.strip()
        if interview.feedback
        else None
    )

    candidate.interview_completed_at = datetime.now(timezone.utc)

    # -----------------------------------------------------
    # Update recruitment status
    # -----------------------------------------------------

    if interview.result in ["Selected", "Hired"]:

        candidate.status = "Selected"

    elif interview.result == "Rejected":

        candidate.status = "Rejected"

    elif interview.result == "On Hold":

        candidate.status = "On Hold"

    try:

        db.commit()
        db.refresh(candidate)

    except Exception:

        db.rollback()

        raise HTTPException(
            status_code=500,
            detail="Failed to save interview result",
        )

    return {
        "success": True,
        "message": "Interview result saved successfully",
        "candidate_id": candidate.id,
        "candidate_name": candidate.name,
        "result": candidate.interview_result,
        "score": candidate.interview_score,
        "feedback": candidate.interview_feedback,
        "status": candidate.status,
    }
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.candidate import Candidate

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

@router.post(
    "/",
    response_model=CandidateResponse,
)
def create_candidate(
    candidate: CandidateCreate,
    db: Session = Depends(get_db),
):

    existing = (
        db.query(Candidate)
        .filter(
            Candidate.email == candidate.email
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Candidate already exists",
        )

    new_candidate = Candidate(
        name=candidate.name,
        email=candidate.email,
        phone=candidate.phone,
        linkedin=candidate.linkedin,
        github=candidate.github,
        location=candidate.location,
        summary=candidate.summary,
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
):

    return (
        db.query(Candidate)
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
):

    return (
        db.query(Candidate)
        .filter(
            Candidate.status == "Interview"
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
):

    return (
        db.query(Candidate)
        .filter(
            Candidate.interview_result.isnot(None)
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
):

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id
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
# UPDATE CANDIDATE
# =========================================================

@router.put("/{candidate_id}")
def update_candidate(
    candidate_id: str,
    candidate_data: CandidateUpdate,
    db: Session = Depends(get_db),
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

    update_data = candidate_data.model_dump(
        exclude_unset=True
    )

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
):

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id
        )
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    # Delete resume file if it exists
    if candidate.resume_url:
        from pathlib import Path
        resume_file = Path(candidate.resume_url)
        if resume_file.exists():
            resume_file.unlink()

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
):

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id
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
):

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == candidate_id
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

    if interview.result == "Selected":

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
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.candidate import Candidate

from app.schemas.candidate import (
    CandidateCreate,
    CandidateUpdate,
    CandidateResponse,
    InterviewScheduleRequest,
    InterviewResponse,
)


router = APIRouter()


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
    )

    db.add(new_candidate)
    db.commit()
    db.refresh(new_candidate)

    return new_candidate



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
            Candidate.created_at.desc()
        )
        .all()
    )



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



@router.put(
    "/{candidate_id}",
    response_model=CandidateResponse,
)
def update_candidate(
    candidate_id: str,
    updated: CandidateUpdate,
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

    update_data = (
        updated.model_dump(
            exclude_unset=True
        )
    )

    for key, value in update_data.items():
        setattr(
            candidate,
            key,
            value
        )

    db.commit()
    db.refresh(candidate)

    return candidate



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

    db.delete(candidate)
    db.commit()

    return {
        "success": True,
        "message": "Candidate deleted successfully",
    }



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
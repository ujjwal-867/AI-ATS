from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.candidate import Candidate

router = APIRouter()


class UpdateStatusRequest(BaseModel):
    candidate_id: int
    status: str


VALID_STATUS = [
    "Applied",
    "Screening",
    "Technical Interview",
    "HR Interview",
    "Offer",
    "Hired",
    "Rejected",
]


@router.get("/")
def get_pipeline(db: Session = Depends(get_db)):
    candidates = db.query(Candidate).all()

    return [
        {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "status": candidate.status,
            "ats_score": candidate.ats_score,
        }
        for candidate in candidates
    ]


@router.put("/status")
def update_status(
    data: UpdateStatusRequest,
    db: Session = Depends(get_db),
):
    if data.status not in VALID_STATUS:
        raise HTTPException(
            status_code=400,
            detail="Invalid status",
        )

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == data.candidate_id)
        .first()
    )

    if candidate is None:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    candidate.status = data.status

    db.commit()
    db.refresh(candidate)

    return {
        "success": True,
        "candidate": {
            "id": candidate.id,
            "status": candidate.status,
        },
    }
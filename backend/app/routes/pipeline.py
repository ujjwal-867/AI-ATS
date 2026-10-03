from fastapi import APIRouter, Depends, HTTPException
from app.dependencies import get_current_user
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.candidate import Candidate

router = APIRouter(
    dependencies=[
        Depends(get_current_user)
    ]
)


from typing import Union

class UpdateStatusRequest(BaseModel):
    candidate_id: Union[str, int]
    status: str


VALID_STATUS = [
    "Applied",
    "Screening",
    "Interview",
    "Technical Interview",
    "HR Interview",
    "Offer",
    "Hired",
    "Selected",
    "Rejected",
]


@router.get("/")
def get_pipeline(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    candidates = (
        db.query(Candidate)
        .filter(Candidate.user_id == current_user["user_id"])
        .all()
    )

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
    current_user: dict = Depends(get_current_user),
):
    if data.status not in VALID_STATUS:
        raise HTTPException(
            status_code=400,
            detail="Invalid status",
        )

    candidate = (
        db.query(Candidate)
        .filter(
            Candidate.id == str(data.candidate_id),
            Candidate.user_id == current_user["user_id"],
        )
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
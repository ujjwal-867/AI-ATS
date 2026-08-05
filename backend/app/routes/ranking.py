from fastapi import APIRouter,Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.candidate import Candidate
from app.models.job import Job
from app.services.matching import calculate_match


router=APIRouter()


@router.get("/{job_id}")
def rank_candidates(
    job_id:str,
    db:Session=Depends(get_db)
):

    job=db.query(Job).filter(
        Job.id==job_id
    ).first()


    if not job:
        return {
            "message":"Job not found"
        }


    candidates=db.query(
        Candidate
    ).all()


    results=[]


    for candidate in candidates:

        results.append(
            calculate_match(
                candidate,
                job.required_skills
            )
        )


    return sorted(
        results,
        key=lambda x:x["match_score"],
        reverse=True
    )
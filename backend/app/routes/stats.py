from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.candidate import Candidate


router = APIRouter()


@router.get("/")
def dashboard_stats(
    db: Session = Depends(get_db),
):

    total_candidates = (
        db.query(Candidate)
        .count()
    )


    active_jobs = 0


    interviews = (
        db.query(Candidate)
        .filter(
            Candidate.status == "Interview"
        )
        .count()
    )


    applied = (
        db.query(Candidate)
        .filter(
            Candidate.status == "Applied"
        )
        .count()
    )


    screening = (
        db.query(Candidate)
        .filter(
            Candidate.status == "Screening"
        )
        .count()
    )


    selected = (
        db.query(Candidate)
        .filter(
            Candidate.status == "Selected"
        )
        .count()
    )


    rejected = (
        db.query(Candidate)
        .filter(
            Candidate.status == "Rejected"
        )
        .count()
    )


    average_ats = (
        db.query(
            func.avg(
                Candidate.ats_score
            )
        )
        .scalar()
    )


    return {

        "totalCandidates":
            total_candidates,

        "activeJobs":
            active_jobs,

        "interviews":
            interviews,

        "averageATS":
            round(
                average_ats or 0
            ),


        "pipeline": {

            "Applied":
                applied,

            "Screening":
                screening,

            "Interview":
                interviews,

            "Selected":
                selected,

            "Rejected":
                rejected,

        }

    }
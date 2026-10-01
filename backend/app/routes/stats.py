from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.candidate import Candidate
from app.models.job import Job

from fastapi import Depends

from app.dependencies import get_current_user

router = APIRouter(
    dependencies=[
        Depends(get_current_user)
    ]
)


@router.get("")
@router.get("/")
def dashboard_stats(
    db: Session = Depends(get_db),
):
    # Candidates
    total_candidates = (
        db.query(Candidate)
        .count()
    )

    # Jobs
    active_jobs = (
        db.query(Job)
        .filter(
            Job.status == "Open"
        )
        .count()
    )

    total_jobs = (
        db.query(Job)
        .count()
    )

    # Interview pipeline
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

    offer = (
        db.query(Candidate)
        .filter(Candidate.status == "Offer")
        .count()
    )

    hired = (
        db.query(Candidate)
        .filter(Candidate.status == "Hired")
        .count()
    )

    rejected = (
        db.query(Candidate)
        .filter(Candidate.status == "Rejected")
        .count()
    )

    # ATS
    average_ats = (
        db.query(func.avg(Candidate.ats_score))
        .scalar()
    )

    return {
        "totalCandidates": total_candidates,
        "activeJobs": active_jobs,
        "totalJobs": total_jobs,
        "interviews": interviews,
        "hired": hired,
        "averageATS": round(average_ats or 0),
        "pipeline": {
            "Applied": applied,
            "Screening": screening,
            "Interview": interviews,
            "Offer": offer,
            "Hired": hired,
            "Rejected": rejected,
        },
        # Aliases used by dashboard components
        "shortlisted": screening,
        "pending": applied,
    }
from datetime import datetime, timedelta

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


def month_label(value):
    return value.strftime("%b")


@router.get("")
@router.get("/")
def get_analytics(
    db: Session = Depends(get_db),
):
    # =========================================================
    # CORE METRICS
    # =========================================================

    total_candidates = (
        db.query(Candidate)
        .count()
    )

    active_jobs = (
        db.query(Job)
        .filter(Job.status == "Open")
        .count()
    )

    interviews = (
        db.query(Candidate)
        .filter(
            Candidate.status == "Interview"
        )
        .count()
    )

    average_ats = (
        db.query(
            func.avg(Candidate.ats_score)
        )
        .scalar()
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

    on_hold = (
        db.query(Candidate)
        .filter(
            Candidate.interview_result == "On Hold"
        )
        .count()
    )

    completed_interviews = (
        db.query(Candidate)
        .filter(
            Candidate.interview_result.isnot(None)
        )
        .count()
    )

    selection_rate = (
        round(
            (selected / total_candidates) * 100,
            1,
        )
        if total_candidates
        else 0
    )

    interview_total = (
        completed_interviews + interviews
    )

    interview_completion_rate = (
        round(
            (completed_interviews / interview_total)
            * 100,
            1,
        )
        if interview_total
        else 0
    )

    # =========================================================
    # PIPELINE
    # =========================================================

    statuses = [
        "Applied",
        "Screening",
        "Interview",
        "Selected",
        "Rejected",
    ]

    pipeline = []

    for status in statuses:
        count = (
            db.query(Candidate)
            .filter(
                Candidate.status == status
            )
            .count()
        )

        pipeline.append(
            {
                "name": status,
                "value": count,
            }
        )

    # =========================================================
    # ATS SCORE DISTRIBUTION
    # =========================================================

    ats_distribution = [
        {
            "name": "0-39",
            "value": (
                db.query(Candidate)
                .filter(
                    Candidate.ats_score < 40
                )
                .count()
            ),
        },
        {
            "name": "40-59",
            "value": (
                db.query(Candidate)
                .filter(
                    Candidate.ats_score >= 40,
                    Candidate.ats_score < 60,
                )
                .count()
            ),
        },
        {
            "name": "60-79",
            "value": (
                db.query(Candidate)
                .filter(
                    Candidate.ats_score >= 60,
                    Candidate.ats_score < 80,
                )
                .count()
            ),
        },
        {
            "name": "80-100",
            "value": (
                db.query(Candidate)
                .filter(
                    Candidate.ats_score >= 80
                )
                .count()
            ),
        },
    ]

    # =========================================================
    # LAST 6 MONTHS
    # =========================================================

    now = datetime.utcnow()

    first_month = datetime(
        now.year,
        now.month,
        1,
    )

    months = []

    for offset in range(5, -1, -1):

        month_start = first_month

        for _ in range(offset):
            previous_month = (
                month_start.replace(day=1)
                - timedelta(days=1)
            )

            month_start = previous_month.replace(
                day=1
            )

        next_month = (
            month_start.replace(day=28)
            + timedelta(days=4)
        ).replace(day=1)

        applications = (
            db.query(Candidate)
            .filter(
                Candidate.created_at >= month_start,
                Candidate.created_at < next_month,
            )
            .count()
        )

        selected_count = (
            db.query(Candidate)
            .filter(
                Candidate.status == "Selected",
                Candidate.created_at >= month_start,
                Candidate.created_at < next_month,
            )
            .count()
        )

        completed_count = (
            db.query(Candidate)
            .filter(
                Candidate.interview_result.isnot(None),
                Candidate.interview_completed_at >= month_start,
                Candidate.interview_completed_at < next_month,
            )
            .count()
        )

        months.append(
            {
                "month": month_label(
                    month_start
                ),
                "applications": applications,
                "interviews": completed_count,
                "selected": selected_count,
            }
        )

    # =========================================================
    # RECENT CANDIDATES
    # =========================================================

    recent_candidates = (
        db.query(Candidate)
        .order_by(
            Candidate.created_at.desc()
        )
        .limit(6)
        .all()
    )

    recent_activity = [
        {
            "id": candidate.id,
            "name": candidate.name,
            "status": candidate.status,
            "ats_score": candidate.ats_score or 0,
            "created_at": (
                candidate.created_at.isoformat()
                if candidate.created_at
                else None
            ),
        }
        for candidate in recent_candidates
    ]

    # =========================================================
    # RESPONSE
    # =========================================================

    return {
        "summary": {
            "totalCandidates": total_candidates,
            "activeJobs": active_jobs,
            "interviews": interviews,
            "completedInterviews": completed_interviews,
            "averageATS": round(
                average_ats or 0
            ),
            "selected": selected,
            "rejected": rejected,
            "onHold": on_hold,
            "selectionRate": selection_rate,
            "interviewCompletionRate": (
                interview_completion_rate
            ),
        },

        "pipeline": pipeline,

        "atsDistribution": ats_distribution,

        "trend": months,

        "recentActivity": recent_activity,
    }
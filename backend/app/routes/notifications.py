from datetime import datetime, timezone

from fastapi import APIRouter, Depends
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


def notification_time(value):
    if not value:
        return None

    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)

    return value.isoformat()


@router.get("")
@router.get("/")
def get_notifications(
    db: Session = Depends(get_db),
):
    notifications = []

    candidates = (
        db.query(Candidate)
        .order_by(Candidate.updated_at.desc())
        .limit(20)
        .all()
    )

    for candidate in candidates:

        if candidate.interview_date:
            notifications.append({
                "id": f"interview-{candidate.id}",
                "title": "Interview Scheduled",
                "message": (
                    f"Interview scheduled for "
                    f"{candidate.name}"
                ),
                "type": "interview",
                "timestamp": notification_time(
                    candidate.updated_at
                    or candidate.created_at
                ),
                "read": False,
            })

        if candidate.interview_result:
            notifications.append({
                "id": f"result-{candidate.id}",
                "title": "Interview Completed",
                "message": (
                    f"{candidate.name} interview result: "
                    f"{candidate.interview_result}"
                ),
                "type": "success"
                if candidate.interview_result == "Selected"
                else "info",
                "timestamp": notification_time(
                    candidate.interview_completed_at
                    or candidate.updated_at
                ),
                "read": False,
            })

        if (
            candidate.ats_score is not None
            and candidate.ats_score >= 80
        ):
            notifications.append({
                "id": f"ats-{candidate.id}",
                "title": "High ATS Score",
                "message": (
                    f"{candidate.name} scored "
                    f"{candidate.ats_score}/100"
                ),
                "type": "ai",
                "timestamp": notification_time(
                    candidate.updated_at
                    or candidate.created_at
                ),
                "read": False,
            })

    jobs = (
        db.query(Job)
        .order_by(Job.updated_at.desc())
        .limit(10)
        .all()
    )

    for job in jobs:
        if job.status == "Open":
            notifications.append({
                "id": f"job-{job.id}",
                "title": "Job Open",
                "message": (
                    f"{job.title} is currently open"
                ),
                "type": "job",
                "timestamp": notification_time(
                    job.updated_at
                    or job.created_at
                ),
                "read": False,
            })

    notifications.sort(
        key=lambda item: item.get("timestamp") or "",
        reverse=True,
    )

    return notifications[:10]
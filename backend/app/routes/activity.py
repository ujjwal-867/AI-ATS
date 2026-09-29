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


def format_time(value):
    if not value:
        return None

    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)

    now = datetime.now(timezone.utc)

    seconds = max(
        0,
        int((now - value).total_seconds())
    )

    if seconds < 60:
        return "Just now"

    minutes = seconds // 60

    if minutes < 60:
        return f"{minutes} min ago"

    hours = minutes // 60

    if hours < 24:
        return f"{hours} hour ago" if hours == 1 else f"{hours} hours ago"

    days = hours // 24

    if days < 7:
        return f"{days} day ago" if days == 1 else f"{days} days ago"

    return value.strftime("%d %b %Y")


@router.get("")
@router.get("/")
def activity(
    db: Session = Depends(get_db),
):
    activities = []

    # =========================================================
    # CANDIDATE ACTIVITY
    # =========================================================

    candidates = (
        db.query(Candidate)
        .order_by(
            Candidate.created_at.desc()
        )
        .limit(20)
        .all()
    )

    for candidate in candidates:

        # Candidate added
        if candidate.created_at:
            activities.append({
                "id": f"candidate-created-{candidate.id}",
                "title": f"{candidate.name} added as candidate",
                "time": format_time(candidate.created_at),
                "type": "upload",
                "timestamp": candidate.created_at.isoformat(),
            })

        # Interview scheduled
        if candidate.interview_date:

            try:
                interview_time = datetime.fromisoformat(
                    candidate.interview_date.replace(
                        "Z",
                        "+00:00"
                    )
                )
            except Exception:
                interview_time = candidate.updated_at

            activities.append({
                "id": f"interview-{candidate.id}",
                "title": f"Interview scheduled for {candidate.name}",
                "time": format_time(interview_time),
                "type": "interview",
                "timestamp": (
                    interview_time.isoformat()
                    if interview_time
                    else None
                ),
            })

        # Interview completed
        if candidate.interview_result:

            completed_at = (
                candidate.interview_completed_at
                or candidate.updated_at
            )

            activities.append({
                "id": f"interview-result-{candidate.id}",
                "title": (
                    f"{candidate.name} interview "
                    f"{candidate.interview_result}"
                ),
                "time": format_time(completed_at),
                "type": (
                    "hired"
                    if candidate.interview_result == "Selected"
                    else "interview"
                ),
                "timestamp": (
                    completed_at.isoformat()
                    if completed_at
                    else None
                ),
            })

        # AI ATS score
        if candidate.ats_score is not None and candidate.ats_score > 0:

            score_time = (
                candidate.updated_at
                or candidate.created_at
            )

            activities.append({
                "id": f"ats-{candidate.id}",
                "title": (
                    f"AI score generated for "
                    f"{candidate.name} — "
                    f"{candidate.ats_score}/100"
                ),
                "time": format_time(score_time),
                "type": "ai",
                "timestamp": (
                    score_time.isoformat()
                    if score_time
                    else None
                ),
            })

    # =========================================================
    # JOB ACTIVITY
    # =========================================================

    jobs = (
        db.query(Job)
        .order_by(
            Job.created_at.desc()
        )
        .limit(10)
        .all()
    )

    for job in jobs:

        if job.created_at:
            activities.append({
                "id": f"job-{job.id}",
                "title": f"Job created: {job.title}",
                "time": format_time(job.created_at),
                "type": "upload",
                "timestamp": job.created_at.isoformat(),
            })

    # =========================================================
    # SORT BY MOST RECENT
    # =========================================================

    activities.sort(
        key=lambda item: item.get("timestamp") or "",
        reverse=True,
    )

    # Keep dashboard compact
    return activities[:8]
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, extract

from app.database import get_db
from app.models.candidate import Candidate


router = APIRouter()


@router.get("/")
def get_analytics(
    db: Session = Depends(get_db),
):
    results = (
        db.query(
            extract(
                "month",
                Candidate.created_at
            ).label("month"),
            func.count(
                Candidate.id
            ).label("applications"),
        )
        .group_by(
            extract(
                "month",
                Candidate.created_at
            )
        )
        .order_by("month")
        .all()
    )


    hired_results = (
        db.query(
            extract(
                "month",
                Candidate.updated_at
            ).label("month"),
            func.count(
                Candidate.id
            ).label("hired"),
        )
        .filter(
            Candidate.status == "Hired"
        )
        .group_by(
            extract(
                "month",
                Candidate.updated_at
            )
        )
        .order_by("month")
        .all()
    )


    hired_map = {
        int(row.month): row.hired
        for row in hired_results
    }


    months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ]


    analytics = []


    for row in results:

        month_number = int(row.month)

        analytics.append(
            {
                "month": months[month_number - 1],
                "applications": row.applications,
                "hired": hired_map.get(
                    month_number,
                    0
                ),
            }
        )


    return analytics
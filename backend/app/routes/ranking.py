import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_current_user
from app.database import get_db

from app.models.candidate import Candidate
from app.models.job import Job
from app.models.match import Match

from app.services.matching import calculate_match


router = APIRouter(
    dependencies=[
        Depends(get_current_user)
    ]
)


@router.get("/{job_id}")
def rank_candidates(
    job_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    job = (
        db.query(Job)
        .filter(
            Job.id == job_id,
            Job.user_id == current_user["user_id"],
        )
        .first()
    )

    if not job:

        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

    candidates = (
        db.query(Candidate)
        .filter(
            Candidate.user_id == current_user["user_id"]
        )
        .all()
    )

    ranking = []

    for candidate in candidates:

        result = calculate_match(
            candidate,
            job,
        )

        existing_match = (
            db.query(Match)
            .filter(
                Match.candidate_id == candidate.id,
                Match.job_id == job.id,
            )
            .first()
        )

        if existing_match:

            existing_match.match_score = (
                result["match_score"]
            )

            existing_match.matched_skills = (
                json.dumps(
                    result["matched_skills"]
                )
            )

            existing_match.missing_skills = (
                json.dumps(
                    result["missing_skills"]
                )
            )

            existing_match.extra_skills = (
                json.dumps(
                    result.get(
                        "extra_skills",
                        [],
                    )
                )
            )

            existing_match.recommendation = (
                result["recommendation"]
            )

        else:

            match = Match(

                candidate_id=candidate.id,

                job_id=job.id,

                match_score=result[
                    "match_score"
                ],

                matched_skills=json.dumps(
                    result["matched_skills"]
                ),

                missing_skills=json.dumps(
                    result["missing_skills"]
                ),

                extra_skills=json.dumps(
                    result.get(
                        "extra_skills",
                        [],
                    )
                ),

                recommendation=result[
                    "recommendation"
                ],
            )

            db.add(match)

        ranking.append(result)

    db.commit()

    ranking = sorted(
        ranking,
        key=lambda item: item[
            "match_score"
        ],
        reverse=True,
    )

    for index, item in enumerate(
        ranking,
        start=1,
    ):

        item["rank"] = index

    return {

        "success": True,

        "job": {
            "id": job.id,
            "title": job.title,
        },

        "total_candidates": len(
            ranking
        ),

        "ranking": ranking,
    }
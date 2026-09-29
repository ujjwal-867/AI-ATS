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


@router.post("/{candidate_id}/{job_id}")
def match_candidate(
    candidate_id: str,
    job_id: str,
    db: Session = Depends(get_db),
):

    candidate = (
        db.query(Candidate)
        .filter(Candidate.id == candidate_id)
        .first()
    )

    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found",
        )

    job = (
        db.query(Job)
        .filter(Job.id == job_id)
        .first()
    )

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found",
        )

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

        match = existing_match

        match.match_score = result[
            "match_score"
        ]

        match.matched_skills = json.dumps(
            result["matched_skills"]
        )

        match.missing_skills = json.dumps(
            result["missing_skills"]
        )

        match.extra_skills = json.dumps(
            result.get(
                "extra_skills",
                [],
            )
        )

        match.recommendation = result[
            "recommendation"
        ]

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

    db.commit()
    db.refresh(match)

    return {

        "success": True,

        "match_id": match.id,

        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
        },

        "job": {
            "id": job.id,
            "title": job.title,
        },

        "match_score": result[
            "match_score"
        ],

        "recommendation": result[
            "recommendation"
        ],

        "score_breakdown": result[
            "score_breakdown"
        ],

        "matched_skills": result[
            "matched_skills"
        ],

        "missing_skills": result[
            "missing_skills"
        ],

        "critical_missing_skills": result[
            "critical_missing_skills"
        ],

        "experience_analysis": result[
            "experience_analysis"
        ],

        "role_analysis": result[
            "role_analysis"
        ],

        "semantic_analysis": result[
            "semantic_analysis"
        ],

        "project_analysis": result[
            "project_analysis"
        ],

        "education_analysis": result[
            "education_analysis"
        ],

        "certification_analysis": result[
            "certification_analysis"
        ],

        "resume_quality": result[
            "resume_quality"
        ],

        "extra_skills": result[
            "extra_skills"
        ],
    }


@router.get("/")
def get_matches(
    db: Session = Depends(get_db),
):

    matches = (
        db.query(Match)
        .order_by(
            Match.created_at.desc()
        )
        .all()
    )

    return {
        "success": True,
        "total": len(matches),
        "matches": matches,
    }


@router.get("/{match_id}")
def get_match(
    match_id: str,
    db: Session = Depends(get_db),
):

    match = (
        db.query(Match)
        .filter(
            Match.id == match_id
        )
        .first()
    )

    if not match:
        raise HTTPException(
            status_code=404,
            detail="Match not found",
        )

    return {
        "success": True,
        "match": match,
    }
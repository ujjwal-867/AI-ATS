import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db

from app.models.candidate import Candidate
from app.models.job import Job
from app.models.match import Match

from app.services.ats_score import calculate_match


router = APIRouter()


# Create ATS match between any candidate and any job
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


    candidate_skills = json.loads(
        candidate.skills or "[]"
    )


    job_skills = json.loads(
        job.required_skills or "[]"
    )


    result = calculate_match(
        " ".join(candidate_skills),
        " ".join(job_skills),
    )


    # Update latest candidate ATS score

    candidate.ats_score = result["ats_score"]


    # Save match history

    match = Match(
        candidate_id=candidate.id,
        job_id=job.id,
        ats_score=result["ats_score"],

        matched_skills=json.dumps(
            result["matched_skills"]
        ),

        missing_skills=json.dumps(
            result["missing_skills"]
        ),

        extra_skills=json.dumps(
            result["extra_skills"]
        ),
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

        "ats_score": result["ats_score"],

        "matched_skills": result["matched_skills"],

        "missing_skills": result["missing_skills"],

        "extra_skills": result["extra_skills"],
    }



# Get all ATS match history

@router.get("/")
def get_matches(
    db: Session = Depends(get_db),
):

    matches = (
        db.query(Match)
        .order_by(Match.created_at.desc())
        .all()
    )


    return {
        "success": True,
        "total": len(matches),
        "matches": matches,
    }



# Get single match result

@router.get("/{match_id}")
def get_match(
    match_id: str,
    db: Session = Depends(get_db),
):

    match = (
        db.query(Match)
        .filter(Match.id == match_id)
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
from pathlib import Path
import json
import uuid

from fastapi import HTTPException
from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.candidate import Candidate
from app.services.resume_parser import parse_resume

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def upload_resume(
    file: UploadFile,
    db: Session,
):
    allowed = {
        ".pdf",
        ".docx",
    }

    extension = Path(file.filename).suffix.lower()

    if extension not in allowed:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX are allowed.",
        )

    # Read file content and validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10 MB.",
        )

    filename = f"{uuid.uuid4()}{extension}"
    filepath = UPLOAD_DIR / filename

    with filepath.open("wb") as buffer:
        buffer.write(content)

    parsed = parse_resume(str(filepath))

    if not parsed.get("email"):
        raise HTTPException(
            status_code=400,
            detail="Unable to extract email from resume.",
        )

    experience = parsed.get("experience", {})
    education = parsed.get("education", {})

    existing = (
        db.query(Candidate)
        .filter(Candidate.email == parsed["email"])
        .first()
    )

    # ----------------------------
    # UPDATE EXISTING CANDIDATE
    # ----------------------------
    if existing:
        # Clean up old resume file if different
        if existing.resume_url and existing.resume_url != str(filepath):
            old_file = Path(existing.resume_url)
            if old_file.exists():
                old_file.unlink()

        existing.name = parsed.get("name") or existing.name
        existing.phone = parsed.get("phone")
        existing.linkedin = parsed.get("linkedin")
        existing.github = parsed.get("github")
        existing.location = parsed.get("location")

        existing.resume_url = str(filepath)
        existing.resume_text = parsed.get("resume_text")

        existing.skills = json.dumps(
            parsed.get("skills", [])
        )

        existing.education = json.dumps(
            education
        )

        existing.experience = json.dumps(
            experience
        )

        existing.experience_years = experience.get(
            "years",
            0,
        )

        existing.projects = json.dumps(
            parsed.get("projects", [])
        )

        existing.certifications = json.dumps(
            parsed.get("certifications", [])
        )

        existing.languages = json.dumps(
            parsed.get("languages", [])
        )

        db.commit()
        db.refresh(existing)

        return {
            "success": True,
            "message": "Candidate profile updated successfully.",
            "candidate": {
                "id": existing.id,
                "name": existing.name,
                "email": existing.email,
                "phone": existing.phone,
                "linkedin": existing.linkedin,
                "github": existing.github,
                "location": existing.location,
                "skills": parsed.get("skills", []),
                "education": education,
                "experience": experience,
                "projects": parsed.get("projects", []),
                "certifications": parsed.get("certifications", []),
                "languages": parsed.get("languages", []),
                "status": existing.status,
                "ats_score": existing.ats_score,
            },
        }

    # ----------------------------
    # CREATE NEW CANDIDATE
    # ----------------------------

    candidate = Candidate(
        name=parsed.get("name") or "Unknown",
        email=parsed["email"],
        phone=parsed.get("phone"),
        linkedin=parsed.get("linkedin"),
        github=parsed.get("github"),
        location=parsed.get("location"),
        summary=None,
        resume_url=str(filepath),
        resume_text=parsed.get("resume_text"),
        skills=json.dumps(parsed.get("skills", [])),
        experience=json.dumps(experience),
        experience_years=experience.get("years", 0),
        education=json.dumps(education),
        projects=json.dumps(parsed.get("projects", [])),
        certifications=json.dumps(parsed.get("certifications", [])),
        languages=json.dumps(parsed.get("languages", [])),
        ats_score=0,
        status="Applied",
    )

    db.add(candidate)
    db.commit()
    db.refresh(candidate)

    return {
        "success": True,
        "message": "Resume uploaded successfully.",
        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "phone": candidate.phone,
            "linkedin": candidate.linkedin,
            "github": candidate.github,
            "location": candidate.location,
            "skills": parsed.get("skills", []),
            "education": education,
            "experience": experience,
            "projects": parsed.get("projects", []),
            "certifications": parsed.get("certifications", []),
            "languages": parsed.get("languages", []),
            "status": candidate.status,
            "ats_score": candidate.ats_score,
        },
    }
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
    user_id: str = None,
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

    # Magic byte verification (prevent executable or malicious script spoofing)
    if extension == ".pdf" and not content.startswith(b"%PDF-"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. The file is not a valid PDF document.",
        )
    if extension == ".docx" and not content.startswith(b"PK\x03\x04"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. The file is not a valid DOCX document.",
        )

    filename = f"{uuid.uuid4()}{extension}"
    filepath = UPLOAD_DIR / filename

    with filepath.open("wb") as buffer:
        buffer.write(content)

    parsed = parse_resume(str(filepath))

    from app.services.email_validator import validate_email_address

    email_val = validate_email_address(parsed.get("email"), check_dns=False)
    if not email_val["valid"]:
        # Clean up temporary file on failure
        filepath.unlink(missing_ok=True)
        reason = email_val.get("reason") or "Unable to extract a valid email from resume."
        raise HTTPException(
            status_code=400,
            detail=f"Invalid candidate email: {reason}",
        )

    # Use validated and normalized email
    parsed["email"] = email_val.get("suggestion") or email_val["email"]

    # Save to persistent storage (Supabase Storage in cloud, or local disk)
    from app.services.storage_service import save_file, delete_file, is_cloud_storage_enabled
    content_type = "application/pdf" if extension == ".pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    final_resume_url = save_file(content, filename, content_type)

    # Clean up local temporary file if cloud storage is active
    if is_cloud_storage_enabled():
        try:
            filepath.unlink(missing_ok=True)
        except Exception:
            pass

    experience = parsed.get("experience", {})
    education = parsed.get("education", {})

    existing_query = db.query(Candidate).filter(Candidate.email == parsed["email"])
    if user_id:
        existing_query = existing_query.filter(Candidate.user_id == user_id)
    existing = existing_query.first()

    # ----------------------------
    # UPDATE EXISTING CANDIDATE
    # ----------------------------
    if existing:
        if user_id and not existing.user_id:
            existing.user_id = user_id
        # Clean up old resume file
        if existing.resume_url and existing.resume_url != final_resume_url:
            delete_file(existing.resume_url)

        from app.utils.sanitizer import sanitize_text, sanitize_url

        existing.name = sanitize_text(parsed.get("name") or existing.name)
        existing.phone = sanitize_text(parsed.get("phone"))
        existing.linkedin = sanitize_url(parsed.get("linkedin"))
        existing.github = sanitize_url(parsed.get("github"))
        existing.location = sanitize_text(parsed.get("location"))

        existing.resume_url = final_resume_url
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
        user_id=user_id,
        name=sanitize_text(parsed.get("name") or "Unknown"),
        email=parsed["email"],
        phone=sanitize_text(parsed.get("phone")),
        linkedin=sanitize_url(parsed.get("linkedin")),
        github=sanitize_url(parsed.get("github")),
        location=sanitize_text(parsed.get("location")),
        summary=None,
        resume_url=final_resume_url,
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
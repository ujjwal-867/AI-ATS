from sqlalchemy import Column, String, Integer, DateTime, Text
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Candidate(Base):
    __tablename__ = "candidates"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    # Basic Information
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)

    linkedin = Column(String)
    github = Column(String)
    location = Column(String)

    # Professional Summary
    summary = Column(Text)

    # Resume
    resume_url = Column(String)
    resume_text = Column(Text)

    # Skills
    skills = Column(Text)

    # Experience
    experience = Column(String)
    experience_years = Column(Integer, default=0)

    # Education
    education = Column(Text)

    # Projects
    projects = Column(Text)

    # Certifications
    certifications = Column(Text)

    # Languages
    languages = Column(Text)

    # ATS
    ats_score = Column(Integer, default=0)

    # Recruitment
    status = Column(
        String,
        default="Applied",
    )

    applied_job = Column(String)

    interview_date = Column(String)
    interviewer = Column(String)
    meeting_link = Column(String)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
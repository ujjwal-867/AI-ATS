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

    user_id = Column(
        String,
        index=True,
        nullable=True,
    )

    # =========================
    # Basic Information
    # =========================

    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)

    linkedin = Column(String)
    github = Column(String)
    location = Column(String)

    # =========================
    # Professional Summary
    # =========================

    summary = Column(Text)

    # =========================
    # Resume
    # =========================

    resume_url = Column(String)
    resume_text = Column(Text)

    # =========================
    # Skills
    # =========================

    skills = Column(Text)

    # =========================
    # Experience
    # =========================

    experience = Column(String)
    experience_years = Column(Integer, default=0)

    # =========================
    # Education
    # =========================

    education = Column(Text)

    # =========================
    # Projects
    # =========================

    projects = Column(Text)

    # =========================
    # Certifications
    # =========================

    certifications = Column(Text)

    # =========================
    # Languages
    # =========================

    languages = Column(Text)

    # =========================
    # ATS
    # =========================

    ats_score = Column(Integer, default=0)

    # =========================
    # Recruitment
    # =========================

    status = Column(
        String,
        default="Applied",
    )

    applied_job = Column(String)

    # =========================
    # Interview Scheduling
    # =========================

    interview_date = Column(String)

    interviewer = Column(String)

    meeting_link = Column(String)

    # =========================
    # Interview Evaluation
    # =========================

    interview_result = Column(
        String,
        default=None,
        nullable=True,
    )

    interview_score = Column(
        Integer,
        default=None,
        nullable=True,
    )

    interview_feedback = Column(
        Text,
        default=None,
        nullable=True,
    )

    interview_completed_at = Column(
        DateTime(timezone=True),
        default=None,
        nullable=True,
    )

    # =========================
    # Timestamps
    # =========================

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
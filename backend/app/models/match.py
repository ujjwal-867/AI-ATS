from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Match(Base):

    __tablename__ = "matches"


    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )


    candidate_id = Column(
        String,
        ForeignKey("candidates.id"),
        nullable=False,
    )


    job_id = Column(
        String,
        ForeignKey("jobs.id"),
        nullable=False,
    )


    match_score = Column(
        Integer,
        default=0,
    )


    matched_skills = Column(
        Text,
    )


    missing_skills = Column(
        Text,
    )


    extra_skills = Column(
        Text,
    )


    recommendation = Column(
        String,
    )


    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )
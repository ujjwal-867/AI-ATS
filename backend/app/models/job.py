from sqlalchemy import Column, String, Text, Integer, DateTime
from sqlalchemy.sql import func
import uuid

from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    title = Column(String, nullable=False)

    company = Column(String)

    location = Column(String)

    employment_type = Column(String)

    experience = Column(String)

    salary = Column(String)

    description = Column(Text, nullable=False)

    required_skills = Column(Text)

    status = Column(
        String,
        default="Open",
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
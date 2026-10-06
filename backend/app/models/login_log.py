import uuid

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func

from app.database import Base


class LoginLog(Base):
    __tablename__ = "login_logs"

    id = Column(
        String,
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
    )

    user_id = Column(
        String,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    email = Column(
        String,
        nullable=False,
        index=True,
    )

    ip_address = Column(
        String,
        nullable=True,
    )

    user_agent = Column(
        Text,
        nullable=True,
    )

    device = Column(
        String,
        nullable=True,
    )

    browser = Column(
        String,
        nullable=True,
    )

    status = Column(
        String,
        nullable=False,  # "Success" or "Failed"
        default="Success",
        index=True,
    )

    failure_reason = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        index=True,
    )

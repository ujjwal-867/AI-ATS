from datetime import datetime
from typing import Optional, Any, Union

from pydantic import BaseModel, EmailStr, ConfigDict, Field


# =========================================================
# Candidate Create
# =========================================================

class CandidateCreate(BaseModel):

    name: str = Field(..., min_length=1)
    email: EmailStr

    phone: Optional[str] = None

    linkedin: Optional[str] = None
    github: Optional[str] = None
    location: Optional[str] = None

    summary: Optional[str] = None

    resume_url: Optional[str] = None
    resume_text: Optional[str] = None

    skills: Optional[Any] = None

    experience: Optional[Any] = None
    experience_years: int = 0

    education: Optional[Any] = None

    projects: Optional[Any] = None

    certifications: Optional[Any] = None

    languages: Optional[Any] = None

    ats_score: Union[int, float] = 0

    status: str = "Applied"
    applied_job: Optional[str] = None


# =========================================================
# Candidate Update
# =========================================================

class CandidateUpdate(BaseModel):

    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None

    linkedin: Optional[str] = None
    github: Optional[str] = None
    location: Optional[str] = None

    summary: Optional[str] = None

    resume_url: Optional[str] = None
    resume_text: Optional[str] = None

    skills: Optional[Any] = None

    experience: Optional[Any] = None
    experience_years: Optional[int] = None

    education: Optional[Any] = None

    projects: Optional[Any] = None

    certifications: Optional[Any] = None

    languages: Optional[Any] = None

    status: Optional[str] = None
    ats_score: Optional[Union[int, float]] = None

    applied_job: Optional[str] = None

    # Interview scheduling & evaluation
    interview_date: Optional[str] = None
    interviewer: Optional[str] = None
    meeting_link: Optional[str] = None

    interview_result: Optional[str] = None
    interview_score: Optional[int] = None
    interview_feedback: Optional[str] = None


# =========================================================
# Candidate Response
# =========================================================

class CandidateResponse(BaseModel):

    id: str

    name: str

    email: EmailStr

    phone: Optional[str] = None

    linkedin: Optional[str] = None

    github: Optional[str] = None

    location: Optional[str] = None

    summary: Optional[str] = None

    resume_url: Optional[str] = None

    resume_text: Optional[str] = None

    skills: Optional[Any] = None

    experience: Optional[Any] = None

    experience_years: int = 0

    education: Optional[Any] = None

    projects: Optional[Any] = None

    certifications: Optional[Any] = None

    languages: Optional[Any] = None

    ats_score: Union[int, float] = 0

    status: str

    applied_job: Optional[str] = None

    # Interview scheduling
    interview_date: Optional[str] = None

    interviewer: Optional[str] = None

    meeting_link: Optional[str] = None

    # Interview evaluation
    interview_result: Optional[str] = None

    interview_score: Optional[int] = None

    interview_feedback: Optional[str] = None

    interview_completed_at: Optional[datetime] = None

    user_id: Optional[str] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        from_attributes=True
    )


# =========================================================
# Schedule Interview
# =========================================================

class InterviewScheduleRequest(BaseModel):

    interview_date: str

    interviewer: str

    meeting_link: Optional[str] = None


# =========================================================
# Schedule Interview Response
# =========================================================

class InterviewResponse(BaseModel):

    success: bool

    message: str

    candidate_id: str

    candidate_name: str

    interview_date: str

    interviewer: str

    meeting_link: Optional[str] = None


# =========================================================
# Complete Interview
# =========================================================

class InterviewResultRequest(BaseModel):

    result: str

    score: Optional[int] = None

    feedback: Optional[str] = None


# =========================================================
# Complete Interview Response
# =========================================================

class InterviewResultResponse(BaseModel):

    success: bool

    message: str

    candidate_id: str

    candidate_name: str

    result: str

    score: Optional[int] = None

    feedback: Optional[str] = None

    status: str
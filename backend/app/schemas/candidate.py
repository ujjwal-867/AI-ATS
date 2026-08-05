from typing import Optional

from pydantic import BaseModel, EmailStr, ConfigDict


class CandidateCreate(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None


class CandidateUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    ats_score: Optional[int] = None


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
    skills: Optional[str] = None

    experience: Optional[str] = None
    experience_years: int = 0

    education: Optional[str] = None
    projects: Optional[str] = None
    certifications: Optional[str] = None
    languages: Optional[str] = None

    status: str
    ats_score: int = 0
    
    # Interview
    
    interview_date: Optional[str] = None
    interviewer: Optional[str] = None
    meeting_link: Optional[str] = None

    model_config = ConfigDict(
        from_attributes=True
    )


class InterviewScheduleRequest(BaseModel):
    interview_date: str
    interviewer: str
    meeting_link: Optional[str] = None


class InterviewResponse(BaseModel):
    success: bool
    message: str
    candidate_id: str
    candidate_name: str
    interview_date: str
    interviewer: str
    meeting_link: Optional[str] = None
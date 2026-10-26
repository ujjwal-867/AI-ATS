from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict


class MatchResponse(BaseModel):
    id: str
    candidate_id: str
    job_id: str
    match_score: int = 0
    matched_skills: Optional[str] = None
    missing_skills: Optional[str] = None
    extra_skills: Optional[str] = None
    recommendation: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class MatchResultResponse(BaseModel):
    success: bool = True
    match_id: Optional[str] = None
    candidate: Optional[Dict[str, Any]] = None
    job: Optional[Dict[str, Any]] = None
    match_score: int = 0
    recommendation: Optional[str] = None
    ai_explanation: Optional[str] = None
    score_breakdown: Optional[Dict[str, Any]] = None
    matched_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    critical_missing_skills: Optional[List[str]] = None
    experience_analysis: Optional[Dict[str, Any]] = None
    role_analysis: Optional[Dict[str, Any]] = None
    semantic_analysis: Optional[Dict[str, Any]] = None
    project_analysis: Optional[Dict[str, Any]] = None
    education_analysis: Optional[Dict[str, Any]] = None
    certification_analysis: Optional[Dict[str, Any]] = None
    resume_quality: Optional[Dict[str, Any]] = None
    extra_skills: Optional[List[str]] = None

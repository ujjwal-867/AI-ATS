from typing import Optional

from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    experience: Optional[str] = None
    salary: Optional[str] = None
    description: str


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    experience: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class JobResponse(BaseModel):
    id: str
    title: str
    company: Optional[str]
    location: Optional[str]
    employment_type: Optional[str]
    experience: Optional[str]
    salary: Optional[str]
    description: str
    required_skills: Optional[str]
    status: str

    class Config:
        from_attributes = True 
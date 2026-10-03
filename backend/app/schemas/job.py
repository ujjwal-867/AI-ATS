from typing import Optional, Union, List
from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    experience: Optional[str] = None
    salary: Optional[str] = None
    description: str
    skills: Optional[Union[List[str], str]] = None
    required_skills: Optional[Union[List[str], str]] = None


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    experience: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    skills: Optional[Union[List[str], str]] = None
    required_skills: Optional[Union[List[str], str]] = None


class JobResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    company: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    experience: Optional[str] = None
    salary: Optional[str] = None
    description: str
    required_skills: Optional[str] = None
    status: str

    class Config:
        from_attributes = True
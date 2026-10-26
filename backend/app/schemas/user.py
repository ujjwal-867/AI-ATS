from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field


class UserRegister(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    login_count: Optional[int] = 0
    role: Optional[str] = "recruiter"

    model_config = ConfigDict(from_attributes=True)


class LoginLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    email: str
    ip_address: Optional[str] = None
    device: Optional[str] = None
    browser: Optional[str] = None
    status: str
    failure_reason: Optional[str] = None
    created_at: Optional[datetime] = None
    is_current: bool = False

    model_config = ConfigDict(from_attributes=True)
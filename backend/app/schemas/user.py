from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    created_at: Optional[datetime] = None
    last_login_at: Optional[datetime] = None
    login_count: Optional[int] = 0

    class Config:
        from_attributes = True


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

    class Config:
        from_attributes = True
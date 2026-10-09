from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from app.config import settings


security = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        security
    ),
):
    token = None
    if credentials:
        token = credentials.credentials
    elif "token" in request.query_params:
        token = request.query_params["token"]
    elif "token" in request.cookies:
        token = request.cookies["token"]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )


    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )

        user_id = payload.get("user_id")
        email = payload.get("email")
        role = payload.get("role", "recruiter")

        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication token",
                headers={
                    "WWW-Authenticate": "Bearer"
                },
            )

        return {
            "user_id": user_id,
            "email": email,
            "role": role,
        }

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={
                "WWW-Authenticate": "Bearer"
            },
        )


def verify_token_payload(token: str) -> dict:
    """Helper to verify and decode JWT tokens from any source (header, cookie, query param)."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        user_id = payload.get("user_id")
        email = payload.get("email")
        role = payload.get("role", "recruiter")

        if not user_id or not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token claims",
            )
        return {
            "user_id": user_id,
            "email": email,
            "role": role,
        }
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        )


def get_current_admin(
    current_user: dict = Depends(get_current_user),
):
    """
    Role-Based Access Control (RBAC) dependency.
    Requires caller to have an admin role or match the configured ADMIN_EMAIL.
    """
    is_admin = (
        current_user.get("role") == "admin"
        or (
            settings.ADMIN_EMAIL
            and current_user.get("email", "").lower() == settings.ADMIN_EMAIL.strip().lower()
        )
    )

    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Administrative privileges required to access this resource",
        )

    return current_user
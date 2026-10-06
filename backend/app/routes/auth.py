from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.login_log import LoginLog
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
    LoginLogResponse,
)
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.utils.device_detector import get_request_metadata

router = APIRouter()


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
def register(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    from app.services.email_validator import validate_email_address

    email_check = validate_email_address(user.email, check_dns=False)
    if not email_check["valid"]:
        raise HTTPException(
            status_code=400,
            detail=email_check.get("reason") or "Invalid email address format.",
        )

    clean_email = email_check.get("suggestion") or email_check["email"]

    existing_user = (
        db.query(User)
        .filter(User.email == clean_email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="User already exists",
        )

    new_user = User(
        name=user.name.strip(),
        email=clean_email,
        password_hash=hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse.model_validate(new_user)


# =========================================================
# LOGIN (WITH AUDIT & DEVICE TRACKING)
# =========================================================

@router.post("/login")
def login(
    user: UserLogin,
    request: Request,
    db: Session = Depends(get_db),
):
    metadata = get_request_metadata(request)
    normalized_email = user.email.strip().lower()

    existing_user = (
        db.query(User)
        .filter(User.email == normalized_email)
        .first()
    )

    if existing_user is None:
        # Record failed attempt: account not found
        failed_log = LoginLog(
            user_id=None,
            email=normalized_email,
            ip_address=metadata["ip_address"],
            user_agent=metadata["user_agent"],
            device=metadata["device"],
            browser=metadata["browser"],
            status="Failed",
            failure_reason="Account does not exist",
        )
        db.add(failed_log)
        db.commit()

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    if not verify_password(user.password, existing_user.password_hash):
        # Record failed attempt: wrong password
        failed_log = LoginLog(
            user_id=existing_user.id,
            email=normalized_email,
            ip_address=metadata["ip_address"],
            user_agent=metadata["user_agent"],
            device=metadata["device"],
            browser=metadata["browser"],
            status="Failed",
            failure_reason="Incorrect password",
        )
        db.add(failed_log)
        db.commit()

        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    # Record successful login
    success_log = LoginLog(
        user_id=existing_user.id,
        email=normalized_email,
        ip_address=metadata["ip_address"],
        user_agent=metadata["user_agent"],
        device=metadata["device"],
        browser=metadata["browser"],
        status="Success",
        failure_reason=None,
    )
    db.add(success_log)

    # Update user login count & last seen timestamp
    existing_user.last_login_at = datetime.now(timezone.utc)
    existing_user.login_count = (existing_user.login_count or 0) + 1
    db.commit()
    db.refresh(existing_user)

    token = create_access_token(
        {
            "user_id": existing_user.id,
            "email": existing_user.email,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(existing_user),
    }


# =========================================================
# GET CURRENT USER LOGIN HISTORY
# =========================================================

@router.get("/login-history", response_model=list[LoginLogResponse])
def get_login_history(
    request: Request,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    logs = (
        db.query(LoginLog)
        .filter(LoginLog.user_id == current_user["user_id"])
        .order_by(LoginLog.created_at.desc())
        .limit(25)
        .all()
    )

    result = []
    first_success_flagged = False

    for log in logs:
        # Mark the most recent successful login as the current session
        is_current = False
        if log.status == "Success" and not first_success_flagged:
            is_current = True
            first_success_flagged = True

        result.append(
            LoginLogResponse(
                id=log.id,
                user_id=log.user_id,
                email=log.email,
                ip_address=log.ip_address,
                device=log.device,
                browser=log.browser,
                status=log.status,
                failure_reason=log.failure_reason,
                created_at=log.created_at,
                is_current=is_current,
            )
        )

    return result


# =========================================================
# GET USERS ACTIVITY (ALL USERS & THEIR LAST SEEN)
# =========================================================

@router.get("/users-activity")
def get_users_activity(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    users = db.query(User).order_by(User.created_at.desc()).all()

    users_data = []
    for u in users:
        latest_log = (
            db.query(LoginLog)
            .filter(
                LoginLog.user_id == u.id,
                LoginLog.status == "Success",
            )
            .order_by(LoginLog.created_at.desc())
            .first()
        )

        users_data.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "created_at": u.created_at,
            "last_login_at": u.last_login_at,
            "login_count": u.login_count or 0,
            "latest_login": {
                "ip_address": latest_log.ip_address if latest_log else None,
                "device": latest_log.device if latest_log else None,
                "browser": latest_log.browser if latest_log else None,
                "created_at": latest_log.created_at if latest_log else None,
            } if latest_log else None,
        })

    return users_data


# =========================================================
# GET PLATFORM-WIDE RECENT AUDIT ACTIVITY
# =========================================================

@router.get("/recent-activity", response_model=list[LoginLogResponse])
def get_recent_activity(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    logs = (
        db.query(LoginLog)
        .order_by(LoginLog.created_at.desc())
        .limit(30)
        .all()
    )

    return [
        LoginLogResponse(
            id=log.id,
            user_id=log.user_id,
            email=log.email,
            ip_address=log.ip_address,
            device=log.device,
            browser=log.browser,
            status=log.status,
            failure_reason=log.failure_reason,
            created_at=log.created_at,
            is_current=False,
        )
        for log in logs
    ]
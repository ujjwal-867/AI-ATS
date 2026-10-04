from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserRegister,
    UserLogin,
    UserResponse,
)
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
)

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
# LOGIN
# =========================================================

@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):
    normalized_email = user.email.strip().lower()
    existing_user = (
        db.query(User)
        .filter(User.email == normalized_email)
        .first()
    )

    if (
        existing_user is None
        or not verify_password(
            user.password,
            existing_user.password_hash,
        )
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid credentials",
        )

    token = create_access_token(
        {
            "user_id": existing_user.id,
            "email": existing_user.email,
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(
            existing_user
        ),
    }
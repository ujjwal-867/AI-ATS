from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import UploadFile

from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.services.resume_service import upload_resume

router = APIRouter(
    dependencies=[
        Depends(get_current_user)
    ]
)


@router.post("/")
async def upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    return await upload_resume(
        file=file,
        db=db,
        user_id=current_user.get("user_id"),
    )
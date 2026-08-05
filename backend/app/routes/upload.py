from fastapi import APIRouter
from fastapi import Depends
from fastapi import File
from fastapi import UploadFile

from sqlalchemy.orm import Session

from app.database import get_db
from app.services.resume_service import upload_resume

router = APIRouter()


@router.post("/")
async def upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await upload_resume(
        file=file,
        db=db,
    )
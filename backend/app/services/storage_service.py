"""
Storage Service — handles persistent file storage.
Automatically uses Supabase Storage if configured; otherwise falls back to local uploads.
"""

from pathlib import Path
import logging
import requests

from app.config import settings

logger = logging.getLogger(__name__)

LOCAL_UPLOAD_DIR = Path(settings.UPLOAD_DIR)
LOCAL_UPLOAD_DIR.mkdir(exist_ok=True)


def is_cloud_storage_enabled() -> bool:
    """Check if Supabase Storage is configured."""
    return bool(settings.SUPABASE_URL and settings.SUPABASE_KEY)


def save_file(content: bytes, filename: str, content_type: str = "application/pdf") -> str:
    """
    Save file to cloud storage (if configured) or local filesystem.
    Returns the public URL (cloud) or relative filepath (local).
    """
    if is_cloud_storage_enabled():
        try:
            base_url = settings.SUPABASE_URL.rstrip("/")
            bucket = settings.SUPABASE_BUCKET or "resumes"
            upload_url = f"{base_url}/storage/v1/object/{bucket}/{filename}"

            headers = {
                "apikey": settings.SUPABASE_KEY,
                "Authorization": f"Bearer {settings.SUPABASE_KEY}",
                "Content-Type": content_type,
                "x-upsert": "true",
            }

            resp = requests.post(upload_url, headers=headers, data=content, timeout=30)
            if resp.status_code in (200, 201):
                public_url = f"{base_url}/storage/v1/object/public/{bucket}/{filename}"
                logger.info("Uploaded to Supabase Storage: %s", public_url)
                return public_url
            else:
                logger.warning(
                    "Supabase upload returned HTTP %s: %s. Falling back to local storage.",
                    resp.status_code,
                    resp.text[:200],
                )
        except Exception as exc:
            logger.warning("Supabase upload failed: %s. Falling back to local storage.", exc)

    # Local storage fallback
    filepath = LOCAL_UPLOAD_DIR / filename
    with filepath.open("wb") as buffer:
        buffer.write(content)

    return str(filepath)


def delete_file(file_url_or_path: str) -> None:
    """
    Delete file from cloud storage or local filesystem.
    """
    if not file_url_or_path:
        return

    # Cloud deletion
    if file_url_or_path.startswith("http://") or file_url_or_path.startswith("https://"):
        if is_cloud_storage_enabled():
            try:
                base_url = settings.SUPABASE_URL.rstrip("/")
                bucket = settings.SUPABASE_BUCKET or "resumes"
                # Extract filename from URL
                filename = file_url_or_path.split("/")[-1]
                delete_url = f"{base_url}/storage/v1/object/{bucket}/{filename}"

                headers = {
                    "apikey": settings.SUPABASE_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_KEY}",
                }
                requests.delete(delete_url, headers=headers, timeout=15)
                logger.info("Deleted from Supabase Storage: %s", filename)
            except Exception as exc:
                logger.warning("Supabase delete failed: %s", exc)
        return

    # Local file deletion
    try:
        local_path = Path(file_url_or_path)
        if local_path.exists():
            local_path.unlink()
            logger.info("Deleted local file: %s", local_path)
    except Exception as exc:
        logger.warning("Local file delete failed: %s", exc)

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "AI ATS Backend"
    APP_VERSION: str = "1.0.0"

    DEBUG: bool = False
    GEMINI_API_KEY: str = ""

    DATABASE_URL: str

    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    UPLOAD_DIR: str = "uploads"

    # Cloud Storage (Optional - e.g. Supabase Storage for persistent resume hosting)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""
    SUPABASE_BUCKET: str = "resumes"

    # Administrator
    ADMIN_EMAIL: str = ""

    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()

# Backward compatibility
DATABASE_URL = settings.DATABASE_URL
JWT_SECRET = settings.JWT_SECRET
JWT_ALGORITHM = settings.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
UPLOAD_DIR = settings.UPLOAD_DIR
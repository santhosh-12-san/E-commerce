import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Mini Ecommerce API"
    VERSION: str = "1.0.0"
    
    # Database Settings: PostgreSQL by default, with automatic or explicit fallback
    # PostgreSQL standard: postgresql+psycopg2://postgres:postgres@localhost:5432/ecommerce_db
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql+psycopg2://postgres:postgres@localhost:5432/ecommerce_db"
    )
    
    # JWT Authentication
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "mini_ecommerce_super_secret_jwt_key_2026_xyz")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Default Admin Credentials
    DEFAULT_ADMIN_USERNAME: str = os.getenv("ADMIN_USERNAME", "admin")
    DEFAULT_ADMIN_PASSWORD: str = os.getenv("ADMIN_PASSWORD", "admin123")
    
    # CORS Origins
    CORS_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()

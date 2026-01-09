from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    database_url: str = "sqlite:///./emotion_app.db"
    secret_key: str = "your-secret-key-change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    redis_url: Optional[str] = None
    environment: str = "development"
    
    class Config:
        env_file = ".env"

settings = Settings()
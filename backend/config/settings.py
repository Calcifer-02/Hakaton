from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    app_name: str = "Система анализа данных предприятий Москвы"
    app_version: str = "1.0.0"
    debug: bool = True
    secret_key: str = "your-secret-key-here"

    # Database
    database_url: str = "postgresql://user:password@localhost:5432/enterprises_db"

    # CORS
    allowed_origins: List[str] = ["http://localhost:3000", "https://bortongo.github.io"]

    # File Upload
    upload_dir: str = "./uploads"
    max_file_size: int = 50 * 1024 * 1024  # 50MB

    # Supported file types
    allowed_file_types: List[str] = [".csv", ".xlsx", ".xls"]

    # Moscow regions
    moscow_regions: List[str] = [
        "Центральный", "Северный", "Северо-Восточный", "Восточный",
        "Юго-Восточный", "Южный", "Юго-Западный", "Западный",
        "Северо-Западный", "Новомосковский", "Троицкий"
    ]

    # Industries
    industries: List[str] = [
        "Машиностроение", "Пищевая промышленность", "Химическая промышленность",
        "Текстильная промышленность", "Металлургия", "Электроника",
        "Строительные материалы", "Фармацевтика", "Автомобилестроение",
        "Полиграфия", "Другое"
    ]

    class Config:
        env_file = ".env"

settings = Settings()

# Database setup
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Create upload directory if it doesn't exist
os.makedirs(settings.upload_dir, exist_ok=True)

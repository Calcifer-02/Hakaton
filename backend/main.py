from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.settings import settings
from models.enterprise import Base
from routes import enterprises, upload, export
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Создание приложения FastAPI
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="API для системы анализа данных предприятий Москвы",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Создание таблиц в базе данных
engine = create_engine(settings.database_url)
Base.metadata.create_all(bind=engine)

# Подключение роутов
app.include_router(
    enterprises.router,
    prefix="/api/v1",
    tags=["enterprises"]
)

app.include_router(
    upload.router,
    prefix="/api/v1",
    tags=["upload"]
)

app.include_router(
    export.router,
    prefix="/api/v1",
    tags=["export"]
)

@app.get("/")
async def root():
    """Корневой эндпоинт"""
    return {
        "message": f"Добро пожаловать в {settings.app_name}",
        "version": settings.app_version,
        "docs": "/docs",
        "redoc": "/redoc",
        "endpoints": {
            "enterprises": "/api/v1/enterprises",
            "aggregates": "/api/v1/aggregates",
            "quality": "/api/v1/quality",
            "upload": "/api/v1/upload",
            "export": "/api/v1/export"
        }
    }

@app.get("/health")
async def health_check():
    """Проверка здоровья сервиса"""
    try:
        # Проверяем подключение к базе данных
        from config.settings import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()

        return {
            "status": "healthy",
            "database": "connected",
            "version": settings.app_version
        }
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=503, detail="Service unavailable")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.debug)

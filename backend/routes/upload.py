from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from config.settings import get_db, settings
from app.schemas import UploadResponse, UploadStatus
from services.data_processing import DataProcessingService
from models.enterprise import DataUpload
import os
import shutil
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/upload", response_model=UploadResponse)
async def upload_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Загрузка и обработка файла с данными предприятий"""

    # Проверяем тип файла
    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in settings.allowed_file_types:
        raise HTTPException(
            status_code=400,
            detail=f"Неподдерживаемый тип файла. Разрешены: {', '.join(settings.allowed_file_types)}"
        )

    # Проверяем размер файла
    if hasattr(file, 'size') and file.size > settings.max_file_size:
        raise HTTPException(
            status_code=400,
            detail=f"Файл слишком большой. Максимальный размер: {settings.max_file_size / (1024*1024):.0f}MB"
        )

    try:
        # Создаем запись о загрузке
        upload_record = DataUpload(
            filename=file.filename,
            file_size=file.size or 0,
            file_type=file_extension,
            status="uploading"
        )
        db.add(upload_record)
        db.commit()
        db.refresh(upload_record)

        # Сохраняем файл
        file_path = os.path.join(settings.upload_dir, f"{upload_record.id}_{file.filename}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Обновляем статус
        upload_record.status = "processing"
        db.commit()

        # Запускаем обработку в фоне
        background_tasks.add_task(
            process_file_background,
            file_path,
            upload_record.id,
            db
        )

        return UploadResponse(
            success=True,
            message="Файл успешно загружен и отправлен на обработку",
            upload_id=upload_record.id,
            processed_count=0,
            error_count=0,
            errors=[]
        )

    except Exception as e:
        logger.error(f"Ошибка загрузки файла: {str(e)}")

        # Обновляем статус на ошибку, если запись была создана
        if 'upload_record' in locals():
            upload_record.status = "failed"
            upload_record.error_details = str(e)
            db.commit()

        raise HTTPException(status_code=500, detail=f"Ошибка загрузки файла: {str(e)}")

@router.get("/upload/{upload_id}/status", response_model=UploadStatus)
async def get_upload_status(upload_id: int, db: Session = Depends(get_db)):
    """Получить статус обработки загруженного файла"""

    upload_record = db.query(DataUpload).filter(DataUpload.id == upload_id).first()
    if not upload_record:
        raise HTTPException(status_code=404, detail="Загрузка не найдена")

    return UploadStatus(
        id=upload_record.id,
        filename=upload_record.filename,
        file_size=upload_record.file_size,
        file_type=upload_record.file_type,
        upload_date=upload_record.upload_date,
        status=upload_record.status,
        processed_records=upload_record.processed_records,
        error_records=upload_record.error_records,
        error_details=upload_record.error_details,
        processing_time=upload_record.processing_time
    )

@router.get("/uploads", response_model=List[UploadStatus])
async def get_uploads(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Получить список всех загрузок"""

    uploads = db.query(DataUpload)\
                .order_by(DataUpload.upload_date.desc())\
                .offset(offset)\
                .limit(limit)\
                .all()

    return [
        UploadStatus(
            id=upload.id,
            filename=upload.filename,
            file_size=upload.file_size,
            file_type=upload.file_type,
            upload_date=upload.upload_date,
            status=upload.status,
            processed_records=upload.processed_records,
            error_records=upload.error_records,
            error_details=upload.error_details,
            processing_time=upload.processing_time
        )
        for upload in uploads
    ]

@router.delete("/upload/{upload_id}")
async def delete_upload(upload_id: int, db: Session = Depends(get_db)):
    """Удалить загрузку и связанные данные"""

    upload_record = db.query(DataUpload).filter(DataUpload.id == upload_id).first()
    if not upload_record:
        raise HTTPException(status_code=404, detail="Загрузка не найдена")

    try:
        # Удаляем файл
        file_path = os.path.join(settings.upload_dir, f"{upload_id}_{upload_record.filename}")
        if os.path.exists(file_path):
            os.remove(file_path)

        # Удаляем связанные предприятия
        from models.enterprise import Enterprise
        db.query(Enterprise).filter(Enterprise.source_file == str(upload_id)).delete()

        # Удаляем запись о загрузке
        db.delete(upload_record)
        db.commit()

        return {"message": "Загрузка успешно удалена"}

    except Exception as e:
        db.rollback()
        logger.error(f"Ошибка удаления загрузки: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка удаления: {str(e)}")

def process_file_background(file_path: str, upload_id: int, db: Session):
    """Фоновая обработка файла"""
    start_time = datetime.now()

    try:
        # Создаем новую сессию для фонового процесса
        from config.settings import SessionLocal
        db_session = SessionLocal()

        # Обновляем статус
        upload_record = db_session.query(DataUpload).filter(DataUpload.id == upload_id).first()
        upload_record.status = "processing"
        db_session.commit()

        # Обрабатываем файл
        processing_service = DataProcessingService(db_session)
        result = processing_service.process_uploaded_file(file_path, upload_id)

        # Обновляем результаты
        processing_time = (datetime.now() - start_time).total_seconds()

        upload_record.processed_records = result.get("processed_rows", 0)
        upload_record.error_records = result.get("error_count", 0)
        upload_record.processing_time = processing_time
        upload_record.processed_at = datetime.now()

        if result["success"]:
            upload_record.status = "completed"
        else:
            upload_record.status = "failed"
            upload_record.error_details = result.get("error", "Unknown error")

        db_session.commit()

        logger.info(f"Файл {upload_id} обработан за {processing_time:.2f} секунд")

    except Exception as e:
        logger.error(f"Ошибка обработки файла {upload_id}: {str(e)}")

        # Обновляем статус на ошибку
        try:
            upload_record = db_session.query(DataUpload).filter(DataUpload.id == upload_id).first()
            upload_record.status = "failed"
            upload_record.error_details = str(e)
            upload_record.processing_time = (datetime.now() - start_time).total_seconds()
            db_session.commit()
        except:
            pass

    finally:
        db_session.close()

        # Удаляем временный файл
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except:
            pass

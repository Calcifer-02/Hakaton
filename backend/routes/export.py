from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from config.settings import get_db, settings
from app.schemas import FilterParams, EnterpriseStatus
from services.analytics import AnalyticsService
from services.export import ExportService
from datetime import datetime
import tempfile
import os

router = APIRouter()

@router.get("/export/csv")
async def export_enterprises_csv(
    industries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    min_employees: Optional[int] = Query(None, ge=0),
    max_employees: Optional[int] = Query(None, ge=0),
    min_revenue: Optional[float] = Query(None, ge=0),
    max_revenue: Optional[float] = Query(None, ge=0),
    status: Optional[List[EnterpriseStatus]] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """Экспорт данных предприятий в CSV формат"""

    analytics_service = AnalyticsService(db)
    export_service = ExportService(db)

    filters = FilterParams(
        industries=industries,
        regions=regions,
        min_employees=min_employees,
        max_employees=max_employees,
        min_revenue=min_revenue,
        max_revenue=max_revenue,
        status=status,
        date_from=date_from,
        date_to=date_to
    )

    # Получаем данные
    result = analytics_service.get_enterprises(filters, page=1, size=100000)
    enterprises = result["enterprises"]

    if not enterprises:
        raise HTTPException(status_code=404, detail="Нет данных для экспорта")

    # Создаем временный файл
    temp_file = export_service.export_to_csv(enterprises)

    # Возвращаем файл
    filename = f"enterprises_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"

    return FileResponse(
        path=temp_file,
        filename=filename,
        media_type="text/csv",
        background=cleanup_temp_file(temp_file)
    )

@router.get("/export/excel")
async def export_enterprises_excel(
    industries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    min_employees: Optional[int] = Query(None, ge=0),
    max_employees: Optional[int] = Query(None, ge=0),
    min_revenue: Optional[float] = Query(None, ge=0),
    max_revenue: Optional[float] = Query(None, ge=0),
    status: Optional[List[EnterpriseStatus]] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """Экспорт данных предприятий в Excel формат"""

    analytics_service = AnalyticsService(db)
    export_service = ExportService(db)

    filters = FilterParams(
        industries=industries,
        regions=regions,
        min_employees=min_employees,
        max_employees=max_employees,
        min_revenue=min_revenue,
        max_revenue=max_revenue,
        status=status,
        date_from=date_from,
        date_to=date_to
    )

    # Получаем данные
    result = analytics_service.get_enterprises(filters, page=1, size=100000)
    enterprises = result["enterprises"]

    if not enterprises:
        raise HTTPException(status_code=404, detail="Нет данных для экспорта")

    # Создаем временный файл
    temp_file = export_service.export_to_excel(enterprises)

    # Возвращаем файл
    filename = f"enterprises_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    return FileResponse(
        path=temp_file,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        background=cleanup_temp_file(temp_file)
    )

@router.get("/export/report/pdf")
async def export_report_pdf(
    industries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    min_employees: Optional[int] = Query(None, ge=0),
    max_employees: Optional[int] = Query(None, ge=0),
    min_revenue: Optional[float] = Query(None, ge=0),
    max_revenue: Optional[float] = Query(None, ge=0),
    status: Optional[List[EnterpriseStatus]] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    title: str = Query("Отчёт по предприятиям Москвы"),
    db: Session = Depends(get_db)
):
    """Генерация PDF отчёта с аналитикой"""

    analytics_service = AnalyticsService(db)
    export_service = ExportService(db)

    filters = FilterParams(
        industries=industries,
        regions=regions,
        min_employees=min_employees,
        max_employees=max_employees,
        min_revenue=min_revenue,
        max_revenue=max_revenue,
        status=status,
        date_from=date_from,
        date_to=date_to
    )

    # Получаем агрегированные данные
    aggregate_data = analytics_service.get_aggregate_data(filters)
    monthly_trends = analytics_service.get_monthly_trends(filters)
    top_enterprises = analytics_service.get_top_enterprises("revenue", 10, filters)
    data_quality = analytics_service.get_data_quality_stats()

    # Создаем PDF отчёт
    temp_file = export_service.generate_pdf_report(
        title=title,
        aggregate_data=aggregate_data,
        monthly_trends=monthly_trends,
        top_enterprises=top_enterprises,
        data_quality=data_quality,
        filters=filters
    )

    # Возвращаем файл
    filename = f"report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

    return FileResponse(
        path=temp_file,
        filename=filename,
        media_type="application/pdf",
        background=cleanup_temp_file(temp_file)
    )

@router.get("/export/aggregates/excel")
async def export_aggregates_excel(
    industries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    min_employees: Optional[int] = Query(None, ge=0),
    max_employees: Optional[int] = Query(None, ge=0),
    min_revenue: Optional[float] = Query(None, ge=0),
    max_revenue: Optional[float] = Query(None, ge=0),
    status: Optional[List[EnterpriseStatus]] = Query(None),
    date_from: Optional[datetime] = Query(None),
    date_to: Optional[datetime] = Query(None),
    db: Session = Depends(get_db)
):
    """Экспорт агрегированных данных в Excel"""

    analytics_service = AnalyticsService(db)
    export_service = ExportService(db)

    filters = FilterParams(
        industries=industries,
        regions=regions,
        min_employees=min_employees,
        max_employees=max_employees,
        min_revenue=min_revenue,
        max_revenue=max_revenue,
        status=status,
        date_from=date_from,
        date_to=date_to
    )

    # Получаем агрегированные данные
    aggregate_data = analytics_service.get_aggregate_data(filters)
    monthly_trends = analytics_service.get_monthly_trends(filters)

    # Создаем Excel файл с агрегированными данными
    temp_file = export_service.export_aggregates_to_excel(aggregate_data, monthly_trends)

    # Возвращаем файл
    filename = f"aggregates_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"

    return FileResponse(
        path=temp_file,
        filename=filename,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        background=cleanup_temp_file(temp_file)
    )

def cleanup_temp_file(file_path: str):
    """Функция для удаления временного файла после отправки"""
    def cleanup():
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass
    return cleanup

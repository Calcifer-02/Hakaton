from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from config.settings import get_db, settings
from app.schemas import *
from services.analytics import AnalyticsService
from services.data_processing import DataProcessingService
from models.enterprise import DataUpload
import os
import shutil
from datetime import datetime

router = APIRouter()

@router.get("/enterprises", response_model=EnterpriseList)
async def get_enterprises(
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=1000),
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
    """Получить список всех предприятий с фильтрацией"""
    analytics_service = AnalyticsService(db)

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

    result = analytics_service.get_enterprises(filters, page, size)

    return EnterpriseList(
        enterprises=result["enterprises"],
        total=result["total"],
        page=result["page"],
        size=result["size"],
        total_pages=result["total_pages"]
    )

@router.get("/aggregates", response_model=AggregateData)
async def get_aggregates(
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
    """Получить агрегированные данные по отраслям, регионам и общую статистику"""
    analytics_service = AnalyticsService(db)

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

    return analytics_service.get_aggregate_data(filters)

@router.get("/quality", response_model=DataQuality)
async def get_data_quality(db: Session = Depends(get_db)):
    """Получить статистику по качеству данных"""
    analytics_service = AnalyticsService(db)
    return analytics_service.get_data_quality_stats()

@router.get("/trends/monthly")
async def get_monthly_trends(
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
    """Получить тренды по месяцам"""
    analytics_service = AnalyticsService(db)

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

    return analytics_service.get_monthly_trends(filters)

@router.get("/top/{by}")
async def get_top_enterprises(
    by: str,
    limit: int = Query(10, ge=1, le=100),
    industries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)
):
    """Получить топ предприятий по выручке или количеству сотрудников"""
    if by not in ["revenue", "employees"]:
        raise HTTPException(status_code=400, detail="Parameter 'by' must be 'revenue' or 'employees'")

    analytics_service = AnalyticsService(db)

    filters = FilterParams(industries=industries, regions=regions)

    return analytics_service.get_top_enterprises(by, limit, filters)

@router.get("/search")
async def search_enterprises(
    q: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    size: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Поиск предприятий по названию или адресу"""
    analytics_service = AnalyticsService(db)
    return analytics_service.search_enterprises(q, page, size)

@router.get("/status-distribution")
async def get_status_distribution(
    industries: Optional[List[str]] = Query(None),
    regions: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db)
):
    """Получить распределение предприятий по статусам"""
    analytics_service = AnalyticsService(db)
    filters = FilterParams(industries=industries, regions=regions)
    return analytics_service.get_status_distribution(filters)

@router.get("/constants")
async def get_constants():
    """Получить константы системы (регионы, отрасли)"""
    return {
        "regions": settings.moscow_regions,
        "industries": settings.industries,
        "statuses": ["active", "inactive", "suspended"]
    }

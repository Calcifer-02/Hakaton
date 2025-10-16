from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from models.enterprise import Enterprise, DataUpload, DataQualityLog
from app.schemas import FilterParams, IndustryStats, RegionStats, AggregateData, DataQuality
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import pandas as pd

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def get_enterprises(self, filters: Optional[FilterParams] = None,
                       page: int = 1, size: int = 100) -> Dict:
        """Получение списка предприятий с фильтрацией и пагинацией"""
        query = self.db.query(Enterprise)

        # Применяем фильтры
        if filters:
            query = self._apply_filters(query, filters)

        # Подсчитываем общее количество
        total = query.count()

        # Применяем пагинацию
        enterprises = query.offset((page - 1) * size).limit(size).all()

        return {
            "enterprises": enterprises,
            "total": total,
            "page": page,
            "size": size,
            "total_pages": (total + size - 1) // size
        }

    def get_industry_stats(self, filters: Optional[FilterParams] = None) -> List[IndustryStats]:
        """Агрегация данных по отраслям"""
        query = self.db.query(
            Enterprise.industry,
            func.count(Enterprise.id).label('count'),
            func.sum(Enterprise.revenue).label('total_revenue'),
            func.avg(Enterprise.revenue).label('average_revenue'),
            func.sum(Enterprise.employees).label('total_employees'),
            func.avg(Enterprise.employees).label('average_employees')
        )

        if filters:
            query = self._apply_filters(query, filters)

        query = query.group_by(Enterprise.industry)
        results = query.all()

        return [
            IndustryStats(
                industry=result.industry,
                count=result.count,
                total_revenue=float(result.total_revenue or 0),
                average_revenue=float(result.average_revenue or 0),
                total_employees=int(result.total_employees or 0),
                average_employees=float(result.average_employees or 0)
            )
            for result in results
        ]

    def get_region_stats(self, filters: Optional[FilterParams] = None) -> List[RegionStats]:
        """Агрегация данных по регионам"""
        query = self.db.query(
            Enterprise.region,
            func.count(Enterprise.id).label('count'),
            func.sum(Enterprise.revenue).label('total_revenue'),
            func.avg(Enterprise.revenue).label('average_revenue'),
            func.sum(Enterprise.employees).label('total_employees'),
            func.avg(Enterprise.employees).label('average_employees')
        )

        if filters:
            query = self._apply_filters(query, filters)

        query = query.group_by(Enterprise.region)
        results = query.all()

        return [
            RegionStats(
                region=result.region,
                count=result.count,
                total_revenue=float(result.total_revenue or 0),
                average_revenue=float(result.average_revenue or 0),
                total_employees=int(result.total_employees or 0),
                average_employees=float(result.average_employees or 0)
            )
            for result in results
        ]

    def get_aggregate_data(self, filters: Optional[FilterParams] = None) -> AggregateData:
        """Получение агрегированных данных"""
        # Получаем статистику по отраслям и регионам
        industries = self.get_industry_stats(filters)
        regions = self.get_region_stats(filters)

        # Получаем общую статистику
        query = self.db.query(
            func.count(Enterprise.id).label('total_enterprises'),
            func.sum(Enterprise.revenue).label('total_revenue'),
            func.sum(Enterprise.employees).label('total_employees'),
            func.avg(Enterprise.revenue).label('average_revenue'),
            func.avg(Enterprise.employees).label('average_employees')
        )

        if filters:
            query = self._apply_filters(query, filters)

        result = query.first()

        return AggregateData(
            industries=industries,
            regions=regions,
            total_enterprises=result.total_enterprises or 0,
            total_revenue=float(result.total_revenue or 0),
            total_employees=int(result.total_employees or 0),
            average_revenue=float(result.average_revenue or 0),
            average_employees=float(result.average_employees or 0)
        )

    def get_data_quality_stats(self) -> DataQuality:
        """Статистика качества данных"""
        # Общее количество записей
        total_records = self.db.query(func.count(Enterprise.id)).scalar()

        # Валидированные записи
        valid_records = self.db.query(func.count(Enterprise.id)).filter(
            Enterprise.is_validated == True
        ).scalar()

        # Получаем ошибки качества данных
        quality_errors = self.db.query(DataQualityLog).all()
        validation_errors = [error.error_message for error in quality_errors]

        invalid_records = total_records - valid_records
        error_rate = (invalid_records / total_records * 100) if total_records > 0 else 0

        return DataQuality(
            total_records=total_records,
            valid_records=valid_records,
            invalid_records=invalid_records,
            validation_errors=validation_errors,
            error_rate=round(error_rate, 2)
        )

    def get_monthly_trends(self, filters: Optional[FilterParams] = None) -> List[Dict]:
        """Тренды по месяцам регистрации предприятий"""
        query = self.db.query(
            func.date_trunc('month', Enterprise.registration_date).label('month'),
            func.count(Enterprise.id).label('count'),
            func.sum(Enterprise.revenue).label('revenue')
        ).filter(Enterprise.registration_date.isnot(None))

        if filters:
            query = self._apply_filters(query, filters)

        query = query.group_by(func.date_trunc('month', Enterprise.registration_date))
        query = query.order_by(func.date_trunc('month', Enterprise.registration_date))

        results = query.all()

        return [
            {
                "month": result.month.strftime("%Y-%m") if result.month else "Unknown",
                "count": result.count,
                "revenue": float(result.revenue or 0)
            }
            for result in results
        ]

    def get_top_enterprises(self, by: str = "revenue", limit: int = 10,
                           filters: Optional[FilterParams] = None) -> List[Enterprise]:
        """Топ предприятий по выручке или количеству сотрудников"""
        query = self.db.query(Enterprise)

        if filters:
            query = self._apply_filters(query, filters)

        if by == "revenue":
            query = query.order_by(Enterprise.revenue.desc())
        elif by == "employees":
            query = query.order_by(Enterprise.employees.desc())
        else:
            raise ValueError("Parameter 'by' must be 'revenue' or 'employees'")

        return query.limit(limit).all()

    def get_status_distribution(self, filters: Optional[FilterParams] = None) -> Dict:
        """Распределение предприятий по статусам"""
        query = self.db.query(
            Enterprise.status,
            func.count(Enterprise.id).label('count')
        )

        if filters:
            query = self._apply_filters(query, filters)

        query = query.group_by(Enterprise.status)
        results = query.all()

        return {result.status.value: result.count for result in results}

    def _apply_filters(self, query, filters: FilterParams):
        """Применение фильтров к запросу"""
        if filters.industries:
            query = query.filter(Enterprise.industry.in_(filters.industries))

        if filters.regions:
            query = query.filter(Enterprise.region.in_(filters.regions))

        if filters.min_employees is not None:
            query = query.filter(Enterprise.employees >= filters.min_employees)

        if filters.max_employees is not None:
            query = query.filter(Enterprise.employees <= filters.max_employees)

        if filters.min_revenue is not None:
            query = query.filter(Enterprise.revenue >= filters.min_revenue)

        if filters.max_revenue is not None:
            query = query.filter(Enterprise.revenue <= filters.max_revenue)

        if filters.status:
            status_values = [status.value for status in filters.status]
            query = query.filter(Enterprise.status.in_(status_values))

        if filters.date_from:
            query = query.filter(Enterprise.registration_date >= filters.date_from)

        if filters.date_to:
            query = query.filter(Enterprise.registration_date <= filters.date_to)

        return query

    def search_enterprises(self, search_term: str, page: int = 1, size: int = 100) -> Dict:
        """Поиск предприятий по названию или адресу"""
        search_pattern = f"%{search_term}%"

        query = self.db.query(Enterprise).filter(
            or_(
                Enterprise.name.ilike(search_pattern),
                Enterprise.address.ilike(search_pattern)
            )
        )

        total = query.count()
        enterprises = query.offset((page - 1) * size).limit(size).all()

        return {
            "enterprises": enterprises,
            "total": total,
            "page": page,
            "size": size,
            "total_pages": (total + size - 1) // size,
            "search_term": search_term
        }

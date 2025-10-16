import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import re
from sqlalchemy.orm import Session
from models.enterprise import Enterprise, DataUpload, DataQualityLog
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

class DataProcessingService:
    def __init__(self, db: Session):
        self.db = db

    def process_uploaded_file(self, file_path: str, upload_id: int) -> Dict:
        """Основная функция обработки загруженного файла"""
        try:
            # Загружаем данные из файла
            if file_path.endswith('.csv'):
                df = pd.read_csv(file_path)
            elif file_path.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file_path)
            else:
                raise ValueError("Неподдерживаемый формат файла")

            # Очищаем данные
            cleaned_df, quality_issues = self.clean_data(df)

            # Валидируем данные
            validated_df, validation_errors = self.validate_data(cleaned_df)

            # Сохраняем данные в БД
            saved_count = self.save_to_database(validated_df, upload_id)

            # Логируем ошибки качества данных
            self.log_quality_issues(upload_id, quality_issues + validation_errors)

            return {
                "success": True,
                "total_rows": len(df),
                "processed_rows": saved_count,
                "error_count": len(quality_issues) + len(validation_errors),
                "errors": quality_issues + validation_errors
            }

        except Exception as e:
            logger.error(f"Ошибка обработки файла: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "total_rows": 0,
                "processed_rows": 0,
                "error_count": 1,
                "errors": [str(e)]
            }

    def clean_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """ETL: Очистка данных"""
        issues = []

        # Создаем копию для работы
        cleaned_df = df.copy()

        # Стандартизируем названия колонок
        column_mapping = {
            'название': 'name', 'имя': 'name', 'наименование': 'name',
            'отрасль': 'industry', 'сфера': 'industry', 'деятельность': 'industry',
            'регион': 'region', 'округ': 'region', 'район': 'region',
            'сотрудники': 'employees', 'работники': 'employees', 'персонал': 'employees',
            'выручка': 'revenue', 'доход': 'revenue', 'прибыль': 'revenue',
            'налоги': 'taxes_paid', 'налог': 'taxes_paid',
            'адрес': 'address', 'местонахождение': 'address',
            'телефон': 'phone', 'тел': 'phone',
            'email': 'email', 'почта': 'email',
            'дата_регистрации': 'registration_date', 'регистрация': 'registration_date',
            'статус': 'status'
        }

        # Переименовываем колонки
        for old_name, new_name in column_mapping.items():
            if old_name in cleaned_df.columns:
                cleaned_df.rename(columns={old_name: new_name}, inplace=True)

        # Обязательные колонки
        required_columns = ['name', 'industry', 'region', 'employees', 'revenue', 'address']

        # Проверяем наличие обязательных колонок
        missing_columns = [col for col in required_columns if col not in cleaned_df.columns]
        if missing_columns:
            issues.append(f"Отсутствуют обязательные колонки: {', '.join(missing_columns)}")
            return cleaned_df, issues

        # Очищаем строковые поля
        string_columns = ['name', 'industry', 'region', 'address', 'phone', 'email']
        for col in string_columns:
            if col in cleaned_df.columns:
                cleaned_df[col] = cleaned_df[col].astype(str).str.strip()
                cleaned_df[col] = cleaned_df[col].replace('nan', '')
                cleaned_df[col] = cleaned_df[col].replace('None', '')

        # Стандартизируем отрасли
        cleaned_df['industry'] = cleaned_df['industry'].apply(self.standardize_industry)

        # Стандартизируем регионы
        cleaned_df['region'] = cleaned_df['region'].apply(self.standardize_region)

        # Очищаем числовые поля
        numeric_columns = ['employees', 'revenue', 'taxes_paid']
        for col in numeric_columns:
            if col in cleaned_df.columns:
                cleaned_df[col] = pd.to_numeric(cleaned_df[col], errors='coerce')
                cleaned_df[col] = cleaned_df[col].fillna(0)

        # Очищаем даты
        if 'registration_date' in cleaned_df.columns:
            cleaned_df['registration_date'] = pd.to_datetime(
                cleaned_df['registration_date'], errors='coerce'
            )

        # Удаляем дубликаты
        initial_count = len(cleaned_df)
        cleaned_df = cleaned_df.drop_duplicates(subset=['name', 'address'])
        duplicate_count = initial_count - len(cleaned_df)
        if duplicate_count > 0:
            issues.append(f"Удалено {duplicate_count} дублированных записей")

        # Удаляем строки с пустыми обязательными полями
        before_clean = len(cleaned_df)
        cleaned_df = cleaned_df.dropna(subset=['name', 'address'])
        cleaned_df = cleaned_df[cleaned_df['name'] != '']
        cleaned_df = cleaned_df[cleaned_df['address'] != '']
        after_clean = len(cleaned_df)

        if before_clean != after_clean:
            issues.append(f"Удалено {before_clean - after_clean} записей с пустыми обязательными полями")

        return cleaned_df, issues

    def validate_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, List[str]]:
        """Валидация данных"""
        errors = []
        valid_df = df.copy()

        # Валидация отраслей
        invalid_industries = ~valid_df['industry'].isin(settings.industries)
        if invalid_industries.any():
            invalid_count = invalid_industries.sum()
            errors.append(f"Найдено {invalid_count} записей с некорректными отраслями")
            # Заменяем некорректные отрасли на "Другое"
            valid_df.loc[invalid_industries, 'industry'] = 'Другое'

        # Валидация регионов
        invalid_regions = ~valid_df['region'].isin(settings.moscow_regions)
        if invalid_regions.any():
            invalid_count = invalid_regions.sum()
            errors.append(f"Найдено {invalid_count} записей с некорректными регионами")
            # Удаляем записи с некорректными регионами
            valid_df = valid_df[~invalid_regions]

        # Валидация числовых полей
        negative_employees = valid_df['employees'] < 0
        if negative_employees.any():
            errors.append(f"Найдено {negative_employees.sum()} записей с отрицательным числом сотрудников")
            valid_df = valid_df[~negative_employees]

        negative_revenue = valid_df['revenue'] < 0
        if negative_revenue.any():
            errors.append(f"Найдено {negative_revenue.sum()} записей с отрицательной выручкой")
            valid_df = valid_df[~negative_revenue]

        # Валидация email
        if 'email' in valid_df.columns:
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
            invalid_emails = valid_df['email'].apply(
                lambda x: x != '' and not re.match(email_pattern, str(x)) if pd.notna(x) else False
            )
            if invalid_emails.any():
                errors.append(f"Найдено {invalid_emails.sum()} записей с некорректными email")
                valid_df.loc[invalid_emails, 'email'] = ''

        return valid_df, errors

    def standardize_industry(self, industry: str) -> str:
        """Стандартизация названий отраслей"""
        if pd.isna(industry) or industry == '':
            return 'Другое'

        industry_lower = industry.lower()

        # Словарь для приведения к стандартным названиям
        industry_mapping = {
            'машиностроение': 'Машиностроение',
            'машиностроительная': 'Машиностроение',
            'пищевая': 'Пищевая промышленность',
            'пищевое производство': 'Пищевая промышленность',
            'химия': 'Химическая промышленность',
            'химическая': 'Химическая промышленность',
            'текстиль': 'Текстильная промышленность',
            'текстильная': 'Текстильная промышленность',
            'металлургия': 'Металлургия',
            'металлургическая': 'Металлургия',
            'электроника': 'Электроника',
            'электронная': 'Электроника',
            'стройматериалы': 'Строительные материалы',
            'строительная': 'Строительные материалы',
            'фарма': 'Фармацевтика',
            'фармацевтическая': 'Фармацевтика',
            'авто': 'Автомобилестроение',
            'автомобильная': 'Автомобилестроение',
            'полиграфия': 'Полиграфия',
            'полиграфическая': 'Полиграфия'
        }

        for key, value in industry_mapping.items():
            if key in industry_lower:
                return value

        # Если точного соответствия нет, возвращаем исходное значение
        return industry if industry in settings.industries else 'Другое'

    def standardize_region(self, region: str) -> str:
        """Стандартизация названий регионов"""
        if pd.isna(region) or region == '':
            return ''

        region_lower = region.lower()

        # Словарь для приведения к стандартным названиям
        region_mapping = {
            'центр': 'Центральный',
            'центральный': 'Центральный',
            'север': 'Северный',
            'северный': 'Северный',
            'сзао': 'Северо-Западный',
            'северо-запад': 'Северо-Западный',
            'свао': 'Северо-Восточный',
            'северо-восток': 'Северо-Восточный',
            'восток': 'Восточный',
            'восточный': 'Восточный',
            'ювао': 'Юго-Восточный',
            'юго-восток': 'Юго-Восточный',
            'юг': 'Южный',
            'южный': 'Южный',
            'юзао': 'Юго-Западный',
            'юго-запад': 'Юго-Западный',
            'запад': 'Западный',
            'западный': 'Западный',
            'новая москва': 'Новомосковский',
            'новомосковский': 'Новомосковский',
            'троицк': 'Троицкий',
            'троицкий': 'Троицкий'
        }

        for key, value in region_mapping.items():
            if key in region_lower:
                return value

        return region if region in settings.moscow_regions else ''

    def save_to_database(self, df: pd.DataFrame, upload_id: int) -> int:
        """Сохранение данных в базу данных"""
        saved_count = 0

        for _, row in df.iterrows():
            try:
                enterprise = Enterprise(
                    name=row['name'],
                    industry=row['industry'],
                    region=row['region'],
                    employees=int(row['employees']),
                    revenue=float(row['revenue']),
                    taxes_paid=float(row.get('taxes_paid', 0)),
                    address=row['address'],
                    phone=row.get('phone', ''),
                    email=row.get('email', ''),
                    registration_date=row.get('registration_date'),
                    source_file=str(upload_id),
                    is_validated=True
                )

                self.db.add(enterprise)
                saved_count += 1

            except Exception as e:
                logger.error(f"Ошибка сохранения записи: {str(e)}")
                continue

        try:
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Ошибка сохранения в БД: {str(e)}")
            raise

        return saved_count

    def log_quality_issues(self, upload_id: int, issues: List[str]):
        """Логирование проблем качества данных"""
        for i, issue in enumerate(issues):
            quality_log = DataQualityLog(
                upload_id=upload_id,
                row_number=i + 1,
                error_type="data_quality",
                error_message=issue
            )
            self.db.add(quality_log)

        try:
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            logger.error(f"Ошибка логирования проблем качества: {str(e)}")

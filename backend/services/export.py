import pandas as pd
import tempfile
import os
from typing import List
from datetime import datetime
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.units import inch
from models.enterprise import Enterprise
from app.schemas import AggregateData, FilterParams, DataQuality
import xlsxwriter

class ExportService:
    def __init__(self, db):
        self.db = db

    def export_to_csv(self, enterprises: List[Enterprise]) -> str:
        """Экспорт предприятий в CSV"""
        # Создаем DataFrame
        data = []
        for enterprise in enterprises:
            data.append({
                'ID': enterprise.id,
                'Название': enterprise.name,
                'Отрасль': enterprise.industry,
                'Регион': enterprise.region,
                'Сотрудники': enterprise.employees,
                'Выручка': enterprise.revenue,
                'Налоги': enterprise.taxes_paid,
                'Адрес': enterprise.address,
                'Телефон': enterprise.phone,
                'Email': enterprise.email,
                'Дата регистрации': enterprise.registration_date,
                'Статус': enterprise.status.value,
                'Дата создания': enterprise.created_at,
                'Последнее обновление': enterprise.updated_at
            })

        df = pd.DataFrame(data)

        # Создаем временный файл
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.csv', mode='w', encoding='utf-8')
        df.to_csv(temp_file.name, index=False, encoding='utf-8-sig')
        temp_file.close()

        return temp_file.name

    def export_to_excel(self, enterprises: List[Enterprise]) -> str:
        """Экспорт предприятий в Excel"""
        # Создаем временный файл
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
        temp_file.close()

        # Создаем Excel файл
        workbook = xlsxwriter.Workbook(temp_file.name)
        worksheet = workbook.add_worksheet('Предприятия')

        # Форматы
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#4472C4',
            'font_color': 'white',
            'border': 1
        })

        currency_format = workbook.add_format({'num_format': '#,##0.00 ₽'})
        number_format = workbook.add_format({'num_format': '#,##0'})
        date_format = workbook.add_format({'num_format': 'dd.mm.yyyy'})

        # Заголовки
        headers = [
            'ID', 'Название', 'Отрасль', 'Регион', 'Сотрудники', 'Выручка',
            'Налоги', 'Адрес', 'Телефон', 'Email', 'Дата регистрации',
            'Статус', 'Дата создания', 'Последнее обновление'
        ]

        for col, header in enumerate(headers):
            worksheet.write(0, col, header, header_format)

        # Данные
        for row, enterprise in enumerate(enterprises, 1):
            worksheet.write(row, 0, enterprise.id, number_format)
            worksheet.write(row, 1, enterprise.name)
            worksheet.write(row, 2, enterprise.industry)
            worksheet.write(row, 3, enterprise.region)
            worksheet.write(row, 4, enterprise.employees, number_format)
            worksheet.write(row, 5, enterprise.revenue, currency_format)
            worksheet.write(row, 6, enterprise.taxes_paid or 0, currency_format)
            worksheet.write(row, 7, enterprise.address)
            worksheet.write(row, 8, enterprise.phone or '')
            worksheet.write(row, 9, enterprise.email or '')
            worksheet.write(row, 10, enterprise.registration_date, date_format)
            worksheet.write(row, 11, enterprise.status.value)
            worksheet.write(row, 12, enterprise.created_at, date_format)
            worksheet.write(row, 13, enterprise.updated_at, date_format)

        # Автоподбор ширины колонок
        worksheet.set_column('A:A', 8)   # ID
        worksheet.set_column('B:B', 30)  # Название
        worksheet.set_column('C:C', 20)  # Отрасль
        worksheet.set_column('D:D', 15)  # Регион
        worksheet.set_column('E:E', 12)  # Сотрудники
        worksheet.set_column('F:F', 15)  # Выручка
        worksheet.set_column('G:G', 15)  # Налоги
        worksheet.set_column('H:H', 40)  # Адрес
        worksheet.set_column('I:I', 15)  # Телефон
        worksheet.set_column('J:J', 25)  # Email
        worksheet.set_column('K:K', 15)  # Дата регистрации
        worksheet.set_column('L:L', 12)  # Статус
        worksheet.set_column('M:M', 15)  # Дата создания
        worksheet.set_column('N:N', 15)  # Последнее обновление

        workbook.close()
        return temp_file.name

    def export_aggregates_to_excel(self, aggregate_data: AggregateData, monthly_trends: List) -> str:
        """Экспорт агрегированных данных в Excel"""
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx')
        temp_file.close()

        workbook = xlsxwriter.Workbook(temp_file.name)

        # Форматы
        header_format = workbook.add_format({
            'bold': True,
            'bg_color': '#4472C4',
            'font_color': 'white',
            'border': 1
        })

        currency_format = workbook.add_format({'num_format': '#,##0.00 ₽'})
        number_format = workbook.add_format({'num_format': '#,##0'})

        # Лист с общей статистикой
        summary_sheet = workbook.add_worksheet('Общая статистика')
        summary_sheet.write(0, 0, 'Показатель', header_format)
        summary_sheet.write(0, 1, 'Значение', header_format)

        summary_data = [
            ('Всего предприятий', aggregate_data.total_enterprises),
            ('Общая выручка', aggregate_data.total_revenue),
            ('Общее количество сотрудников', aggregate_data.total_employees),
            ('Средняя выручка', aggregate_data.average_revenue),
            ('Среднее количество сотрудников', aggregate_data.average_employees)
        ]

        for row, (metric, value) in enumerate(summary_data, 1):
            summary_sheet.write(row, 0, metric)
            if 'выручка' in metric.lower():
                summary_sheet.write(row, 1, value, currency_format)
            else:
                summary_sheet.write(row, 1, value, number_format)

        summary_sheet.set_column('A:A', 30)
        summary_sheet.set_column('B:B', 20)

        # Лист по отраслям
        industries_sheet = workbook.add_worksheet('По отраслям')
        industry_headers = ['Отрасль', 'Количество', 'Общая выручка', 'Средняя выручка', 'Всего сотрудников', 'Средн. сотрудников']

        for col, header in enumerate(industry_headers):
            industries_sheet.write(0, col, header, header_format)

        for row, industry in enumerate(aggregate_data.industries, 1):
            industries_sheet.write(row, 0, industry.industry)
            industries_sheet.write(row, 1, industry.count, number_format)
            industries_sheet.write(row, 2, industry.total_revenue, currency_format)
            industries_sheet.write(row, 3, industry.average_revenue, currency_format)
            industries_sheet.write(row, 4, industry.total_employees, number_format)
            industries_sheet.write(row, 5, industry.average_employees, number_format)

        industries_sheet.set_column('A:A', 25)
        industries_sheet.set_column('B:F', 15)

        # Лист по регионам
        regions_sheet = workbook.add_worksheet('По регионам')
        region_headers = ['Регион', 'Количество', 'Общая выручка', 'Средняя выручка', 'Всего сотрудников', 'Средн. сотрудников']

        for col, header in enumerate(region_headers):
            regions_sheet.write(0, col, header, header_format)

        for row, region in enumerate(aggregate_data.regions, 1):
            regions_sheet.write(row, 0, region.region)
            regions_sheet.write(row, 1, region.count, number_format)
            regions_sheet.write(row, 2, region.total_revenue, currency_format)
            regions_sheet.write(row, 3, region.average_revenue, currency_format)
            regions_sheet.write(row, 4, region.total_employees, number_format)
            regions_sheet.write(row, 5, region.average_employees, number_format)

        regions_sheet.set_column('A:A', 20)
        regions_sheet.set_column('B:F', 15)

        # Лист с трендами
        if monthly_trends:
            trends_sheet = workbook.add_worksheet('Тренды по месяцам')
            trend_headers = ['Месяц', 'Количество', 'Выручка']

            for col, header in enumerate(trend_headers):
                trends_sheet.write(0, col, header, header_format)

            for row, trend in enumerate(monthly_trends, 1):
                trends_sheet.write(row, 0, trend['month'])
                trends_sheet.write(row, 1, trend['count'], number_format)
                trends_sheet.write(row, 2, trend['revenue'], currency_format)

            trends_sheet.set_column('A:A', 15)
            trends_sheet.set_column('B:C', 15)

        workbook.close()
        return temp_file.name

    def generate_pdf_report(self, title: str, aggregate_data: AggregateData,
                           monthly_trends: List, top_enterprises: List[Enterprise],
                           data_quality: DataQuality, filters: FilterParams) -> str:
        """Генерация PDF отчёта"""
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_file.close()

        doc = SimpleDocTemplate(temp_file.name, pagesize=A4)
        styles = getSampleStyleSheet()
        story = []

        # Заголовок
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=18,
            spaceAfter=30,
            alignment=1  # Центрирование
        )
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 20))

        # Дата генерации
        story.append(Paragraph(f"Дата генерации: {datetime.now().strftime('%d.%m.%Y %H:%M')}", styles['Normal']))
        story.append(Spacer(1, 20))

        # Общая статистика
        story.append(Paragraph("ОБЩАЯ СТАТИСТИКА", styles['Heading2']))

        summary_data = [
            ['Показатель', 'Значение'],
            ['Всего предприятий', f"{aggregate_data.total_enterprises:,}"],
            ['Общая выручка', f"{aggregate_data.total_revenue:,.2f} ₽"],
            ['Общее количество сотрудников', f"{aggregate_data.total_employees:,}"],
            ['Средняя выручка', f"{aggregate_data.average_revenue:,.2f} ₽"],
            ['Среднее количество сотрудников', f"{aggregate_data.average_employees:.0f}"]
        ]

        summary_table = Table(summary_data)
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        story.append(summary_table)
        story.append(Spacer(1, 30))

        # Топ 5 отраслей
        story.append(Paragraph("ТОП 5 ОТРАСЛЕЙ ПО КОЛИЧЕСТВУ ПРЕДПРИЯТИЙ", styles['Heading2']))

        top_industries = sorted(aggregate_data.industries, key=lambda x: x.count, reverse=True)[:5]
        industry_data = [['Отрасль', 'Количество', 'Общая выручка']]

        for industry in top_industries:
            industry_data.append([
                industry.industry,
                f"{industry.count}",
                f"{industry.total_revenue:,.0f} ₽"
            ])

        industry_table = Table(industry_data)
        industry_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        story.append(industry_table)
        story.append(Spacer(1, 30))

        # Топ предприятия
        story.append(Paragraph("ТОП 10 ПРЕДПРИЯТИЙ ПО ВЫРУЧКЕ", styles['Heading2']))

        top_data = [['Название', 'Отрасль', 'Выручка']]
        for enterprise in top_enterprises:
            top_data.append([
                enterprise.name[:30] + "..." if len(enterprise.name) > 30 else enterprise.name,
                enterprise.industry,
                f"{enterprise.revenue:,.0f} ₽"
            ])

        top_table = Table(top_data)
        top_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 8)
        ]))

        story.append(top_table)
        story.append(Spacer(1, 30))

        # Качество данных
        story.append(Paragraph("КАЧЕСТВО ДАННЫХ", styles['Heading2']))

        quality_data = [
            ['Показатель', 'Значение'],
            ['Общее количество записей', f"{data_quality.total_records:,}"],
            ['Валидных записей', f"{data_quality.valid_records:,}"],
            ['Невалидных записей', f"{data_quality.invalid_records:,}"],
            ['Процент ошибок', f"{data_quality.error_rate:.2f}%"]
        ]

        quality_table = Table(quality_data)
        quality_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        story.append(quality_table)

        # Генерируем PDF
        doc.build(story)
        return temp_file.name

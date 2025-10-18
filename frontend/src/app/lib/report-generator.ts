import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Enterprise, IndustryStats, RegionStats } from '../types/enterprise';

// Интерфейс для конфигурации отчета
export interface ReportData {
  title: string;
  period: {
    from: string;
    to: string;
  };
  enterprises: Enterprise[];
  stats: {
    totalEnterprises: number;
    totalRevenue: number;
    totalEmployees: number;
    averageRevenue: number;
    averageEmployees: number;
  };
  industryStats?: IndustryStats[];
  regionStats?: RegionStats[];
}

// Форматирование валюты для отчетов
const formatCurrencyForExport = (value: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Форматирование чисел
const formatNumberForExport = (value: number): string => {
  return new Intl.NumberFormat('ru-RU').format(value);
};

// Генерация Excel отчета
export const generateExcelReport = (reportData: ReportData) => {
  const workbook = XLSX.utils.book_new();

  // Лист 1: Общая информация
  const summaryData = [
    ['Отчёт по предприятиям Москвы'],
    ['Название отчёта:', reportData.title],
    ['Дата создания:', new Date().toLocaleString('ru-RU')],
    ['Период:', `${reportData.period.from} - ${reportData.period.to}`],
    [],
    ['Общая статистика'],
    ['Всего предприятий:', reportData.stats.totalEnterprises],
    ['Общая выручка:', formatCurrencyForExport(reportData.stats.totalRevenue)],
    ['Всего сотрудников:', formatNumberForExport(reportData.stats.totalEmployees)],
    ['Средняя выручка:', formatCurrencyForExport(reportData.stats.averageRevenue)],
    ['Средняя численность:', formatNumberForExport(Math.round(reportData.stats.averageEmployees))],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Общая информация');

  // Лист 2: Предприятия
  if (reportData.enterprises.length > 0) {
    const enterprisesData = reportData.enterprises.map(e => ({
      'Название': e.name,
      'Отрасль': e.industry,
      'Регион': e.region,
      'Сотрудники': e.employees,
      'Выручка (руб.)': e.revenue,
      'Налоги (руб.)': e.taxesPaid,
      'Статус': e.status === 'active' ? 'Активно' : e.status === 'inactive' ? 'Неактивно' : 'Приостановлено',
      'Адрес': e.contactInfo.address,
      'Телефон': e.contactInfo.phone || '-',
      'Email': e.contactInfo.email || '-',
    }));

    const enterprisesSheet = XLSX.utils.json_to_sheet(enterprisesData);
    XLSX.utils.book_append_sheet(workbook, enterprisesSheet, 'Предприятия');
  }

  // Лист 3: Статистика по отраслям
  if (reportData.industryStats && reportData.industryStats.length > 0) {
    const industryData = reportData.industryStats.map(i => ({
      'Отрасль': i.industry,
      'Количество предприятий': i.count,
      'Общая выручка (руб.)': i.totalRevenue,
      'Средняя численность': i.averageEmployees,
    }));

    const industrySheet = XLSX.utils.json_to_sheet(industryData);
    XLSX.utils.book_append_sheet(workbook, industrySheet, 'По отраслям');
  }

  // Лист 4: Статистика по регионам
  if (reportData.regionStats && reportData.regionStats.length > 0) {
    const regionData = reportData.regionStats.map(r => ({
      'Регион': r.region,
      'Количество предприятий': r.count,
      'Общая выручка (руб.)': r.totalRevenue,
      'Средняя численность': r.averageEmployees,
    }));

    const regionSheet = XLSX.utils.json_to_sheet(regionData);
    XLSX.utils.book_append_sheet(workbook, regionSheet, 'По регионам');
  }

  // Сохранение файла
  const fileName = `report_${Date.now()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};

// Генерация PDF отчета
export const generatePDFReport = (reportData: ReportData) => {
  const doc = new jsPDF();

  // Используем базовый шрифт с поддержкой юникода
  doc.setFont('helvetica');

  // Заголовок
  doc.setFontSize(18);
  doc.text('Отчёт по предприятиям Москвы', 14, 15);

  doc.setFontSize(12);
  doc.text(`Название: ${reportData.title}`, 14, 25);
  doc.text(`Дата создания: ${new Date().toLocaleDateString('ru-RU')}`, 14, 32);
  doc.text(`Период: ${reportData.period.from} - ${reportData.period.to}`, 14, 39);

  // Общая статистика
  doc.setFontSize(14);
  doc.text('Общая статистика', 14, 50);

  doc.setFontSize(11);
  doc.text(`Всего предприятий: ${reportData.stats.totalEnterprises}`, 14, 58);
  doc.text(`Общая выручка: ${formatCurrencyForExport(reportData.stats.totalRevenue)}`, 14, 65);
  doc.text(`Всего сотрудников: ${formatNumberForExport(reportData.stats.totalEmployees)}`, 14, 72);
  doc.text(`Средняя выручка: ${formatCurrencyForExport(reportData.stats.averageRevenue)}`, 14, 79);
  doc.text(`Средняя численность: ${formatNumberForExport(Math.round(reportData.stats.averageEmployees))}`, 14, 86);

  let yPos = 95;

  // Статистика по отраслям
  if (reportData.industryStats && reportData.industryStats.length > 0) {
    doc.setFontSize(14);
    doc.text('Статистика по отраслям', 14, yPos);
    yPos += 10;

    const industryTableData = reportData.industryStats.map(i => [
      i.industry,
      i.count.toString(),
      formatCurrencyForExport(i.totalRevenue),
      i.averageEmployees.toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Отрасль', 'Кол-во', 'Выручка', 'Сред. численность']],
      body: industryTableData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [59, 130, 246],
        font: 'helvetica',
        fontStyle: 'bold'
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Статистика по регионам
  if (reportData.regionStats && reportData.regionStats.length > 0) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 15;
    }

    doc.setFontSize(14);
    doc.text('Статистика по регионам', 14, yPos);
    yPos += 10;

    const regionTableData = reportData.regionStats.map(r => [
      r.region,
      r.count.toString(),
      formatCurrencyForExport(r.totalRevenue),
      r.averageEmployees.toString(),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Регион', 'Кол-во', 'Выручка', 'Сред. численность']],
      body: regionTableData,
      theme: 'grid',
      styles: {
        fontSize: 9,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [16, 185, 129],
        font: 'helvetica',
        fontStyle: 'bold'
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Топ 10 предприятий
  if (reportData.enterprises.length > 0) {
    if (yPos > 220) {
      doc.addPage();
      yPos = 15;
    }

    doc.setFontSize(14);
    doc.text('Топ 10 предприятий по выручке', 14, yPos);
    yPos += 10;

    const topEnterprises = [...reportData.enterprises]
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const enterprisesTableData = topEnterprises.map(e => [
      e.name,
      e.industry,
      e.employees.toString(),
      formatCurrencyForExport(e.revenue),
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['Название', 'Отрасль', 'Сотрудники', 'Выручка']],
      body: enterprisesTableData,
      theme: 'grid',
      styles: {
        fontSize: 8,
        font: 'helvetica'
      },
      headStyles: {
        fillColor: [139, 92, 246],
        font: 'helvetica',
        fontStyle: 'bold'
      },
    });
  }

  // Сохранение файла
  const fileName = `otchet_${Date.now()}.pdf`;
  doc.save(fileName);
};

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Enterprise, IndustryStats, RegionStats } from '../types/enterprise';

// Динамический импорт pdfMake только когда он нужен
let pdfMake: any = null;

// Асинхронная инициализация pdfMake с улучшенной обработкой ошибок
const initializePdfMake = async () => {
  if (!pdfMake) {
    try {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

      pdfMake = pdfMakeModule.default || pdfMakeModule;

      // Проверяем различные способы доступа к шрифтам
      if (pdfFontsModule.default?.pdfMake?.vfs) {
        pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
      } else if (pdfFontsModule.pdfMake?.vfs) {
        pdfMake.vfs = pdfFontsModule.pdfMake.vfs;
      } else if ((pdfFontsModule as any).vfs) {
        pdfMake.vfs = (pdfFontsModule as any).vfs;
      } else {
        console.warn('Не удалось найти шрифты pdfMake, используем стандартные');
        // Создаем пустой объект vfs для базовой работы
        pdfMake.vfs = {};
      }

      console.log('pdfMake успешно инициализирован');
    } catch (error) {
      console.error('Ошибка инициализации pdfMake:', error);
      pdfMake = null;
      throw error;
    }
  }
  return pdfMake;
};

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

// Улучшенная генерация Excel отчета с лучшим форматированием
export const generateExcelReport = (reportData: ReportData) => {
  const workbook = XLSX.utils.book_new();

  // Лист 1: Общая информация
  const summaryData = [
    ['ОТЧЁТ ПО ПРЕДПРИЯТИЯМ МОСКВЫ'],
    [''],
    ['Название отчёта:', reportData.title],
    ['Дата создания:', new Date().toLocaleString('ru-RU')],
    ['Период:', `${reportData.period.from} - ${reportData.period.to}`],
    [''],
    ['ОБЩАЯ СТАТИСТИКА'],
    ['Всего предприятий:', reportData.stats.totalEnterprises],
    ['Общая выручка:', formatCurrencyForExport(reportData.stats.totalRevenue)],
    ['Всего сотрудников:', formatNumberForExport(reportData.stats.totalEmployees)],
    ['Средняя выручка:', formatCurrencyForExport(reportData.stats.averageRevenue)],
    ['Средняя численность:', formatNumberForExport(Math.round(reportData.stats.averageEmployees))],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Применяем стили к заголовкам
  if (!summarySheet['!merges']) summarySheet['!merges'] = [];
  summarySheet['!merges'].push(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }, // Объединяем ячейки для главного заголовка
    { s: { r: 6, c: 0 }, e: { r: 6, c: 1 } }  // Объединяем ячейки для "ОБЩАЯ СТАТИСТИКА"
  );

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
      'Дата регистрации': e.registrationDate,
      'Статус': e.status === 'active' ? 'Активно' : e.status === 'inactive' ? 'Неактивно' : 'Приостановлено',
      'Адрес': e.contactInfo.address,
      'Телефон': e.contactInfo.phone || '-',
      'Email': e.contactInfo.email || '-',
      'Координаты': e.latitude && e.longitude ? `${e.latitude}, ${e.longitude}` : '-'
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

  // Сохранение файла с русским названием
  const fileName = `Отчёт_предприятия_Москвы_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);

  return fileName;
};

// Обновленная генерация PDF отчета с улучшенной обработкой ошибок
export const generatePDFReport = async (reportData: ReportData) => {
  try {
    console.log('Начинаем генерацию PDF отчета...');

    // Инициализируем pdfMake асинхронно
    const pdf = await initializePdfMake();

    if (!pdf) {
      console.log('pdfMake не доступен, переключаемся на jsPDF');
      return generateSimplePDFReport(reportData);
    }

    console.log('Создаем структуру документа...');

    // Определяем документ с поддержкой русского языка
    const docDefinition = {
      pageSize: 'A4' as const,
      pageMargins: [40, 60, 40, 60] as [number, number, number, number],

      content: [
        // Заголовок
        {
          text: 'ОТЧЁТ ПО ПРЕДПРИЯТИЯМ МОСКВЫ',
          style: 'header',
          alignment: 'center' as const,
          margin: [0, 0, 0, 20] as [number, number, number, number]
        },

        // Информация о отчете
        {
          columns: [
            {
              width: '50%',
              stack: [
                { text: `Название: ${reportData.title}`, style: 'subheader' },
                { text: `Дата создания: ${new Date().toLocaleDateString('ru-RU')}`, style: 'normal' },
                { text: `Период: ${reportData.period.from} - ${reportData.period.to}`, style: 'normal' }
              ]
            },
            {
              width: '50%',
              stack: [
                { text: 'Общая статистика', style: 'subheader' },
                { text: `Всего предприятий: ${formatNumberForExport(reportData.stats.totalEnterprises)}`, style: 'normal' },
                { text: `Общая выручка: ${formatCurrencyForExport(reportData.stats.totalRevenue)}`, style: 'normal' }
              ]
            }
          ],
          margin: [0, 0, 0, 20] as [number, number, number, number]
        },

        // Дополнительная статистика
        {
          columns: [
            {
              width: '50%',
              text: `Всего сотрудников: ${formatNumberForExport(reportData.stats.totalEmployees)}`,
              style: 'normal'
            },
            {
              width: '50%',
              text: `Средняя выручка: ${formatCurrencyForExport(reportData.stats.averageRevenue)}`,
              style: 'normal'
            }
          ],
          margin: [0, 0, 0, 30] as [number, number, number, number]
        }
      ] as any[],

      styles: {
        header: {
          fontSize: 18,
          bold: true,
          color: '#1f2937'
        },
        subheader: {
          fontSize: 14,
          bold: true,
          color: '#3b82f6',
          margin: [0, 10, 0, 5] as [number, number, number, number]
        },
        normal: {
          fontSize: 11,
          margin: [0, 2, 0, 2] as [number, number, number, number]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#3b82f6'
        },
        tableBody: {
          fontSize: 9
        }
      }
    };

    // Добавляем статистику по отраслям
    if (reportData.industryStats && reportData.industryStats.length > 0) {
      docDefinition.content.push(
        { text: 'Статистика по отраслям', style: 'subheader', pageBreak: 'before' },
        {
          table: {
            headerRows: 1,
            widths: ['30%', '20%', '30%', '20%'],
            body: [
              [
                { text: 'Отрасль', style: 'tableHeader' },
                { text: 'Количество', style: 'tableHeader' },
                { text: 'Общая выручка', style: 'tableHeader' },
                { text: 'Средняя численность', style: 'tableHeader' }
              ],
              ...reportData.industryStats.map(industry => [
                { text: industry.industry, style: 'tableBody' },
                { text: formatNumberForExport(industry.count), style: 'tableBody' },
                { text: formatCurrencyForExport(industry.totalRevenue), style: 'tableBody' },
                { text: formatNumberForExport(Math.round(industry.averageEmployees)), style: 'tableBody' }
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#3b82f6' : (rowIndex % 2 === 0 ? '#f8f9fa' : null),
            hLineColor: '#e5e7eb',
            vLineColor: '#e5e7eb'
          },
          margin: [0, 10, 0, 20] as [number, number, number, number]
        }
      );
    }

    // Добавляем статистику по регионам
    if (reportData.regionStats && reportData.regionStats.length > 0) {
      docDefinition.content.push(
        { text: 'Статистика по регионам', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['30%', '20%', '30%', '20%'],
            body: [
              [
                { text: 'Регион', style: 'tableHeader' },
                { text: 'Количество', style: 'tableHeader' },
                { text: 'Общая выручка', style: 'tableHeader' },
                { text: 'Средняя численность', style: 'tableHeader' }
              ],
              ...reportData.regionStats.map(region => [
                { text: region.region, style: 'tableBody' },
                { text: formatNumberForExport(region.count), style: 'tableBody' },
                { text: formatCurrencyForExport(region.totalRevenue), style: 'tableBody' },
                { text: formatNumberForExport(Math.round(region.averageEmployees)), style: 'tableBody' }
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#10b981' : (rowIndex % 2 === 0 ? '#f0fdf4' : null),
            hLineColor: '#e5e7eb',
            vLineColor: '#e5e7eb'
          },
          margin: [0, 10, 0, 20] as [number, number, number, number]
        }
      );
    }

    // Добавляем топ предприятий
    if (reportData.enterprises.length > 0) {
      const topEnterprises = [...reportData.enterprises]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      docDefinition.content.push(
        { text: 'Топ 10 предприятий по выручке', style: 'subheader' },
        {
          table: {
            headerRows: 1,
            widths: ['35%', '25%', '15%', '25%'],
            body: [
              [
                { text: 'Название', style: 'tableHeader' },
                { text: 'Отрасль', style: 'tableHeader' },
                { text: 'Сотрудники', style: 'tableHeader' },
                { text: 'Выручка', style: 'tableHeader' }
              ],
              ...topEnterprises.map(enterprise => [
                { text: enterprise.name, style: 'tableBody' },
                { text: enterprise.industry, style: 'tableBody' },
                { text: formatNumberForExport(enterprise.employees), style: 'tableBody' },
                { text: formatCurrencyForExport(enterprise.revenue), style: 'tableBody' }
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#8b5cf6' : (rowIndex % 2 === 0 ? '#faf5ff' : null),
            hLineColor: '#e5e7eb',
            vLineColor: '#e5e7eb'
          },
          margin: [0, 10, 0, 0] as [number, number, number, number]
        }
      );
    }

    // Создаем и скачиваем PDF
    const fileName = `Отчёт_предприятия_Москвы_${new Date().toISOString().split('T')[0]}.pdf`;

    console.log('Генерируем PDF файл...');
    pdf.createPdf(docDefinition).download(fileName);

    console.log('PDF успешно создан:', fileName);
    return fileName;
  } catch (error) {
    console.error('Ошибка генерации PDF:', error);
    console.log('Переключаемся на простой PDF через jsPDF');
    // Fallback на простой PDF через jsPDF
    return generateSimplePDFReport(reportData);
  }
};

// Улучшенная функция для генерации упрощенного PDF через jsPDF
export const generateSimplePDFReport = (reportData: ReportData) => {
  try {
    console.log('Создаем упрощенный PDF отчет через jsPDF...');

    const doc = new jsPDF();

    // Добавляем поддержку Unicode через escape последовательности
    const addUnicodeText = (text: string, x: number, y: number, fontSize: number = 12) => {
      doc.setFontSize(fontSize);

      // Простая замена основных кириллических символов
      const cyrillicMap: { [key: string]: string } = {
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
        'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
        'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
        'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
        'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
        'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
        'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
      };

      const transliteratedText = text.replace(/[А-Яа-яЁё]/g, char => cyrillicMap[char] || char);
      doc.text(transliteratedText, x, y);
    };

    // Заголовок
    addUnicodeText('OTCHYOT PO PREDPRIYATIYAM MOSKVY', 105, 20, 18);
    doc.setFontSize(14);
    doc.text('(Report on Moscow Enterprises)', 105, 30, { align: 'center' });

    // Основная информация
    let yPosition = 50;
    addUnicodeText(`Nazvanie: ${reportData.title}`, 20, yPosition, 12);
    yPosition += 10;
    addUnicodeText(`Data sozdaniya: ${new Date().toLocaleDateString('ru-RU')}`, 20, yPosition, 12);
    yPosition += 10;
    addUnicodeText(`Period: ${reportData.period.from} - ${reportData.period.to}`, 20, yPosition, 12);
    yPosition += 20;

    // Общая статистика
    addUnicodeText('OBSHCHAYA STATISTIKA', 20, yPosition, 14);
    yPosition += 15;

    const stats = [
      ['Vsego predpriyatiy:', formatNumberForExport(reportData.stats.totalEnterprises)],
      ['Obshchaya vyruchka:', formatCurrencyForExport(reportData.stats.totalRevenue)],
      ['Vsego sotrudnikov:', formatNumberForExport(reportData.stats.totalEmployees)],
      ['Srednyaya vyruchka:', formatCurrencyForExport(reportData.stats.averageRevenue)],
      ['Srednyaya chislennost:', formatNumberForExport(Math.round(reportData.stats.averageEmployees))]
    ];

    stats.forEach(([label, value]) => {
      doc.setFontSize(11);
      doc.text(label, 20, yPosition);
      doc.text(value, 120, yPosition);
      yPosition += 8;
    });

    // Таблица с топ предприятиями
    if (reportData.enterprises.length > 0) {
      const topEnterprises = [...reportData.enterprises]
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      yPosition += 10;
      addUnicodeText('TOP 10 PREDPRIYATIY PO VYRUCHKE', 20, yPosition, 14);
      yPosition += 10;

      const tableData = topEnterprises.map(enterprise => [
        enterprise.name.replace(/[А-Яа-яЁё]/g, char => {
          const cyrillicMap: { [key: string]: string } = {
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
            'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
            'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
            'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
            'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return cyrillicMap[char] || char;
        }),
        enterprise.industry.replace(/[А-Яа-яЁё]/g, char => {
          const cyrillicMap: { [key: string]: string } = {
            'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo',
            'Ж': 'Zh', 'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M',
            'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
            'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch',
            'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya',
            'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
            'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
            'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
            'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
            'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
          };
          return cyrillicMap[char] || char;
        }),
        formatNumberForExport(enterprise.employees),
        formatCurrencyForExport(enterprise.revenue)
      ]);

      autoTable(doc, {
        head: [['Nazvanie', 'Otrasl', 'Sotrudniki', 'Vyruchka']],
        body: tableData,
        startY: yPosition,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        }
      });
    }

    // Сохранение файла
    const fileName = `Report_Moscow_Enterprises_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);

    console.log('Упрощенный PDF успешно создан:', fileName);
    return fileName;
  } catch (error) {
    console.error('Ошибка создания упрощенного PDF:', error);
    throw error;
  }
};

// Новая функция для генерации HTML отчета (полная поддержка русского языка)
export const generateHTMLReport = (reportData: ReportData): string => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="ru">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${reportData.title}</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 8px;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
            }
            .meta-info {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 30px;
            }
            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                border-left: 4px solid #3b82f6;
            }
            .stat-card h3 {
                margin: 0 0 10px 0;
                color: #1f2937;
                font-size: 14px;
                text-transform: uppercase;
                font-weight: 600;
            }
            .stat-card .value {
                font-size: 24px;
                font-weight: bold;
                color: #3b82f6;
            }
            table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th, td {
                text-align: left;
                padding: 12px;
                border-bottom: 1px solid #e5e7eb;
            }
            th {
                background: #f3f4f6;
                font-weight: 600;
                color: #374151;
            }
            tr:hover {
                background: #f9fafb;
            }
            .section-title {
                font-size: 20px;
                font-weight: bold;
                margin: 30px 0 15px 0;
                color: #1f2937;
                border-bottom: 2px solid #3b82f6;
                padding-bottom: 8px;
            }
            .print-button {
                position: fixed;
                top: 20px;
                right: 20px;
                background: #3b82f6;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-size: 14px;
            }
            @media print {
                .print-button { display: none; }
                body { margin: 0; padding: 15px; }
            }
        </style>
    </head>
    <body>
        <button class="print-button" onclick="window.print()">Печать отчёта</button>
        
        <div class="header">
            <h1>ОТЧЁТ ПО ПРЕДПРИЯТИЯМ МОСКВЫ</h1>
            <h2>${reportData.title}</h2>
        </div>

        <div class="meta-info">
            <strong>Дата создания:</strong> ${new Date().toLocaleString('ru-RU')}<br>
            <strong>Период:</strong> ${reportData.period.from} - ${reportData.period.to}
        </div>

        <div class="section-title">Общая статистика</div>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Всего предприятий</h3>
                <div class="value">${formatNumberForExport(reportData.stats.totalEnterprises)}</div>
            </div>
            <div class="stat-card">
                <h3>Общая выручка</h3>
                <div class="value">${formatCurrencyForExport(reportData.stats.totalRevenue)}</div>
            </div>
            <div class="stat-card">
                <h3>Всего сотрудников</h3>
                <div class="value">${formatNumberForExport(reportData.stats.totalEmployees)}</div>
            </div>
            <div class="stat-card">
                <h3>Средняя выручка</h3>
                <div class="value">${formatCurrencyForExport(reportData.stats.averageRevenue)}</div>
            </div>
        </div>

        ${reportData.industryStats && reportData.industryStats.length > 0 ? `
        <div class="section-title">Статистика по отраслям</div>
        <table>
            <thead>
                <tr>
                    <th>Отрасль</th>
                    <th>Количество предприятий</th>
                    <th>Общая выручка</th>
                    <th>Средняя численность</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.industryStats.map(i => `
                <tr>
                    <td>${i.industry}</td>
                    <td>${formatNumberForExport(i.count)}</td>
                    <td>${formatCurrencyForExport(i.totalRevenue)}</td>
                    <td>${formatNumberForExport(Math.round(i.averageEmployees))}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        ${reportData.regionStats && reportData.regionStats.length > 0 ? `
        <div class="section-title">Статистика по регионам</div>
        <table>
            <thead>
                <tr>
                    <th>Регион</th>
                    <th>Количество предприятий</th>
                    <th>Общая выручка</th>
                    <th>Средняя численность</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.regionStats.map(r => `
                <tr>
                    <td>${r.region}</td>
                    <td>${formatNumberForExport(r.count)}</td>
                    <td>${formatCurrencyForExport(r.totalRevenue)}</td>
                    <td>${formatNumberForExport(Math.round(r.averageEmployees))}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        ${reportData.enterprises.length > 0 ? `
        <div class="section-title">Топ 10 предприятий по выручке</div>
        <table>
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Отрасль</th>
                    <th>Регион</th>
                    <th>Сотрудники</th>
                    <th>Выручка</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.enterprises
                  .sort((a, b) => b.revenue - a.revenue)
                  .slice(0, 10)
                  .map(e => `
                <tr>
                    <td>${e.name}</td>
                    <td>${e.industry}</td>
                    <td>${e.region}</td>
                    <td>${formatNumberForExport(e.employees)}</td>
                    <td>${formatCurrencyForExport(e.revenue)}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
    </body>
    </html>
  `;

  // Создаем и открываем HTML файл в новом окне
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const newWindow = window.open(url, '_blank');

  if (newWindow) {
    newWindow.document.title = `Отчёт - ${reportData.title}`;
  }

  return htmlContent;
};

import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { Enterprise, UploadResult } from '../types/enterprise';

// Московские регионы
export const MOSCOW_REGIONS = [
  'Центральный',
  'Северный',
  'Северо-Восточный',
  'Восточный',
  'Юго-Восточный',
  'Южный',
  'Юго-Западный',
  'Западный',
  'Северо-Западный',
  'Новомосковский',
  'Троицкий'
];

// Основные отрасли промышленности
export const INDUSTRIES = [
  'Машиностроение',
  'Пищевая промышленность',
  'Химическая промышленность',
  'Текстильная промышленность',
  'Металлургия',
  'Электроника',
  'Строительные материалы',
  'Фармацевтика',
  'Автомобилестроение',
  'Полиграфия',
  'Другое'
];

// Валидация данных предприятия
export const validateEnterprise = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Некорректное название предприятия');
  }

  if (!data.industry || !INDUSTRIES.includes(data.industry)) {
    errors.push('Некорректная отрасль');
  }

  if (!data.region || !MOSCOW_REGIONS.includes(data.region)) {
    errors.push('Некорректный регион');
  }

  if (!data.employees || data.employees < 0) {
    errors.push('Некорректн��е количество сотрудников');
  }

  if (!data.revenue || data.revenue < 0) {
    errors.push('Некорректная выручка');
  }

  if (!data.contactInfo?.address) {
    errors.push('Отсутствует адрес');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Парсинг CSV файла
export const parseCSV = (file: File): Promise<UploadResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const enterprises: Enterprise[] = [];
        const errors: string[] = [];
        let errorCount = 0;

        results.data.forEach((row: any, index: number) => {
          const validation = validateEnterprise(row);

          if (validation.isValid) {
            const enterprise: Enterprise = {
              id: crypto.randomUUID(),
              name: row.name,
              industry: row.industry,
              region: row.region,
              employees: parseInt(row.employees) || 0,
              revenue: parseFloat(row.revenue) || 0,
              taxesPaid: parseFloat(row.taxesPaid) || 0,
              registrationDate: new Date(row.registrationDate || Date.now()),
              lastUpdated: new Date(),
              status: row.status || 'active',
              contactInfo: {
                address: row.address,
                phone: row.phone,
                email: row.email
              }
            };
            enterprises.push(enterprise);
          } else {
            errorCount++;
            errors.push(`Строка ${index + 1}: ${validation.errors.join(', ')}`);
          }
        });

        resolve({
          success: true,
          message: `Обработано ${enterprises.length} записей из ${results.data.length}`,
          processedCount: enterprises.length,
          errorCount,
          errors,
          data: enterprises
        });
      },
      error: (error) => {
        resolve({
          success: false,
          message: `Ошибка парсинга CSV: ${error.message}`,
          processedCount: 0,
          errorCount: 1,
          errors: [error.message]
        });
      }
    });
  });
};

// Парсинг Excel файла
export const parseExcel = (file: File): Promise<UploadResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const enterprises: Enterprise[] = [];
        const errors: string[] = [];
        let errorCount = 0;

        jsonData.forEach((row: any, index: number) => {
          const validation = validateEnterprise(row);

          if (validation.isValid) {
            const enterprise: Enterprise = {
              id: crypto.randomUUID(),
              name: row.name,
              industry: row.industry,
              region: row.region,
              employees: parseInt(row.employees) || 0,
              revenue: parseFloat(row.revenue) || 0,
              taxesPaid: parseFloat(row.taxesPaid) || 0,
              registrationDate: new Date(row.registrationDate || Date.now()),
              lastUpdated: new Date(),
              status: row.status || 'active',
              contactInfo: {
                address: row.address,
                phone: row.phone,
                email: row.email
              }
            };
            enterprises.push(enterprise);
          } else {
            errorCount++;
            errors.push(`Строка ${index + 1}: ${validation.errors.join(', ')}`);
          }
        });

        resolve({
          success: true,
          message: `Обработано ${enterprises.length} записей из ${jsonData.length}`,
          processedCount: enterprises.length,
          errorCount,
          errors,
          data: enterprises
        });
      } catch (error) {
        resolve({
          success: false,
          message: `Ошибка парсинга Excel: ${(error as Error).message}`,
          processedCount: 0,
          errorCount: 1,
          errors: [(error as Error).message]
        });
      }
    };

    reader.readAsBinaryString(file);
  });
};

// Форматирование чисел
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('ru-RU').format(num);
};

// Форматирование валюты
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount);
};

// Генерация случайных данных для демонстрации
export const generateSampleData = (count: number = 100): Enterprise[] => {
  const sampleData: Enterprise[] = [];

  for (let i = 0; i < count; i++) {
    const enterprise: Enterprise = {
      id: crypto.randomUUID(),
      name: `Предприятие ${i + 1}`,
      industry: INDUSTRIES[Math.floor(Math.random() * INDUSTRIES.length)],
      region: MOSCOW_REGIONS[Math.floor(Math.random() * MOSCOW_REGIONS.length)],
      employees: Math.floor(Math.random() * 1000) + 10,
      revenue: Math.floor(Math.random() * 100000000) + 1000000,
      taxesPaid: Math.floor(Math.random() * 10000000) + 100000,
      registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000 * 5),
      lastUpdated: new Date(),
      status: Math.random() > 0.1 ? 'active' : Math.random() > 0.5 ? 'inactive' : 'suspended',
      contactInfo: {
        address: `Москва, улица ${i + 1}, дом ${Math.floor(Math.random() * 100) + 1}`,
        phone: `+7-495-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 90) + 10}`,
        email: `contact${i + 1}@enterprise.ru`
      }
    };
    sampleData.push(enterprise);
  }

  return sampleData;
};

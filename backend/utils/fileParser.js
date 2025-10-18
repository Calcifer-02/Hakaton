const Papa = require('papaparse');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');

// Московские регионы
const MOSCOW_REGIONS = [
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
const INDUSTRIES = [
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
const validateEnterprise = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string') {
    errors.push('Некорректное название предприятия');
  }

  if (!data.industry || !INDUSTRIES.includes(data.industry)) {
    errors.push('Некорректная отрасль');
  }

  if (!data.region || !MOSCOW_REGIONS.includes(data.region)) {
    errors.push('Некорректный регион');
  }

  if (data.employees === undefined || Number(data.employees) < 0) {
    errors.push('Некорректное количество сотрудников');
  }

  if (data.revenue === undefined || Number(data.revenue) < 0) {
    errors.push('Некорректная выручка');
  }

  if (!data.address) {
    errors.push('Отсутствует адрес');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Парсинг CSV файла
const parseCSV = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    try {
      const fileContent = fileBuffer.toString('utf-8');

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const enterprises = [];
          const errors = [];
          let errorCount = 0;

          results.data.forEach((row, index) => {
            const validation = validateEnterprise(row);

            if (validation.isValid) {
              const enterprise = {
                id: uuidv4(),
                name: String(row.name),
                industry: String(row.industry),
                region: String(row.region),
                employees: parseInt(row.employees) || 0,
                revenue: parseFloat(row.revenue) || 0,
                taxesPaid: parseFloat(row.taxesPaid) || 0,
                registrationDate: row.registrationDate || new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                status: row.status || 'active',
                latitude: row.latitude ? parseFloat(row.latitude) : null,
                longitude: row.longitude ? parseFloat(row.longitude) : null,
                contactInfo: {
                  address: String(row.address),
                  phone: row.phone || '',
                  email: row.email || ''
                }
              };
              enterprises.push(enterprise);
            } else {
              errorCount++;
              errors.push(`Строка ${index + 2}: ${validation.errors.join(', ')}`);
            }
          });

          resolve({
            success: enterprises.length > 0,
            message: `Обработано ${enterprises.length} записей, ошибок: ${errorCount}`,
            processedCount: enterprises.length,
            errorCount,
            errors: errors.slice(0, 10), // Ограничиваем количество ошибок
            data: enterprises
          });
        },
        error: (error) => {
          reject(new Error(`Ошибка парсинга CSV: ${error.message}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Парсинг Excel файла
const parseExcel = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    try {
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet);

      const enterprises = [];
      const errors = [];
      let errorCount = 0;

      data.forEach((row, index) => {
        const validation = validateEnterprise(row);

        if (validation.isValid) {
          const enterprise = {
            id: uuidv4(),
            name: String(row.name),
            industry: String(row.industry),
            region: String(row.region),
            employees: parseInt(row.employees) || 0,
            revenue: parseFloat(row.revenue) || 0,
            taxesPaid: parseFloat(row.taxesPaid) || 0,
            registrationDate: row.registrationDate || new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            status: row.status || 'active',
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
            contactInfo: {
              address: String(row.address),
              phone: row.phone || '',
              email: row.email || ''
            }
          };
          enterprises.push(enterprise);
        } else {
          errorCount++;
          errors.push(`Строка ${index + 2}: ${validation.errors.join(', ')}`);
        }
      });

      resolve({
        success: enterprises.length > 0,
        message: `Обработано ${enterprises.length} записей, ошибок: ${errorCount}`,
        processedCount: enterprises.length,
        errorCount,
        errors: errors.slice(0, 10), // Ограничиваем количество ошибок
        data: enterprises
      });
    } catch (error) {
      reject(new Error(`Ошибка парсинга Excel: ${error.message}`));
    }
  });
};

module.exports = {
  parseCSV,
  parseExcel,
  validateEnterprise,
  MOSCOW_REGIONS,
  INDUSTRIES
};

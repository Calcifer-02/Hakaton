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
  'Троицкий',
  'Москва',
  'Московская область'
];

// Основные отрасли промышленности с маппингом
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
  'IT',
  'Информационные технологии',
  'Строительство',
  'Сельское хозяйство',
  'Другое'
];

// Маппинг популярных названий отраслей
const INDUSTRY_MAPPING = {
  'IT': 'Информационные технологии',
  'ИТ': 'Информационные технологии',
  'Информационные технологии': 'Информационные технологии',
  'Строительство': 'Строительные материалы',
  'Строительные материалы': 'Строительные материалы',
  'Сельское хозяйство': 'Сельское хозяйство',
  'Агро': 'Сельское хозяйство',
  'Металлургия': 'Металлургия',
  'Машиностроение': 'Машиностроение'
};

// Функция нормализации отрасли
const normalizeIndustry = (industry) => {
  if (!industry) return 'Другое';

  const normalized = String(industry).trim();

  // Проверяем точное совпадение
  if (INDUSTRIES.includes(normalized)) {
    return normalized;
  }

  // Проверяем маппинг
  if (INDUSTRY_MAPPING[normalized]) {
    return INDUSTRY_MAPPING[normalized];
  }

  // Проверяем частичные совпадения (case-insensitive)
  const lowerIndustry = normalized.toLowerCase();
  for (const validIndustry of INDUSTRIES) {
    if (validIndustry.toLowerCase().includes(lowerIndustry) ||
        lowerIndustry.includes(validIndustry.toLowerCase())) {
      return validIndustry;
    }
  }

  return 'Другое';
};

// Функция нормализации региона
const normalizeRegion = (region) => {
  if (!region) return 'Центральный';

  const normalized = String(region).trim();

  // Если просто "Москва" - ставим Центральный
  if (normalized === 'Москва' || normalized === 'Московская область') {
    return 'Центральный';
  }

  // Проверяем точное совпадение
  if (MOSCOW_REGIONS.includes(normalized)) {
    return normalized;
  }

  return 'Центральный'; // По умолчанию
};

// Функция нормализации статуса
const normalizeStatus = (status) => {
  if (!status) return 'active';

  const normalized = String(status).toLowerCase().trim();

  const statusMap = {
    'активна': 'active',
    'активно': 'active',
    'active': 'active',
    'неактивна': 'inactive',
    'неактивно': 'inactive',
    'inactive': 'inactive',
    'приостановлена': 'suspended',
    'приостановлено': 'suspended',
    'suspended': 'suspended'
  };

  return statusMap[normalized] || 'active';
};

// Функция для определения кодировки и декодирования
const decodeBuffer = (buffer) => {
  // Сначала пробуем UTF-8
  let content = buffer.toString('utf-8');

  // Проверяем наличие BOM и удаляем его
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }

  // Проверяем на различные признаки проблем с кодировкой
  const hasEncodingIssues =
    content.includes('Рћ') ||
    content.includes('Р ') ||
    content.includes('СЂ') ||
    content.includes('РњРѕСЃ') ||
    content.includes('���') ||
    content.includes('РћРћРћ') ||
    content.includes('РҐРё') ||
    content.includes('��') ||
    /[\u0420-\u044F]{3,}[\u0080-\u00FF]/.test(content) ||
    /[А-я]{2,}[^\u0000-\u007F\u0400-\u04FF\s,."'-]+/.test(content);

  if (hasEncodingIssues) {
    console.log('Обнаружены проблемы с кодировкой, пробуем альтернативные варианты...');

    try {
      const iconv = require('iconv-lite');

      // Пробуем различные кодировки
      const encodingsToTry = ['win1251', 'cp1251', 'windows-1251', 'utf8', 'latin1'];

      for (const encoding of encodingsToTry) {
        if (iconv.encodingExists(encoding)) {
          try {
            const decoded = iconv.decode(buffer, encoding);

            // Проверяем, стал ли текст лучше (меньше кракозябр)
            const hasFewerIssues =
              !decoded.includes('���') &&
              !decoded.includes('Рћ') &&
              !decoded.includes('РњРѕСЃ') &&
              decoded.length > 0;

            if (hasFewerIssues) {
              console.log(`Успешно декодировано с помощью ${encoding}`);
              content = decoded;
              break;
            }
          } catch (e) {
            console.log(`Ошибка декодирования с ${encoding}:`, e.message);
          }
        }
      }

      // Если ничего не помогло, попробуем еще один подход - заменить проблемные символы
      if (hasEncodingIssues) {
        console.log('Применяем восстановление поврежденного текста...');
        content = content
          .replace(/���/g, 'ООО')
          .replace(/РћРћРћ/g, 'ООО')
          .replace(/РњРѕСЃРєРІР°/g, 'Москва')
          .replace(/РњР°С€РёРЅРѕСЃС‚СЂРѕРµРЅРёРµ/g, 'Машиностроение')
          .replace(/РџРёС‰РµРІР°СЏ РїСЂРѕРјС‹С€Р»РµРЅРЅРѕСЃС‚СЊ/g, 'Пищевая промышленность')
          .replace(/РҐРёРјРёС‡РµСЃРєР°СЏ РїСЂРѕРјС‹С€Р»РµРЅРЅРѕСЃС‚СЊ/g, 'Химическая промышленность')
          .replace(/Р¦РµРЅС‚СЂР°Р»СЊРЅС‹Р№/g, 'Центральный')
          .replace(/РЎРµРІРµСЂРЅС‹Р№/g, 'Северный')
          .replace(/Р'РѕСЃС‚РѕС‡РЅС‹Р№/g, 'Восточный');
      }

    } catch (e) {
      console.warn('Библиотека iconv-lite недоступна, используем базовую обработку:', e.message);
    }
  }

  return content;
};

// Валидация данных предприятия
const validateEnterprise = (data) => {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Некорректное название предприятия');
  }

  if (!data.industry) {
    errors.push('Отсутствует отрасль');
  }

  if (!data.region) {
    errors.push('Отсутствует регион');
  }

  if (data.employees === undefined || isNaN(Number(data.employees)) || Number(data.employees) < 0) {
    errors.push('Некорректное количество сотрудников');
  }

  if (data.revenue === undefined || isNaN(Number(data.revenue)) || Number(data.revenue) < 0) {
    errors.push('Некорректная выручка');
  }

  if (!data.address || data.address.trim().length === 0) {
    errors.push('Отсутствует адрес');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Улучшенная функция для ручного парсинга CSV строки
const parseCSVLineRobust = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  // Определяем разделитель - пробуем запятую и точку с запятой
  const delimiter = line.includes(';') && line.split(';').length > line.split(',').length ? ';' : ',';

  while (i < line.length) {
    const char = line[i];

    if (char === '"') {
      // Обрабатываем кавычки
      if (!inQuotes) {
        // Начало кавычек
        inQuotes = true;
      } else {
        // Проверяем следующий символ
        const nextChar = line[i + 1];
        if (nextChar === '"') {
          // Экранированная кавычка
          current += '"';
          i += 2; // Пропускаем обе кавычки
          continue;
        } else {
          // Конец кавычек
          inQuotes = false;
        }
      }
    } else if (char === delimiter && !inQuotes) {
      // Разделитель вне кавычек
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
    i++;
  }

  // Добавляем последнее поле
  result.push(current.trim());

  return result.map(field => field.replace(/^["']|["']$/g, '').trim());
};

// Супер-простая функция парсинга как последняя попытка
const parseCSVLineFallback = (line) => {
  // Убираем все кавычки и просто разделяем по запятым
  const cleanLine = line.replace(/"/g, '');
  return cleanLine.split(',').map(field => field.trim());
};

// Функция для ручного парсинга CSV строки с учетом кавычек
const parseCSVLine = (line) => {
  try {
    // Сначала пробуем улучшенный парсер
    const result = parseCSVLineRobust(line);

    // Если получили мало полей, пробуем простой fallback
    if (result.length < 5) {
      const fallbackResult = parseCSVLineFallback(line);
      if (fallbackResult.length > result.length) {
        return fallbackResult;
      }
    }

    return result;
  } catch (error) {
    console.error('Ошибка во всех парсерах, используем fallback:', error);
    return parseCSVLineFallback(line);
  }
};

// Парсинг CSV файла
const parseCSV = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    try {
      const fileContent = decodeBuffer(fileBuffer);

      console.log('Первые 500 символов файла:', fileContent.substring(0, 500));

      // Улучшенное определение разделителя
      const detectDelimiter = (content) => {
        const lines = content.split('\n').slice(0, 3); // Анализируем первые 3 строки
        const delimiters = [',', ';', '\t', '|'];

        let bestDelimiter = ',';
        let maxConsistentFields = 0;

        for (const delimiter of delimiters) {
          const fieldCounts = lines.map(line => {
            // Простой подсчет с учетом кавычек
            let inQuotes = false;
            let fieldCount = 1;

            for (let i = 0; i < line.length; i++) {
              const char = line[i];
              if (char === '"') {
                inQuotes = !inQuotes;
              } else if (char === delimiter && !inQuotes) {
                fieldCount++;
              }
            }
            return fieldCount;
          });

          // Проверяем консистентность количества полей
          const uniqueCounts = [...new Set(fieldCounts)];
          if (uniqueCounts.length === 1 && uniqueCounts[0] > maxConsistentFields) {
            maxConsistentFields = uniqueCounts[0];
            bestDelimiter = delimiter;
          }
        }

        console.log(`Определен разделитель: '${bestDelimiter}', ожидается полей: ${maxConsistentFields}`);
        return bestDelimiter;
      };

      const delimiter = detectDelimiter(fileContent);

      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        delimiter: delimiter,
        quoteChar: '"',
        escapeChar: '"',
        trim: true,
        encoding: 'utf-8',
        complete: (results) => {
          console.log('Papa.parse результат:', {
            errors: results.errors.slice(0, 5),
            meta: results.meta,
            dataCount: results.data.length,
            firstRow: results.data[0],
            fields: results.meta.fields
          });

          // Проверяем структуру первой строки
          const firstRow = results.data[0];
          const hasCorrectStructure = firstRow &&
                                    typeof firstRow === 'object' &&
                                    Object.keys(firstRow).length > 1 &&
                                    firstRow.name &&
                                    firstRow.industry;

          // Если Papa.parse не справился, переходим к ручному парсингу
          if (!hasCorrectStructure || results.errors.length > 0) {
            console.log('Papa.parse не справился, используем полностью ручной парсинг...');

            const lines = fileContent.trim().split('\n').filter(line => line.trim());
            if (lines.length < 2) {
              resolve({
                success: false,
                message: 'Файл содержит недостаточно данных',
                processedCount: 0,
                errorCount: 1,
                errors: ['Файл содержит недостаточно данных'],
                data: []
              });
              return;
            }

            // Ручной парсинг заголовков
            const headerLine = lines[0];
            const headers = parseCSVLine(headerLine);
            console.log('Ручные заголовки:', headers);

            // Нормализуем заголовки
            const normalizedHeaders = headers.map(header => {
              const cleanHeader = header.toLowerCase().trim().replace(/['"]/g, '');
              const headerMap = {
                'name': 'name',
                'название': 'name',
                'наименование': 'name',
                'company': 'name',
                'компания': 'name',
                'industry': 'industry',
                'отрасль': 'industry',
                'сфера': 'industry',
                'region': 'region',
                'регион': 'region',
                'район': 'region',
                'employees': 'employees',
                'сотрудники': 'employees',
                'персонал': 'employees',
                'численность': 'employees',
                'revenue': 'revenue',
                'выручка': 'revenue',
                'доход': 'revenue',
                'оборот': 'revenue',
                'taxesPaid': 'taxesPaid',
                'taxespaid': 'taxesPaid',
                'налоги': 'taxesPaid',
                'registrationDate': 'registrationDate',
                'registrationdate': 'registrationDate',
                'дата': 'registrationDate',
                'status': 'status',
                'статус': 'status',
                'address': 'address',
                'адрес': 'address',
                'phone': 'phone',
                'телефон': 'phone',
                'email': 'email',
                'почта': 'email',
                'latitude': 'latitude',
                'широта': 'latitude',
                'lat': 'latitude',
                'longitude': 'longitude',
                'долгота': 'longitude',
                'lng': 'longitude',
                'lon': 'longitude'
              };
              return headerMap[cleanHeader] || cleanHeader;
            });

            console.log('Нормализованные заголовки:', normalizedHeaders);

            // Ручной парсинг данных
            const manualData = [];
            for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line) {
                try {
                  const values = parseCSVLine(line);

                  console.log(`Строка ${i}: разобрано ${values.length} полей из ${normalizedHeaders.length} ожидаемых`);

                  if (values.length >= normalizedHeaders.length) {
                    const rowObj = {};
                    normalizedHeaders.forEach((header, index) => {
                      const value = values[index] || '';
                      rowObj[header] = value.replace(/^["']|["']$/g, '').trim();
                    });

                    // Если полей больше ожидаемого, объединяем лишние части в адрес
                    if (values.length > normalizedHeaders.length) {
                      const addressIndex = normalizedHeaders.indexOf('address');
                      if (addressIndex !== -1) {
                        // Объединяем все лишние поля в адрес
                        const extraParts = values.slice(normalizedHeaders.length);
                        const currentAddress = rowObj.address || '';
                        rowObj.address = [currentAddress, ...extraParts].filter(part => part.trim()).join(', ');
                      }
                    }

                    // Логируем первые несколько строк для отладки
                    if (i <= 3) {
                      console.log(`Обработанная строка ${i}:`, rowObj);
                    }

                    manualData.push(rowObj);
                  } else {
                    console.log(`Строка ${i} пропущена: недостаточно полей (${values.length} < ${normalizedHeaders.length})`);
                    // Показываем что именно разобрали для первых 3 строк
                    if (i <= 3) {
                      console.log(`Разобранные поля:`, values);
                    }
                  }
                } catch (lineError) {
                  console.error(`Ошибка парсинга строки ${i}:`, lineError);
                }
              }
            }

            if (manualData.length > 0) {
              results.data = manualData;
              results.errors = [];
              console.log(`Ручной парсинг успешен: обработано ${manualData.length} строк`);
              console.log('Первая обработанная строка:', manualData[0]);
            } else {
              resolve({
                success: false,
                message: 'Не удалось разобрать данные из файла',
                processedCount: 0,
                errorCount: 1,
                errors: ['Не удалось разобрать данные из файла'],
                data: []
              });
              return;
            }
          }

          // Проверяем, что у нас есть данные для обработки
          if (!results.data || results.data.length === 0) {
            resolve({
              success: false,
              message: 'Файл не содержит данных для обработки',
              processedCount: 0,
              errorCount: 1,
              errors: ['Файл не содержит данных для обработки'],
              data: []
            });
            return;
          }

          const enterprises = [];
          const errors = [];
          let errorCount = 0;

          results.data.forEach((row, index) => {
            try {
              // Нормализуем данные перед валидацией
              const normalizedRow = {
                ...row,
                industry: normalizeIndustry(row.industry),
                region: normalizeRegion(row.region),
                name: row.name ? String(row.name).trim() : '',
                address: row.address ? String(row.address).trim() : '',
                status: normalizeStatus(row.status)
              };

              const validation = validateEnterprise(normalizedRow);

              if (validation.isValid) {
                const enterprise = {
                  id: uuidv4(),
                  name: normalizedRow.name,
                  industry: normalizedRow.industry,
                  region: normalizedRow.region,
                  employees: parseInt(row.employees) || 0,
                  revenue: parseFloat(row.revenue) || 0,
                  taxesPaid: parseFloat(row.taxesPaid) || 0,
                  registrationDate: row.registrationDate || new Date().toISOString().split('T')[0],
                  lastUpdated: new Date().toISOString(),
                  status: normalizedRow.status,
                  latitude: row.latitude ? parseFloat(row.latitude) : null,
                  longitude: row.longitude ? parseFloat(row.longitude) : null,
                  contactInfo: {
                    address: normalizedRow.address,
                    phone: row.phone || '',
                    email: row.email || ''
                  }
                };
                enterprises.push(enterprise);

                // Логируем успешно обработанные предприятия для отладки
                if (enterprises.length <= 3) {
                  console.log(`✅ Успешно обработано предприятие ${enterprises.length}:`, {
                    name: enterprise.name,
                    coordinates: [enterprise.latitude, enterprise.longitude],
                    region: enterprise.region,
                    industry: enterprise.industry
                  });
                }
              } else {
                errorCount++;
                const rowStr = JSON.stringify(row).substring(0, 300);
                errors.push(`Строка ${index + 2}: ${validation.errors.join(', ')}. Исходные данные: ${rowStr}...`);

                // Для отладки выводим подробную информацию о первых нескольких ошибках
                if (errorCount <= 3) {
                  console.log(`❌ Ошибка валидации строки ${index + 2}:`, {
                    originalRow: row,
                    normalizedRow,
                    validationErrors: validation.errors
                  });
                }
              }
            } catch (parseError) {
              errorCount++;
              errors.push(`Строка ${index + 2}: Ошибка обработки - ${parseError.message}`);
              console.error(`Ошибка обработки строки ${index + 2}:`, parseError);
            }
          });

          resolve({
            success: enterprises.length > 0,
            message: `Обработано ${enterprises.length} записей, ошибок: ${errorCount}`,
            processedCount: enterprises.length,
            errorCount,
            errors: errors.slice(0, 10),
            data: enterprises
          });
        },
        error: (error) => {
          console.error('Ошибка Papa.parse:', error);
          reject(new Error(`Ошибка парсинга CSV: ${error.message}`));
        }
      });
    } catch (error) {
      console.error('Общая ошибка parseCSV:', error);
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

      console.log('Excel данные:', {
        sheetName,
        dataCount: data.length,
        firstRow: data[0]
      });

      const enterprises = [];
      const errors = [];
      let errorCount = 0;

      data.forEach((row, index) => {
        // Нормализуем данные перед валидацией (как в CSV парсере)
        const normalizedRow = {
          ...row,
          industry: normalizeIndustry(row.industry),
          region: normalizeRegion(row.region),
          name: row.name ? String(row.name).trim() : '',
          address: row.address ? String(row.address).trim() : ''
        };

        const validation = validateEnterprise(normalizedRow);

        if (validation.isValid) {
          const enterprise = {
            id: uuidv4(),
            name: normalizedRow.name,
            industry: normalizedRow.industry,
            region: normalizedRow.region,
            employees: parseInt(row.employees) || 0,
            revenue: parseFloat(row.revenue) || 0,
            taxesPaid: parseFloat(row.taxesPaid) || 0,
            registrationDate: row.registrationDate || new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString(),
            status: row.status || 'active',
            latitude: row.latitude ? parseFloat(row.latitude) : null,
            longitude: row.longitude ? parseFloat(row.longitude) : null,
            contactInfo: {
              address: normalizedRow.address,
              phone: row.phone || '',
              email: row.email || ''
            }
          };
          enterprises.push(enterprise);
        } else {
          errorCount++;
          errors.push(`Строка ${index + 2}: ${validation.errors.join(', ')}. Данные: ${JSON.stringify(row).substring(0, 100)}...`);
        }
      });

      resolve({
        success: enterprises.length > 0,
        message: `Обработано ${enterprises.length} записей, ошибок: ${errorCount}`,
        processedCount: enterprises.length,
        errorCount,
        errors: errors.slice(0, 10),
        data: enterprises
      });
    } catch (error) {
      console.error('Ошибка parseExcel:', error);
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

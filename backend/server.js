const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { addEnterprise, getAllEnterprises, getStatistics, clearAllEnterprises, getEnterpriseById } = require('./database/db');
const { parseCSV, parseExcel } = require('./utils/fileParser');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка multer для загрузки файлов
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.csv', '.xlsx', '.xls'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Неподдерживаемый формат файла. Используйте CSV или Excel.'));
    }
  }
});

// Маршруты

// Проверка работоспособности API
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend API работает' });
});

// Загрузка файла
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Файл не загружен'
      });
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase();
    let parseResult;

    // Парсим файл в зависимости от формата
    if (fileExtension === '.csv') {
      parseResult = await parseCSV(req.file.buffer);
    } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
      parseResult = await parseExcel(req.file.buffer);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Неподдерживаемый формат файла'
      });
    }

    // Сохраняем данные в базу
    let savedCount = 0;
    const saveErrors = [];

    for (const enterprise of parseResult.data) {
      try {
        await addEnterprise(enterprise);
        savedCount++;
      } catch (error) {
        saveErrors.push(`Ошибка сохранения: ${enterprise.name}`);
      }
    }

    res.json({
      success: true,
      message: `Успешно загружено ${savedCount} предприятий`,
      processedCount: savedCount,
      errorCount: parseResult.errorCount + saveErrors.length,
      errors: [...parseResult.errors, ...saveErrors].slice(0, 10)
    });

  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка обработки файла: ${error.message}`,
      processedCount: 0,
      errorCount: 1,
      errors: [error.message]
    });
  }
});

// Получение всех предприятий с фильтрами
app.get('/api/enterprises', async (req, res) => {
  try {
    const filters = {};

    // Парсим фильтры из query параметров
    if (req.query.industries) {
      filters.industries = Array.isArray(req.query.industries)
        ? req.query.industries
        : [req.query.industries];
    }

    if (req.query.regions) {
      filters.regions = Array.isArray(req.query.regions)
        ? req.query.regions
        : [req.query.regions];
    }

    if (req.query.status) {
      filters.status = req.query.status;
    }

    if (req.query.minEmployees || req.query.maxEmployees) {
      filters.employeeRange = {
        min: req.query.minEmployees ? parseInt(req.query.minEmployees) : undefined,
        max: req.query.maxEmployees ? parseInt(req.query.maxEmployees) : undefined
      };
    }

    if (req.query.minRevenue || req.query.maxRevenue) {
      filters.revenueRange = {
        min: req.query.minRevenue ? parseFloat(req.query.minRevenue) : undefined,
        max: req.query.maxRevenue ? parseFloat(req.query.maxRevenue) : undefined
      };
    }

    const enterprises = await getAllEnterprises(filters);
    res.json({
      success: true,
      count: enterprises.length,
      data: enterprises
    });

  } catch (error) {
    console.error('Ошибка получения предприятий:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка получения данных: ${error.message}`
    });
  }
});

// Получение предприятия по ID
app.get('/api/enterprises/:id', async (req, res) => {
  try {
    const enterprise = await getEnterpriseById(req.params.id);

    if (!enterprise) {
      return res.status(404).json({
        success: false,
        message: 'Предприятие не найдено'
      });
    }

    res.json({
      success: true,
      data: enterprise
    });

  } catch (error) {
    console.error('Ошибка получения предприятия:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка получения данных: ${error.message}`
    });
  }
});

// Получение статистики
app.get('/api/statistics', async (req, res) => {
  try {
    const stats = await getStatistics();
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Ошибка получения статистики:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка получения статистики: ${error.message}`
    });
  }
});

// Очистка всех данных (для разработки)
app.delete('/api/enterprises', async (req, res) => {
  try {
    await clearAllEnterprises();
    res.json({
      success: true,
      message: 'Все данные удалены'
    });

  } catch (error) {
    console.error('Ошибка очистки данных:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка очистки данных: ${error.message}`
    });
  }
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Внутренняя ошибка сервера'
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🚀 Backend API запущен                   ║
║   📡 Порт: ${PORT}                          ║
║   🌐 URL: http://localhost:${PORT}         ║
╚════════════════════════════════════════════╝
  `);
});

module.exports = app;


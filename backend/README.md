# Backend API

Backend сервер для управления данными предприятий Москвы.

## Технологии

- Node.js + Express
- SQLite3 (база данных)
- Multer (загрузка файлов)
- PapaParse (парсинг CSV)
- XLSX (парсинг Excel)

## Установка

```bash
npm install
```

## Запуск

```bash
npm start
```

Сервер запустится на порту 4000.

## API Endpoints

### GET /api/health
Проверка работоспособности API

### POST /api/upload
Загрузка CSV или Excel файла с данными предприятий
- Content-Type: multipart/form-data
- Body: file (CSV или Excel)

### GET /api/enterprises
Получение списка всех предприятий с фильтрами
- Query параметры:
  - industries[] - массив отраслей
  - regions[] - массив регионов
  - status - статус предприятия
  - minEmployees, maxEmployees - диапазон сотрудников
  - minRevenue, maxRevenue - диапазон выручки

### GET /api/enterprises/:id
Получение предприятия по ID

### GET /api/statistics
Получение статистики по предприятиям

### DELETE /api/enterprises
Очистка всех данных (для разработки)

## Структура базы данных

Таблица `enterprises`:
- id (TEXT, PRIMARY KEY)
- name (TEXT)
- industry (TEXT)
- region (TEXT)
- employees (INTEGER)
- revenue (REAL)
- taxesPaid (REAL)
- registrationDate (TEXT)
- lastUpdated (TEXT)
- status (TEXT)
- address (TEXT)
- phone (TEXT)
- email (TEXT)


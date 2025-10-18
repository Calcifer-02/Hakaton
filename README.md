# Система анализа данных предприятий Москвы

Полнофункциональное веб-приложение для анализа и управления данными промышленных предприятий Москвы.

## 🚀 Структура проекта

```
hakaton/
├── backend/          # Backend API (Node.js + Express + SQLite)
├── frontend/         # Frontend (Next.js + React + TypeScript)
├── auth/            # Auth сервис (legacy)
└── database/        # База данных SQLite (создается автоматически)
```

## 🛠 Технологии

### Backend
- **Node.js** + **Express** - REST API
- **SQLite3** - База данных
- **Multer** - Загрузка файлов
- **PapaParse** - Парсинг CSV
- **XLSX** - Парсинг Excel

### Frontend
- **Next.js 15** - React фреймворк
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Recharts** - Графики и визуализация
- **Lucide React** - Иконки

## 📦 Установка

### 1. Backend

```bash
cd backend
npm install
```

### 2. Frontend

```bash
cd frontend
npm install
```

## 🚀 Запуск проекта

### Windows (PowerShell)

#### Запуск Backend (порт 4000):
```powershell
cd backend
npm start
```

#### Запуск Frontend (порт 3000):
```powershell
cd frontend
npm run dev
```

### После запуска

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api

## 📊 Функционал

### 1. Загрузка данных (`/upload`)
- Загрузка CSV и Excel файлов
- Валидация данных
- Автоматическое сохранение в БД
- Отчет об ошибках

### 2. Дашборд (`/`)
- Ключевые метрики предприятий
- Общая статистика
- Топ отрасли и регионы
- Качество данных

### 3. Аналитика (`/analytics`)
- Детальные графики и диаграммы
- Фильтрация по параметрам
- Распределение по отраслям и регионам
- Таблица топ предприятий

### 4. Отчеты (`/reports`)
- Генерация отчетов
- Экспорт данных

## 📁 Формат загружаемых файлов

### Обязательные поля:
- `name` - Название предприятия
- `industry` - Отрасль
- `region` - Регион Москвы
- `employees` - Количество сотрудников
- `revenue` - Выручка (руб.)
- `taxesPaid` - Уплаченные налоги (руб.)
- `address` - Адрес

### Опциональные поля:
- `phone` - Телефон
- `email` - Email
- `registrationDate` - Дата регистрации
- `status` - Статус (active/inactive/suspended)

### Пример CSV файла:
```csv
name,industry,region,employees,revenue,taxesPaid,address,phone,email
"ООО МосМаш",Машиностроение,Центральный,250,150000000,22500000,"г. Москва, ул. Тверская, д. 10",+74951234567,info@mosmash.ru
```

### Доступные отрасли:
- Машиностроение
- Пищевая промышленность
- Химическая промышленность
- Текстильная промышленность
- Металлургия
- Электроника
- Строительные материалы
- Фармацевтика
- Автомобилестроение
- Полиграфия
- Другое

### Регионы Москвы:
- Центральный
- Северный
- Северо-Восточный
- Восточный
- Юго-Восточный
- Южный
- Юго-Западный
- Западный
- Северо-Западный
- Новомосковский
- Троицкий

## 🔌 API Endpoints

### `GET /api/health`
Проверка работоспособности

### `POST /api/upload`
Загрузка файла с данными
- Content-Type: multipart/form-data
- Body: file (CSV или Excel)

### `GET /api/enterprises`
Получение списка предприятий
- Query: industries[], regions[], status, minEmployees, maxEmployees, minRevenue, maxRevenue

### `GET /api/enterprises/:id`
Получение предприятия по ID

### `GET /api/statistics`
Получение статистики

### `DELETE /api/enterprises`
Очистка всех данных (для разработки)

## 📝 База данных

База данных SQLite создается автоматически при первом запуске backend.

Расположение: `backend/database/enterprises.db`

### Структура таблицы `enterprises`:
```sql
CREATE TABLE enterprises (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  industry TEXT NOT NULL,
  region TEXT NOT NULL,
  employees INTEGER NOT NULL,
  revenue REAL NOT NULL,
  taxesPaid REAL NOT NULL,
  registrationDate TEXT NOT NULL,
  lastUpdated TEXT NOT NULL,
  status TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT
)
```

## 🧪 Тестирование

В папке `backend` есть файл `sample_data.csv` с тестовыми данными.

Загрузите его через интерфейс `/upload` для тестирования.

## 🔧 Конфигурация

### Backend
Порт по умолчанию: 4000
Изменить в `backend/server.js`:
```javascript
const PORT = process.env.PORT || 4000;
```

### Frontend
API URL настраивается в `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## 📋 TODO / Возможные улучшения

- [ ] Аутентификация пользователей
- [ ] Экспорт отчетов в PDF/Excel
- [ ] Расширенная фильтрация и поиск
- [ ] История изменений данных
- [ ] Backup и восстановление БД
- [ ] Миграция на PostgreSQL
- [ ] Dockerизация проекта
- [ ] CI/CD pipeline

## 👨‍💻 Разработка

Проект создан в рамках хакатона для анализа данных промышленных предприятий Москвы.

## 📄 Лицензия

ISC

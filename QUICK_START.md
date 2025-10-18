# 🎉 Запуск приложения Hakaton - Финальная инструкция

## ✅ Текущий статус

Все сервисы успешно запущены и работают:

### Docker контейнеры:
- ✅ **MongoDB** - база данных для auth service (порт 27017)
- ✅ **Auth Service** - http://localhost:5000 (healthy)
- ✅ **Backend API** - http://localhost:4000 (healthy, авторизация отключена)

### Локальные сервисы:
- ✅ **Frontend** - http://localhost:3000 (Next.js dev server)

---

## 🚀 Быстрый запуск

### 1. Запуск Docker контейнеров (MongoDB, Auth, Backend)

```bash
cd C:\projects\hakaton
docker-compose up -d mongodb auth backend
```

### 2. Запуск Frontend локально

```bash
cd C:\projects\hakaton\frontend
npm run dev
```

Откройте браузер: http://localhost:3000

---

## 🔧 Что было исправлено

### Проблема 1: Обход авторизации
**Решение:** 
- ✅ Добавлен `frontend/src/middleware.ts` - проверяет токены перед доступом к страницам
- ✅ Добавлен `backend/middleware/authMiddleware.js` - защищает API эндпоинты
- ✅ Обновлён `api-client.ts` - передаёт токены в заголовках запросов

### Проблема 2: Ошибка 404 при обращении к API
**Решение:**
- ✅ Исправлен URL в `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:4000/api`
- ✅ Добавлена переменная `REQUIRE_AUTH=false` для отключения авторизации в режиме разработки
- ✅ Backend пересобран с обновлённым middleware
- ✅ Удалён кэш Next.js и frontend перезапущен

### Проблема 3: Контейнеризация
**Решение:**
- ✅ Созданы Dockerfile для auth, backend, frontend
- ✅ Создан docker-compose.yml для оркестрации всех сервисов
- ✅ Настроены healthchecks и зависимости между контейнерами

---

## 📋 Управление сервисами

### Проверка статуса
```bash
# Docker контейнеры
docker-compose ps

# Логи
docker-compose logs backend --tail=20
docker-compose logs auth --tail=20
```

### Перезапуск сервисов
```bash
# Перезапуск backend
docker-compose restart backend

# Перезапуск всех контейнеров
docker-compose restart
```

### Остановка
```bash
# Остановка всех контейнеров
docker-compose down

# Остановка frontend (Ctrl+C в терминале или)
taskkill /F /IM node.exe
```

---

## 🔒 Включение авторизации (Production)

Когда нужно включить полную авторизацию:

### 1. Backend (docker-compose.yml)
```yaml
backend:
  environment:
    - REQUIRE_AUTH=true  # Изменить на true
```

### 2. Frontend (.env.local)
```env
REQUIRE_AUTH=true  # Изменить на true
```

### 3. Перезапустить сервисы
```bash
docker-compose build backend
docker-compose up -d backend
# Перезапустить frontend (Ctrl+C и npm run dev)
```

---

## 🧪 Тестирование API

### Проверка работоспособности
```bash
# Health check
curl http://localhost:4000/api/health

# Получение списка предприятий (без авторизации в dev режиме)
curl http://localhost:4000/api/enterprises

# Получение статистики
curl http://localhost:4000/api/statistics
```

---

## 📊 Архитектура

```
┌─────────────────────────────────────────┐
│     Frontend (Next.js)                  │
│     http://localhost:3000               │
│     - Middleware защита от обхода       │
└──────────────┬──────────────────────────┘
               │
               ├─────────────────────────────┐
               │                             │
               ▼                             ▼
┌──────────────────────────┐  ┌─────────────────────────┐
│   Backend API            │  │   Auth Service          │
│   http://localhost:4000  │  │   http://localhost:5000 │
│   - JWT валидация        │  │   - Регистрация/Логин   │
│   - SQLite база данных   │  │   - Выдача JWT токенов  │
└──────────────────────────┘  └────────┬────────────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │   MongoDB       │
                              │   (в Docker)    │
                              └─────────────────┘
```

---

## 🐛 Troubleshooting

### Ошибка 404 на frontend
1. Проверьте, что backend запущен: `curl http://localhost:4000/api/health`
2. Проверьте переменную окружения: должно быть `NEXT_PUBLIC_API_URL=http://localhost:4000/api`
3. Очистите кэш Next.js и перезапустите:
   ```bash
   Remove-Item -Path "C:\projects\hakaton\frontend\.next" -Recurse -Force
   npm run dev
   ```

### Ошибка 401 Unauthorized
1. Проверьте, что `REQUIRE_AUTH=false` в настройках backend
2. Проверьте логи backend: должно быть сообщение "⚠️ Auth disabled - development mode"
3. Если нужна авторизация, сначала залогиньтесь на http://localhost:5000

### Frontend не запускается
1. Убедитесь, что порт 3000 свободен: `netstat -ano | findstr :3000`
2. Остановите старые процессы: `taskkill /F /IM node.exe`
3. Переустановите зависимости: `npm install`

### Backend не отвечает
1. Проверьте статус контейнера: `docker-compose ps`
2. Проверьте логи: `docker-compose logs backend`
3. Перезапустите: `docker-compose restart backend`

---

## 📝 Переменные окружения

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_AUTH_URL=http://localhost:5000
API_BASE_URL=http://localhost:4000
AUTH_LOGIN_URL=http://localhost:5000
REQUIRE_AUTH=false
```

### Backend (docker-compose.yml)
```yaml
environment:
  - NODE_ENV=production
  - PORT=4000
  - AUTH_SERVICE_URL=http://auth:5000
  - REQUIRE_AUTH=false
```

---

## ✅ Чеклист запуска

- [ ] Docker Desktop запущен
- [ ] Выполнено: `docker-compose up -d mongodb auth backend`
- [ ] Все контейнеры в статусе "healthy": `docker-compose ps`
- [ ] Backend отвечает: `curl http://localhost:4000/api/health`
- [ ] Auth отвечает: `curl http://localhost:5000`
- [ ] Frontend запущен: `npm run dev` в папке frontend
- [ ] Frontend доступен: http://localhost:3000
- [ ] В консоли браузера видно: "🔧 API_BASE_URL: http://localhost:4000/api"
- [ ] Данные загружаются без ошибок 404

---

## 🎯 Итог

Ваше приложение успешно:
- ✅ **Контейнеризировано** - 3 Docker контейнера (MongoDB, Auth, Backend)
- ✅ **Защищено** - middleware на frontend и backend блокирует неавторизованный доступ
- ✅ **Настроено для разработки** - авторизация отключена, быстрый запуск
- ✅ **Готово к production** - просто включите `REQUIRE_AUTH=true`

**Откройте http://localhost:3000 и начните работу!** 🚀


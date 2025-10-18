# Docker Setup для Hakaton Project

## Архитектура

Приложение состоит из 4 контейнеров:

1. **mongodb** - База данных MongoDB для auth service
2. **auth** - Сервис авторизации (порт 5000)
3. **backend** - API backend для работы с данными предприятий (порт 4000)
4. **frontend** - Next.js фронтенд (порт 3000)

Все сервисы объединены в одну Docker сеть `hakaton-network` для внутреннего взаимодействия.

## Быстрый старт

### 1. Установите Docker Desktop
Скачайте с https://www.docker.com/products/docker-desktop/

### 2. Запустите все сервисы

```bash
# Сборка и запуск всех контейнеров
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f auth
```

### 3. Проверка работоспособности

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/health
- Auth Service: http://localhost:5000

### 4. Остановка приложения

```bash
# Остановка без удаления контейнеров
docker-compose stop

# Остановка и удаление контейнеров
docker-compose down

# Остановка и удаление контейнеров + volumes (БД будет очищена!)
docker-compose down -v
```

## Управление контейнерами

```bash
# Перезапуск одного сервиса
docker-compose restart frontend

# Пересборка одного сервиса
docker-compose up -d --build frontend

# Просмотр статуса
docker-compose ps

# Вход в контейнер
docker exec -it hakaton-frontend sh
docker exec -it hakaton-backend sh
docker exec -it hakaton-auth sh
```

## Volumes (Persistent Data)

- `mongodb_data` - данные MongoDB (пользователи, роли)
- `backend_data` - SQLite база данных с предприятиями

## Переменные окружения

Создайте `.env` файл в корне проекта (см. `.env.example`):

```env
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password
JWT_SECRET=your_jwt_secret_key
```

## Production Deployment

Для продакшена рекомендуется:

1. Использовать внешний MongoDB Atlas вместо контейнера
2. Настроить reverse proxy (nginx/traefik) для HTTPS
3. Изменить пароли и секреты в `.env`
4. Настроить автоматические бэкапы volumes
5. Использовать Docker Swarm или Kubernetes для оркестрации

## Troubleshooting

### Порты заняты
Если порты 3000, 4000, 5000 заняты, измените их в `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # внешний:внутренний
```

### Проблемы с MongoDB подключением
Проверьте логи: `docker-compose logs mongodb auth`

### Frontend не видит Backend
Убедитесь, что переменные окружения `NEXT_PUBLIC_API_URL` и `API_BASE_URL` настроены правильно.

### Очистка Docker
```bash
# Удалить неиспользуемые образы
docker system prune -a

# Удалить volumes
docker volume prune
```

## Разработка

Для разработки можно использовать docker-compose с hot-reload:

```bash
# В auth/
npm run dev

# В backend/
npm run dev

# В frontend/
npm run dev
```

Или создать `docker-compose.dev.yml` с volume mounts для исходников.


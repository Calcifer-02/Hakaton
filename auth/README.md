# Auth Service Docker

Этот сервис авторизации контейнеризирован с помощью Docker.

## Запуск с помощью Docker

### Вариант 1: Docker Compose (рекомендуется)
```bash
# Сборка и запуск контейнера
docker-compose up --build

# Запуск в фоновом режиме
docker-compose up -d --build

# Остановка контейнера
docker-compose down
```

### Вариант 2: Docker команды
```bash
# Сборка образа
docker build -t hakaton-auth .

# Запуск контейнера
docker run -p 5000:5000 --name hakaton-auth hakaton-auth

# Запуск в фоновом режиме
docker run -d -p 5000:5000 --name hakaton-auth hakaton-auth

# Остановка контейнера
docker stop hakaton-auth

# Удаление контейнера
docker rm hakaton-auth
```

## Доступ к приложению

После запуска контейнера сервис будет доступен по адресу:
- **Веб-интерфейс**: http://localhost:5000
- **API**: http://localhost:5000/auth/

## Endpoints

- `GET /` - Форма входа
- `GET /register.html` - Форма регистрации  
- `POST /auth/registration` - Регистрация пользователя
- `POST /auth/login` - Авторизация пользователя
- `GET /auth/users` - Список пользователей (требует токен)

## MongoDB подключение

Сервис использует MongoDB Atlas. Убедитесь, что строка подключения в `index.js` корректна.

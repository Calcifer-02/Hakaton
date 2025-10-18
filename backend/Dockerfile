# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем код приложения
COPY . .

# Создаем директорию для базы данных
RUN mkdir -p /app/database

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Открываем порт
EXPOSE 4000

# Запуск приложения
CMD ["npm", "start"]


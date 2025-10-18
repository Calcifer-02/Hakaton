# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем весь код приложения
COPY . .

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Изменяем владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открываем порт 5000
EXPOSE 5000

# Команда для запуска приложения
CMD ["npm", "start"]

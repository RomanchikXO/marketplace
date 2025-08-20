# frontend/Dockerfile - универсальная сборка
FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем исходный код
COPY . .

EXPOSE 3000

# По умолчанию запускаем development сервер
# В production это будет переопределено в docker-compose.yml
CMD ["npm", "start"]
#!/bin/bash
# start-dev.sh - Запуск локальной разработки

echo "🚀 Запуск локальной разработки..."

# Используем локальный nginx конфиг без SSL
cp nginx/nginx-local.conf nginx/nginx.conf

# Устанавливаем переменные для development
export NODE_ENV=development
export REACT_APP_API_URL=http://localhost/api

# Запускаем сервисы
docker compose down -v certbot react redis django fastapi worker beat nginx
docker compose up --build -d

echo "✅ Локальная разработка запущена!"
echo "🌐 Фронтенд: http://localhost"
echo "🔧 Django Admin: http://localhost/admin/"
echo "📚 FastAPI Docs: http://localhost:8001/docs"

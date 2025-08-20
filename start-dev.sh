#!/bin/bash
# start-dev.sh - Запуск локальной разработки

echo "🚀 Запуск локальной разработки..."

# Устанавливаем переменные для development
export NODE_ENV=development
export REACT_APP_API_URL=http://localhost/api

# Запускаем сервисы
docker compose up --build

echo "✅ Локальная разработка запущена!"
echo "🌐 Фронтенд: http://localhost"
echo "🔧 Django Admin: http://localhost/admin/"
echo "📚 FastAPI Docs: http://localhost:8001/docs"

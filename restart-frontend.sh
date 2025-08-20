#!/bin/bash
# restart-frontend.sh - Перезапуск только фронтенда

echo "🔄 Перезапуск фронтенда..."

if [ "$NODE_ENV" = "production" ]; then
    echo "🧹 Очищаем production кэш..."
    docker-compose stop react nginx
    docker volume rm marketplace_react_build 2>/dev/null || echo "Volume уже очищен"
    docker-compose up --build -d react
    sleep 10
    docker-compose restart nginx
    echo "✅ Production фронтенд перезапущен!"
else
    echo "🔄 Перезапуск development фронтенда..."
    docker-compose restart react
    echo "✅ Development фронтенд перезапущен!"
fi

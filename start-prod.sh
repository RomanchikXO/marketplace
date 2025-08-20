#!/bin/bash
# start-prod.sh - Запуск production (для сервера)

echo "🚀 Запуск production сервера..."

# Создаем production nginx конфиг с SSL
if [ ! -f nginx/nginx-prod.conf ]; then
    echo "⚠️  nginx-prod.conf не найден, используем nginx.conf"
else
    cp nginx/nginx-prod.conf nginx/nginx.conf
fi

# Устанавливаем переменные для production
export NODE_ENV=production
export REACT_APP_API_URL=https://wbautopro.ru/api

# Останавливаем текущие сервисы
docker compose down

# Очищаем кэш фронтенда
echo "🧹 Очищаем кэш фронтенда..."
docker volume rm marketplace_react_build 2>/dev/null || echo "Volume уже очищен"

# Пересобираем и запускаем
echo "🔨 Пересобираем сервисы..."
docker compose up --build -d

echo "⏳ Ждем запуска сервисов..."
sleep 30

echo "📊 Статус сервисов:"
docker compose ps

echo "✅ Production сервер запущен!"
echo "🌐 Сайт: https://wbautopro.ru"
echo "🔧 Admin: https://wbautopro.ru/admin/"

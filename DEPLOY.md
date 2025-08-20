# 🚀 Инструкция по деплою на сервер

## Первый деплой

```bash
# 1. Получить код
git pull origin main

# 2. Сделать скрипты исполняемыми
chmod +x *.sh

# 3. Создать production .env файл
cat > .env << 'EOF'
# Database
POSTGRES_DB=marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=ваш_пароль
DB_HOST=postgres
DB_PORT=5432

# Django
DEBUG=False
DJANGO_SUPERUSER_USERNAME=ваш_админ
DJANGO_SUPERUSER_PASSWORD=ваш_пароль_админа
DJANGO_SUPERUSER_EMAIL=ваш_email

# React Production
NODE_ENV=production
REACT_APP_API_URL=https://wbautopro.ru/api

# Environment
ENVIRONMENT=production
EOF

# 4. Запустить production
./start-prod.sh
```

## Последующие деплои

```bash
# Просто эти две команды:
git pull origin main
./start-prod.sh
```

## Локальное тестирование production

```bash
# Локально можно тестировать production режим:
NODE_ENV=production ./start-prod.sh

# Или временно изменить .env:
# NODE_ENV=production
# REACT_APP_API_URL=http://localhost/api
```

## Переключение между режимами локально

```bash
# Development (быстрая разработка)
./start-dev.sh

# Production тест (медленно, но как на сервере)
NODE_ENV=production ./start-prod.sh
```

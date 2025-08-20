# Marketplace для селлера Wildberries

Проект для автоматизации работы селлера на маркетплейсе Wildberries.

## Архитектура

- **Django** - основной бэкенд, admin панель, работа с API WB
- **FastAPI** - API для фронтенда, быстрый доступ к данным
- **React** - фронтенд интерфейс для пользователей
- **PostgreSQL** - основная база данных
- **Redis + Celery** - фоновые задачи и планировщик
- **Nginx** - реверс-прокси и статические файлы

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Клонируем репозиторий
git clone <repository-url>
cd marketplace

# Запускаем локальную разработку
chmod +x start-dev.sh
./start-dev.sh
```

**Доступные URL:**
- Фронтенд: http://localhost
- Django Admin: http://localhost/admin/
- FastAPI Docs: http://localhost:8001/docs

### Production сервер

```bash
# На сервере
chmod +x start-prod.sh
./start-prod.sh
```

## 📋 Команды управления

### Основные команды

```bash
# Запуск локальной разработки
./start-dev.sh

# Запуск production (сервер)
./start-prod.sh

# Перезапуск только фронтенда
./restart-frontend.sh

# Остановка всех сервисов
docker compose down

# Просмотр логов
docker compose logs [service_name]

# Статус сервисов
docker compose ps
```

### При изменениях в коде

| Что изменилось | Команда                               | Пояснение |
|---|---------------------------------------|---|
| **Frontend код** | `./restart-frontend.sh`               | Перезапуск React с очисткой кэша |
| **Django код** | `docker compose restart django`       | Автоперезапуск при изменениях |
| **FastAPI код** | `docker compose restart fastapi`      | Автоперезапуск при изменениях |
| **nginx.conf** | `docker compose restart nginx`        | Перезапуск nginx |
| **Dockerfile** | `docker compose up --build`           | Полная пересборка |
| **requirements.txt** | `docker compose build django fastapi` | Пересборка backend сервисов |
| **package.json** | `docker compose build react`          | Пересборка frontend |

### Работа с базой данных

```bash
# Создание миграций
docker compose exec django python manage.py makemigrations

# Применение миграций
docker compose exec django python manage.py migrate

# Сбор статических файлов
docker compose exec django python manage.py collectstatic --noinput

# Создание суперпользователя
docker compose exec django python manage.py createsuperuser

# Подключение к БД
docker compose exec postgres psql -U postgres -d marketplace
```

### Работа с пользователями FastAPI

```bash
# Активация пользователя через FastAPI
docker compose exec fastapi python -c "
from database import SessionLocal
from models import User
db = SessionLocal()
try:
    user = db.query(User).filter(User.nickname == 'USERNAME').first()
    if user:
        user.is_active = True
        db.commit()
        print('User activated')
finally:
    db.close()
"
```

### Troubleshooting

```bash
# Очистка всех данных (ОСТОРОЖНО!)
docker compose down -v
docker system prune -a

# Просмотр логов конкретного сервиса
docker compose logs -f django
docker compose logs -f react
docker compose logs -f nginx

# Вход в контейнер для отладки
docker compose exec django bash
docker compose exec react sh

# Проверка сети и портов
docker compose exec nginx nginx -t
curl http://localhost/api/health
```

## 🔧 Конфигурация

### Переменные окружения

Создайте файл `.env` в корне проекта:

```bash
# Database
POSTGRES_DB=marketplace
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
DB_HOST=postgres
DB_PORT=5432

# Django
DEBUG=False
DJANGO_SUPERUSER_USERNAME=admin
DJANGO_SUPERUSER_PASSWORD=admin_password
DJANGO_SUPERUSER_EMAIL=admin@example.com

# React
NODE_ENV=production
REACT_APP_API_URL=https://yourdomain.com/api
```

### Локальная разработка vs Production

Проект автоматически определяет режим по переменной `NODE_ENV`:

- **Development** (`NODE_ENV=development`):
  - React dev server на порту 3000
  - Hot reload включен
  - Django DEBUG=True
  - Подробные логи

- **Production** (`NODE_ENV=production`):
  - React билдится в статические файлы
  - Nginx раздает статику
  - Django DEBUG=False
  - Оптимизированная сборка

## 📦 Деплой

### Первый деплой

```bash
# 1. Настройте .env файл
cp .env.example .env
# Отредактируйте .env с production настройками

# 2. Запустите
./start-prod.sh
```

### Обновление кода

```bash
# 1. Получите изменения
git pull origin main

# 2. Перезапустите с обновлениями
./start-prod.sh
```

### Откат изменений

```bash
# Откатиться к предыдущему коммиту
git checkout HEAD~1
./start-prod.sh
```

## 🛡️ Безопасность

- Все пароли должны быть в `.env` файлах
- `.env` файлы добавлены в `.gitignore`
- В production всегда используйте `DEBUG=False`
- Регулярно обновляйте зависимости
- Используйте HTTPS в production

## 📝 Логи

```bash
# Все логи
docker compose logs

# Логи в реальном времени
docker compose logs -f

# Логи конкретного сервиса
docker compose logs django
docker compose logs react
docker compose logs nginx
```

## 🔄 Мониторинг

```bash
# Статус всех сервисов
docker compose ps

# Использование ресурсов
docker stats

# Проверка health endpoints
curl http://localhost/api/health
curl http://localhost/admin/
```

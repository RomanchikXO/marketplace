# Marketplace Project - Full-Stack Architecture

## 🏗️ Дерево архитектуры проекта

marketplace/
├── backend/                 # Django Backend
│   ├── api/                 # API приложение
│   │   ├── models.py        # Модели данных
│   │   ├── views.py         # API views
│   │   ├── urls.py          # URL маршруты
│   │   └── migrations/      # Миграции БД
│   ├── core/                # Основные настройки
│   │   ├── settings.py      # Конфигурация Django
│   │   ├── urls.py          # Главные URL маршруты
│   │   └── wsgi.py          # WSGI конфигурация
│   ├── database/            # Работа с БД
│   │   ├── DataBase.py      # Подключение к БД
│   │   └── funcs_db.py      # Функции БД
│   ├── logger/               # Логирование
│   │   ├── models.py        # Модели логов
│   │   └── tasks.py         # Celery задачи
│   ├── wb/                  # Wildberries модуль
│   │   ├── models.py        # Модели WB
│   │   └── views.py         # WB views
│   ├── parsers/             # Парсеры данных
│   │   └── wildberies.py    # WB парсер
│   ├── manage.py            # Django CLI
│   ├── requirements.txt     # Python зависимости
│   └── Dockerfile           # Docker образ
├── fastapi_service/          # FastAPI Service
│   ├── main.py              # Основной API
│   ├── models.py             # SQLAlchemy модели
│   ├── schemas.py            # Pydantic схемы
│   ├── database.py           # Подключение к БД
│   ├── requirements.txt      # Python зависимости
│   └── Dockerfile            # Docker образ
├── frontend/                 # React Frontend
│   ├── src/                  # Исходный код
│   │   ├── components/       # React компоненты
│   │   │   ├── modules/      # Модули дашборда
│   │   │   │   ├── Analytics.tsx
│   │   │   │   ├── Repricer.tsx
│   │   │   │   └── Sorter.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── OrdersChart.tsx
│   │   │   ├── PeriodStats.tsx
│   │   │   ├── ProductsTable.tsx
│   │   │   └── DateRangeFilter.tsx
│   │   ├── hooks/            # React хуки
│   │   │   └── useAuth.ts    # Хук авторизации
│   │   ├── App.tsx           # Главный компонент
│   │   └── index.tsx         # Точка входа
│   ├── public/               # Статические файлы
│   ├── package.json          # Node.js зависимости
│   └── Dockerfile            # Docker образ
├── nginx/                    # Nginx конфигурация
│   ├── nginx-local.conf      # Локальная среда
│   ├── nginx-prod.conf       # Продакшн среда
│   └── nginx.conf            # Основная конфигурация
├── docker-compose.yml        # Docker Compose
├── start-dev.sh              # Скрипт запуска dev
├── start-prod.sh             # Скрипт запуска prod
├── setup-ssl.sh              # SSL сертификаты
└── .env                      # Переменные окружения

## 🚀 Технологический стек

### Backend
- **Python 3.9+** - Основной язык
- **Django 4.x** - Веб-фреймворк
- **FastAPI** - Современный API фреймворк
- **SQLAlchemy** - ORM для FastAPI
- **Celery** - Асинхронные задачи
- **Redis** - Кэш и брокер сообщений

### Frontend
- **React 18** - JavaScript библиотека
- **TypeScript** - Типизированный JavaScript
- **CSS3** - Стилизация
- **Chart.js** - Графики и диаграммы

### Database
- **PostgreSQL 15** - Реляционная БД
- **psycopg2** - PostgreSQL драйвер

### DevOps & Infrastructure
- **Docker** - Контейнеризация
- **Docker Compose** - Оркестрация контейнеров
- **Nginx** - Веб-сервер и прокси
- **Let's Encrypt** - SSL сертификаты

### Development Tools
- **Git** - Система контроля версий
- **Postman/Insomnia** - Тестирование API

### Architecture Patterns
- **Microservices** - FastAPI + Django
- **REST API** - RESTful архитектура
- **Containerization** - Docker-based deployment
- **CI/CD** - Автоматизация развертывания

## 📊 Основные возможности

- **Аналитический дашборд** - Статистика продаж и заказов
- **Управление товарами** - Анализ остатков и прогнозирование
- **Фильтрация по датам** - Динамический выбор периодов
- **Реал-тайм данные** - Актуальная информация из БД
- **Адаптивный дизайн** - Современный UI/UX
- **Масштабируемость** - Docker-based архитектура

#!/bin/bash

# Ожидаем запуск PostgreSQL
echo "Waiting for postgres..."
while ! nc -z postgres 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

# Выполняем миграции
echo "Making migrations..."
python manage.py makemigrations

echo "Running migrations..."
python manage.py migrate

# Собираем статические файлы
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Запускаем Django сервер
echo "Starting Django server..."
python manage.py runserver 0.0.0.0:8000
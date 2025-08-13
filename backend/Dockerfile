# backend/Dockerfile
FROM python:3.11-slim

# Устанавливаем netcat для проверки подключения к БД
RUN apt-get update && apt-get install -y netcat-openbsd && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 8000

CMD ["./entrypoint.sh"]
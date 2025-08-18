marketplace/
├── backend/                 # Django
│   ├── core/
│   ├── api/
│   ├── manage.py
│   ├── Dockerfile
│   └── requirements.txt
├── fastapi_service/         # FastAPI
│   ├── main.py
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # React
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env
└── .gitignore


Если поменяли в DJANGO
docker compose down
docker compose build django
docker compose up -d
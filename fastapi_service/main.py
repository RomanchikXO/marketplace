from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="My FastAPI Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "FastAPI is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
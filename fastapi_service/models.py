# marketplace/fastapi_service/models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from passlib.context import CryptContext

Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "frontend_users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.hashed_password)

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)
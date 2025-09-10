# marketplace/fastapi_service/schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    nickname: str
    email: EmailStr
    phone: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    nickname: str
    password: str


class UserResponse(BaseModel):
    id: int
    nickname: str
    email: str
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserLoginResponse(BaseModel):
    user: UserResponse
    message: str


class UserRegisterResponse(BaseModel):
    user: UserResponse
    message: str
    activation_required: bool


class OrdersChartData(BaseModel):
    date: str
    count: int


class OrdersChartResponse(BaseModel):
    data: list[OrdersChartData]
    total_orders: int
    total_sales: float


class WbLkResponse(BaseModel):
    id: int
    name: str
    token: str
    number: Optional[int] = None
    cookie: Optional[str] = None
    authorizev3: Optional[str] = None
    inn: Optional[int] = None
    tg_id: Optional[int] = None
    owner_id: int
    is_owner: bool = False  # Показывает, является ли текущий пользователь владельцем

    class Config:
        from_attributes = True


class WbLkCreate(BaseModel):
    name: str
    token: str
    number: Optional[int] = None
    cookie: Optional[str] = None
    authorizev3: Optional[str] = None
    inn: Optional[int] = None
    tg_id: Optional[int] = None


class UserWithWbLksResponse(BaseModel):
    id: int
    nickname: str
    email: str
    phone: Optional[str] = None
    is_active: bool
    created_at: datetime
    wb_lks: list[WbLkResponse] = []

    class Config:
        from_attributes = True


class ShareWbLkRequest(BaseModel):
    user_id: int
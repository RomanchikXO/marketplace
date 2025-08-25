# marketplace/fastapi_service/main.py
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db, create_tables
from models import User, WbOrders, Stocks, Nmids, Base
from schemas import UserRegister, UserLogin, UserLoginResponse, UserRegisterResponse, OrdersChartResponse, OrdersChartData

app = FastAPI(title="Marketplace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    create_tables()


@app.post("/auth/register", response_model=UserRegisterResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Проверяем уникальность никнейма
    if db.query(User).filter(User.nickname == user_data.nickname).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Никнейм уже занят"
        )

    # Проверяем уникальность email
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email уже используется"
        )

    # Создаем пользователя
    hashed_password = User.hash_password(user_data.password)
    db_user = User(
        nickname=user_data.nickname,
        email=user_data.email,
        phone=user_data.phone,
        hashed_password=hashed_password,
        is_active = False
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return UserRegisterResponse(
        user=db_user,
        message="Регистрация успешна! Аккаунт будет активирован администратором.",
        activation_required=True
    )


@app.post("/auth/login", response_model=UserLoginResponse)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    # Находим пользователя
    user = db.query(User).filter(User.nickname == user_data.nickname).first()

    if not user or not user.verify_password(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный никнейм или пароль"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Аккаунт не активирован. Обратитесь к администратору для активации."
        )

    return UserLoginResponse(
        user=user,
        message="Вход выполнен успешно"
    )


@app.get("/analytics/orders-chart", response_model=OrdersChartResponse)
async def get_orders_chart(
    date_from: str = None, 
    date_to: str = None,
    db: Session = Depends(get_db)
):
    """Получить данные заказов с фильтрами по датам для графика"""
    
    # Если даты не указаны, берем последние 30 дней
    if not date_from:
        date_from = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    if not date_to:
        date_to = datetime.now().strftime('%Y-%m-%d')
    
    # Преобразуем строки в datetime
    try:
        start_date = datetime.strptime(date_from, '%Y-%m-%d')
        end_date = datetime.strptime(date_to, '%Y-%m-%d')
        
        # Проверяем, что дата "до" не больше текущего дня
        if end_date > datetime.now():
            end_date = datetime.now()
            
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Неверный формат даты. Используйте формат YYYY-MM-DD"
        )
    
    try:
        # Получаем количество заказов по дням в указанном диапазоне
        orders_by_date = db.query(
            func.date(WbOrders.date).label('order_date'),
            func.count(WbOrders.id).label('count')
        ).filter(
            WbOrders.date >= start_date,
            WbOrders.date <= end_date + timedelta(days=1),  # +1 день чтобы включить end_date
        ).group_by(
            func.date(WbOrders.date)
        ).order_by(
            func.date(WbOrders.date)
        ).all()
        
        # Преобразуем в нужный формат
        chart_data = []
        for row in orders_by_date:
            chart_data.append(OrdersChartData(
                date=row.order_date.strftime('%Y-%m-%d'),
                count=row.count
            ))
        
        # Получаем общее количество заказов за период
        total_orders = db.query(func.count(WbOrders.id)).filter(
            WbOrders.date >= start_date,
            WbOrders.date <= end_date + timedelta(days=1),
        ).scalar()
        
        # Получаем общую сумму продаж по полю pricewithdisc
        total_sales = db.query(func.sum(WbOrders.pricewithdisc)).filter(
            WbOrders.date >= start_date,
            WbOrders.date <= end_date + timedelta(days=1),
        ).scalar()
        
        return OrdersChartResponse(
            data=chart_data,
            total_orders=total_orders or 0,
            total_sales=float(total_sales or 0)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения данных заказов: {str(e)}"
        )


@app.get("/analytics/stocks")
async def get_stocks(db: Session = Depends(get_db)):
    """Получить общие остатки товаров"""
    
    try:
        # Сумма всех остатков
        total_stocks = db.query(func.sum(Stocks.quantity)).scalar()
        
        return {
            "total_stocks": int(total_stocks or 0)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения данных об остатках: {str(e)}"
        )


@app.get("/")
async def root():
    return {"message": "FastAPI is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
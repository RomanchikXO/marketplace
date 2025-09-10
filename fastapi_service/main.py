# marketplace/fastapi_service/main.py
from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, case, and_
from datetime import datetime, timedelta
from typing import Optional, List
from database import get_db, create_tables
from models import User, WbOrders, Stocks, Nmids, Base, WbLk
from schemas import UserRegister, UserLogin, UserLoginResponse, UserRegisterResponse, OrdersChartResponse, OrdersChartData, UserResponse, WbLkResponse, WbLkCreate, UserWithWbLksResponse, ShareWbLkRequest

app = FastAPI(title="Marketplace API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost"],  # В продакшене указать конкретные домены
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Функция для получения текущего пользователя по header
def get_current_user_from_header(x_user_id: int = Header(..., alias="X-User-ID"), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == x_user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Аккаунт не активирован"
        )
    return user


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


@app.get("/user/profile", response_model=UserWithWbLksResponse)
async def get_user_profile(current_user: User = Depends(get_current_user_from_header)):
    """Получить профиль текущего пользователя с его WB личными кабинетами"""
    return current_user


@app.get("/wb-lk", response_model=List[WbLkResponse])
async def get_user_wb_lks(current_user: User = Depends(get_current_user_from_header)):
    """Получить все WB личные кабинеты пользователя"""
    wb_lks_with_ownership = []
    for wb_lk in current_user.wb_lks:
        wb_lk_dict = {
            "id": wb_lk.id,
            "name": wb_lk.name,
            "token": wb_lk.token,
            "number": wb_lk.number,
            "cookie": wb_lk.cookie,
            "authorizev3": wb_lk.authorizev3,
            "inn": wb_lk.inn,
            "tg_id": wb_lk.tg_id,
            "owner_id": wb_lk.owner_id,
            "is_owner": wb_lk.owner_id == current_user.id
        }
        wb_lks_with_ownership.append(wb_lk_dict)
    return wb_lks_with_ownership


@app.post("/wb-lk", response_model=WbLkResponse)
async def create_wb_lk(
    wb_lk_data: WbLkCreate,
    current_user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Создать новый WB личный кабинет"""
    wb_lk_dict = wb_lk_data.dict()
    wb_lk_dict['owner_id'] = current_user.id
    db_wb_lk = WbLk(**wb_lk_dict)
    db.add(db_wb_lk)
    db.commit()
    db.refresh(db_wb_lk)
    
    # Привязываем к текущему пользователю
    current_user.wb_lks.append(db_wb_lk)
    db.commit()
    
    # Возвращаем с информацией о владении
    return {
        "id": db_wb_lk.id,
        "name": db_wb_lk.name,
        "token": db_wb_lk.token,
        "number": db_wb_lk.number,
        "cookie": db_wb_lk.cookie,
        "authorizev3": db_wb_lk.authorizev3,
        "inn": db_wb_lk.inn,
        "tg_id": db_wb_lk.tg_id,
        "owner_id": db_wb_lk.owner_id,
        "is_owner": True
    }


@app.post("/wb-lk/{wb_lk_id}/share")
async def share_wb_lk(
    wb_lk_id: int,
    share_data: ShareWbLkRequest,
    current_user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Поделиться WB личным кабинетом с другим пользователем (только владелец)"""
    # Проверяем, что WB личный кабинет существует
    wb_lk = db.query(WbLk).filter(WbLk.id == wb_lk_id).first()
    if not wb_lk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="WB личный кабинет не найден"
        )
    
    # Проверяем, что текущий пользователь является владельцем
    if wb_lk.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только владелец может предоставлять доступ к личному кабинету"
        )
    
    # Находим пользователя для привязки
    target_user = db.query(User).filter(User.id == share_data.user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Проверяем, что пользователь уже не привязан к этому личному кабинету
    if wb_lk in target_user.wb_lks:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь уже имеет доступ к этому личному кабинету"
        )
    
    # Привязываем пользователя к личному кабинету
    target_user.wb_lks.append(wb_lk)
    db.commit()
    
    return {"message": f"WB личный кабинет '{wb_lk.name}' успешно предоставлен пользователю {target_user.nickname}"}


@app.delete("/wb-lk/{wb_lk_id}/unshare/{user_id}")
async def unshare_wb_lk(
    wb_lk_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Отозвать доступ к WB личному кабинету у пользователя (только владелец)"""
    # Проверяем, что WB личный кабинет существует
    wb_lk = db.query(WbLk).filter(WbLk.id == wb_lk_id).first()
    if not wb_lk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="WB личный кабинет не найден"
        )
    
    # Проверяем, что текущий пользователь является владельцем
    if wb_lk.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только владелец может отзывать доступ к личному кабинету"
        )
    
    # Находим пользователя
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Пользователь не найден"
        )
    
    # Удаляем привязку
    if wb_lk in target_user.wb_lks:
        target_user.wb_lks.remove(wb_lk)
        db.commit()
        return {"message": f"Доступ к WB личному кабинету '{wb_lk.name}' отозван у пользователя {target_user.nickname}"}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пользователь не имеет доступа к этому личному кабинету"
        )


@app.get("/wb-lk/{wb_lk_id}/users")
async def get_wb_lk_users(
    wb_lk_id: int,
    current_user: User = Depends(get_current_user_from_header),
    db: Session = Depends(get_db)
):
    """Получить список пользователей, имеющих доступ к WB личному кабинету (только владелец)"""
    # Проверяем, что WB личный кабинет существует
    wb_lk = db.query(WbLk).filter(WbLk.id == wb_lk_id).first()
    if not wb_lk:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="WB личный кабинет не найден"
        )
    
    # Проверяем, что текущий пользователь является владельцем
    if wb_lk.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Только владелец может просматривать список пользователей"
        )
    
    # Получаем всех пользователей, имеющих доступ к личному кабинету
    users_with_access = []
    for user in wb_lk.frontend_users:
        users_with_access.append({
            "id": user.id,
            "nickname": user.nickname,
            "email": user.email,
            "is_owner": user.id == wb_lk.owner_id
        })
    
    return {
        "wb_lk_name": wb_lk.name,
        "users": users_with_access
    }


@app.get("/analytics/orders-chart", response_model=OrdersChartResponse)
async def get_orders_chart(
    date_from: str = None, 
    date_to: str = None,
    wb_lk_ids: Optional[str] = None,
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
        # Подготавливаем базовый запрос
        query = db.query(
            func.date(WbOrders.date).label('order_date'),
            func.count(WbOrders.id).label('count')
        ).filter(
            WbOrders.date >= start_date,
            WbOrders.date <= end_date + timedelta(days=1),  # +1 день чтобы включить end_date
        )
        
        # Добавляем фильтрацию по WB кабинетам если указаны
        if wb_lk_ids:
            wb_lk_id_list = [int(id.strip()) for id in wb_lk_ids.split(',') if id.strip()]
            if wb_lk_id_list:
                query = query.filter(WbOrders.lk_id.in_(wb_lk_id_list))
        
        # Получаем количество заказов по дням в указанном диапазоне
        orders_by_date = query.group_by(
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
        
        # Подготавливаем базовые запросы для total_orders и total_sales
        total_orders_query = db.query(func.count(WbOrders.id)).filter(
            WbOrders.date >= start_date,
            WbOrders.date <= end_date + timedelta(days=1),
        )
        
        total_sales_query = db.query(func.sum(WbOrders.pricewithdisc)).filter(
            WbOrders.date >= start_date,
            WbOrders.date <= end_date + timedelta(days=1),
        )
        
        # Добавляем фильтрацию по WB кабинетам если указаны
        if wb_lk_ids:
            wb_lk_id_list = [int(id.strip()) for id in wb_lk_ids.split(',') if id.strip()]
            if wb_lk_id_list:
                total_orders_query = total_orders_query.filter(WbOrders.lk_id.in_(wb_lk_id_list))
                total_sales_query = total_sales_query.filter(WbOrders.lk_id.in_(wb_lk_id_list))
        
        # Получаем общее количество заказов за период
        total_orders = total_orders_query.scalar()
        
        # Получаем общую сумму продаж по полю pricewithdisc
        total_sales = total_sales_query.scalar()
        
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
async def get_stocks(
    wb_lk_ids: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Получить общие остатки товаров"""
    
    try:
        # Подготавливаем базовый запрос
        query = db.query(func.sum(Stocks.quantity))
        
        # Добавляем фильтрацию по WB кабинетам если указаны
        if wb_lk_ids:
            wb_lk_id_list = [int(id.strip()) for id in wb_lk_ids.split(',') if id.strip()]
            if wb_lk_id_list:
                query = query.filter(Stocks.lk_id.in_(wb_lk_id_list))
        
        # Сумма всех остатков
        total_stocks = query.scalar()
        
        return {
            "total_stocks": int(total_stocks or 0)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения данных об остатках: {str(e)}"
        )


@app.get("/analytics/products")
async def get_products(
        date_from: str = None,
        date_to: str = None,
        wb_lk_ids: Optional[str] = None,
        db: Session = Depends(get_db)
):
    """Получить все артикулы с заказами и остатками"""

    try:
        # Если даты не указаны, берем последние 30 дней
        if not date_from:
            date_from = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        if not date_to:
            date_to = datetime.now().strftime('%Y-%m-%d')

        start_date = datetime.strptime(date_from, '%Y-%m-%d')
        end_date = datetime.strptime(date_to, '%Y-%m-%d')

        last_7_days = datetime.now() - timedelta(days=7)

        # Подготавливаем условия для JOIN с WbOrders
        join_conditions = [
            Nmids.nmid == WbOrders.nmid,
            WbOrders.date >= start_date,
            WbOrders.date <= end_date + timedelta(days=1)
        ]
        
        # Добавляем фильтрацию по WB кабинетам если указаны
        if wb_lk_ids:
            wb_lk_id_list = [int(id.strip()) for id in wb_lk_ids.split(',') if id.strip()]
            if wb_lk_id_list:
                join_conditions.append(WbOrders.lk_id.in_(wb_lk_id_list))
        
        join_condition = and_(*join_conditions)
        
        # Подготавливаем условия для Stocks
        stocks_query = db.query(func.sum(Stocks.quantity)).filter(Stocks.nmid == Nmids.nmid)
        if wb_lk_ids:
            wb_lk_id_list = [int(id.strip()) for id in wb_lk_ids.split(',') if id.strip()]
            if wb_lk_id_list:
                stocks_query = stocks_query.filter(Stocks.lk_id.in_(wb_lk_id_list))

        products = db.query(
            Nmids.nmid,
            func.count(func.distinct(WbOrders.id)).label('orders'),
            func.coalesce(
                func.coalesce(
                    stocks_query.as_scalar(),
                    0
                ),
                0
            ).label('quantity'),
            # количество заказов за последние 7 дней / 7
            (
                    func.count(
                        func.distinct(
                            case(
                                (
                                    WbOrders.date >= last_7_days,
                                    WbOrders.id
                                )
                            )
                        )
                    ) / 7.0
            ).label("orders_per_day_7d")
        ).outerjoin(
            WbOrders,
            join_condition
        ).filter(
            Nmids.is_active == True
        ).group_by(
            Nmids.nmid
        ).all()

        return {
            "products": [
                {
                    "nmid": row.nmid,
                    "orders": row.orders,
                    "quantity": row.quantity,
                    "orders_per_day_7d": int(row.quantity / row.orders_per_day_7d) if row.orders_per_day_7d else 0
                }
                for row in products
            ]
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения данных о товарах: {str(e)}"
        )


@app.get("/")
async def root():
    return {"message": "FastAPI is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
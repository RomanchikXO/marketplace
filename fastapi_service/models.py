# marketplace/fastapi_service/models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, BigInteger, Float, ForeignKey, Table
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from passlib.context import CryptContext

Base = declarative_base()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Таблица для связи many-to-many между пользователями и WB личными кабинетами
user_wb_lk_association = Table(
    'frontend_users_wb_lk',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('frontend_users.id'), primary_key=True),
    Column('wb_lk_id', Integer, ForeignKey('wb_wblk.id'), primary_key=True)
)


class User(Base):
    __tablename__ = "frontend_users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=func.now())

    # Связь many-to-many с WB личными кабинетами
    wb_lks = relationship("WbLk", secondary=user_wb_lk_association, back_populates="frontend_users")

    def verify_password(self, password: str) -> bool:
        return pwd_context.verify(password, self.hashed_password)

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)


class WbLk(Base):
    __tablename__ = "wb_wblk"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    token = Column(String(400), nullable=False)
    number = Column(BigInteger, default=0, nullable=True)
    cookie = Column(String, default='', nullable=True)
    authorizev3 = Column(String, default='', nullable=True)
    inn = Column(BigInteger, default=0, nullable=True)
    tg_id = Column(BigInteger, default=0, nullable=True)
    owner_id = Column(Integer, nullable=False)

    # Связь many-to-many с пользователями (включая владельца)
    frontend_users = relationship("User", secondary=user_wb_lk_association, back_populates="wb_lks")


class WbOrders(Base):
    __tablename__ = "wb_orders"

    id = Column(Integer, primary_key=True, index=True)
    lk_id = Column(Integer, nullable=False, default=1)
    date = Column(DateTime, nullable=False)
    lastchangedate = Column(DateTime, nullable=False)
    warehousename = Column(String(255), nullable=False)
    warehousetype = Column(String(255), nullable=False)
    countryname = Column(String(255), nullable=False)
    oblastokrugname = Column(String(255), nullable=True)
    regionname = Column(String(255), nullable=True)
    supplierarticle = Column(String(255), nullable=False)
    nmid = Column(Integer, nullable=False)
    barcode = Column(BigInteger, nullable=True)
    category = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    brand = Column(String(255), nullable=False)
    techsize = Column(String(255), nullable=True)
    incomeid = Column(Integer, nullable=False)
    issupply = Column(Boolean, nullable=False)
    isrealization = Column(Boolean, nullable=False)
    totalprice = Column(Integer, nullable=False)
    discountpercent = Column(Integer, nullable=False)
    spp = Column(Integer, nullable=False)
    finishedprice = Column(Float, nullable=False)
    pricewithdisc = Column(Float, nullable=False)
    iscancel = Column(Boolean, nullable=False)
    canceldate = Column(DateTime, nullable=False)
    sticker = Column(String(255), nullable=False)
    gnumber = Column(String(255), nullable=False)
    srid = Column(String(255), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())


class Stocks(Base):
    __tablename__ = "wb_stocks"

    id = Column(Integer, primary_key=True, index=True)
    lk_id = Column(Integer, nullable=False, default=1)
    lastchangedate = Column(DateTime, nullable=False)
    warehousename = Column(String(255), nullable=False)
    supplierarticle = Column(String(255), nullable=False)
    nmid = Column(Integer, nullable=False)
    barcode = Column(BigInteger, nullable=True)
    quantity = Column(Integer, nullable=False)
    inwaytoclient = Column(Integer, nullable=False)
    inwayfromclient = Column(Integer, nullable=False)
    quantityfull = Column(Integer, nullable=False)
    category = Column(String(255), nullable=False)
    techsize = Column(String(255), nullable=True)
    issupply = Column(Boolean, nullable=False)
    isrealization = Column(Boolean, nullable=False)
    sccode = Column(String(255), nullable=False)
    added_db = Column(DateTime, nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())


class Nmids(Base):
    __tablename__ = "wb_nmids"

    id = Column(Integer, primary_key=True, index=True)
    lk_id = Column(Integer, nullable=False, default=1)
    nmid = Column(Integer, nullable=False)
    imtid = Column(Integer, nullable=True)
    nmuuid = Column(String(255), nullable=True)
    subjectid = Column(Integer, nullable=True)
    subjectname = Column(String(255), nullable=True)
    vendorcode = Column(String(255), nullable=True)
    brand = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    needkiz = Column(Boolean, nullable=True)
    dimensions = Column(String(255), nullable=True)
    characteristics = Column(String(255), nullable=True)
    sizes = Column(String(255), nullable=True)
    tag_ids = Column(String(255), nullable=True)
    created_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now())
    added_db = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
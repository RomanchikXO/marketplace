# marketplace/fastapi_service/models.py
from sqlalchemy import Column, Integer, String, DateTime, Boolean, BigInteger, Float, ForeignKey
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
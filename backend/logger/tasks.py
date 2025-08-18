# /marketplace/backend/logger/tasks.py

from context_logger import ContextLogger
import logging
from celery import shared_task
from decorators import with_task_context
from parsers.wildberies import get_orders, get_nmids
import asyncio

logger = ContextLogger(logging.getLogger("logger"))


@shared_task
@with_task_context("get_area_warehouses_task")
def get_area_warehouses_task():
    logger.info("🟢 Тестовый лог")


@shared_task
@with_task_context("get_nmids_to_db")
def get_nmids_to_db():
    logger.info("🟢 Обновляем артикулы в DB")
    asyncio.run(get_nmids())
    logger.info("Артикулы в DB обновлены")


@shared_task
@with_task_context("get_orders_to_db")
def get_orders_to_db():
    logger.info("🟢 Обновляем заказы в DB")
    asyncio.run(get_orders())
    logger.info("Заказы в DB обновлены")
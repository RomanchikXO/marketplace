# /marketplace/backend/logger/tasks.py

from context_logger import ContextLogger
import logging
from celery import shared_task
from decorators import with_task_context
import asyncio

logger = ContextLogger(logging.getLogger("logger"))


@shared_task
@with_task_context("get_area_warehouses_task")
def get_area_warehouses_task():
    logger.info("🟢 Тестовый лог")
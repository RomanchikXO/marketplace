# marketplace/backend/core/celery_config.py

from celery import Celery
import os


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

app = Celery('marketplace')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()


# Использование DatabaseScheduler для хранения расписания в базе данных
app.conf.beat_scheduler = 'django_celery_beat.schedulers:DatabaseScheduler'
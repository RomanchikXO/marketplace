# marketplace/backend/logger/models.py
from django.db import models


class CeleryLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    level = models.CharField(max_length=50)
    source = models.CharField(max_length=255, null=True)
    message = models.TextField()

    class Meta:
        verbose_name_plural = "Логи"

    def __str__(self):
        return f"[{self.timestamp}] {self.level}: {self.message}"
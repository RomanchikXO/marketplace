# backend/api/models.py
from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class FrontendUser(models.Model):
    nickname = models.CharField(max_length=50, unique=True, db_index=True)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    hashed_password = models.CharField(max_length=255)
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'frontend_users'  # Указываем существующую таблицу
        managed = False  # Django не будет управлять этой таблицей

    def __str__(self):
        return self.nickname

    def set_password(self, raw_password):
        """Устанавливает пароль используя bcrypt (совместимо с FastAPI)"""
        import bcrypt
        hashed = bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt())
        self.hashed_password = hashed.decode('utf-8')

    def check_password(self, raw_password):
        """Проверяет пароль используя bcrypt"""
        import bcrypt
        return bcrypt.checkpw(raw_password.encode('utf-8'), self.hashed_password.encode('utf-8'))


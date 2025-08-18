from django.db import models


# Модель для таблицы group
class Groups(models.Model):
    name = models.CharField(max_length=255)
    permissions = models.JSONField()  # Используем JSONField для хранения списка разрешений

    def __str__(self):
        return self.name


# Модель для таблицы wb_lk
class WbLk(models.Model):
    # myapp_wblk
    groups = models.ForeignKey(Groups, on_delete=models.CASCADE, null=True) #groups_id в бд
    name = models.CharField(max_length=255)
    token = models.CharField(max_length=400)
    number = models.BigIntegerField(default=0, null=True)
    cookie = models.TextField(default='', null=True)
    authorizev3 = models.TextField(default='', null=True)
    inn = models.BigIntegerField(default=0, null=True)
    tg_id = models.BigIntegerField(default=0, null=True)

    def __str__(self):
        return self.name

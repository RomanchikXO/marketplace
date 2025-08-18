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


class nmids(models.Model):
    lk = models.ForeignKey(WbLk, on_delete=models.CASCADE, default=1) #lk_id в бд
    nmid = models.IntegerField() # Артикул WB
    imtid = models.IntegerField() # ID карточки товара. Артикулы WB из одной карточки товара будут иметь одинаковый imtID
    nmuuid = models.CharField(max_length=255) # Внутренний технический ID товара
    subjectid = models.IntegerField() # ID предмета
    subjectname = models.CharField(max_length=255) # Название предмета
    vendorcode = models.CharField(max_length=255) # Артикул продавца
    brand = models.CharField(max_length=255) # Бренд
    title = models.CharField(max_length=500) # Наименование товара
    description = models.TextField() # Описание товара
    needkiz = models.BooleanField() # Требуется ли код маркировки для этого товара
    dimensions = models.JSONField() # Габариты и вес товара c упаковкой, см и кг
    characteristics = models.JSONField() # Характеристики
    sizes = models.JSONField() # Размеры товара
    tag_ids = models.JSONField(default=list)
    created_at = models.DateTimeField() # Дата создания карточки товара (по данным WB)
    updated_at = models.DateTimeField() # Дата изменения карточки товара (по данным WB)
    added_db = models.DateTimeField(auto_now_add=True) # по МСК
    is_active = models.BooleanField(default=True) # поле для понимания нужен товар или нет

    class Meta:
        unique_together = ['nmid', 'lk']
        verbose_name = "Товар WB"
        verbose_name_plural = "Товары WB"

    def __str__(self):
        return f"{self.nmid} – {self.title} ({self.brand})"


class Stocks(models.Model):
    lk = models.ForeignKey(WbLk, on_delete=models.CASCADE, default=1)  # lk_id в бд
    lastchangedate = models.DateTimeField() #Дата и время обновления информации в сервисе. Это поле соответствует параметру dateFrom в запросе. Если часовой пояс не указан, то берётся Московское время (UTC+3)
    warehousename = models.CharField(max_length=255, null=True) #Название склада
    supplierarticle = models.CharField(max_length=255) #Артикул продавца
    nmid = models.IntegerField() #Артикул
    barcode = models.BigIntegerField(null=True) #Баркод
    quantity = models.IntegerField() #Количество, доступное для продажи (сколько можно добавить в корзину)
    inwaytoclient = models.IntegerField() #В пути к клиенту
    inwayfromclient = models.IntegerField() #В пути от клиента
    quantityfull = models.IntegerField(default=0) #Полное (непроданное) количество, которое числится за складом (= quantity + в пути)
    category = models.CharField(max_length=255, null=True) #Категория
    techsize = models.CharField(max_length=255, null=True) #Размер
    issupply = models.BooleanField(default=False) #Договор поставки (внутренние технологические данные)
    isrealization = models.BooleanField(default=False) #Договор реализации (внутренние технологические данные)
    sccode = models.CharField(max_length=255, null=True) #Код контракта (внутренние технологические данные)
    added_db = models.DateTimeField(auto_now_add=True, null=True)  # по МСК время обновления в бд
    updated_at = models.DateTimeField(auto_now_add=True, null=True) # по сути то же что и выше но в UTC
    days_in_stock_last_3 = models.IntegerField(null=True, default=0)
    days_in_stock_last_7 = models.IntegerField(null=True, default=0)
    days_in_stock_last_14 = models.IntegerField(null=True, default=0)
    days_in_stock_last_30 = models.IntegerField(null=True, default=0)

    class Meta:
        unique_together = ['nmid', 'lk', 'supplierarticle', 'warehousename']
        verbose_name_plural = "Отстаки товаров на складах"

    def __str__(self):
        return f"{self.supplierarticle} | {self.techsize} | {self.quantity} шт."
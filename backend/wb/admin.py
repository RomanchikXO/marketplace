from django.contrib import admin
from .models import Groups, WbLk, nmids, Stocks


@admin.register(Groups)
class GroupsAdmin(admin.ModelAdmin):
    list_display = ('name', 'permissions')


@admin.register(WbLk)
class WbLkAdmin(admin.ModelAdmin):
    list_display = ('name', 'groups', 'inn')


@admin.register(nmids)
class NmidsAdmin(admin.ModelAdmin):
    list_display = (
        'nmid', 'title', 'brand', 'vendorcode', 'subjectname', 'needkiz',
        'lk', 'created_at', 'updated_at', 'added_db'
    )
    list_filter = ('brand', 'subjectname', 'needkiz', 'lk')
    search_fields = ('nmid', 'vendorcode', 'title', 'brand', 'nmuuid')
    ordering = ('-added_db',)
    date_hierarchy = 'added_db'


@admin.register(Stocks)
class StocksAdmin(admin.ModelAdmin):
    list_display = (
        'supplierarticle', 'nmid', 'barcode',
        'quantity', 'inwaytoclient', 'inwayfromclient',
        'quantityfull', 'warehousename', 'lastchangedate',
        'isrealization',
    )
    list_filter = ('warehousename', 'issupply', 'isrealization')
    search_fields = ('supplierarticle', 'barcode', 'nmid')
    ordering = ('-lastchangedate',)
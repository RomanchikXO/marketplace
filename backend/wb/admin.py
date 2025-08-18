from django.contrib import admin
from .models import Groups, WbLk


@admin.register(Groups)
class GroupsAdmin(admin.ModelAdmin):
    list_display = ('name', 'permissions')


@admin.register(WbLk)
class WbLkAdmin(admin.ModelAdmin):
    list_display = ('name', 'groups', 'inn')
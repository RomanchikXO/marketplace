from django.contrib import admin
from .models import Groups


@admin.register(Groups)
class GroupsAdmin(admin.ModelAdmin):
    list_display = ('name', 'permissions')
# marketplace/backend/logger/admin.py

from django.contrib import admin
from .models import CeleryLog

class CeleryLogAdmin(admin.ModelAdmin):
    list_display = ('timestamp', 'source', 'level', 'message')
    list_filter = ('level', 'source', 'timestamp')
    search_fields = ('message',)


admin.site.register(CeleryLog, CeleryLogAdmin)
# marketplace/api/admin.py
from django.contrib import admin
from .models import FrontendUser


@admin.register(FrontendUser)
class FrontendUserAdmin(admin.ModelAdmin):
    list_display = ('nickname', 'email', 'phone', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('nickname', 'email', 'phone')
    readonly_fields = ('created_at',)

    fieldsets = (
        (None, {
            'fields': ('nickname', 'email', 'phone', 'is_active')
        }),
        ('Дополнительно', {
            'fields': ('created_at',),
        }),
    )

    def save_model(self, request, obj, form, change):
        # Если это новый пользователь, устанавливаем временный пароль
        if not change:
            obj.set_password('temp123')  # Временный пароль
        super().save_model(request, obj, form, change)
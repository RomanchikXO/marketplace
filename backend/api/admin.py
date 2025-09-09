# marketplace/api/admin.py
from django.contrib import admin
from django.contrib import messages
from .models import FrontendUser


@admin.action(description='Активировать выбранных пользователей')
def activate_users(modeladmin, request, queryset):
    updated = queryset.update(is_active=True)
    modeladmin.message_user(request, f'{updated} пользователей активировано.', messages.SUCCESS)


@admin.action(description='Деактивировать выбранных пользователей')
def deactivate_users(modeladmin, request, queryset):
    updated = queryset.update(is_active=False)
    modeladmin.message_user(request, f'{updated} пользователей деактивировано.', messages.SUCCESS)


@admin.register(FrontendUser)
class FrontendUserAdmin(admin.ModelAdmin):
    list_display = ('nickname', 'email', 'phone', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'wb_lks')
    search_fields = ('nickname', 'email', 'phone')
    readonly_fields = ('created_at',)
    filter_horizontal = ('wb_lks',)  # Для удобного управления связями many-to-many
    actions = [activate_users, deactivate_users]

    fieldsets = (
        ('Основная информация', {
            'fields': ('nickname', 'email', 'phone')
        }),
        ('Статус и доступ', {
            'fields': ('is_active',),
            'description': 'Активируйте пользователя для доступа к системе'
        }),
        ('WB Личные кабинеты', {
            'fields': ('wb_lks',),
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
    
    def get_readonly_fields(self, request, obj=None):
        # Поле created_at всегда только для чтения
        readonly_fields = ['created_at']
        return readonly_fields
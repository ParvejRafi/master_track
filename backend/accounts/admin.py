import secrets

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.template.response import TemplateResponse

from .models import InviteCode

User = get_user_model()


def generate_access_code() -> str:
    return secrets.token_urlsafe(9)


@admin.action(description='Generate new access code for selected users')
def generate_new_access_code(modeladmin, request, queryset):
    results = []
    for user in queryset:
        code = generate_access_code()
        user.set_password(code)
        user.save(update_fields=['password'])
        results.append({'username': user.username, 'email': user.email, 'code': code})
    context = {
        **modeladmin.admin_site.each_context(request),
        'results': results,
        'title': 'New access codes generated',
    }
    return TemplateResponse(request, 'accounts/new_access_codes.html', context)


class CustomUserAdmin(UserAdmin):
    actions = [generate_new_access_code]


admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(InviteCode)
class InviteCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'note', 'max_uses', 'used_count', 'expires_at', 'created_at']
    list_filter = ['expires_at', 'created_at']
    search_fields = ['code', 'note']
    readonly_fields = ['used_count', 'created_at']

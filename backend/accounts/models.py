from django.conf import settings
from django.db import models
from django.utils import timezone

class InviteCode(models.Model):
    code = models.CharField(max_length=64, unique=True)
    note = models.CharField(max_length=255, blank=True)
    max_uses = models.IntegerField(default=1)
    used_count = models.IntegerField(default=0)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self) -> bool:
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        if self.max_uses is not None and self.used_count >= self.max_uses:
            return False
        return True

    def __str__(self):
        return self.code


class NotificationSettings(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notification_settings'
    )
    email_reminders_enabled = models.BooleanField(default=True)
    remind_days_ahead = models.PositiveIntegerField(default=3)
    last_sent_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f'{self.user.username} notification settings'

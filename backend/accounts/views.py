from django.db import models, transaction
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import InviteCode, NotificationSettings
from .serializers import (
    EmailOrUsernameTokenObtainPairSerializer,
    NotificationSettingsSerializer,
    RegisterSerializer,
)


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'register'

    def create(self, request, *args, **kwargs):
        code = request.data.get('inviteCode')
        with transaction.atomic():
            try:
                invite = InviteCode.objects.select_for_update().get(code=code)
            except InviteCode.DoesNotExist:
                raise ValidationError({'inviteCode': ['Invalid invite code.']})
            if not invite.is_valid():
                raise ValidationError({'inviteCode': ['This code has expired or reached its use limit.']})

            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)

            invite.used_count = models.F('used_count') + 1
            invite.save(update_fields=['used_count'])

        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)


class EmailOrUsernameTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailOrUsernameTokenObtainPairSerializer


class NotificationSettingsView(generics.RetrieveUpdateAPIView):
    serializer_class = NotificationSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        obj, _ = NotificationSettings.objects.get_or_create(user=self.request.user)
        return obj

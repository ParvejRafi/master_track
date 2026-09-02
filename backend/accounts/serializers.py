from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import NotificationSettings

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    inviteCode = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'inviteCode']

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('That username is already taken.')
        return value

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('That email is already registered.')
        return value

    def create(self, validated_data):
        code = validated_data.pop('inviteCode')
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=code,
        )


class NotificationSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationSettings
        fields = ['email_reminders_enabled', 'remind_days_ahead', 'last_sent_at']
        read_only_fields = ['last_sent_at']

    def validate_remind_days_ahead(self, value):
        if value < 1 or value > 30:
            raise serializers.ValidationError('Must be between 1 and 30 days.')
        return value


class EmailOrUsernameTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        login = attrs.get(self.username_field)
        if login and '@' in login:
            try:
                user = User.objects.get(email__iexact=login)
                attrs[self.username_field] = user.username
            except User.DoesNotExist:
                pass
        return super().validate(attrs)

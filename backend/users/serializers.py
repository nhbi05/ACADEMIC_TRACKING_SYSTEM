from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Issue

User =get_user_model

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields=['username','email','password','role']

    def create(self,validated_data):
        user = User.objects.create_user(username=validated_data['username'],
        email=validated_data['email'],
        password=validated_data['password'],
        role=validated_data['role'])
        return user

class LoginSerializer(serializers.Serializer):
    username=serializers.CharField()
    password=serializers.CharField(write_only=True)

class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields ='__all__'        

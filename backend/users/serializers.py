
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import StudentProfile, LecturerProfile, RegistrarProfile
from .serializers import StudentProfileSerializer, LecturerProfileSerializer, RegistrarProfileSerializer

User =get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)
    student_profile = StudentProfileSerializer(required=False)
    lecturer_profile = LecturerProfileSerializer(required=False)
    registrar_profile = RegistrarProfileSerializer(required=False)

    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'role',
            'student_profile', 'lecturer_profile', 'registrar_profile'
        ]
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        return data

    def create(self, validated_data):
        password = validated_data.pop('password')
        password2 = validated_data.pop('password2')
        
        # Extract profile data based on role
        student_profile_data = validated_data.pop('student_profile', None)
        lecturer_profile_data = validated_data.pop('lecturer_profile', None)
        registrar_profile_data = validated_data.pop('registrar_profile', None)
        
        # Create user
        user = User.objects.create_user(
            password=password,
            **validated_data
        )
        
        # Create appropriate profile based on role
        if user.role == 'student' and student_profile_data:
            StudentProfile.objects.create(user=user, **student_profile_data)
        elif user.role == 'lecturer' and lecturer_profile_data:
            LecturerProfile.objects.create(user=user, **lecturer_profile_data)
        elif user.role == 'registrar' and registrar_profile_data:
            RegistrarProfile.objects.create(user=user, **registrar_profile_data)
            
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    loginType = serializers.CharField()

    
class IssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = Issue
        fields ='__all__'        

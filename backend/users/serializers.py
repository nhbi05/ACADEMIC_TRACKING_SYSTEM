# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import StudentProfile, LecturerProfile, RegistrarProfile, Issue
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import api_view, parser_classes
from rest_framework.response import Response
from rest_framework import status

# Get the custom User model
User = get_user_model(

# Serializer for the StudentProfile model
class StudentProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = StudentProfile  # Specify the model to serializers
        fields = ["first_name","last_name",'registration_no', 'programme',"student_no"]  # Fields to include in the serialized output
        #changed college and department to programme and student_no

# Serializer for the LecturerProfile model
class LecturerProfileSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user.id',read_only=True)
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    class Meta:
        model = LecturerProfile  # Specify the model to serialize
        fields = ["id","first_name","last_name",'department']  # Fields to include in the serialized output


class UserSerializer(serializers.ModelSerializer):
     class Meta:
         model = User
         fields = '__all__'

# Serializer for the RegistrarProfile model
class RegistrarProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)#his should appear in the profile as read only
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    class Meta:
        model = RegistrarProfile  # Specify the model to serialize
        fields = ["first_name","last_name",'college']  # Fields to include in the serialized output, removed the unnecessary fields like department

# Serializer for user registration, including profiles
class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)  
    student_profile = StudentProfileSerializer(required=False)  # Nested serializer for student profile
    lecturer_profile = LecturerProfileSerializer(required=False)  # Nested serializer for lecturer profile
    registrar_profile = RegistrarProfileSerializer(required=False)  # Nested serializer for registrar profile

    class Meta:
        model = User  # Specify the model to serialize
        fields = [
            'username', 'email', 'password', 'password2',
            'first_name', 'last_name', 'role',
            'student_profile', 'lecturer_profile', 'registrar_profile'
        ]
        extra_kwargs = {
            'password': {'write_only': True}  # Ensure password is write-only
        }

    # Validate the data before creating a user
    def validate(self, data):
        # Check if passwords match
        if data['password'] != data['password2']:
            raise serializers.ValidationError({'password': 'Passwords do not match'})
        
    #the profiles have to be made during registering if not an error should be raised
        role = data.get('role')

        if role == 'student' and 'student_profile' not in data:
            raise serializers.ValidationError({'student_profile': 'Student profile data is required for students'})
        
        if role == 'lecturer' and 'lecturer_profile' not in data:
            raise serializers.ValidationError({'lecturer_profile': 'Lecturer profile data is required for lecturers'})
        
        if role == 'registrar' and 'registrar_profile' not in data:
            raise serializers.ValidationError({'registrar_profile': 'Registrar profile data is required for registrars'})   
        return data

    # Create a new user and associated profile
    def create(self, validated_data):
        password = validated_data.pop('password')  # Extract password
        validated_data.pop('password2')  # Remove password confirmation from data
        
        # Extract profile data if available
        student_profile_data = validated_data.pop('student_profile', None)
        lecturer_profile_data = validated_data.pop('lecturer_profile', None)
        registrar_profile_data = validated_data.pop('registrar_profile', None)
        
        # Create the user with the provided data
        user = User.objects.create_user(
            password=password,
            **validated_data  # Unpack the remaining validated data
        )
        
        # Create associated profile based on user role
        if user.role == 'student':
            StudentProfile.objects.create(user=user, **student_profile_data)
        elif user.role == 'lecturer':
            LecturerProfile.objects.create(user=user, **lecturer_profile_data)
        elif user.role == 'registrar':
            RegistrarProfile.objects.create(user=user, **registrar_profile_data)
            
        return user  # Return the created user

# Serializer for user login
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=255)  # Username field changed from email
    password = serializers.CharField(write_only=True) 
    loginType = serializers.CharField(required=False)  

# Serializer for the Issue model
class IssueSerializer(serializers.ModelSerializer):
    # Auto-fetch student details from User and StudentProfile
    first_name = serializers.CharField(source='submitted_by.first_name', read_only=True)
    last_name = serializers.CharField(source='submitted_by.last_name', read_only=True)
    registration_no = serializers.CharField(source='submitted_by.student_profile.registration_no', read_only=True)
    student_no = serializers.CharField(source='submitted_by.student_profile.student_no', read_only=True)
    programme = serializers.CharField(source='submitted_by.student_profile.programme', read_only=True)


    class Meta:
        model = Issue
        fields = [
            'id', 'issue_id','category', 'status', 'description', "title",
            'year_of_study', 'semester', 'submitted_by', 'lecturer_name', 
            'created_at', 'resolved_at', 'first_name', 'last_name', 
            'registration_no', 'student_no',"title","course_unit","programme","attachments"
        ]
        read_only_fields = [
            'status', 'submitted_by', 'created_at', 'resolved_at', 
            'first_name', 'last_name', 'registration_no', 'student_no',"programme"
        ]  # These fields CANNOT be modified manually
   


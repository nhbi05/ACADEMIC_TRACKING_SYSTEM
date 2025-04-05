# users/serializers.py
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import StudentProfile, LecturerProfile, RegistrarProfile, Issue

# Get the custom User model
User = get_user_model()

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
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    class Meta:
        model = LecturerProfile  # Specify the model to serialize
        fields = ["first_name","last_name",'department']  # Fields to include in the serialized output

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
    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'description', 'category', 'status',
            'lecturer_name', 'semester', 'year_of_study', 'registration_no',
            'submitted_by', 'assigned_to', 'attachments', 
            'created_at', 
        ]
        read_only_fields = ['submitted_by', 'assigned_to', 'status', 'created_at']

class LecturerProfileSerializer(serializers.ModelSerializer):
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = LecturerProfile
        fields = ["first_name", "last_name", "department"]

        
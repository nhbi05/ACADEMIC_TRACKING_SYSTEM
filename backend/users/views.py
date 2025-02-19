from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Issue
from .serializers import RegisterSerializer,LoginSerializer,IssueSerializer
from django.contrib.auth import get_user_model
User = get_user_model()

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            login_type = serializer.validated_data['loginType']
            
            try:
                user = User.objects.get(email=email)
                if user.role != login_type:
                    return Response(
                        {'message': 'Please use the correct login type for your account'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if user.check_password(password):
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'token': str(refresh.access_token),
                        'user': {
                            'id': user.id,
                            'username': user.username,
                            'email': user.email,
                            'role': user.role,
                            'first_name': user.first_name,
                            'last_name': user.last_name
                        }
                    })
                
            except User.DoesNotExist:
                pass
            
            return Response(
                {'message': 'Invalid credentials'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SubmitIssueView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        if request.user.role !='student':
            return Response({'error':'Only students can submit issues'},
            status.status.HTTP_403_FORBIDDEN)
        
        serializer=IssueSerializer(data=request.data)
        if serializer .is_valid():
            serializer.save(submitted_by=request.user)
            return Response(serializer.data,status=status.HTTP_201_CREATED)
        Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)

class ResolveIssueView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request,issue_id):
        if request.user.role != 'lecturer':
            return Response({'error':'Only lecturers can resolve issue'},status=status.HTTP_403_FORBIDDEN)
        
        try:
            issue=Issue.objects.get(id=issue_id)
            request.user.resolve_issue(issue)
            return Response({'message':'Issue resolved successfully'},status=status.HTTP_200_OK)
        except Issue.DoesnotExist:
            return Response({'error':'Issue not found'},status=status.HTTP_404_NOT_FOUND)

class AssignIssueView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request,issue_id):
        if request.user.role !='registrar':
            return Response({'error':'Only Registrar can assign issues'},status=status.HTTP_403_FORBIDDEN)
            lecturer_id=request.data.get('lecturer_id')
            try:
                issue=Issue.objects.get(id=issue_id)
                lecturer=User.objects.get(id=lecturer_id)
                request.user.assign_issue(issue,lecturer)
                return Response({'message':'Issue assigned successfully'},status=status.HTTP_200_OK)
            
            except Issue.DoesnotExist:
                return Response({'error':'Issue not found'},status=status.HTTP_404_NOT_FOUND)
            
            except User.DoesnotExist:
                return Response({'error':'Lecturer not found'},status=status.HTTP_404_NOT_FOUND)





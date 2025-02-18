from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from .models import Issue
from .serializers import RegisterSerializer,LoginSerializer,IssueSerializer
from django.contrib.auth import get_user_model


# Create your views here.
@method_decorator(ensure_csrf_cookie, name='dispatch')
class CSRFTokenView(APIView):
    def get(self, request, format=None):
        return Response({'detail': 'CSRF cookie set'})
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created successfully", "user": serializer.data}, 
                status=status.HTTP_201_CREATED  
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self,request):
        serializer = LoginSerializer(data=request.data)
        if serializer .is_valid():
            username=serializer.validated_data['username']
            password = serializer.validated_data['password']
            user=authenticate(request, username=username,password=password)
            if user is not None:
                refresh=RefreshToken.for_user(user)
                return Response({
                    'refresh':str(refresh),
                    'access':str(refresh.access_token),
                    'user':{
                        'id':user.id,
                        'username':user.username,
                        'email':user.email,
                        'role':user.role,
                    }
                })
            else:
                return Response({'error':'Invalid Credentials'},status=status.HTTP_400_BAD_REQUEST)

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





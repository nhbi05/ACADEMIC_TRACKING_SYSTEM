from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
#from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from .models import Issue
from .serializers import RegisterSerializer, LoginSerializer, IssueSerializer,StudentProfileSerializer,LecturerProfileSerializer,RegistrarProfileSerializer
from django.contrib.auth import get_user_model

User = get_user_model()
"""changes made:I JUST DELETED THE CSRF TOKEN THING """
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        print(request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created successfully", "user": serializer.data}, 
                status=status.HTTP_201_CREATED
            )
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']  # Use username instead of email
            password = serializer.validated_data['password']
            login_type = serializer.validated_data.get('loginType')  # Use get() for optional field
            
            # Find user by username
            try:
                user = User.objects.get(username=username)  # Find user by username instead of email
                # Authenticate with username and password
                authenticated_user = authenticate(request, username=user.username, password=password)
                
                if authenticated_user is not None:
                    # Optional role check
                    if login_type and authenticated_user.role != login_type:
                        return Response({'error': 'Invalid role for this login type'}, 
                                       status=status.HTTP_403_FORBIDDEN)
                    
                    refresh = RefreshToken.for_user(authenticated_user)
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': {
                            'id': authenticated_user.id,
                            'username': authenticated_user.username,
                            'email': authenticated_user.email,
                            'role': authenticated_user.role,
                        }
                    })
                return Response({'error': 'Invalid password'}, status=status.HTTP_400_BAD_REQUEST)
            except User.DoesNotExist:
                return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class StudentProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.student_profile

# View for retrieving the lecturer profile
class LecturerProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = LecturerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.lecturer_profile

# View for retrieving the registrar profile
class RegistrarProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = RegistrarProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user.registrar_profile

class SubmitIssueView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.role != 'student':
            return Response(
                {'error': 'Only students can submit issues'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = IssueSerializer(data=request.data, context={'request':request})
        if serializer.is_valid():
            serializer.save(submitted_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResolveIssueView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, issue_id):
        if request.user.role != 'lecturer':
            return Response(
                {'error': 'Only lecturers can resolve issues'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            issue = Issue.objects.get(id=issue_id)
            request.user.resolve_issue(issue)
            return Response(
                {'message': 'Issue resolved successfully'},
                status=status.HTTP_200_OK
            )
        except Issue.DoesNotExist:  # Fixed typo in DoesNotExist
            return Response(
                {'error': 'Issue not found'},
                status=status.HTTP_404_NOT_FOUND
            )

class AssignIssueView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, issue_id):
        if request.user.role != 'registrar':
            return Response(
                {'error': 'Only Registrar can assign issues'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        lecturer_id = request.data.get('lecturer_id')
        if not lecturer_id:
            return Response(
                {'error': 'Lecturer ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
            
        try:
            issue = Issue.objects.get(id=issue_id)
            lecturer = User.objects.get(id=lecturer_id, role='lecturer')
            request.user.assign_issue(issue, lecturer)
            return Response(
                {'message': 'Issue assigned successfully'},
                status=status.HTTP_200_OK
            )
        except Issue.DoesNotExist:  # Fixed typo in DoesNotExist
            return Response(
                {'error': 'Issue not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except User.DoesNotExist:  # Fixed typo in DoesNotExist
            return Response(
                {'error': 'Lecturer not found'},
                status=status.HTTP_404_NOT_FOUND
            )

#functionality of the students dashboard
class StudentIssueView(generics.ListAPIView):
    serializer_class=IssueSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(student=self.request.user).order_by('created_at')

class ResolvedIssuesView(generics.ListAPIView):
    serializer_class=IssueSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(student=self.request.user,status='resolved')

class CreateIssueView(generics.CreateAPIView):
    serializer_class=IssueSerializer
    permission_classes=[IsAuthenticated]

    def perform_create(self,serializer):
        serializer.save(student=self.request.user)

class IssueDetailView(generics.RetrieveAPIView):
    queryset = Issue.objects.all()
    serializer_class=IssueSerializer
    permission_classes=[IsAuthenticated]

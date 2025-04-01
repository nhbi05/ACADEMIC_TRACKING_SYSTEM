from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.decorators import method_decorator
from .models import Issue
from .serializers import RegisterSerializer, LoginSerializer, IssueSerializer,StudentProfileSerializer,LecturerProfileSerializer,RegistrarProfileSerializer
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from django.db.models import Q


User = get_user_model()
class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                return Response(
                    {
                        "message": "User created successfully",
                        "user_id": user.id,
                        "username": user.username
                    },
                    status=status.HTTP_201_CREATED
                )
            except Exception as e:
                return Response(
                    {"error": str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
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
                            'first_name': authenticated_user.first_name,
                            'last_name': authenticated_user.last_name,
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

        request_data = request.data.copy()  # Copy data to avoid modifying the original request

        serializer = IssueSerializer(data=request_data, context={'request': request})
        if serializer.is_valid():
            # Save issue with status "pending" so the Registrar can review it
            serializer.save(submitted_by=request.user, status="pending")  
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
        return Issue.objects.filter(submitted_by=self.request.user).order_by('created_at')

class LecturerSearchView(generics.ListAPIView):
    
    #API endpoint for searching lecturers by name.
    
    serializer_class = LecturerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.GET.get('q', '')
        return User.objects.filter(
            Q(first_name__icontains=query) | Q(last_name__icontains=query),
            role='lecturer'
        )

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class ResolvedIssuesView(generics.ListAPIView):
    serializer_class=IssueSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(student=self.request.user,status='resolved')

class CreateIssueView(generics.CreateAPIView):
    serializer_class=IssueSerializer
    permission_classes=[IsAuthenticated]

    def perform_create(self,serializer):
        #O11 serializer.save(student=self.request.user)
        serializer.save()

class IssueDetailView(generics.RetrieveAPIView):
    queryset = Issue.objects.all()
    serializer_class=IssueSerializer
    permission_classes=[IsAuthenticated]


class IssueCountView(generics.ListAPIView):
    permission_classes=[IsAuthenticated]

    def list(self,request,*args,**kwargs):
        total_issues = Issue.objects.count()
        resolved_issues = Issue.objects.filter(status="resolved").count()
        pending_issues = Issue.objects.filter(status="pending").count()
        return Response({
            "total_issues":total_issues,
            "resolved_issues":resolved_issues,
            "pending_issues":pending_issues
        })
        

class LogoutView(APIView):
    permission_classes=[IsAuthenticated]
    def post(self,request):
        try:
            refresh_token=request.data.get('refresh')
            if not RefreshToken:
                return Response({'error': 'Refresh token is required'}, status=status.HTTP_400_BAD_REQUEST)
            token=RefreshToken(refresh_token)
            token.blacklist() #Blacklist the refresh token
            return Response({'message': 'Successfully logged out'}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


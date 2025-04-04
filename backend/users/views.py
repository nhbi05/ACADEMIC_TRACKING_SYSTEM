from email import message
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status,generics,filters
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.decorators import method_decorator
from .models import Issue,User
from .serializers import RegisterSerializer, LoginSerializer, IssueSerializer,StudentProfileSerializer,LecturerProfileSerializer,RegistrarProfileSerializer
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from django.core.mail import send_mail
from django.conf import settings


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

# Example views.py modification

class SubmitIssueView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        # Print the incoming request data
        print("Incoming request data:", request.data)

        serializer = IssueSerializer(data=request.data)
        
        if serializer.is_valid():
            print("Serializer validated data:", serializer.validated_data)  # Debugging

            serializer.validated_data['submitted_by'] = request.user
            
            # Check if registration_no is missing, then get it from the student's profile
            if not serializer.validated_data.get('registration_no') and hasattr(request.user, 'student_profile'):
                serializer.validated_data['registration_no'] = request.user.student_profile.registration_no

            # Save the issue
            issue = serializer.save()
            print("Created issue:", issue)  # Debugging

            return Response(
                IssueSerializer(issue).data,
                status=status.HTTP_201_CREATED
            )
        
        # Print validation errors if serializer is not valid
        print("Validation errors:", serializer.errors)  # Debugging

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

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
            #the lecturer resolves the issue calling the method from the user model
            request.user.resolve_issue(issue)
            #send an email notification to the student who submitted the issue
            student_user= issue.submitted_by
            if student_user and student_user.email:
               send_mail(
                    subject= "Your Issue has been resolved",
                    message=(f"Hello {student_user.first_name},your issue has been successfully resolved "),
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[student_user.email],
                    fail_silently=False,
                    
                    )

                
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
            #send email notification to lecturer
            if lecturer.email:
                send_mail(
                    subject= "New Issue Assigned",
                    message= f"Dear {lecturer.first_name}, you have been assigned a new issue from the registrar",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[lecturer.email],
                    fail_silently=False,
                    
                )
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



class ResolvedIssuesView(generics.ListAPIView):
    serializer_class=IssueSerializer
    permission_classes=[IsAuthenticated]

    def get_queryset(self):
        return Issue.objects.filter(student=self.request.user,status='resolved')


class IssueDetailView(generics.RetrieveAPIView):
    queryset = Issue.objects.all()
    serializer_class=IssueSerializer
    permission_classes=[IsAuthenticated]


class IssueCountView(generics.ListAPIView):
    permission_classes=[IsAuthenticated]

    def list(self,request):
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



#functionality for Registrar dashboard

class RegistrarIssueView(generics.ListAPIView):
    # API endpoint for registrar to view all submitted issues and filter all submitted issues
    
    serializer_class= IssueSerializer
    permission_classes= [IsAuthenticated]
    #Retrieves all issues for the registar
    def get_queryset(self):
        return Issue.objects.all().order_by('created_at')
    #filtering capabalities
    filter_backends= [DjangoFilterBackend,filters.SearchFilter]
    filterset_fields= ['status','category']

    # Method for registrars to assign issues to lecturers
    def assign_issue(self, issue, lecturer):
        # Only registrars can assign issues
        if self.role != 'registrar':
            raise PermissionError("Only Registrar can assign issues to lecturers")
        # Ensure the lecturer is of the correct role
        if lecturer.role != 'lecturer':
            raise ValueError("Issues can only be assigned to lecturers")
        # Assign the issue to the lecturer and update its status
        issue.assigned_to = lecturer
        issue.status = 'in_progress'
        issue.save()

     #viewing Issue statistics 
class RegisterCountView(generics.ListAPIView):
    permission_classes=[IsAuthenticated]

    def list(self,request):
        if request.user.role == "registrar":
            total_issues = Issue.objects.count()
            resolved_issues = Issue.objects.filter(status="resolved").count()
            pending_issues = Issue.objects.filter(status="pending").count()
            return Response({
            "total_issues":total_issues,
            "resolved_issues":resolved_issues,
            "pending_issues":pending_issues
        })
        
        
        



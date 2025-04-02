from django.urls import path
from .views import( RegisterView,
                   LoginView,
                   SubmitIssueView,
                   AssignIssueView,
                   ResolveIssueView,
                   StudentIssueView,
                   ResolvedIssuesView,
                   CreateIssueView,
                   IssueDetailView,
                   LecturerProfileView,
                   RegistrarProfileView,
                   StudentProfileView,
                   LogoutView,
                   IssueCountView
                   )
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,)




urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('student/profile/', StudentProfileView.as_view(), name='student_profile'),
    path('lecturer/profile/', LecturerProfileView.as_view(), name='lecturer_profile'),
    path('registrar/profile/', RegistrarProfileView.as_view(), name='registrar_profile'),
    path('submit-issue/', SubmitIssueView.as_view(), name='submit_issue'),
    path('resolve-issue/', ResolveIssueView.as_view(), name='resolve_issue'),
    path('assign-issue/<int:issue_id>/', AssignIssueView.as_view(), name='assign_issue'),
    path('my-issues/',StudentIssueView.as_view(),name='my-issues'),
    path('resolved-issues/',ResolvedIssuesView.as_view(),name='resolved-issues'),
    path('create-issue/',CreateIssueView.as_view(),name='create-issue'),
    path('issue/<int:pk>/',IssueDetailView.as_view(),name='issue-detail'),
    path('issue-count/', IssueCountView.as_view(), name='issue-count'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh')
]
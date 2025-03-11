from django.urls import path
from .views import RegisterView,LoginView,SubmitIssueView,AssignIssueView,ResolveIssueView,StudentIssueView,ResolvedIssuesView,CreateIssueView,IssueDetailView



urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('submit-issue/', SubmitIssueView.as_view(), name='submit_issue'),
    path('resolve-issue/', ResolveIssueView.as_view(), name='resolve_issue'),
    path('assign-issue/<int:issue_id>/', AssignIssueView.as_view(), name='assign_issue'),
    #path('api/csrf/', CSRFTokenView.as_view(), name='csrf-token'),
    path('my-issues/',StudentIssueView.as_view(),name='my-issues'),
    path('resolved-issues/',ResolvedIssuesView.as_view(),name='resolved-issues'),
    path('create-issue/',CreateIssueView.as_view(),name='create-issue'),
    path('issue/<int:pk>/',IssueDetailView.as_view(),name='issue-detail'),
]

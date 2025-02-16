from django.urls import path
from .views import RegisterView,LoginView,SubmitIssueView,AssignIssueView,ResolveIssueView


urlpatterns = [
    path('register/',RegisterView.as_view,name='register'),
    path('login/',LoginView.as_view,name='login'),
    path('submit-issue/',SubmitIssueView.as_view,name='submit_issue'),
    path('resolve-issue/',ResolveIssueView.as_view,name='resolve_issue'),
    path('assign-issue/<int:issue_id>/',AssignIssueView.as_view,name='assign_issue'),
    

    
    

]
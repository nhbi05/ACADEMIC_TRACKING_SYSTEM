from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.auth import get_user_model
from django.utils import timezone

#User = get_user_model()

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES=[
        ('student','Student'),
        ('lecturer','Lecture'),
        ('registar','Registar'),
    ]
    role = models.CharField(max_length=10,choices=ROLE_CHOICES)

    def submit_issue(self,category,description):
        if self.role != 'student':
            raise PermissionError("Only students can submit issues")
        return Issue.objects.create(
            category = category,
            status = 'open',
            description = description,
            submitted_by = self
        )

    def assign_issue(self,issue,lecturer):
        if role != 'lecturer':
            raise PermissionError("Only Registrar can assign issues to lectures")
        issue.assigned_to = lecturer
        issue.save()
    
            
    def resolve_issue(self,issue):
        if self.role != 'lecturer':
            raise PermissionError("Only lecturers can resolve issues")
        issue.status = 'resolved'
        issue.save()



class Issue(models.Model):
    STATUS_CHOICES = [
        ('open','Open'),
        ('in_progress','In Progress'),
        ('resolved','Resolved'),
    ]
    id = models.AutoField(primary_key=True)
    category = models.CharField(max_length=100)
    status = models.CharField(max_length=20,choices=STATUS_CHOICES,default='open')
    description = models.TextField()
    submitted_by = models.ForeignKey(User,null=True,on_delete=models.CASCADE,related_name="submitted_issues")
    assigned_to = models.ForeignKey(User,null=True,blank=True,on_delete=models.SET_NULL,related_name="assigned_issues")

    def __str__(self):
        return f"Issue {self.id} - {self.category} ({self.status})"

    def submit_issue(self):
        self.status ='open'
        self.save()

    def update_issue(self,new_status):
        self.status = new_status
        self.save()

class Notification(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User,on_delete=models.CASCADE)
    message = models.TextField()
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Notification for {self.user.name}: {self.message} "



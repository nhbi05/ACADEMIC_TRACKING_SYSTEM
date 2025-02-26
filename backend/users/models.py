# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    # Choices for user roles
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('registrar', 'Registrar'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)

    # Method for students to submit issues
    def submit_issue(self, category, description):
        # Only students are allowed to submit issues
        if self.role != 'student':
            raise PermissionError("Only students can submit issues")
        # Create and return a new Issue object
        return Issue.objects.create(
            category=category,
            status='open',
            description=description,
            submitted_by=self  # Set the user who submitted the issue
        )

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

    # Method for lecturers to resolve assigned issues
    def resolve_issue(self, issue):
        if self.role != 'lecturer':
            raise PermissionError("Only lecturers can resolve issues")
        if issue.assigned_to != self:
            raise PermissionError("You can only resolve issues assigned to you")
        issue.status = 'resolved'
        issue.resolved_at = timezone.now()
        issue.save()

# Profile model for students, linked to the User model
class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=50)  # Unique student identifier
    college = models.CharField(max_length=100)  # College name
    department = models.CharField(max_length=100)  # Department name
    # year_level = models.IntegerField()  

# Profile model for lecturers, linked to the User model
class LecturerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lecturer_profile')
    department = models.CharField(max_length=100)  # Department name

"""Changes made here commented out office number and specialisation"""
    # office_number = models.CharField(max_length=50)  
    # specialization = models.CharField(max_length=100) 

"""Changes made here commented out office location"""
# Profile model for registrars, linked to the User model
class RegistrarProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='registrar_profile')
    college = models.CharField(max_length=100)  # College name
    # office_location = models.CharField(max_length=100) 
     
# Model for issues submitted by users
class Issue(models.Model):
    # Choices for issue status
    STATUS_CHOICES = [
        ('pending', 'pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]
    
    category = models.CharField(max_length=100)  
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending') 
    description = models.TextField()  
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="submitted_issues")  
    assigned_to = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_issues") 
    created_at = models.DateTimeField(auto_now_add=True) 
    resolved_at = models.DateTimeField(null=True, blank=True)  
    
    def __str__(self):
        # String representation of the issue
        return f"Issue {self.id} - {self.category} ({self.status})"

# Model for notifications related to users
class Notification(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)  # User to whom the notification belongs
    message = models.TextField()  # Notification message
    created_at = models.DateTimeField(auto_now_add=True)  # Timestamp when the notification was created

    def __str__(self):
        # String representation of the notification
        return f"Notification for {self.user.username}: {self.message}"
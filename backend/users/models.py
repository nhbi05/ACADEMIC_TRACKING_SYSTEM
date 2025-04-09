# users/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.contrib.auth import get_user_model




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
    def submit_issue(self, category, description,course_unit,semester,year_of_study):
        # Only students are allowed to submit issues
        if self.role != 'student':
            raise PermissionError("Only students can submit issues")
        # Create and return a new Issue object
        return Issue.objects.create(
            category=category,
            status='pending',
            description=description,
            course_unit = course_unit,
            semester = semester,
            year_of_study = year_of_study,
            submitted_by=self  # Set the user who submitted the issue
        )

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
"""SO HERE I JUST CHANGED STUDENT_ID TO NO N THEN ALSO REGISTRATION NO"""
class StudentProfile(models.Model):
    PROGRAMME_CHOICES =[
        ('BSCS','Bachelor of Science in Computer Science'),
        ('BSSE','Bachelor of Science in Software Engineering'),
        ('BIT','Bachelor of Information Systems & Technology'),
        ('BLIS','Bachelor of Library & Information Systems'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    registration_no = models.CharField(max_length=50,unique=True)  # Unique student identifier
    student_no =models.CharField(max_length=50,unique=True) 
    programme = models.CharField(max_length=100,choices=PROGRAMME_CHOICES)  # Programme name
    


class Department(models.Model):
   # department_id=models.IntegerField(primary_key=True)
    name= models.CharField(max_length=100)


# Profile model for lecturers, linked to the User model
class LecturerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='lecturer_profile')
    department = models.ForeignKey(Department,on_delete=models.SET_NULL,null=True,blank=True,related_name='lecturer_profile')  # Department name


# Profile model for registrars, linked to the User model
class RegistrarProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='registrar_profile')
    college = models.CharField(max_length=100)  # College name
     
# Model for issues submitted by users
class Issue(models.Model):
    # Choices for issue status
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]
    #the choices for the issue category
    CATEGORY_CHOICES=[
        ('missing_marks','Missing Marks'),
        ('appeal','Appeal'),
        ('correction','Correction'),
        ('others','Others'),
    ]
    # New choices for year of study 
    YEAR_OF_STUDY =[
        ( 1 , '1'),
        ( 2, '2'),
        ( 3,'3'),
        ( 4, '4'),
    ]
    # New choices for semester
    SEMESTER_OF_STUDY = [
        ('Semester 1', 'Semester 1'),
        ('Semester 2' , 'Semester 2'),
        
    ]
    issue_id = models.CharField(max_length=20, unique=True, editable=False)
    #Student_no = models.IntegerField()
    registration_no = models.CharField(max_length = 20)
    category = models.CharField(max_length=100,choices=CATEGORY_CHOICES)  
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending') 
    description = models.TextField() 
    course_unit = models.TextField(max_length=100) 
    year_of_study = models.IntegerField( choices= YEAR_OF_STUDY)
    semester = models.CharField(max_length=20, choices= SEMESTER_OF_STUDY)
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="submitted_issues")  
    assigned_to = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name="assigned_issues") 
    created_at = models.DateTimeField(auto_now_add=True) 
    resolved_at = models.DateTimeField(null=True, blank=True) 
    lecturer_name = models.CharField(max_length=255) 
    title = models.CharField(max_length=255) 
    attachments = models.FileField(upload_to="issue_attachments/", blank=True, null=True)


    def __str__(self):
        # String representation of the issue
        return f"Issue {self.id} - {self.category} ({self.status})"

    #creating an automatic issue_id eg. ISS0001
    def save(self, *args, **kwargs):
        if not self.issue_id:
            last_issue = Issue.objects.order_by('-id').first() #checks last issue once created
            if last_issue and last_issue.issue_id:
                last_number = int(last_issue.issue_id.replace('ISS', ''))
                new_number = last_number + 1
            else:
                new_number = 1
            self.issue_id = f'ISS{new_number:04d}'
        super().save(*args, **kwargs)



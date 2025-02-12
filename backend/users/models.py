from django.db import models

# Create your models here.
class User(models.Model):
    ROLE_CHOICES=[
        ('student','Student'),
        ('lecturer','Lecture'),
        ('registar','Registar'),
    ]
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=10,choices=ROLE_CHOICES)

    def __str__(self):
        return self.name

class Student(User):
    def submit_issue(self,category,description):
        return Issue.objects.create(
            category = category,
            #status='open',
            description = description,
            submitted_by = self

        )

class Lecturer(User):
    def resolve_issue(self,issue,lecturer):
        issue.status = 'resolved'
        issue.save()

class Registrar(User):
    def assign_issue(self,issue,lecturer):
        issue.assigned_to = lecturer
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
    submitted_by = models.ForeignKey(Student,null=True,on_delete=models.CASCADE)
    assigned_to = models.ForeignKey(Lecturer,null=True,blank=True,on_delete=models.SET_NULL)

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
    message = models.TextField

    def __str__(self):
        return f"Notification for {self.user.name}: {self.message} "



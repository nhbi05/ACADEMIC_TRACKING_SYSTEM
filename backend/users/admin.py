from django.contrib import admin
from .models import User, Issue, Notification

# Register your models here.
admin.site.register(User)
admin.site.register(Issue)
admin.site.register(Notification)


# Generated by Django 5.0.1 on 2025-04-01 15:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0004_alter_issue_reg_no'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='issue',
            name='assigned_to',
        ),
        migrations.AddField(
            model_name='issue',
            name='Name_of_Lecturer',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]

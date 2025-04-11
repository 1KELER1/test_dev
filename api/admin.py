from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from api.models import User, Team, Project, Task, Note, Group, Objectives, Notification

# Create a custom UserAdmin that extends Django's built-in UserAdmin
class CustomUserAdmin(UserAdmin):
    # Keep the standard UserAdmin fields and functionality
    list_display = ('username', 'email', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('description',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('email', 'description',)}),
    )

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at')
    search_fields = ('name', 'description')
    
    def get_model_perms(self, request):
        perms = super().get_model_perms(request)
        perms.update({
            'add_team_text': 'Добавить команду',
            'list_team_text': 'Команда',
            'plural_team_text': 'Команды'
        })
        return perms

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'project', 'created_at')
    search_fields = ('name', 'description')

    def get_model_perms(self, request):
        perms = super().get_model_perms(request)
        perms.update({
            'add_note_text': 'Добавить заметку',
            'list_note_text': 'Заметка',
            'plural_note_text': 'Заметки'
        })
        return perms

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'project', 'deadline', 'created_at')
    search_fields = ('name', 'description')

    def get_model_perms(self, request):
        perms = super().get_model_perms(request)
        perms.update({
            'add_task_text': 'Добавить задачу',
            'list_task_text': 'Задача',
            'plural_task_text': 'Задачи'
        })
        return perms

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'team', 'created_at')
    search_fields = ('name', 'description')

    def get_model_perms(self, request):
        perms = super().get_model_perms(request)
        perms.update({
            'add_project_text': 'Добавить проект',
            'list_project_text': 'Проект',
            'plural_project_text': 'Проекты'
        })
        return perms

@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ('name', 'project')
    search_fields = ('name',)

    def get_model_perms(self, request):
        perms = super().get_model_perms(request)
        perms.update({
            'add_group_text': 'Добавить группу',
            'list_group_text': 'Группа',
            'plural_group_text': 'Группы'
        })
        return perms

@admin.register(Objectives)
class ObjectivesAdmin(admin.ModelAdmin):
    list_display = ('name', 'completed', 'task', 'created_at')
    search_fields = ('name',)

    def get_model_perms(self, request):
        perms = super().get_model_perms(request)
        perms.update({
            'add_objectives_text': 'Добавить цель',
            'list_objectives_text': 'Цель',
            'plural_objectives_text': 'Цели'
        })
        return perms

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'message')
    search_fields = ('message',)

    def get_model_perms(self, request):
        perms = super().get_model_perms(request)
        perms.update({
            'add_notification_text': 'Добавить уведомление',
            'list_notification_text': 'Уведомление',
            'plural_notification_text': 'Уведомления'
        })
        return perms

# Register User model with CustomUserAdmin
admin.site.register(User, CustomUserAdmin)
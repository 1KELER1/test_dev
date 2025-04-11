from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

#import slugify
from django.utils.text import slugify

class User(AbstractUser):
      '''
      Basic User model with email as username
      '''
      description = models.TextField(verbose_name='Описание')

      class Meta:
          verbose_name = 'Пользователь'
          verbose_name_plural = 'Пользователи'

      def __str__(self):
          return self.username


class Team(models.Model):
    '''
    Team is owned by a user and is consist of projects and members.
    User can invite other user to collabrate on a team.
    '''
    name = models.CharField(max_length=100, verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='team_owner', verbose_name='Владелец')
    members = models.ManyToManyField(User, related_name='team_members', verbose_name='Участники')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='URL')

    class Meta:
        verbose_name = 'Команда'
        verbose_name_plural = 'Команды'

    @property
    def verbose_name_add(self):
        return 'команду'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            # Generate the initial slug from the name
            self.slug = slugify(self.name)

            # Если slug пустой (например, содержит только русские буквы)
            if not self.slug:
                # Используем первые символы имени + UUID
                import uuid

                # Создаем безопасный идентификатор из имени + uuid
                name_prefix = ""
                if self.name:
                    # Используем первые N символов имени (в ASCII кодировке)
                    name_bytes = self.name.encode('ascii', 'ignore')
                    name_prefix = name_bytes.decode('ascii')[:3]

                    # Если префикс пустой, используем только UUID
                    if not name_prefix:
                        name_prefix = ""

                unique_id = str(uuid.uuid4())[:8]
                self.slug = f"{name_prefix}{unique_id}" if name_prefix else unique_id

                # Делаем slug безопасным через slugify
                self.slug = slugify(self.slug)

            # Check for uniqueness and handle duplicates
            base_slug = self.slug
            suffix = 1
            while Team.objects.filter(slug=self.slug).exists():
                # If a duplicate slug exists, append a unique identifier to it
                self.slug = f"{base_slug}-{suffix}"
                suffix += 1

        super(Team, self).save(*args, **kwargs)


class Project(models.Model):
    '''
    Project is owned by a team and is consist of tasks and notes
    Team member have access to project.

    strucutre:
    Team-
        Project=[Task1,Task2,Note1,Note2]
    '''
    name = models.CharField(max_length=100, verbose_name='Название')
    description = models.TextField(verbose_name='Описание')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='project_team', verbose_name='Команда')
    tasks = models.ManyToManyField('Task', related_name='project_tasks', blank=True, verbose_name='Задачи')
    notes = models.ManyToManyField('Note', related_name='project_notes', blank=True, verbose_name='Заметки')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    slug = models.SlugField(max_length=100, unique=True, verbose_name='URL')
    
    class Meta:
        verbose_name = 'Проект'
        verbose_name_plural = 'Проекты'

    @property
    def verbose_name_add(self):
        return 'проект'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            # Проверяем, содержит ли имя валидные символы для slug
            from django.utils.text import slugify
            slug = slugify(self.name)

            if not slug:
                # Если slugify вернул пустую строку, используем uuid как запасной вариант
                import uuid
                slug = str(uuid.uuid4())[:8]

            # Проверяем уникальность slug
            suffix = 1
            original_slug = slug
            # Здесь была ошибка: проверка уникальности в неправильной модели
            # Было: while Team.objects.filter(slug=slug).exists():
            while Project.objects.filter(slug=slug).exists():
                slug = f"{original_slug}-{suffix}"
                suffix += 1

            self.slug = slug

        super().save(*args, **kwargs)


class Task(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_owner', verbose_name='Владелец')
    description = models.CharField(max_length=500, verbose_name='Описание')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='task_project', verbose_name='Проект')
    group = models.ForeignKey('Group', on_delete=models.CASCADE, related_name='task_group', null=True, blank=True, verbose_name='Группа')
    objectives = models.ManyToManyField('Objectives', related_name='task_objectives', blank=True, verbose_name='Цели')
    deadline = models.DateTimeField(null=True, blank=True, verbose_name='Срок выполнения')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        verbose_name = 'Задача'
        verbose_name_plural = 'Задачи'

    @property
    def verbose_name_add(self):
        return 'задачу'

    def __str__(self):
        return self.name
    
class Note(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='note_owner', verbose_name='Владелец')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='note_project', verbose_name='Проект')
    group = models.ForeignKey('Group', on_delete=models.CASCADE, related_name='note_group', null=True, blank=True, verbose_name='Группа')
    description = models.TextField(verbose_name='Описание')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        verbose_name = 'Заметка'
        verbose_name_plural = 'Заметки'

    @property
    def verbose_name_add(self):
        return 'заметку'

    def __str__(self):
        return self.name

class Group(models.Model):
    '''
    Will be used to group Notes and Tasks
    for example: Progress, Backlog, Completed or any other group user wish to name.
    strucutre:
    Team-
        Project-
            Group=[Task1,Task2,Note1,Note2]
    '''
    name = models.CharField(max_length=100, verbose_name='Название')
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='group_project', verbose_name='Проект')
    
    class Meta:
        verbose_name = 'Группа'
        verbose_name_plural = 'Группы'

    @property
    def verbose_name_add(self):
        return 'группу'

    def __str__(self):
        return self.name
    
class Objectives(models.Model):
    '''
    used as single objective for a task

    strucutre:
    Task=[Objective1,Objective2,objective3,Objective4]
    '''
    name = models.CharField(max_length=100, verbose_name='Название')
    completed = models.BooleanField(default=False, verbose_name='Выполнено')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='objective_task', null=True, blank=True, verbose_name='Задача')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    class Meta:
        verbose_name = 'Цель'
        verbose_name_plural = 'Цели'

    @property
    def verbose_name_add(self):
        return 'цель'

    def __str__(self):
        return self.name

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('invitation', 'Приглашение в команду'),
        ('system', 'Системное уведомление'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    message = models.CharField(max_length=250, verbose_name='Сообщение')
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES, default='system', verbose_name='Тип уведомления')
    team = models.ForeignKey(Team, on_delete=models.CASCADE, null=True, blank=True, verbose_name='Команда')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    is_read = models.BooleanField(default=False, verbose_name='Прочитано')

    class Meta:
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'
        ordering = ['-created_at']

    @property
    def verbose_name_add(self):
        return 'уведомление'

    def __str__(self):
        return f"Уведомление для {self.user}"
    
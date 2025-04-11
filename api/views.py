import json
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse,Http404
from api.serializers import MyTokenObtainPairSerializer, RegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.views import APIView
from django.views.generic import TemplateView
from django.db.models import Q

#3rd party imports
from ipware import get_client_ip


#project imports
from api.version import version as api_version
from api.models import Team, Project, Task,Note, Notification
from api.serializers import (
                                TeamSerializer, 
                                ProjectSerializer,
                                UserSerializer,
                                ProjectOperationSerializer,
                                TeamOperationSerializer,
                                TaskSerializer,
                                TaskOperationSerializer,
                                NoteSerializer,
                                NoteOperationSerializer,
                                NotificationSerializer
                            )
from api.permissions import IsMember, IsOwner
#from api.urls import urlpatterns


User=get_user_model()


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

#api docs
class DocsView(TemplateView):
    template_name = 'api/docs.html'
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["api_version"] = api_version
        return context
    
#this will return all the routes available in the api
@api_view(['GET'])
def getRoutes(request):
    routes = [

        '/api/',
        '/api/token/',
        '/api/register/',
        '/api/token/refresh/',
        '/api/test/',
        '/api/docs/',
        '/api/teams/',
        '/api/projects/',
        '/api/profile/',
    ]
    # for urls in urlpatterns:
    #     routes.append(urls.pattern._route)

    return Response(routes)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def testEndPoint(request):
    if request.method == 'GET':
        data = f"Congratulation {request.user}, your API just responded to GET request"
        return Response({'response': data}, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        try:
            body = request.body.decode('utf-8')
            data = json.loads(body)
            if 'text' not in data:
                return Response("Invalid JSON data", status.HTTP_400_BAD_REQUEST)
            text = data.get('text')
            data = f'Congratulation your API just responded to POST request with text: {text}'
            return Response({'response': data}, status=status.HTTP_200_OK)
        except json.JSONDecodeError:
            return Response("Invalid JSON data", status.HTTP_400_BAD_REQUEST)
    return Response("Invalid JSON data", status.HTTP_400_BAD_REQUEST)


class TeamCreateAndListAPIView(APIView):
    '''
    Get query can only be allowed to user with member or owner level permission.
    Post can be done by anyone.
    '''
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        permission_classes = [IsAuthenticated]

        team_own = Team.objects.filter(owner=request.user)
        team_member = Team.objects.filter(members=request.user)

        serializer_own = TeamSerializer(team_own, many=True)
        serializer_member = TeamSerializer(team_member, many=True)

        return Response(
            {'own': serializer_own.data,
             'member': serializer_member.data,
             })

    def post(self, request, format=None):
        # This is for creating a new team
        serializer = TeamOperationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProjectCreateAndListAPIView(APIView):
    '''
    This class can be accessed with anyone with member level permission.
    '''
    permission_classes = [IsAuthenticated]

    def get (self,request,format=None):
        project_own=Project.objects.filter(team__owner=request.user)
        project_member=Project.objects.filter(team__members=request.user)

        serializer_own=ProjectSerializer(project_own,many=True)
        serializer_member=ProjectSerializer(project_member,many=True)

        return Response(
                        {'own_project':serializer_own.data,
                         'member_project':serializer_member.data,
                        })
    
    #Handle creation of project, Team is required
    #user need to pass the name of team in team field
    def post(self, request,slug, format=None):
        try:
            team=Team.objects.get(slug=slug)
        except Team.DoesNotExist:
            return Response("Team doesn't exist",status=status.HTTP_400_BAD_REQUEST)
        if IsOwner(request,team).has_permission or IsMember(request,team).has_permission:
            serializer = ProjectSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response("You don't have permission to create project in this team",
                        status=status.HTTP_400_BAD_REQUEST)


class TeamDetailView(APIView):
    '''
    Every team has a unique slug, this slug is used to get the team detail.
    This whole class will need authentication+ access permission.
    Other user(member) can only access get method. all other function require
    owner permission.
    '''

    def get_object(self, slug):
        #Object permission will be defined here

        try:
            team=Team.objects.get(slug=slug)
            if IsOwner(self.request,team).has_permission or IsMember(self.request,team).has_permission:
                return team
            raise Http404
        except Team.DoesNotExist:
            raise Http404
    
    #this 'get' will return the team detail
    # It will also include members and  all project owned by this team.
    def get(self, request, slug, format=None):
        team = self.get_object(slug)
        serializer_projects=ProjectSerializer(team.project_team.all(),many=True)
        serializer_team = TeamSerializer(team)
        return Response({'team':serializer_team.data,
                        'projects':serializer_projects.data}
                        ,status=status.HTTP_200_OK)

    
    def put(self, request, slug, format=None):
        team = self.get_object(slug=slug)
        serializer = TeamOperationSerializer(team, data=request.data)
        #read serializer update function for more info
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def post(self, request,slug, format=None):
        try:
            team=Team.objects.get(slug=slug)
        except Team.DoesNotExist:
            return Response("Team doesn't exist",status=status.HTTP_400_BAD_REQUEST)
        if IsOwner(request,team).has_permission or IsMember(request,team).has_permission:
            serializer = ProjectOperationSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(team=team)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response("You don't have permission to create project in this team",
                        status=status.HTTP_400_BAD_REQUEST)
    
    
    def delete(self, request, slug, format=None):
        team = self.get_object(slug=slug)
        team_name = team.name
        # Создаем уведомления для всех участников о удалении команды
        for member in team.members.all():
            Notification.objects.create(
                user=member,
                message=f"Команда {team_name} была удалена",
                type='system'
            )
        
        team.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    

class ProjectDetailView(APIView):
    '''
    All method except delete can be accessed by any member of team..
    '''

    permission_classes=[IsAuthenticated]

    
    def get_object(self,slug,pk):
        try:
            project= Project.objects.get(id=pk)
            #get the team of ptoject
            team=Team.objects.get(slug=slug)
            if IsOwner(self.request,team).has_permission or IsMember(self.request,team).has_permission:
                return project
            raise Http404
        except Project.DoesNotExist:
            raise Http404
    
    #get  query need to return  notes and tasks of entire project
    def get(self, request,slug,pk, format=None):
        project = self.get_object(slug,pk)
        #add task and notes of  team
        #will avoid this as task and notes already got in many to many field
        tasks = 1
        notes = 1
        serializer = ProjectSerializer(project)
        return Response(serializer.data)

    def put(self, request, slug, pk, format=None):
        project = self.get_object(slug, pk)
        serializer = ProjectSerializer(project, data=request.data)
        if serializer.is_valid():
            serializer.save(owner=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug, pk, format=None):
        project = self.get_object(slug, pk)
        project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class UserProfileAPIView(APIView):
    '''
    This class will return the user profile detail and teams owned by user.
    User can update the profile(change username or email).
    '''

    permission_classes = [IsAuthenticated]

    def get(self,request,format=None):
        profile=User.objects.get(username=request.user)
        serializer_profile=UserSerializer(profile)
        team_own=Team.objects.filter(owner=request.user)
        serializer_own=TeamSerializer(team_own,many=True)
        return Response({
                        'profile':serializer_profile.data,
                        'teams':serializer_own.data}
                        ,status=status.HTTP_200_OK)
        
    
    def put(self,request,format=None):
        user=request.user
        serializer=UserSerializer(user,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    
class AddTeamMemberAPIView(APIView):
    '''
    This class will add member to team.
    '''
    permission_classes = [IsAuthenticated]

    def get_object(self, slug):
        try:
            team=Team.objects.get(slug=slug)
            if IsOwner(self.request,team).has_permission:
                return team
            raise Http404
        except Team.DoesNotExist:
            raise Http404
    
    def post(self,request,slug,format=None):
        team=self.get_object(slug)
        try:
            user=User.objects.get(username=request.data['username'])
        except User.DoesNotExist:
            return Response("User doesn't exist",status=status.HTTP_400_BAD_REQUEST)
        
        # Проверяем, существует ли уже приглашение для этого пользователя в эту команду
        existing_invitation = Notification.objects.filter(
            user=user,
            team=team,
            type='invitation'
        ).exists()
        
        # Проверяем, не является ли пользователь уже членом команды
        is_already_member = team.members.filter(id=user.id).exists()
        
        if is_already_member:
            return Response({"message": "Пользователь уже является участником команды"}, status=status.HTTP_400_BAD_REQUEST)
        
        if existing_invitation:
            return Response({"message": "Приглашение уже было отправлено этому пользователю"}, status=status.HTTP_200_OK)
        
        # Создаем уведомление только если пользователь не в команде и приглашения ещё нет
        Notification.objects.create(
            user=user,
            message=f"Вас пригласили в команду {team.name}",
            type='invitation',
            team=team
        )
        
        return Response({"message": "Приглашение отправлено"}, status=status.HTTP_200_OK)
    
    def delete(self,request,slug,format=None):
        team=self.get_object(slug)
        try:
            user=User.objects.get(username=request.data['username'])
        except User.DoesNotExist:
            return Response("User doesn't exist",status=status.HTTP_400_BAD_REQUEST)
        team.members.remove(user)
        
        # Создаем уведомление для пользователя об удалении из команды
        Notification.objects.create(
            user=user,
            message=f"Вы были удалены из команды {team.name}",
            type='system'
        )
        
        return Response(status=status.HTTP_200_OK)
    

class TaskAPIView(APIView):
    '''
    User send post request on this view with slug and pk.
    '''

    permission_classes = [IsAuthenticated]

    def post(self, request, slug, pk):
        try:
            team = Team.objects.get(slug=slug)
            project = Project.objects.get(id=pk)
        except Exception as e:
            return Response("Team/project doesn't exist or you don't have access to it!", status=status.HTTP_400_BAD_REQUEST)
        if IsOwner(self.request, team).has_permission or IsMember(self.request, team).has_permission:
            serializer = TaskOperationSerializer(data=request.data)
            if serializer.is_valid():
                task = serializer.save(owner=request.user)
                project.tasks.add(task)
                
                # Создаем уведомления для всех участников команды о создании новой задачи
                for member in team.members.all():
                    if member != request.user:  # Не отправляем уведомление создателю задачи
                        Notification.objects.create(
                            user=member,
                            message=f"Создана новая задача '{task.name}' в проекте {project.name}",
                            type='system',
                            team=team
                        )
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response("Team/project doesn't exist or you don't have access to it!", status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug, pk, task_id, format=None):
        try:
            # Получаем команду и проект
            team = Team.objects.get(slug=slug)
            project = Project.objects.get(id=pk)
            task = Task.objects.get(id=task_id, project=project)  # Получаем задачу, привязанную к проекту
        except Team.DoesNotExist:
            return Response("Team doesn't exist", status=status.HTTP_400_BAD_REQUEST)
        except Project.DoesNotExist:
            return Response("Project doesn't exist", status=status.HTTP_400_BAD_REQUEST)
        except Task.DoesNotExist:
            return Response("Task doesn't exist in this project", status=status.HTTP_404_NOT_FOUND)

        # Проверяем права пользователя
        if IsOwner(self.request, team).has_permission or IsMember(self.request, team).has_permission:
            if task.owner == request.user:
                task.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response("You do not have permission to delete this task.", status=status.HTTP_403_FORBIDDEN)

        return Response("Access denied", status=status.HTTP_403_FORBIDDEN)



        


class NoteAPIView(APIView):

    permission_classes=[IsAuthenticated]
    
    def post(self,request,slug,pk):
        try: 
            team=Team.objects.get(slug=slug)
            project=Project.objects.get(id=pk)
        except Exception as e:
            return Response("Team/project doesn't exist or you don't have access to it!",status=status.HTTP_400_BAD_REQUEST)
        if IsOwner(self.request,team).has_permission or IsMember(self.request,team).has_permission:
            serializer=NoteOperationSerializer(data=request.data) 
            if serializer.is_valid():
                note=serializer.save(owner=request.user)
                project.notes.add(note)
                
                # Создаем уведомления для всех участников команды о создании новой заметки
                for member in team.members.all():
                    if member != request.user:  # Не отправляем уведомление создателю заметки
                        Notification.objects.create(
                            user=member,
                            message=f"Создана новая заметка '{note.name}' в проекте {project.name}",
                            type='system',
                            team=team
                        )
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response("Team/project doesn't exist or you don't have access to it!",status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug, pk, note_id, format=None):
        try:
            team = Team.objects.get(slug=slug)
            note = Note.objects.get(id=note_id)
        except Team.DoesNotExist:
            return Response("Team doesn't exist", status=status.HTTP_400_BAD_REQUEST)
        except Note.DoesNotExist:
            return Response("Note doesn't exist", status=status.HTTP_404_NOT_FOUND)

        if IsOwner(self.request, team).has_permission or IsMember(self.request, team).has_permission:
            if note.owner == request.user:
                note.delete()
                return Response(status=status.HTTP_204_NO_CONTENT)
            else:
                return Response("You do not have permission to delete this note.", status=status.HTTP_403_FORBIDDEN)
        return Response("Access denied", status=status.HTTP_403_FORBIDDEN)

        
class GroupAPIView(APIView):
    pass


class NotificationAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        notifications = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def delete(self, request, notification_id):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Notification.DoesNotExist:
            return Response({"error": "Уведомление не найдено"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, notification_id, action):
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            
            if notification.type != 'invitation':
                return Response({"error": "Это не приглашение в команду"}, status=status.HTTP_400_BAD_REQUEST)
            
            if action == 'accept':
                team = notification.team
                if team:
                    team.members.add(request.user)
                    
                    # Создаем уведомление для владельца команды о принятии приглашения
                    Notification.objects.create(
                        user=team.owner,
                        message=f"Пользователь {request.user.username} принял приглашение в команду {team.name}",
                        type='system',
                        team=team
                    )
                    
                    notification.delete()
                    return Response({"message": "Приглашение принято"}, status=status.HTTP_200_OK)
                return Response({"error": "Команда не найдена"}, status=status.HTTP_404_NOT_FOUND)
            
            elif action == 'reject':
                notification.delete()
                return Response({"message": "Приглашение отклонено"}, status=status.HTTP_200_OK)
            
            return Response({"error": "Неверное действие"}, status=status.HTTP_400_BAD_REQUEST)
            
        except Notification.DoesNotExist:
            return Response({"error": "Уведомление не найдено"}, status=status.HTTP_404_NOT_FOUND)

class UserSearchAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('query', '')
        if len(query) < 3:
            return Response(
                {"error": "Query must be at least 3 characters long"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        users = User.objects.filter(
            Q(username__icontains=query) | Q(email__icontains=query)
        ).exclude(id=request.user.id)[:10]
        
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

class RemoveTeamMemberAPIView(APIView):
    '''
    This class will remove a member from a team.
    '''
    permission_classes = [IsAuthenticated]

    def get_object(self, slug):
        try:
            team = Team.objects.get(slug=slug)
            if IsOwner(self.request, team).has_permission:
                return team
            raise Http404
        except Team.DoesNotExist:
            raise Http404
    
    def post(self, request, slug, format=None):
        team = self.get_object(slug)
        try:
            user = User.objects.get(username=request.data['username'])
            if user == team.owner:
                return Response(
                    "Cannot remove the team owner",
                    status=status.HTTP_400_BAD_REQUEST
                )
            team.members.remove(user)
            
            # Создаем уведомление для пользователя об удалении из команды
            Notification.objects.create(
                user=user,
                message=f"Вы были удалены из команды {team.name}",
                type='system'
            )
            
            return Response(status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response(
                "User doesn't exist",
                status=status.HTTP_400_BAD_REQUEST
            )

class UserDetailAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)


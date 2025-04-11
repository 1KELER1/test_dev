import requests
import json

BASE_URL = 'http://0.0.0.0:8000/api/'

def register_user():
    user_data = {
        'username': 'test_user',
        'email': 'test_user@example.com',
        'password': 'test123456',
        'password2': 'test123456'
    }
    
    response = requests.post(BASE_URL + 'register/', data=user_data)
    if response.status_code == 201:
        print("Пользователь успешно зарегистрирован!")
        return response.json()
    else:
        print(f"Ошибка регистрации: {response.status_code}")
        print(response.json())
        return None

def login_user(username, password):
    login_data = {
        'username': username,
        'password': password
    }
    
    response = requests.post(BASE_URL + 'token/', data=login_data)
    if response.status_code == 200:
        print("Успешный вход в систему!")
        return response.json()
    else:
        print(f"Ошибка входа: {response.status_code}")
        print(response.json())
        return None

def create_team(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    team_data = {
        'name': 'Моя команда',
        'description': 'Тестовая команда для примера'
    }
    
    response = requests.post(
        BASE_URL + 'teams/',
        data=json.dumps(team_data),
        headers=headers
    )
    
    if response.status_code == 201:
        print("Команда успешно создана!")
        return response.json()
    else:
        print(f"Ошибка создания команды: {response.status_code}")
        print(response.json())
        return None

def create_project(access_token, team_slug):
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    project_data = {
        'name': 'Мой проект',
        'description': 'Тестовый проект для примера'
    }
    
    response = requests.post(
        f'{BASE_URL}team/{team_slug}/',
        data=json.dumps(project_data),
        headers=headers
    )
    
    if response.status_code == 201:
        print("Проект успешно создан!")
        return response.json()
    else:
        print(f"Ошибка создания проекта: {response.status_code}")
        print(response.json())
        return None

# Выполняем все шаги
def main():
    # Шаг 1: Регистрация
    register_result = register_user()
    if not register_result:
        return
    
    # Шаг 2: Вход в систему
    login_result = login_user('test_user', 'test123456')
    if not login_result:
        return
    
    access_token = login_result['access']
    
    # Шаг 3: Создание команды
    team_result = create_team(access_token)
    if not team_result:
        return
    
    team_slug = team_result['slug']  # Получаем slug созданной команды
    
    # Шаг 4: Создание проекта в команде
    project_result = create_project(access_token, team_slug)
    if project_result:
        print("Все операции выполнены успешно!")

if __name__ == "__main__":
    main()

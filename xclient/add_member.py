import requests
import json
import time
import pytest

BASE_URL = 'http://127.0.0.1:8000/api/'

@pytest.fixture
def test_user():
    return {
        'username': f'test_user_{int(time.time())}',
        'email': f'test_{int(time.time())}@example.com',
        'password': 'test123456',
        'password2': 'test123456'
    }

@pytest.fixture
def second_user():
    return {
        'username': f'test_user_2_{int(time.time())}',
        'email': f'test_2_{int(time.time())}@example.com',
        'password': 'test123456',
        'password2': 'test123456'
    }

@pytest.fixture
def access_token(test_user):
    # Регистрация пользователя
    response = requests.post(BASE_URL + 'register/', data=test_user)
    assert response.status_code == 201
    
    # Получение токена
    login_data = {
        'username': test_user['username'],
        'password': test_user['password']
    }
    response = requests.post(BASE_URL + 'token/', data=login_data)
    assert response.status_code == 200
    return response.json()['access']

@pytest.fixture
def team_slug(access_token):
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    team_data = {
        'name': f'Test Team {int(time.time())}',
        'description': 'Test team description'
    }
    
    response = requests.post(
        BASE_URL + 'teams/',
        data=json.dumps(team_data),
        headers=headers
    )
    
    assert response.status_code == 201
    return response.json()['slug']

def test_add_member(access_token, team_slug, second_user):
    # Регистрируем второго пользователя
    response = requests.post(BASE_URL + 'register/', data=second_user)
    assert response.status_code == 201
    
    # Добавляем его в команду
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    member_data = {
        'username': second_user['username']
    }
    
    response = requests.post(
        f'{BASE_URL}team/{team_slug}/add_member/',
        data=json.dumps(member_data),
        headers=headers
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data['member'] == second_user['username']
    assert data['status'] == 'added'
    print("\nУчастник успешно добавлен:")
    print(f"Команда: {data.get('team')}")
    print(f"Участник: {data.get('member')}")
    print(f"Статус: {data.get('status')}")

if __name__ == "__main__":
    pytest.main([__file__])

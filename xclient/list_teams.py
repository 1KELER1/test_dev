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

def test_list_teams(access_token, team_slug):
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    response = requests.get(
        BASE_URL + 'teams/',
        headers=headers
    )
    
    assert response.status_code == 200
    teams = response.json()
    assert isinstance(teams, list)
    assert len(teams) > 0
    
    print("\nСписок команд:")
    for team in teams:
        print("\nКоманда:")
        print(f"ID: {team.get('id')}")
        print(f"Название: {team.get('name')}")
        print(f"Описание: {team.get('description')}")
        print(f"Slug: {team.get('slug')}")
        print(f"Владелец: {team.get('owner')}")
        print(f"Участники: {team.get('members')}")

if __name__ == "__main__":
    pytest.main([__file__])

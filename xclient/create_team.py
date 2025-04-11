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

def test_create_team(access_token):
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
    data = response.json()
    assert data['name'] == team_data['name']
    assert data['description'] == team_data['description']
    print("\nКоманда успешно создана:")
    print(f"ID: {data.get('id')}")
    print(f"Название: {data.get('name')}")
    print(f"Описание: {data.get('description')}")
    print(f"Slug: {data.get('slug')}")
    return data['slug']

if __name__ == "__main__":
    pytest.main([__file__])

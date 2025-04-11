import requests
import json
import pytest
import time

BASE_URL = 'http://127.0.0.1:8000/api/'

def test_connection():
    response = requests.get(BASE_URL)
    assert response.status_code == 200, f"Ошибка подключения: {response.status_code}"

def test_register_user():
    user_data = {
        'username': f'test_user_{int(time.time())}',
        'email': f'test_{int(time.time())}@example.com',
        'password': 'test123456',
        'password2': 'test123456'
    }
    
    response = requests.post(BASE_URL + 'register/', data=user_data)
    assert response.status_code == 201, f"Ошибка регистрации: {response.status_code}"
    response_data = response.json()
    assert 'username' in response_data, "Ответ не содержит username"
    assert 'email' in response_data, "Ответ не содержит email"

def test_login_user():
    # Сначала регистрируем пользователя
    user_data = {
        'username': f'test_user_{int(time.time())}',
        'email': f'test_{int(time.time())}@example.com',
        'password': 'test123456',
        'password2': 'test123456'
    }
    
    response = requests.post(BASE_URL + 'register/', data=user_data)
    assert response.status_code == 201
    
    # Теперь пробуем войти
    login_data = {
        'username': user_data['username'],
        'password': user_data['password']
    }
    
    response = requests.post(BASE_URL + 'token/', data=login_data)
    assert response.status_code == 200, f"Ошибка входа: {response.status_code}"
    response_data = response.json()
    assert 'access' in response_data, "Ответ не содержит access токен"
    assert 'refresh' in response_data, "Ответ не содержит refresh токен"

def main():
    print("Тестирование API...")
    
    # Проверка соединения
    test_connection()
    
    # Регистрация нового пользователя
    test_register_user()
    
    # Вход в систему
    test_login_user()
    
    print("\nТестирование завершено успешно!")

if __name__ == "__main__":
    main() 
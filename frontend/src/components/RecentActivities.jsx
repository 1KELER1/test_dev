import { useState, useEffect } from 'react';
import {
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineIcon,
  TimelineHeader,
} from "@material-tailwind/react";
import {
  PlusIcon,
  PencilIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/solid";
import axios from 'axios';

export function RecentActivities() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Refresh token не найден');
      }

      const response = await axios.post('http://localhost:8000/api/token/refresh/', {
        refresh: refreshToken
      });

      localStorage.setItem('accessToken', response.data.access);
      return response.data.access;
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        console.log('Начало загрузки уведомлений...');
        let token = localStorage.getItem('accessToken');
        console.log('Токен авторизации:', token ? 'найден' : 'не найден');
        
        if (!token) {
          throw new Error('Токен авторизации не найден');
        }

        try {
          // Используем правильный URL с /api/ в пути
          const url = 'http://localhost:8000/api/notifications/';
          console.log('Отправка запроса напрямую на:', url);
          
          const response = await axios.get(url, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('Получен ответ:', {
            status: response.status,
            data: response.data
          });
          
          if (!Array.isArray(response.data)) {
            console.error('Ожидался массив данных, получено:', response.data);
            throw new Error('Неверный формат данных');
          }
          
          setActivities(response.data);
          setError(null);
        } catch (error) {
          if (error.response?.status === 401) {
            console.log('Токен истек, пытаемся обновить...');
            token = await refreshToken();
            
            const url = 'http://localhost:8000/api/notifications/';
            const response = await axios.get(url, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (!Array.isArray(response.data)) {
              console.error('Ожидался массив данных, получено:', response.data);
              throw new Error('Неверный формат данных');
            }

            setActivities(response.data);
            setError(null);
          } else if (error.response?.status === 404) {
            console.error('Эндпоинт не найден:', error.config?.url);
            setError('Сервис уведомлений временно недоступен');
            setActivities([]);
          } else {
            throw error;
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке уведомлений:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        
        setError('Не удалось загрузить мероприятия. Проверьте авторизацию.');
        setActivities([]);
      } finally {
        console.log('Завершение загрузки уведомлений');
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'invitation':
        return <PlusIcon className="h-5 w-5" />;
      case 'system':
        return <PencilIcon className="h-5 w-5" />;
      default:
        return <ArchiveBoxIcon className="h-5 w-5" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'invitation':
        return 'blue';
      case 'system':
        return 'green';
      default:
        return 'red';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).toUpperCase();
  };

  const renderContent = () => {
    console.log('Рендеринг содержимого:', {
      loading,
      error,
      activitiesCount: activities.length
    });

    if (loading) {
      return (
        <div className="flex justify-center items-center h-32">
          <span className="text-blue-gray-600">Загрузка...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex justify-center items-center h-32">
          <span className="text-red-600">{error}</span>
        </div>
      );
    }

    if (activities.length === 0) {
      return (
        <div className="flex justify-center items-center h-32">
          <span className="text-blue-gray-600">Нет доступных мероприятий</span>
        </div>
      );
    }

    return (
      <Timeline>
        {activities.map((activity, index) => (
          <TimelineItem key={activity.id} className="h-28">
            {index !== activities.length - 1 && (
              <TimelineConnector className="!w-[78px]" />
            )}
            <TimelineHeader className="relative rounded-xl border border-blue-gray-50 bg-white py-3 pl-4 pr-8 shadow-lg shadow-blue-gray-900/5">
              <TimelineIcon className="p-3" variant="ghost" color={getActivityColor(activity.type)}>
                {getActivityIcon(activity.type)}
              </TimelineIcon>
              <div className="flex flex-col gap-1">
                <span className="text-blue-gray-900 font-semibold">
                  {activity.message}
                </span>
                <span className="text-gray-600 text-sm">
                  {formatDate(activity.created_at)}
                </span>
              </div>
            </TimelineHeader>
          </TimelineItem>
        ))}
      </Timeline>
    );
  };

  return <div>{renderContent()}</div>;
} 
import api from '../api';

export const getNotifications = async () => {
    try {
        console.log('getNotifications: используемый API baseURL =', api.defaults.baseURL);
        console.log('getNotifications: начало запроса к notifications/');
        const response = await api.get('notifications/');
        console.log('getNotifications: получен ответ:', response.status);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error);
        console.error('getNotifications: ошибка запроса, детали:', {
            status: error.response?.status,
            url: error.config?.url,
            baseURL: api.defaults.baseURL
        });
        throw error;
    }
};

export const deleteNotification = async (notificationId) => {
    try {
        await api.delete(`notifications/${notificationId}/`);
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
};

export const acceptInvitation = async (notificationId) => {
    try {
        const response = await api.post(`notifications/${notificationId}/accept/`);
        return response.data;
    } catch (error) {
        console.error('Error accepting invitation:', error);
        throw error;
    }
};

export const rejectInvitation = async (notificationId) => {
    try {
        const response = await api.post(`notifications/${notificationId}/reject/`);
        return response.data;
    } catch (error) {
        console.error('Error rejecting invitation:', error);
        throw error;
    }
}; 
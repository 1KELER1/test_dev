import React, { useState, useEffect } from 'react';
import { List, message, Button, Popover, Badge, Space } from 'antd';
import { BellOutlined, DeleteOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { getNotifications, deleteNotification, acceptInvitation, rejectInvitation } from '../services/endpoints/notifications';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(false);

    const validateToken = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            message.error('Необходима авторизация');
            return false;
        }
        return true;
    };

    const fetchNotifications = async () => {
        if (!validateToken()) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const data = await getNotifications();
            // Фильтруем дублирующиеся уведомления
            const uniqueNotifications = data.reduce((acc, current) => {
                const isDuplicate = acc.some(item => 
                    item.type === current.type && 
                    item.team === current.team && 
                    item.message === current.message
                );
                if (!isDuplicate) {
                    acc.push(current);
                }
                return acc;
            }, []);
            setNotifications(Array.isArray(uniqueNotifications) ? uniqueNotifications : []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError(error.message);
            
            if (error.response?.status === 401) {
                message.error('Необходима повторная авторизация');
            } else {
                message.error('Не удалось загрузить уведомления');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (notificationId) => {
        if (!validateToken()) return;
        
        try {
            await deleteNotification(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
            message.success('Уведомление удалено');
        } catch (error) {
            console.error('Delete error:', error);
            message.error('Не удалось удалить уведомление');
        }
    };

    const handleAcceptInvitation = async (notificationId) => {
        if (!validateToken()) return;
        
        try {
            await acceptInvitation(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
            message.success('Приглашение принято');
        } catch (error) {
            console.error('Accept error:', error);
            message.error('Не удалось принять приглашение');
        }
    };

    const handleRejectInvitation = async (notificationId) => {
        if (!validateToken()) return;
        
        try {
            await rejectInvitation(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
            message.success('Приглашение отклонено');
        } catch (error) {
            console.error('Reject error:', error);
            message.error('Не удалось отклонить приглашение');
        }
    };

    useEffect(() => {
        if (validateToken()) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, []);

    const handleVisibleChange = (newVisible) => {
        setVisible(newVisible);
        if (newVisible) {
            fetchNotifications();
        }
    };

    const getNotificationActions = (item) => {
        if (item.type === 'invitation') {
            return [
                <Space>
                    <Button
                        type="text"
                        icon={<CheckOutlined />}
                        onClick={() => handleAcceptInvitation(item.id)}
                        title="Принять"
                    />,
                    <Button
                        type="text"
                        icon={<CloseOutlined />}
                        onClick={() => handleRejectInvitation(item.id)}
                        title="Отклонить"
                    />
                </Space>
            ];
        }
        return [
            <Button
                type="text"
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(item.id)}
                title="Удалить"
            />
        ];
    };

    const notificationsList = (
        <List
            size="small"
            loading={loading}
            dataSource={notifications}
            renderItem={item => (
                <List.Item
                    actions={getNotificationActions(item)}
                >
                    <List.Item.Meta
                        title={item.message}
                        description={item.type === 'invitation' ? 'Приглашение в команду' : ''}
                    />
                </List.Item>
            )}
            locale={{ emptyText: error || 'Нет уведомлений' }}
            style={{ maxWidth: 300, maxHeight: 400, overflow: 'auto' }}
        />
    );

    return (
        <div onClick={(e) => e.stopPropagation()}>
            <Popover
                content={notificationsList}
                title="Уведомления"
                trigger="click"
                placement="bottomRight"
                open={visible}
                onOpenChange={handleVisibleChange}
            >
                <Badge count={notifications.length} offset={[-5, 5]}>
                    <Button 
                        type="text" 
                        icon={<BellOutlined />} 
                        onClick={() => setVisible(!visible)}
                    />
                </Badge>
            </Popover>
        </div>
    );
};

export default Notifications; 
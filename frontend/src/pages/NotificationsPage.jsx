import React, { useState, useEffect } from 'react';
import { Card, Typography, List, ListItem, Button } from "@material-tailwind/react";
import { SideBar } from "../components/SideBar";
import { getNotifications, deleteNotification, acceptInvitation, rejectInvitation } from '../services/endpoints/notifications';
import { TrashIcon, CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

export const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (notificationId) => {
        try {
            await deleteNotification(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error deleting notification:', error);
        }
    };

    const handleAcceptInvitation = async (notificationId) => {
        try {
            await acceptInvitation(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error accepting invitation:', error);
        }
    };

    const handleRejectInvitation = async (notificationId) => {
        try {
            await rejectInvitation(notificationId);
            setNotifications(notifications.filter(n => n.id !== notificationId));
        } catch (error) {
            console.error('Error rejecting invitation:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const getNotificationActions = (notification) => {
        if (notification.type === 'invitation') {
            return (
                <div className="flex gap-2">
                    <Button
                        variant="text"
                        color="green"
                        className="flex items-center gap-2"
                        onClick={() => handleAcceptInvitation(notification.id)}
                    >
                        <CheckIcon className="h-4 w-4" />
                        Принять
                    </Button>
                    <Button
                        variant="text"
                        color="red"
                        className="flex items-center gap-2"
                        onClick={() => handleRejectInvitation(notification.id)}
                    >
                        <XMarkIcon className="h-4 w-4" />
                        Отклонить
                    </Button>
                </div>
            );
        }
        return (
            <Button
                variant="text"
                color="red"
                className="flex items-center gap-2"
                onClick={() => handleDelete(notification.id)}
            >
                <TrashIcon className="h-4 w-4" />
                Удалить
            </Button>
        );
    };

    return (
        <div className="h-screen w-screen flex bg-gray-50">
            <SideBar />
            <div className="flex-1 p-8">
                <Typography variant="h3" className="mb-6">
                    Уведомления
                </Typography>
                <Card className="w-full p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <Typography className="text-center text-gray-500 py-8">
                            Нет уведомлений
                        </Typography>
                    ) : (
                        <List>
                            {notifications.map((notification) => (
                                <ListItem key={notification.id} className="flex justify-between items-center py-4">
                                    <div>
                                        <Typography>{notification.message}</Typography>
                                        {notification.type === 'invitation' && (
                                            <Typography variant="small" color="gray">
                                                Приглашение в команду
                                            </Typography>
                                        )}
                                    </div>
                                    {getNotificationActions(notification)}
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Card>
            </div>
        </div>
    );
}; 
import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
} from "@material-tailwind/react";
import {
  PresentationChartBarIcon,
  UserCircleIcon,
  PowerIcon,
  InboxIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import { logout } from "../services/endpoints/users";
import { useNavigate } from "react-router-dom";
import { getNotifications } from "../services/endpoints/notifications";

export function SideBar() {
  const navigate = useNavigate();
  const [notificationCount, setNotificationCount] = useState(0);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleDashboard = () => {
    navigate("/dashboard");
  };

  const handleTeams = () => {
    navigate("/teams");
  };

  const handleNotifications = () => {
    navigate("/notifications");
  };

  const fetchNotificationCount = async () => {
    try {
      const notifications = await getNotifications();
      setNotificationCount(Array.isArray(notifications) ? notifications.length : 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotificationCount(0);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="h-screen w-full max-w-[20rem] p-4 shadow-xl shadow-blue-gray-900/5">
      <div className="mb-2 p-4">
        <Typography variant="h5" color="blue-gray">
          Sticky Notes
        </Typography>
      </div>
      <List>
        <ListItem onClick={handleDashboard}>
          <ListItemPrefix>
            <PresentationChartBarIcon className="h-5 w-5" />
          </ListItemPrefix>
          Главная
        </ListItem>
        <ListItem onClick={handleTeams}>
          <ListItemPrefix>
            <UsersIcon className="h-5 w-5" />
          </ListItemPrefix>
          Команды
        </ListItem>
        <ListItem onClick={handleNotifications}>
          <ListItemPrefix>
            <InboxIcon className="h-5 w-5" />
          </ListItemPrefix>
          Входящие
          {notificationCount > 0 && (
            <ListItemSuffix>
              <Chip
                value={notificationCount}
                size="sm"
                variant="ghost"
                color="blue"
                className="rounded-full"
              />
            </ListItemSuffix>
          )}
        </ListItem>
        <ListItem onClick={handleProfile}>
          <ListItemPrefix>
            <UserCircleIcon className="h-5 w-5" />
          </ListItemPrefix>
          Профиль
        </ListItem>
        <ListItem onClick={handleLogout}>
          <ListItemPrefix>
            <PowerIcon className="h-5 w-5" />
          </ListItemPrefix>
          Выход
        </ListItem>
      </List>
    </Card>
  );
}

import React, { useState, useEffect } from "react"; // Добавляем импорты React и хуков
import { Route, Routes, useLocation } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import { FormPage } from "./pages/FormPage";
import { Profile } from "./pages/Profile";
import { TeamPage } from "./pages/TeamPage";
import { Spinner } from "@material-tailwind/react";
import { Teams } from "./pages/Teams";
import { getProfile } from "./services/endpoints/users";
import { ProjectPage } from "./pages/ProjectPage";
import { LandingPage } from "./pages/LandingPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { isAuth } from "./services/utils/isAuth"; // Импортируем isAuth

export default function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const checkAuth = async () => {
      try {
        const auth = await isAuth();
        setIsAuthenticated(auth);

        if (auth) {
          const res = await getProfile();
          setUsername(res.profile.username);
        }
      } catch (error) {
        console.error(error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [location]);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Spinner />
      </div>
    );

  // Список маршрутов
  const routes = [
    {
      path: "/",
      element: isAuthenticated ? (
        <Dashboard username={username} />
      ) : (
        <LandingPage />
      ),
    },
    {
      path: "/dashboard",
      element: isAuthenticated ? (
        <Dashboard username={username} />
      ) : (
        <FormPage isLogin={true} />
      ),
    },
    {
      path: "/login",
      element: <FormPage isLogin={true} />,
    },
    {
      path: "/signup",
      element: <FormPage isLogin={false} />,
    },
    {
      path: "/profile",
      element: isAuthenticated ? (
        <Profile username={username} />
      ) : (
        <FormPage isLogin={true} />
      ),
    },
    {
      path: "/teams",
      element: isAuthenticated ? (
        <Teams username={username} />
      ) : (
        <FormPage isLogin={true} />
      ),
    },
    {
      path: "/teams/:teamSlug/",
      element: isAuthenticated ? <TeamPage /> : <FormPage isLogin={true} />,
    },
    {
      path: "/teams/:teamSlug/projects/:projectId",
      element: isAuthenticated ? <ProjectPage /> : <FormPage isLogin={true} />,
    },
    {
      path: "/notifications",
      element: isAuthenticated ? <NotificationsPage /> : <FormPage isLogin={true} />,
    },
    {
      path: "*",
      element: <FormPage isLogin={true} />,
    },
  ];

  return (
    <>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </>
  );
}

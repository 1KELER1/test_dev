import api from "../api";
import { logout, getRefreshToken } from "../endpoints/users";
import { isTokenExpired } from "./isTokenExpired";

export const isAuth = async () => {
    try {
        const refreshToken = localStorage.getItem("refreshToken");
        const accessToken = localStorage.getItem("accessToken");

        if (!refreshToken || !accessToken) {
            logout();
            return false;
        }

        // Проверяем, истек ли access token
        if (isTokenExpired(accessToken)) {
            try {
                const response = await getRefreshToken(refreshToken);
                if (response.status === 200) {
                    const { access } = response.data;
                    localStorage.setItem("accessToken", access);
                    api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
                    return true;
                }
            } catch (error) {
                console.error("Error refreshing token:", error);
                logout();
                return false;
            }
        }

        // Если токен не истек, устанавливаем его в заголовки
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        return true;
    } catch (error) {
        console.error("Auth error:", error);
        logout();
        return false;
    }
};

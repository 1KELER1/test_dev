// services/utils/refreshToken.js
import api from "../api";

export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      return false;
    }

    const response = await api.post("/token/refresh/", {
      refresh: refreshToken,
    });

    if (response.data.access) {
      localStorage.setItem("accessToken", response.data.access);
      if (response.data.refresh) {
        localStorage.setItem("refreshToken", response.data.refresh);
      }
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error refreshing token:", error);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return false;
  }
};

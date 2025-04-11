// services/utils/jwtUtils.js
export const decodeToken = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error decoding token:", e);
    return null;
  }
};

export const isTokenExpired = () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return true;

  const decodedToken = decodeToken(token);
  if (!decodedToken || !decodedToken.exp) return true;

  // Проверим, не истекает ли токен в ближайшие 30 секунд
  const currentTime = Math.floor(Date.now() / 1000);
  return decodedToken.exp < currentTime + 30;
};

import axios from "axios";
import { authService } from "./authService";

let refreshPromise = null;

const instance = axios.create({
  baseURL: "http://160.30.113.40:8080/api",
  withCredentials: true,
});

instance.interceptors.request.use(async (config) => {
  const token = localStorage.getItem("token");
  const expiresAt = localStorage.getItem("expiresAt");

  if (token && expiresAt) {
    const now = Date.now();
    const expireTime = parseInt(expiresAt, 10);

    // Nếu còn < 2h thì refresh token
    if (expireTime - now < 2 * 60 * 60 * 1000) {
      if (!refreshPromise) {
        refreshPromise = authService.refreshToken(token)
          .then((data) => {
            localStorage.setItem("token", data.token);
            localStorage.setItem("expiresAt", data.expiresAt);
            return data.token;
          })
          .finally(() => (refreshPromise = null));
      }
      await refreshPromise;
    }
    config.headers.Authorization = `Bearer ${localStorage.getItem("token")}`;
  }

  return config;
});

export default instance;

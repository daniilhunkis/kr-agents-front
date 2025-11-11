import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const telegramLogin = (data: any) => api.post("/api/auth/telegram", data);
export const getObjects = () => api.get("/api/objects");
export const getUser = () => api.get("/api/users/me");
export const api = axios.create({
  baseURL: "http://185.233.186.13:8000/api", // адрес бэка
  headers: {
    "Content-Type": "application/json",
  },
});
export default api;

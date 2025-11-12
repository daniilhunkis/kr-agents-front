import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // у тебя: https://api.krd-agents.ru
});

// --- Тип пользователя ---
export type UserDto = {
  id: number;
  firstName: string;
  lastName?: string;
  phone?: string;
  role?: "user" | "moderator" | "admin";
  moderatorPassword?: string | null;
};

// --- Пользователь по ID ---
export async function getUser(userId: number) {
  const res = await api.get<UserDto>(`/api/user/${userId}`);
  return res.data;
}

// --- Проверка роли для меню / админки ---
export async function checkAdminRole(userId: number) {
  const res = await api.get<{ role: string }>(`/api/admin/check/${userId}`);
  return res.data;
}

// --- Все пользователи (только главный админ) ---
export async function getAllUsers(adminId: number) {
  const res = await api.get<UserDto[]>("/api/users", {
    params: { admin_id: adminId },
  });
  return res.data;
}

// --- Обновление роли (только главный админ) ---
export async function updateUserRole(
  userId: number,
  role: "user" | "moderator" | "admin",
  adminId: number
) {
  const res = await api.patch(`/api/users/${userId}/role`, {
    role,
    admin_id: adminId,
  });
  return res.data;
}

// --- Установка пароля модератора (админ) ---
export async function setModeratorPassword(
  userId: number,
  password: string,
  adminId: number
) {
  const res = await api.post("/api/moderator/set-password", {
    user_id: userId,
    password,
    admin_id: adminId,
  });
  return res.data;
}

// --- Смена пароля модератором ---
export async function changeModeratorPassword(
  userId: number,
  oldPassword: string,
  newPassword: string
) {
  const res = await api.post("/api/moderator/change-password", {
    user_id: userId,
    oldPassword,
    newPassword,
  });
  return res.data;
}

// --- Уже существующая функция создания объекта ---
export const createObject = (data: FormData) =>
  api.post("/api/objects", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default api;

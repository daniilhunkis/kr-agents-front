// src/lib/api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.krd-agents.ru";

export const api = axios.create({
  baseURL: API_BASE,
});

// ====== USERS ======

export interface UserDto {
  id: number;
  firstName: string;
  lastName?: string;
  phone?: string;
  role?: "user" | "moderator" | "admin";
  moderatorPassword?: string; // ⭐ добавили
}

// --- Проверка роли (админ/модер/юзер)
export async function checkAdminRole(userId: number) {
  const res = await api.get<{ role: string }>(`/api/admin/check/${userId}`);
  return res.data;
}

export async function getUser(userId: number) {
  const res = await api.get<UserDto>(`/api/user/${userId}`);
  return res.data;
}

export async function registerUser(data: UserDto) {
  const res = await api.post<{ status: string; user: UserDto }>(
    "/api/register",
    data
  );
  return res.data;
}

// ====== ADMIN ======

export async function getAllUsers(adminId: number) {
  const res = await api.get<UserDto[]>("/api/users", {
    params: { admin_id: adminId },
  });
  return res.data;
}

// — обновление роли
export async function updateUserRole(
  userId: number,
  role: "user" | "moderator" | "admin",
  adminId: number
) {
  const res = await api.patch<{ status: string; user: UserDto }>(
    `/api/users/${userId}/role`,
    {
      role,
      admin_id: adminId,
    }
  );
  return res.data;
}

// — установить пароль модератору
export async function setModeratorPassword(
  userId: number,
  password: string,
  adminId: number
) {
  const res = await api.patch<{ status: string; user: UserDto }>(
    `/api/moderator/password/set`,
    {
      userId,
      password,
      admin_id: adminId,
    }
  );
  return res.data;
}

// ====== MODERATOR ======

export async function changeModeratorPassword(
  userId: number,
  oldPassword: string,
  newPassword: string
) {
  const res = await api.patch<{ status: string; user: UserDto }>(
    `/api/moderator/password/change`,
    {
      userId,
      oldPassword,
      newPassword,
    }
  );
  return res.data;
}

// ====== OBJECTS ======

export async function createObject(formData: FormData) {
  const res = await api.post("/api/objects", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export default api;

// src/lib/api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.krd-agents.ru/api";

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
}

export async function getUser(userId: number) {
  const res = await api.get<UserDto>(`/user/${userId}`);
  return res.data;
}

export async function registerUser(data: UserDto) {
  const res = await api.post<{ status: string; user: UserDto }>("/register", data);
  return res.data;
}

// ====== ADMIN ======

export async function getAllUsers(adminId: number) {
  const res = await api.get<UserDto[]>(`/users`, {
    params: { admin_id: adminId },
  });
  return res.data;
}

export async function updateUserRole(userId: number, role: "user" | "moderator" | "admin", adminId: number) {
  const res = await api.patch<{ status: string; user: UserDto }>(`/users/${userId}/role`, {
    role,
    admin_id: adminId,
  });
  return res.data;
}

// ====== OBJECTS (если нужно, оставляем-заглушку) ======

export async function createObject(formData: FormData) {
  const res = await api.post("/objects", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export default api;

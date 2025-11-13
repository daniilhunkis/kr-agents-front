// src/lib/api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL;
console.log("API BASE =", API_BASE);

export const api = axios.create({
  baseURL: API_BASE, // <--- БОЛЬШЕ НИЧЕГО НЕ ДОБАВЛЯЕМ
});

// ====== USERS ======

export interface UserDto {
  id: number;
  firstName: string;
  lastName?: string;
  phone?: string;
  role?: "user" | "moderator" | "admin";
  moderatorPassword?: string;
}

export async function getUser(id: number) {
  const res = await api.get(`/user/${id}`);
  return res.data;
}

export async function registerUser(data: UserDto) {
  const res = await api.post("/register", data);
  return res.data;
}

// ====== ADMIN ======

export async function getAllUsers(adminId: number) {
  const res = await api.get("/users", { params: { admin_id: adminId } });
  return res.data;
}

export async function updateUserRole(userId: number, role: string, adminId: number) {
  const res = await api.patch(`/users/${userId}/role`, { role, admin_id: adminId });
  return res.data;
}

export async function setModeratorPassword(userId: number, pwd: string, adminId: number) {
  const res = await api.patch(`/users/${userId}/moderator-password`, {
    new_password: pwd,
    admin_id: adminId,
  });
  return res.data;
}

export async function changeModeratorPassword(userId: number, oldPwd: string, newPwd: string) {
  const res = await api.patch(`/users/${userId}/change-password`, {
    old_password: oldPwd,
    new_password: newPwd,
  });
  return res.data;
}

// ====== OBJECTS ======
export async function createObject(formData: FormData) {
  const res = await api.post("/objects", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

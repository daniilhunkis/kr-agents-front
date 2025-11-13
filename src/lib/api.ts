import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.krd-agents.ru/api",
});

// types
export interface UserDto {
  id: number;
  firstName: string;
  lastName?: string;
  phone?: string;
  role?: "user" | "moderator" | "admin";
  moderatorPassword?: string;
}

// users
export function getUser(id: number) {
  return api.get<UserDto>(`/user/${id}`).then(r => r.data);
}
export function registerUser(data: UserDto) {
  return api.post(`/register`, data).then(r => r.data);
}

// admin
export function getAllUsers(adminId: number) {
  return api.get(`/users`, { params: { admin_id: adminId } }).then(r => r.data);
}
export function updateUserRole(id: number, role: string, adminId: number) {
  return api.patch(`/users/${id}/role`, { role, admin_id: adminId }).then(r => r.data);
}
export function setModeratorPassword(id: number, password: string, adminId: number) {
  return api.patch(`/users/${id}/moderatorPassword`, { password, admin_id: adminId });
}

// moderator
export function moderatorLogin(id: number, password: string) {
  return api.post(`/moderator/login`, { id, password });
}
export function changeModeratorPassword(id: number, oldPwd: string, newPwd: string) {
  return api.patch(`/moderator/changePassword`, {
    id,
    old: oldPwd,
    new: newPwd,
  });
}

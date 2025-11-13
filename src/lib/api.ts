// src/lib/api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.krd-agents.ru/api";

// Базовый инстанс
export const api = axios.create({
  baseURL: API_BASE,
});

// ====== ТИПЫ ======

export type UserRole = "user" | "moderator" | "admin";

export interface UserDto {
  id: number;
  firstName: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  // пароль модератора (приходит с бэка только для самого модератора / админа)
  moderatorPassword?: string;
}

export type ObjectStatus = "pending" | "approved" | "rejected" | "revision";

export interface ObjectDto {
  id: number;
  ownerId: number;
  title: string;
  address?: string;
  price?: number;
  rooms?: number;
  areaTotal?: number;
  kitchenArea?: number;
  renovation?: string;
  status?: ObjectStatus;
  moderatorComment?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ====== USERS ======

export async function getUser(userId: number) {
  const res = await api.get<UserDto>(`/user/${userId}`);
  return res.data;
}

export async function registerUser(data: UserDto) {
  const res = await api.post<{ status: string; user: UserDto }>(
    "/register",
    data
  );
  return res.data;
}

// ====== ADMIN (ТОЛЬКО ДЛЯ ГЛАВНОГО АДМИНА) ======

export async function getAllUsers(adminId: number) {
  const res = await api.get<UserDto[]>("/users", {
    params: { admin_id: adminId },
  });
  return res.data;
}

/**
 * Обновление роли пользователя.
 * Если роль = "moderator" и передан moderatorPassword — бэк должен сохранить этот пароль.
 */
export async function updateUserRole(
  userId: number,
  role: UserRole,
  adminId: number,
  moderatorPassword?: string
) {
  const body: any = { role, admin_id: adminId };
  if (moderatorPassword) {
    body.moderatorPassword = moderatorPassword;
  }

  const res = await api.patch<{ status: string; user: UserDto }>(
    `/users/${userId}/role`,
    body
  );
  return res.data;
}

// ====== МОДЕРАТОР ======

/**
 * Смена пароля модератора самим модератором.
 * oldPassword может быть пустым, если пароль ещё не был задан.
 */
export async function changeModeratorPassword(
  userId: number,
  oldPassword: string,
  newPassword: string
) {
  const res = await api.post<{ status: string; user: UserDto }>(
    `/moderator/${userId}/password/change`,
    {
      oldPassword,
      newPassword,
    }
  );
  return res.data;
}

/**
 * Получить список объектов, которые ждут модерации.
 * Бэк может фильтровать по роли и статусу (pending / revision).
 */
export async function getModerationList() {
  const res = await api.get<ObjectDto[]>("/objects/moderation");
  return res.data;
}

/**
 * Обновить статус объекта модератором.
 */
export async function updateObjectStatus(
  objectId: number,
  status: ObjectStatus,
  comment?: string
) {
  const res = await api.post<{ status: string; object: ObjectDto }>(
    `/objects/${objectId}/moderation`,
    {
      status,
      comment,
    }
  );
  return res.data;
}

// ====== МОИ ОБЪЕКТЫ ======

export async function getMyObjects(ownerId: number) {
  const res = await api.get<ObjectDto[]>(`/objects/my/${ownerId}`);
  return res.data;
}

// ====== OBJECTS (добавление; AddObject может использовать и createObject, и api.post) ======

export async function createObject(data: FormData) {
  const res = await api.post("/objects", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export default api;

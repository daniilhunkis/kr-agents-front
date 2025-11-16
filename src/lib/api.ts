// src/lib/api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.krd-agents.ru/api";

export const api = axios.create({
  baseURL: API_BASE,
});

// ====== USERS ======

export type UserRole = "user" | "moderator" | "admin";

export interface UserDto {
  id: number;
  firstName: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  moderatorPassword?: string;
}

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

export async function checkAdminRole(userId: number) {
  const res = await api.get<{ role: UserRole }>(`/admin/check/${userId}`);
  return res.data;
}

export async function getAllUsers(adminId: number) {
  const res = await api.get<UserDto[]>("/users", {
    params: { admin_id: adminId },
  });
  return res.data;
}

export async function updateUserRole(
  userId: number,
  role: UserRole,
  adminId: number
) {
  const res = await api.patch<{ status: string; user: UserDto }>(
    `/users/${userId}/role`,
    {
      role,
      admin_id: adminId,
    }
  );
  return res.data;
}

export async function changeModeratorPassword(
  userId: number,
  payload: { oldPassword?: string; newPassword: string; adminId?: number }
) {
  const res = await api.post<{ status: string; user: UserDto }>(
    `/moderator/${userId}/password/change`,
    payload
  );
  return res.data;
}

// ====== OBJECTS ======

export type ObjectStatus = "waiting" | "approved" | "rejected" | "revision";

export interface ObjectDto {
  id: string;
  ownerId: number;
  district: string;
  street: string;
  house: string;
  flat?: string;
  floor?: string;
  roomsType: string;
  roomsCustom?: string;
  area: number;
  kitchenArea?: number;
  price: number;
  commissionPlace: "inside" | "on_top";
  commissionValue: number;
  commissionValueType: "percent" | "fixed";
  status: ObjectStatus;
  moderatorComment?: string | null;
  photos: string[];
  planPhotos: string[];
  docPhotos: string[];
  createdAt?: string;
}

export async function createObject(formData: FormData) {
  const res = await api.post<ObjectDto>("/objects", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getMyObjects(userId: number) {
  const res = await api.get<ObjectDto[]>(`/objects/my/${userId}`);
  return res.data;
}

export async function getObjectsForModeration(moderatorId: number) {
  const res = await api.get<ObjectDto[]>("/objects/moderation", {
    params: { moderator_id: moderatorId },
  });
  return res.data;
}

export async function moderateObject(
  objectId: string,
  payload: { moderatorId: number; action: "approve" | "reject" | "revision"; comment?: string }
) {
  const res = await api.post<ObjectDto>(`/objects/${objectId}/moderate`, payload);
  return res.data;
}

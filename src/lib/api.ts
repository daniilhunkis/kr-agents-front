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
  const res = await api.post<{ status: string; user: UserDto }>("/register", data);
  return res.data;
}

// ====== ADMIN ======

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
    { role, admin_id: adminId }
  );
  return res.data;
}

export interface ModeratorPasswordPayload {
  oldPassword?: string;
  newPassword: string;
  adminId?: number;
}

export async function changeModeratorPassword(
  userId: number,
  payload: ModeratorPasswordPayload
) {
  const res = await api.post<{ status: string; user: UserDto }>(
    `/moderator/${userId}/password/change`,
    payload
  );
  return res.data;
}

// ====== OBJECTS ======

export type ObjectStatus = "pending" | "approved" | "needs_fix" | "rejected";

export interface ObjectDto {
  id: number;
  ownerId: number;
  district?: string;
  street?: string;
  complexName?: string;
  house?: string;
  floor?: string;
  roomsType: string;
  roomsCustom?: string;
  areaTotal?: number;
  kitchenArea?: number;
  price: number;
  commissionType: "inside" | "on_top";
  commissionValue: number;
  commissionUnit: "percent" | "rub";
  status: ObjectStatus;
  comment?: string | null;
  photos?: string[];
  planPhotos?: string[];
  docsPhotos?: string[];
  createdAt: string;
}

export async function createObject(formData: FormData) {
  const res = await api.post<ObjectDto>("/objects", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getMyObjects(ownerId: number) {
  const res = await api.get<ObjectDto[]>(`/objects/my/${ownerId}`);
  return res.data;
}

export async function getObjectsForModeration(moderatorId: number) {
  const res = await api.get<ObjectDto[]>("/objects/moderation", {
    params: { moderator_id: moderatorId },
  });
  return res.data;
}

export async function changeObjectStatus(
  objectId: number,
  payload: { status: ObjectStatus; comment?: string; moderatorId: number }
) {
  const res = await api.patch<ObjectDto>(`/objects/${objectId}/status`, payload);
  return res.data;
}

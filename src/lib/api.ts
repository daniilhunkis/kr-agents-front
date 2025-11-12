// src/lib/api.ts
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://api.krd-agents.ru";

const api = axios.create({
  baseURL: API_BASE,
});

// пример: создание объекта (мы шлем на /api/objects)
export const createObject = (data: FormData) =>
  api.post("/api/objects", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export default api;

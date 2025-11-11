const API_URL = import.meta.env.VITE_API_URL || "https://api.krd-agents/api";

export async function fetchObjects() {
  const res = await fetch(`${API_URL}/objects`);
  if (!res.ok) throw new Error("Ошибка при загрузке объектов");
  return await res.json();
}

export async function fetchStories() {
  const res = await fetch(`${API_URL}/stories`);
  if (!res.ok) throw new Error("Ошибка при загрузке сторис");
  return await res.json();
}

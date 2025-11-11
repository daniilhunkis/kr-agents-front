// здесь точек входа к бэку.
// подставь прод-URL твоего бэка
const BASE = import.meta.env.VITE_API_BASE ?? "https://app.krd-agents.ru/api";

export async function telegramLogin(payload: { initData: string }): Promise<{ first_name?: string; last_name?: string; phone?: string; }> {
  try {
    const r = await fetch(`${BASE}/auth/telegram`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!r.ok) throw new Error("auth failed");
    return await r.json();
  } catch {
    // пока возвращаем пустой профиль — заставим заполнить
    return {};
  }
}

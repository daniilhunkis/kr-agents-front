import React, { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import axios from "axios";

export default function MyObjectsPage() {
  const tgUser = WebApp.initDataUnsafe?.user;
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [objects, setObjects] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "https://app.krd-agents.ru/api";

  useEffect(() => {
    if (!tgUser) return;

    const fetchUser = async () => {
      try {
        const user = await axios.get(`${API_BASE}/user/${tgUser.id}`);
        setForm({
          firstName: user.data.firstName || "",
          lastName: user.data.lastName || "",
          phone: user.data.phone || "",
        });

        // проверяем админку
        const adminCheck = await axios.get(`${API_BASE}/admin/check/${tgUser.id}`);
        setIsAdmin(adminCheck.data.is_admin);
      } catch {
        console.log("Пользователь не найден");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [tgUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!tgUser) return;
    setIsSaving(true);
    try {
      await axios.post(`${API_BASE}/register`, {
        id: tgUser.id,
        username: tgUser.username,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });
      WebApp.showAlert("Профиль обновлён ✅");
    } catch {
      WebApp.showAlert("Ошибка при сохранении");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        Загрузка...
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Мой профиль</h1>

      <div className="flex flex-col gap-3">
        <input
          name="firstName"
          placeholder="Имя"
          value={form.firstName}
          onChange={handleChange}
          className="bg-neutral-800 p-3 rounded-xl"
        />
        <input
          name="lastName"
          placeholder="Фамилия"
          value={form.lastName}
          onChange={handleChange}
          className="bg-neutral-800 p-3 rounded-xl"
        />
        <input
          name="phone"
          placeholder="Телефон"
          value={form.phone}
          onChange={handleChange}
          className="bg-neutral-800 p-3 rounded-xl"
        />

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-emerald-500 text-white py-3 rounded-xl mt-2 hover:bg-emerald-600 transition"
        >
          {isSaving ? "Сохраняем..." : "💾 Сохранить"}
        </button>
      </div>

      <hr className="my-6 border-gray-700" />

      <button
        onClick={() => WebApp.showAlert("Форма добавления объекта скоро будет 😉")}
        className="bg-blue-500 w-full py-3 rounded-xl hover:bg-blue-600 transition"
      >
        ➕ Добавить объект
      </button>

      <h2 className="text-xl font-semibold mt-6 mb-2">Мои объекты</h2>
      <div className="bg-neutral-900 p-4 rounded-xl text-gray-400">
        Пока вы не добавили ни одного объекта
      </div>

      {isAdmin && (
        <div className="mt-8 text-center">
          <a
            href="/admin"
            className="text-emerald-400 underline hover:text-emerald-300"
          >
            Перейти в админку
          </a>
        </div>
      )}
    </div>
  );
}

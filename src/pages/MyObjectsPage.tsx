import React, { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { getUser, registerUser, type UserDto } from "../lib/api";
import { Link } from "react-router-dom";

export default function MyObjectsPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  // ---- 1. Загружаем данные пользователя ----
  useEffect(() => {
    const init = async () => {
      try {
        const tg = WebApp.initDataUnsafe?.user;
        if (!tg) return;

        const u = await getUser(tg.id);
        setUser(u);

        setFirstName(u.firstName || "");
        setLastName(u.lastName || "");
        setPhone(u.phone || "");

      } catch (err) {
        console.error("Ошибка загрузки пользователя", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // ---- 2. Сохранение данных ----
  const handleSave = async () => {
    if (!user) return;

    try {
      const updated = await registerUser({
        id: user.id,
        firstName,
        lastName,
        phone,
        role: user.role,
      });

      WebApp.showAlert("Данные успешно обновлены");
      setUser(updated.user);
    } catch (err) {
      console.error(err);
      WebApp.showAlert("Ошибка при сохранении");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-4 text-white">
        Ошибка загрузки пользователя
      </div>
    );
  }

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Мои данные</h1>

      {/* === Форма пользователя === */}
      <div className="bg-gray-900 p-4 rounded-2xl mb-6 flex flex-col gap-3">
        <input
          className="bg-gray-800 rounded-xl p-3 outline-none"
          placeholder="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          className="bg-gray-800 rounded-xl p-3 outline-none"
          placeholder="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />

        <input
          className="bg-gray-800 rounded-xl p-3 outline-none"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          onClick={handleSave}
          className="bg-emerald-600 py-3 rounded-xl font-semibold mt-2"
        >
          Сохранить
        </button>
      </div>

      {/* === Объекты пользователя === */}
      <h2 className="text-xl font-bold mb-3">Мои объекты</h2>

      <Link
        to="/add"
        className="block bg-emerald-700 hover:bg-emerald-600 text-center py-3 rounded-xl font-semibold mb-4"
      >
        ➕ Добавить объект
      </Link>

      <div className="bg-gray-900 p-4 rounded-2xl text-gray-300">
        📦 Список объектов будет здесь (подключим после API объектов)
      </div>
    </div>
  );
}

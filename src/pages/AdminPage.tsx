import React, { useState } from "react";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");

  const correctPassword = "krd2025"; // 🔐 можно сменить на любой

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setAuthorized(true);
    } else {
      alert("Неверный пароль ❌");
    }
  };

  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <form
          onSubmit={handleSubmit}
          className="bg-neutral-900 p-6 rounded-2xl shadow-lg w-full max-w-sm flex flex-col gap-4"
        >
          <h2 className="text-xl font-semibold text-center mb-2">
            🔒 Вход в админку
          </h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
            className="p-3 rounded-xl bg-neutral-800 text-white focus:outline-none text-center"
            required
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 transition rounded-xl py-2 font-semibold"
          >
            Войти
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Админ-панель</h1>
      <p>Добро пожаловать, главный администратор 👑</p>

      <div className="mt-6 space-y-3">
        <button className="bg-blue-600 hover:bg-blue-700 transition rounded-xl py-2 px-4 w-full">
          Управление пользователями
        </button>
        <button className="bg-green-600 hover:bg-green-700 transition rounded-xl py-2 px-4 w-full">
          Просмотр и модерация объектов
        </button>
        <button className="bg-gray-700 hover:bg-gray-800 transition rounded-xl py-2 px-4 w-full">
          Настройки проекта
        </button>
      </div>
    </div>
  );
}

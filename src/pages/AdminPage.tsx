import React, { useEffect, useState } from "react";

import {
  getAllUsers,
  updateUserRole,
  changeModeratorPassword,
} from "../lib/api";

import type { UserDto } from "../lib/api"; // ← ОБЯЗАТЕЛЬНО ТОЛЬКО ТАК!

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<UserDto[]>([]);
  const [newModeratorPasswords, setNewModeratorPasswords] = useState<Record<number, string>>({});

  const correctPassword = "krd2025";
  const ADMIN_ID = "776430926"; // строка!

  // --- ВХОД В АДМИНКУ ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setAuthorized(true);
    } else {
      alert("Неверный пароль");
    }
  };

  // --- ЗАГРУЗКА ЮЗЕРОВ ---
  useEffect(() => {
    if (!authorized) return;

    getAllUsers(Number(ADMIN_ID))
      .then((list) => setUsers(list))
      .catch((err) => console.error(err));
  }, [authorized]);

  // --- НАЗНАЧЕНИЕ РОЛИ ---
  const handleRoleChange = async (id: number, role: "user" | "moderator" | "admin") => {
    try {
      await updateUserRole(id, role, Number(ADMIN_ID));

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role } : u))
      );

      alert("Роль обновлена");
    } catch {
      alert("Ошибка при назначении роли");
    }
  };

  // --- УСТАНОВКА ПАРОЛЯ МОДЕРАТОРА ---
  const handleSetModeratorPassword = async (id: number) => {
    const pwd = newModeratorPasswords[id];
    if (!pwd) return alert("Введите пароль");

    try {
      await changeModeratorPassword(id, pwd, ADMIN_ID);

      setUsers((prev) =>
        prev.map((u) =>
          u.id === id ? { ...u, moderatorPassword: pwd } : u
        )
      );

      alert("Пароль модератора установлен");
    } catch {
      alert("Ошибка при установке пароля");
    }
  };

  // --- НЕ АВТОРИЗОВАН ---
  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <form
          onSubmit={handleLogin}
          className="bg-neutral-900 p-6 rounded-xl w-full max-w-sm flex flex-col gap-4"
        >
          <h2 className="text-xl font-semibold text-center">🔐 Вход в админку</h2>

          <input
            type="password"
            placeholder="Пароль"
            className="p-3 rounded-lg bg-neutral-800 text-white text-center"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="bg-emerald-600 hover:bg-emerald-700 p-3 rounded-lg">
            Войти
          </button>
        </form>
      </div>
    );
  }

  // --- АДМИН-ПАНЕЛЬ ---
  return (
    <div className="p-4 bg-black min-h-screen text-white">
      <h1 className="text-2xl font-bold mb-4">Админ-панель 👑</h1>

      <table className="w-full border border-gray-700 text-sm">
        <thead className="bg-gray-800">
          <tr>
            <th className="border border-gray-700 p-2">ID</th>
            <th className="border border-gray-700 p-2">Имя</th>
            <th className="border border-gray-700 p-2">Телефон</th>
            <th className="border border-gray-700 p-2">Роль</th>
            <th className="border border-gray-700 p-2">Пароль модератора</th>
            <th className="border border-gray-700 p-2">Действие</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border border-gray-700 p-2">{u.id}</td>

              <td className="border border-gray-700 p-2">
                {u.firstName} {u.lastName}
              </td>

              <td className="border border-gray-700 p-2">{u.phone}</td>

              <td className="border border-gray-700 p-2">
                <select
                  className="bg-neutral-800 p-1 rounded"
                  value={u.role || "user"}
                  onChange={(e) =>
                    handleRoleChange(u.id, e.target.value as any)
                  }
                >
                  <option value="user">Пользователь</option>
                  <option value="moderator">Модератор</option>
                  <option value="admin">Админ</option>
                </select>
              </td>

              <td className="border border-gray-700 p-2">
                {u.role === "moderator" && (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      className="bg-neutral-800 p-1 rounded w-24"
                      placeholder="пароль"
                      value={newModeratorPasswords[u.id] || ""}
                      onChange={(e) =>
                        setNewModeratorPasswords((prev) => ({
                          ...prev,
                          [u.id]: e.target.value,
                        }))
                      }
                    />

                    <button
                      className="bg-emerald-700 px-2 rounded"
                      onClick={() => handleSetModeratorPassword(u.id)}
                    >
                      ✔
                    </button>
                  </div>
                )}
              </td>

              <td className="border border-gray-700 p-2 text-center">—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

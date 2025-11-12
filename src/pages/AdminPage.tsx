// src/pages/AdminPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const correctPassword = "krd2025";
  const API_BASE = import.meta.env.VITE_API_URL || "https://api.krd-agents.ru";
  const ADMIN_ID = 776430926; // твой Telegram ID

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setAuthorized(true);
    } else {
      alert("Неверный пароль");
    }
  };

  useEffect(() => {
    if (!authorized) return;

    const loadUsers = async () => {
      try {
        const url = `${API_BASE}/api/users`;
        console.log("Load users URL:", url);

        const res = await axios.get(url, {
          params: { admin_id: ADMIN_ID },
        });

        console.log("Users from backend:", res.data);
        setUsers(res.data);
      } catch (err) {
        console.error("Ошибка загрузки списка пользователей", err);
      }
    };

    loadUsers();
  }, [authorized, API_BASE]);

  const handleRoleChange = async (id: number, role: string) => {
    try {
      const url = `${API_BASE}/api/users/${id}/role`;
      console.log("Update role URL:", url, "role:", role);

      await axios.patch(url, { role, admin_id: ADMIN_ID });
      alert("Роль успешно обновлена");

      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role } : u))
      );
    } catch (err) {
      console.error("Ошибка при обновлении роли", err);
      alert("Ошибка при обновлении роли");
    }
  };

  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <form
          onSubmit={handleLogin}
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
      <h1 className="text-2xl font-bold mb-4">Админ-панель 👑</h1>
      <h2 className="text-lg mb-3">Пользователи</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-700 text-sm">
          <thead className="bg-gray-800">
            <tr>
              <th className="border border-gray-700 px-3 py-2">ID</th>
              <th className="border border-gray-700 px-3 py-2">Имя</th>
              <th className="border border-gray-700 px-3 py-2">Телефон</th>
              <th className="border border-gray-700 px-3 py-2">Роль</th>
              <th className="border border-gray-700 px-3 py-2">Действие</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="border border-gray-700 px-3 py-2">{u.id}</td>
                <td className="border border-gray-700 px-3 py-2">
                  {u.firstName} {u.lastName}
                </td>
                <td className="border border-gray-700 px-3 py-2">{u.phone}</td>
                <td className="border border-gray-700 px-3 py-2">
                  {u.role || "user"}
                </td>
                <td className="border border-gray-700 px-3 py-2">
                  <select
                    value={u.role || "user"}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    className="bg-neutral-800 text-white rounded px-2 py-1"
                  >
                    <option value="user">Пользователь</option>
                    <option value="moderator">Модератор</option>
                    <option value="admin">Админ</option>
                  </select>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-center text-gray-400 py-4 border border-gray-700"
                >
                  Пользователей пока нет
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

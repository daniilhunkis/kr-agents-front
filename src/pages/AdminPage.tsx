import React, { useEffect, useState } from "react";
import api from "../lib/api";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<any[]>([]);

  const correctPassword = "krd2025";
  const MAIN_ADMIN = 776430926;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setAuthorized(true);
    } else {
      alert("Неверный пароль");
    }
  };

  useEffect(() => {
    if (authorized) {
      api.get(`/users?admin_id=${MAIN_ADMIN}`)
        .then((res) => setUsers(res.data))
        .catch((err) => console.error(err));
    }
  }, [authorized]);

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await api.patch(`/users/${id}/role`, {
        role,
        admin_id: MAIN_ADMIN,
      });
      alert("Роль обновлена");
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role } : u))
      );
    } catch (err) {
      alert("Ошибка");
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
                <td className="border border-gray-700 px-3 py-2">{u.role}</td>
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
          </tbody>
        </table>
      </div>
    </div>
  );
}

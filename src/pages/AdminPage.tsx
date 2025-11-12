import React, { useEffect, useState } from "react";
import api from "../lib/api";
import WebApp from "@twa-dev/sdk";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [role, setRole] = useState<"user" | "moderator" | "admin">("user");

  const correctPassword = "krd2025";

  useEffect(() => {
    const loadUser = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        if (!tgUser) return;

        const res = await api.get(`/user/${tgUser.id}`);
        setRole(res.data.role || "user");
      } catch (err) {
        console.log("Ошибка:", err);
      }
    };

    loadUser();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (password === correctPassword) {
      setAuthorized(true);
    } else {
      alert("Неверный пароль");
    }
  };

  useEffect(() => {
    if (authorized && role === "admin") {
      api
        .get("/users/admin-list")
        .then((res) => setUsers(res.data))
        .catch((err) => console.error(err));
    }
  }, [authorized, role]);

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      await api.patch(`/users/${id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      alert("Ошибка обновления роли");
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
            placeholder="Пароль"
            className="p-3 bg-neutral-800 rounded-xl text-center"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="bg-emerald-600 py-2 rounded-xl font-semibold"
          >
            Войти
          </button>
        </form>
      </div>
    );
  }

  if (role !== "admin")
    return (
      <div className="text-center text-red-400 p-6 text-xl">
        ⛔ У вас нет доступа к админ-панели
      </div>
    );

  return (
    <div className="p-4 text-white bg-black min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Админ-панель 👑</h1>

      <table className="min-w-full border border-gray-700 text-sm">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-3 py-2 border">ID</th>
            <th className="px-3 py-2 border">Имя</th>
            <th className="px-3 py-2 border">Телефон</th>
            <th className="px-3 py-2 border">Роль</th>
            <th className="px-3 py-2 border">Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td className="border px-3 py-2">{u.id}</td>
              <td className="border px-3 py-2">
                {u.firstName} {u.lastName}
              </td>
              <td className="border px-3 py-2">{u.phone}</td>
              <td className="border px-3 py-2">{u.role}</td>

              <td className="border px-3 py-2">
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="bg-neutral-800 px-2 py-1 rounded"
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
  );
}

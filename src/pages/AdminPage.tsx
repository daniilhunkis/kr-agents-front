import React, { useEffect, useState } from "react";
import {
  getAllUsers,
  updateUserRole,
  changeModeratorPassword,
  type UserDto,
} from "../lib/api";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<UserDto[]>([]);
  const ADMIN_ID = 776430926; // твой Telegram ID (число!)

  // ---- ЛОГИН ----
  const correctPassword = "krd2025";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === correctPassword) {
      setAuthorized(true);
    } else {
      alert("Неверный пароль");
    }
  };

  // ---- ЗАГРУЗКА ЮЗЕРОВ ----
  const loadUsers = async () => {
    try {
      const list = await getAllUsers(ADMIN_ID);
      setUsers(list);
    } catch (err) {
      console.error("Ошибка загрузки пользователей", err);
    }
  };

  useEffect(() => {
    if (authorized) loadUsers();
  }, [authorized]);

  // ---- ИЗМЕНЕНИЕ РОЛЕЙ ----
  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      await updateUserRole(id, newRole as any, ADMIN_ID);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? ({
                ...u,
                role: newRole as "user" | "moderator" | "admin",
              } as UserDto)
            : u
        )
      );
      alert("Роль обновлена");
    } catch (err) {
      console.error(err);
      alert("Ошибка изменения роли");
    }
  };

  // ---- УСТАНОВКА ПАРОЛЯ МОДЕРАТОРА ----
  const handleSetModeratorPassword = async (id: number) => {
    const pwd = prompt("Введите новый пароль модератора (6 цифр):");
    if (!pwd) return;

    try {
      await changeModeratorPassword(id, {
        newPassword: pwd,
        adminId: ADMIN_ID,
      });

      alert("Пароль модератора установлен");
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Ошибка установки пароля модератора");
    }
  };

  // ---- ФОРМА ВХОДА ----
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

  // ---- АДМИН-ПАНЕЛЬ ----
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

                <td className="border border-gray-700 px-3 py-2 flex flex-col gap-2">
                  {/* Изменение роли */}
                  <select
                    value={u.role || "user"}
                    onChange={(e) =>
                      handleRoleChange(u.id, e.target.value)
                    }
                    className="bg-neutral-800 text-white rounded px-2 py-1"
                  >
                    <option value="user">Пользователь</option>
                    <option value="moderator">Модератор</option>
                    <option value="admin">Админ</option>
                  </select>

                  {/* Установить пароль модератора */}
                  {u.role === "moderator" && (
                    <button
                      onClick={() => handleSetModeratorPassword(u.id)}
                      className="bg-blue-600 hover:bg-blue-700 transition px-2 py-1 rounded"
                    >
                      🔐 Задать пароль модератору
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

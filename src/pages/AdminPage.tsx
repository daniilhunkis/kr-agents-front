// src/pages/AdminPage.tsx
import React, { useEffect, useState } from "react";
import type { UserDto } from "../lib/api";
import {
  getAllUsers,
  updateUserRole,
  setModeratorPassword,
} from "../lib/api";

const ADMIN_ID = 776430926; // твой Telegram ID
const ADMIN_PASSWORD = "krd2025"; // пароль для входа в админку

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modPasswords, setModPasswords] = useState<Record<number, string>>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthorized(true);
    } else {
      alert("Неверный пароль");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers(ADMIN_ID);
      setUsers(data);
    } catch (err) {
      console.error("Ошибка загрузки пользователей", err);
      alert("Не удалось загрузить список пользователей");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authorized) {
      fetchUsers();
    }
  }, [authorized]);

  const handleRoleChange = async (id: number, role: string) => {
    try {
      await updateUserRole(id, role as "user" | "moderator" | "admin", ADMIN_ID);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? {
                ...u,
                role: role as "user" | "moderator" | "admin",
              }
            : u
        )
      );
      // если роль больше не модератор — чистим пароль из локального стейта
      if (role !== "moderator") {
        setModPasswords((prev) => {
          const copy = { ...prev };
          delete copy[id];
          return copy;
        });
      }
      alert("Роль обновлена");
    } catch (err) {
      console.error("Ошибка при обновлении роли", err);
      alert("Ошибка обновления роли");
    }
  };

  const handleSetModeratorPassword = async (id: number) => {
    const pwd = modPasswords[id];
    if (!pwd || pwd.length !== 6) {
      alert("Пароль модератора должен быть 6-значным кодом");
      return;
    }

    try {
      await setModeratorPassword(id, pwd, ADMIN_ID);
      alert("Пароль модератора сохранён");
    } catch (err) {
      console.error("Ошибка установки пароля модератора", err);
      alert("Не удалось сохранить пароль модератора");
    }
  };

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
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
            placeholder="Введите пароль администратора"
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
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold mb-1">Админ-панель 👑</h1>
        <p className="text-sm text-gray-400">
          Главный админ может назначать роли и задавать пароль модераторам.
        </p>
      </div>

      {loading ? (
        <div className="text-gray-300">Загрузка пользователей…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-700 text-sm">
            <thead className="bg-gray-800">
              <tr>
                <th className="border border-gray-700 px-3 py-2">ID</th>
                <th className="border border-gray-700 px-3 py-2">Имя</th>
                <th className="border border-gray-700 px-3 py-2">Телефон</th>
                <th className="border border-gray-700 px-3 py-2">Роль</th>
                <th className="border border-gray-700 px-3 py-2">
                  Пароль модератора
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="border border-gray-700 px-3 py-2">{u.id}</td>
                  <td className="border border-gray-700 px-3 py-2">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="border border-gray-700 px-3 py-2">
                    {u.phone}
                  </td>
                  <td className="border border-gray-700 px-3 py-2">
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
                  </td>
                  <td className="border border-gray-700 px-3 py-2">
                    {u.role === "moderator" ? (
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="6-значный код"
                          value={modPasswords[u.id] ?? ""}
                          onChange={(e) =>
                            setModPasswords((prev) => ({
                              ...prev,
                              [u.id]: e.target.value.replace(/\D/g, "").slice(0, 6),
                            }))
                          }
                          className="bg-neutral-800 text-white rounded px-2 py-1 w-full sm:w-32"
                        />
                        <button
                          type="button"
                          onClick={() => handleSetModeratorPassword(u.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-xs sm:text-sm rounded px-2 py-1"
                        >
                          Сохранить
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-xs">
                        Доступно только для модераторов
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="border border-gray-700 px-3 py-4 text-center text-gray-400"
                  >
                    Пользователей пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

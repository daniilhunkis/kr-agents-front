import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import {
  getAllUsers,
  updateUserRole,
  setModeratorPassword,
} from "../lib/api";
import type { UserDto } from "../lib/api";

const ADMIN_MASTER_PASSWORD = "krd2025";
const MAIN_ADMIN_ID = 776430926; // твой TG ID

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [masterPassword, setMasterPassword] = useState("");
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (masterPassword === ADMIN_MASTER_PASSWORD) {
      setAuthorized(true);
    } else {
      alert("Неверный пароль");
    }
  };

  useEffect(() => {
    if (!authorized) return;

    setLoading(true);
    getAllUsers(MAIN_ADMIN_ID)
      .then((data) => setUsers(data))
      .catch((err) => {
        console.error(err);
        alert("Ошибка загрузки пользователей");
      })
      .finally(() => setLoading(false));
  }, [authorized]);

  const handleRoleChange = async (user: UserDto, newRole: string) => {
    if (user.id === MAIN_ADMIN_ID) {
      alert("Нельзя менять роль главного админа");
      return;
    }

    const prevRole = user.role || "user";

    if (newRole === prevRole) return;

    try {
      if (newRole === "moderator") {
        const pwd = window.prompt(
          "Введите пароль для модератора (например, 6-значный код):",
        );
        if (!pwd) {
          return;
        }

        await updateUserRole(user.id, "moderator", MAIN_ADMIN_ID);
        await setModeratorPassword(user.id, pwd, MAIN_ADMIN_ID);

        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id ? { ...u, role: "moderator", moderatorPassword: pwd } : u,
          ),
        );
        alert("Роль модератора и пароль успешно назначены");
      } else if (newRole === "user") {
        await updateUserRole(user.id, "user", MAIN_ADMIN_ID);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: "user" } : u)),
        );
        alert("Роль пользователя назначена");
      } else if (newRole === "admin") {
        // если ты хочешь разрешить создавать других админов
        await updateUserRole(user.id, "admin", MAIN_ADMIN_ID);
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, role: "admin" } : u)),
        );
        alert("Роль админа назначена");
      }
    } catch (err) {
      console.error(err);
      alert("Ошибка при обновлении роли");
    }
  };

  // --- Проверка, что это именно главный админ по TG ID ---
  useEffect(() => {
    const tgUser = WebApp.initDataUnsafe?.user;
    if (!tgUser) return;

    if (tgUser.id !== MAIN_ADMIN_ID) {
      // не показываем админку вообще
      setAuthorized(false);
    }
  }, []);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-full">
        <form
          onSubmit={handleLogin}
          className="bg-neutral-900 p-6 rounded-2xl shadow-lg w-full max-w-sm flex flex-col gap-4"
        >
          <h2 className="text-xl font-semibold text-center mb-2">
            🔒 Вход в админку
          </h2>
          <input
            type="password"
            value={masterPassword}
            onChange={(e) => setMasterPassword(e.target.value)}
            placeholder="Мастер-пароль"
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
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Админ-панель 👑</h1>

      {loading ? (
        <div>Загрузка пользователей...</div>
      ) : (
        <>
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
                    <td className="border border-gray-700 px-3 py-2">
                      {u.phone}
                    </td>
                    <td className="border border-gray-700 px-3 py-2">
                      {u.role || "user"}
                    </td>
                    <td className="border border-gray-700 px-3 py-2">
                      <select
                        value={u.role || "user"}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
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
        </>
      )}
    </div>
  );
}

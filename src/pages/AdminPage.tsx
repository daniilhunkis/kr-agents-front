import React, { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import axios from "axios";

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "https://app.krd-agents.ru/api";
  const tgUser = WebApp.initDataUnsafe?.user;

  // локальный пароль
  const ADMIN_PASSWORD = "kradmin123";

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("isAdminLoggedIn", "true");
      setIsAuthorized(true);
      fetchUsers();
    } else {
      WebApp.showAlert("Неверный пароль 😕");
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/users/all`);
      setUsers(res.data || []);
    } catch {
      WebApp.showAlert("Ошибка загрузки списка пользователей");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (userId: number, currentRole: string) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      await axios.post(`${API_BASE}/users/role`, { user_id: userId, role: newRole });
      WebApp.showAlert("Роль обновлена");
      fetchUsers();
    } catch {
      WebApp.showAlert("Ошибка изменения роли");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("isAdminLoggedIn");
    if (stored === "true") {
      setIsAuthorized(true);
      fetchUsers();
    }
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white px-6">
        <h1 className="text-2xl font-bold mb-4">Админ-панель 🔐</h1>
        <input
          type="password"
          placeholder="Введите пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-neutral-800 p-3 rounded-xl mb-4 w-full max-w-sm text-center"
        />
        <button
          onClick={handleLogin}
          className="bg-emerald-500 px-6 py-2 rounded-xl hover:bg-emerald-600"
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-center">Админ-панель ⚙️</h1>

      {loading ? (
        <div className="text-center">Загрузка...</div>
      ) : (
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="text-gray-400 text-center">Пользователи не найдены</div>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="bg-neutral-900 p-4 rounded-xl flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold">
                    {u.firstName} {u.lastName}
                  </div>
                  <div className="text-gray-400 text-sm">{u.phone}</div>
                </div>
                <button
                  onClick={() => toggleRole(u.id, u.role)}
                  className={`px-3 py-1 rounded-xl text-sm ${
                    u.role === "admin"
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : "bg-gray-700 hover:bg-gray-600"
                  }`}
                >
                  {u.role === "admin" ? "Админ" : "Пользователь"}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import axios from "axios";

export default function MainLayout() {
  const location = useLocation();
  const [role, setRole] = useState<string>("user");

  const [debug, setDebug] = useState<any>({
    tgId: null,
    apiUrl: "",
    response: null,
    error: null,
  });

  const API_BASE = import.meta.env.VITE_API_URL || "https://api.krd-agents.ru";

  useEffect(() => {
    const checkRole = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;

        if (!tgUser) {
          setDebug((d: any) => ({ ...d, error: "Нет данных Telegram" }));
          return;
        }

        const id = tgUser.id;

        const url = `${API_BASE}/api/user/${id}`;

        setDebug((d: any) => ({ ...d, tgId: id, apiUrl: url }));

        const res = await axios.get(url);

        setDebug((d: any) => ({
          ...d,
          response: res.data,
        }));

        setRole(res.data.role || "user");
      } catch (err: any) {
        setDebug((d: any) => ({
          ...d,
          error: err.message || "Ошибка API",
        }));
      }
    };

    checkRole();
  }, []);

  const menuItems = [
    { to: "/", label: "🏠 Главная" },
    { to: "/search", label: "🔎 Поиск" },
    { to: "/express", label: "⚡ Экспресс" },
    { to: "/profile", label: "👤 Профиль" },

    ...(role === "admin" || role === "moderator"
      ? [{ to: "/admin", label: "⚙️ Админ" }]
      : []),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-tgBg text-white">
      {/* Контент */}
      <main className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </main>

      {/* Нижнее меню */}
      <nav className="flex justify-around bg-gray-800/80 py-3 border-t border-gray-700 backdrop-blur-md">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`text-sm ${
              location.pathname === item.to
                ? "text-emerald-400 font-semibold"
                : "text-gray-300"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* DIAGNOSTIC INFO */}
      <div className="fixed bottom-0 left-0 w-full bg-black/70 text-xs p-2 text-yellow-400">
        <div>TG ID: {debug.tgId || "нет"}</div>
        <div>API URL: {debug.apiUrl}</div>
        <div>Role: {role}</div>
        <div>Response: {JSON.stringify(debug.response)}</div>
        <div>Error: {debug.error}</div>
      </div>
    </div>
  );
}

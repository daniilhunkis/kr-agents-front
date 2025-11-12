// src/layouts/MainLayout.tsx
import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import axios from "axios";

export default function MainLayout() {
  const location = useLocation();
  const [role, setRole] = useState<string>("user");

  const API_BASE = import.meta.env.VITE_API_URL || "https://api.krd-agents.ru";

  useEffect(() => {
    const checkRole = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        console.log("TG USER in MainLayout:", tgUser);

        if (!tgUser) {
          console.log("Нет tgUser — обычный браузер или WebApp не инициализирован");
          return;
        }

        const url = `${API_BASE}/api/user/${tgUser.id}`;
        console.log("Role check URL:", url);

        const res = await axios.get(url);
        console.log("Response from /api/user/{id}:", res.data);

        const r = res.data.role || "user";
        setRole(r);
        console.log("Final role in state:", r);
      } catch (err: any) {
        console.error("Ошибка проверки роли", err);
        setRole("user");
      }
    };

    checkRole();
  }, []);

  const menuItems = [
    { to: "/", label: "🏠 Главная" },
    { to: "/search", label: "🔎 Поиск" },
    { to: "/express", label: "⚡ Экспресс" },
    { to: "/profile", label: "👤 Мои объекты" },
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

      {/* Нижнее меню — фиксируем внизу */}
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around bg-gray-800/90 py-3 border-t border-gray-700 backdrop-blur-md">
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

      {/* чтобы контент не залезал под меню */}
      <div className="h-16" />
    </div>
  );
}

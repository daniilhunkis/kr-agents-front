import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import api from "../lib/api";

export default function MainLayout() {
  const location = useLocation();
  const [role, setRole] = useState<"user" | "moderator" | "admin">("user");

  useEffect(() => {
    const loadRole = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        if (!tgUser) return;

        const res = await api.get(`/user/${tgUser.id}`);
        setRole(res.data.role || "user");
      } catch (err) {
        console.log("Ошибка загрузки роли:", err);
      }
    };

    loadRole();
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

      <main className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </main>

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
    </div>
  );
}

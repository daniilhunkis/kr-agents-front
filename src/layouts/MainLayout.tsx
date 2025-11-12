import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import axios from "axios";

export default function MainLayout() {
  const location = useLocation();
  const [role, setRole] = useState<string>("user");

  const API_BASE = import.meta.env.VITE_API_URL; // https://api.krd-agents.ru

  useEffect(() => {
    const loadRole = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        if (!tgUser) return;

        console.log("Checking user role for:", tgUser.id);

        // запрос в backend
        const res = await axios.get(`${API_BASE}/api/user/${tgUser.id}`);

        console.log("User response:", res.data);

        if (res.data.role) {
          setRole(res.data.role);
        } else {
          setRole("user");
        }
      } catch (err: any) {
        console.error("Ошибка получения роли:", err.response || err);
      }
    };

    loadRole();
  }, []);

  const menuItems = [
    { to: "/", label: "🏠 Главная" },
    { to: "/search", label: "🔎 Поиск" },
    { to: "/express", label: "⚡ Экспресс" },
    { to: "/profile", label: "👤 Мои объекты" },

    // показываем админку только если admin или moderator
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
    </div>
  );
}

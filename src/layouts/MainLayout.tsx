import { Outlet, Link, useLocation } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import { useEffect, useState } from "react";
import axios from "axios";

export default function MainLayout() {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || "https://app.krd-agents.ru/api";
  const tgUser = WebApp.initDataUnsafe?.user;

  useEffect(() => {
    const checkAdmin = async () => {
      if (!tgUser) return;
      try {
        const res = await axios.get(`${API_BASE}/admin/check/${tgUser.id}`);
        setIsAdmin(res.data.is_admin);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [tgUser]);

  const menuItems = [
    { to: "/", label: "🏠 Главная" },
    { to: "/search", label: "🔎 Поиск" },
    { to: "/express", label: "⚡ Экспресс" },
    { to: "/profile", label: "📋 Мои объекты" },
    ...(isAdmin ? [{ to: "/admin", label: "⚙️ Админка" }] : []),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-tgBg text-white">
      <main className="flex-1 p-4 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="flex justify-around bg-gray-800/80 py-3 border-t border-gray-700 backdrop-blur-md fixed bottom-0 left-0 w-full">
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

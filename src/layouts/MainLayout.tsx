import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { checkAdminRole } from "../lib/api";

type Role = "user" | "moderator" | "admin" | "unknown";

export default function MainLayout() {
  const location = useLocation();
  const [role, setRole] = useState<Role>("unknown");

  useEffect(() => {
    const tgUser = WebApp.initDataUnsafe?.user;
    if (!tgUser) {
      setRole("user");
      return;
    }

    checkAdminRole(tgUser.id)
      .then((data) => {
        const r = (data.role || "user") as Role;
        setRole(r);
      })
      .catch(() => setRole("user"));
  }, []);

  const menuItems = [
    { to: "/", label: "🏠 Главная" },
    { to: "/search", label: "🔎 Поиск" },
    { to: "/express", label: "⚡ Экспресс" },
    { to: "/profile", label: "👤 Мои объекты" },
    ...(role === "admin"
      ? [{ to: "/admin", label: "⚙️ Админ" }]
      : role === "moderator"
      ? [{ to: "/moderation", label: "🛡 Модерация" }]
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

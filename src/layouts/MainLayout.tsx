import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { getUser } from "../lib/api";

export default function MainLayout() {
  const location = useLocation();
  const [role, setRole] = useState("user");

  useEffect(() => {
    const load = async () => {
      const tgUser = WebApp.initDataUnsafe?.user;
      if (!tgUser) return;

      try {
        const data = await getUser(tgUser.id);
        setRole(data.role || "user");
      } catch {
        setRole("user");
      }
    };

    load();
  }, []);

  const menuItems = [
    { to: "/", label: "🏠 Главная" },
    { to: "/search", label: "🔎 Поиск" },
    { to: "/express", label: "⚡ Экспресс" },
    { to: "/profile", label: "👤 Профиль" },
    ...(role === "admin"
      ? [{ to: "/admin", label: "⚙️ Админ" }]
      : role === "moderator"
      ? [{ to: "/moderator", label: "🛠 Модерация" }]
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
            className={
              location.pathname === item.to
                ? "text-emerald-400 font-semibold"
                : "text-gray-300"
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

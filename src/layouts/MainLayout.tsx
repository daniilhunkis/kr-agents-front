// src/layouts/MainLayout.tsx
import { Outlet, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { getUser } from "../lib/api";

const MAIN_ADMIN_ID = 776430926; // твой Telegram ID

export default function MainLayout() {
  const location = useLocation();
  const [role, setRole] = useState<"user" | "moderator" | "admin">("user");

  useEffect(() => {
    const checkRole = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        if (!tgUser) {
          console.warn("Нет WebApp.initDataUnsafe.user, меню без админки");
          return;
        }

        console.log("TG ID:", tgUser.id);

        try {
          const user = await getUser(tgUser.id);
          console.log("Ответ /api/user:", user);
          const r = (user.role as any) || (tgUser.id === MAIN_ADMIN_ID ? "admin" : "user");
          setRole(r);
        } catch (err: any) {
          console.error("Ошибка при запросе /api/user", err);
          if (tgUser.id === MAIN_ADMIN_ID) {
            setRole("admin");
          }
        }
      } catch (e) {
        console.error("Ошибка checkRole", e);
      }
    };

    checkRole();
  }, []);

  const menuItems = [
    { to: "/", label: "🏠 Главная" },
    { to: "/search", label: "🔎 Поиск" },
    { to: "/express", label: "⚡ Экспресс" },
    { to: "/my-objects", label: "📂 Мои объекты" },
    // Профиль можно убрать, если все в "Мои объекты"
    // { to: "/profile", label: "👤 Профиль" },
    ...(role === "admin" || role === "moderator"
      ? [{ to: "/admin", label: "⚙️ Админ" }]
      : []),
  ];

  const hideNav = location.pathname === "/login";

  return (
    <div className="flex flex-col min-h-screen bg-tgBg text-white">
      {/* Контент */}
      <main className="flex-1 p-4 overflow-y-auto pb-16">
        <Outlet />
      </main>

      {/* Нижнее меню */}
      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 flex justify-around bg-gray-900/90 py-3 border-t border-gray-700 backdrop-blur-md">
          {menuItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`text-xs sm:text-sm ${
                location.pathname === item.to
                  ? "text-emerald-400 font-semibold"
                  : "text-gray-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

// src/layouts/MainLayout.tsx
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { getUser, type UserDto } from "../lib/api";

type CheckState = "idle" | "checking" | "ready";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [checkState, setCheckState] = useState<CheckState>("checking");
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);

  useEffect(() => {
    const run = async () => {
      if (location.pathname === "/login") {
        setCheckState("ready");
        return;
      }

      try {
        const tgUser = WebApp.initDataUnsafe?.user;

        if (!tgUser) {
          setCheckState("ready");
          return;
        }

        const user = await getUser(tgUser.id);
        setCurrentUser(user);

        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        setCheckState("ready");
      } catch {
        navigate("/login", { replace: true });
      }
    };

    run();
  }, [location.pathname, navigate]);

  if (checkState === "checking") {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        Загрузка...
      </div>
    );
  }

  // ==== МЕНЮ ====
  const menuItems = [
    { to: "/", label: "🏠 Главная" },
    { to: "/search", label: "🔎 Поиск" },
    { to: "/express", label: "⚡ Экспресс" },
    { to: "/my-objects", label: "📦 Мои объекты" },
  ];

  // главный админ → видит всё
  if (currentUser?.role === "admin") {
    menuItems.push({ to: "/admin", label: "⚙️ Админ" });
    menuItems.push({ to: "/moderator", label: "🛡 Модерация" });
  }

  // модератор → видит только модерку
  if (currentUser?.role === "moderator") {
    menuItems.push({ to: "/moderator", label: "🛡 Модерация" });
  }

  return (
    <div className="flex flex-col min-h-screen bg-tgBg text-white">
      <main className="flex-1 p-4 pb-16 overflow-y-auto">
        <Outlet context={{ currentUser }} />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex justify-around bg-gray-900/95 py-2">
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

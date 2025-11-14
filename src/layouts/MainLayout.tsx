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
      // Страницу /login не защищаем — там форма регистрации
      if (location.pathname === "/login") {
        setCheckState("ready");
        return;
      }

      setCheckState("checking");

      try {
        const tgUser = WebApp.initDataUnsafe?.user;

        // В обычном браузере без Telegram — просто показываем контент (для разработки)
        if (!tgUser) {
          setCheckState("ready");
          return;
        }

        // Если уже регистрировались — просто пытаемся подтянуть профиль
        const registeredFlag = localStorage.getItem("kr_user_registered");

        if (registeredFlag === "true") {
          try {
            const user = await getUser(tgUser.id);
            setCurrentUser(user);
            setCheckState("ready");
            return;
          } catch (e) {
            // если вдруг пользователя нет — отправим на логин
            navigate("/login", { replace: true });
            return;
          }
        }

        // Первый раз: пробуем получить пользователя
        try {
          const user = await getUser(tgUser.id);
          setCurrentUser(user);
          localStorage.setItem("kr_user_registered", "true");
          setCheckState("ready");
        } catch (err: any) {
          // 404 → новый пользователь, ведём на логин
          navigate("/login", { replace: true });
        }
      } catch (e) {
        console.error("Auth check error:", e);
        setCheckState("ready");
      }
    };

    run();
  }, [location.pathname, navigate]);

  // Меню
  const menuItems = [
    { to: "/", label: "🏠 Главная" },
    { to: "/search", label: "🔎 Поиск" },
    { to: "/express", label: "⚡ Экспресс" },
    { to: "/profile", label: "📦 Мои объекты" },
  ];

  if (currentUser?.role === "admin" || currentUser?.role === "moderator") {
    menuItems.push({ to: "/admin", label: "⚙️ Админ" });
  }

  if (checkState === "checking" && location.pathname !== "/login") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tgBg text-white">
        Загрузка...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-tgBg text-white">
      <main className="flex-1 p-4 pb-16 overflow-y-auto">
        {/* прокидываю currentUser через контекст Outleta, если захочешь использовать */}
        <Outlet context={{ currentUser }} />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 flex justify-around bg-gray-900/90 py-2 border-t border-gray-800 backdrop-blur-xl">
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
    </div>
  );
}

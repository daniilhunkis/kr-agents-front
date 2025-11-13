import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import type { UserDto, UserRole } from "../lib/api";
import { getUser } from "../lib/api";

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>("user");
  const [checkingUser, setCheckingUser] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      // чтобы не устраивать гонки, если мы уже на странице логина – не трогаем
      if (location.pathname === "/login") {
        setCheckingUser(false);
        return;
      }

      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        if (!tgUser) {
          // в обычном браузере без Telegram WebApp просто даём зайти
          setCheckingUser(false);
          return;
        }

        const userId = tgUser.id;
        let user: UserDto | null = null;

        try {
          user = await getUser(userId);
        } catch (err: any) {
          // 404 – значит, юзер не зарегистрирован → на форму
          if (err?.response?.status === 404) {
            navigate("/login", { replace: true });
            return;
          } else {
            console.error("Ошибка при запросе пользователя", err);
          }
        }

        if (!user) {
          // на всякий случай, если выше что-то пошло не так
          navigate("/login", { replace: true });
          return;
        }

        // если нет имени или телефона – считаем, что профиль не заполнен
        if (!user.firstName || !user.phone) {
          navigate("/login", { replace: true });
          return;
        }

        // роль для меню
        setRole(user.role || "user");
      } finally {
        setCheckingUser(false);
      }
    };

    checkUser();
    // важно: следим за pathname, чтобы при смене страниц не было лишней гонки
  }, [location.pathname, navigate]);

  const menuItems = [
    { to: "/", label: "🏠 Главная" },
    { to: "/search", label: "🔎 Поиск" },
    { to: "/express", label: "⚡ Экспресс" },
    { to: "/profile", label: "🏢 Мои объекты" },
    ...(role === "admin"
      ? [{ to: "/admin", label: "👑 Админка" }]
      : role === "moderator"
      ? [{ to: "/moderator", label: "🛠 Модерация" }]
      : []),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-tgBg text-white">
      {/* Контент */}
      <main className="flex-1 p-4 pb-20 overflow-y-auto">
        {checkingUser && location.pathname !== "/login" ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            Загрузка...
          </div>
        ) : (
          <Outlet />
        )}
      </main>

      {/* Нижнее меню — фиксировано внизу, как в ТГ-кошельке */}
      {location.pathname !== "/login" && (
        <nav className="fixed bottom-0 left-0 right-0 flex justify-around bg-gray-900/90 py-3 border-t border-gray-800 backdrop-blur-md">
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
      )}
    </div>
  );
}

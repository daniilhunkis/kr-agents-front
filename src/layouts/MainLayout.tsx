import { Outlet, Link, useLocation } from "react-router-dom";
import TelegramLogin from "../components/TelegramLogin";

export default function MainLayout() {
  const location = useLocation();

  const menuItems = [
    { to: "/", label: "🏠 Главная" },
    { to: "/search", label: "🔎 Поиск" },
    { to: "/express", label: "⚡ Экспресс" },
    { to: "/profile", label: "👤 Профиль" },
    { to: "/admin", label: "⚙️ Админ" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-neutral-950 text-white relative">
      {/* Telegram авторизация при первом входе */}
      <TelegramLogin />

      {/* Основной контент */}
      <main className="flex-1 overflow-y-auto pb-20 px-4">
        <Outlet />
      </main>

      {/* Фиксированное нижнее меню */}
      <nav className="fixed bottom-0 left-0 w-full bg-gray-900/90 border-t border-gray-800 backdrop-blur-md flex justify-around py-3 z-40">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`text-sm transition ${
              location.pathname === item.to
                ? "text-emerald-400 font-semibold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

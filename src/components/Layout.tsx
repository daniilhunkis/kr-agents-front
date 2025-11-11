import { Outlet, Link, useLocation } from "react-router-dom";

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-tgBg text-white flex flex-col">
      {/* Контент */}
      <div className="flex-1 p-4">
        <Outlet />
      </div>

      {/* Нижнее меню */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-gray-800 flex justify-around py-2 text-sm">
        <Link to="/" className={pathname === "/" ? "text-accent" : "text-gray-400"}>
          🏠 Главная
        </Link>
        <Link to="/search" className={pathname === "/search" ? "text-accent" : "text-gray-400"}>
          🔍 Поиск
        </Link>
        <Link to="/express" className={pathname === "/express" ? "text-accent" : "text-gray-400"}>
          ⚡ Подбор
        </Link>
        <Link to="/profile" className={pathname === "/profile" ? "text-accent" : "text-gray-400"}>
          👤 Профиль
        </Link>
      </nav>
    </div>
  );
}

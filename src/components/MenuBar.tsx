import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MenuBar() {
  const [isTg, setIsTg] = useState(false);

  useEffect(() => {
    // Проверяем, открыто ли приложение в Telegram WebApp
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("telegram")) {
      setIsTg(true);
    }
  }, []);

  const menuItems = [
    { path: "/", label: "Главная", icon: "🏠" },
    { path: "/search", label: "Поиск", icon: "🔍" },
    { path: "/express", label: "Экспресс", icon: "⚡" },
    { path: "/promotion", label: "Продвижение", icon: "🚀" },
    { path: "/profile", label: "Профиль", icon: "👤" },
  ];

  return (
    <>
      <div className="h-[70px]" /> {/* отступ под фиксированное меню */}
      <nav
        className="fixed bottom-0 left-0 w-full bg-[#0f0f0f] flex justify-around items-center py-3 border-t border-gray-800 z-50"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.4)",
        }}
      >
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center text-xs transition ${
                isActive ? "text-[#00BFFF]" : "text-gray-400"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}

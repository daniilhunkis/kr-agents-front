import { Outlet } from "react-router-dom";
import MenuBar from "./MenuBar";
import { useEffect } from "react";

export default function Layout() {
  useEffect(() => {
    // Настройка Telegram WebApp темы (если открыт внутри Telegram)
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.expand(); // разворачиваем на весь экран
      tg.setBackgroundColor("#0f0f0f");
      tg.setHeaderColor("#0f0f0f");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f0f] text-white">
      {/* Основной контент */}
      <main className="flex-grow overflow-y-auto px-4 pb-[80px]">
        <Outlet />
      </main>

      {/* Нижнее меню */}
      <MenuBar />
    </div>
  );
}

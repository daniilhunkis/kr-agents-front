import { Home, Search, User } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm flex justify-around py-3">
      <button className="flex flex-col items-center text-blue-600">
        <Home className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Главная</span>
      </button>
      <button className="flex flex-col items-center text-gray-500 hover:text-blue-600">
        <Search className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Поиск</span>
      </button>
      <button className="flex flex-col items-center text-gray-500 hover:text-blue-600">
        <User className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Профиль</span>
      </button>
    </nav>
  );
}

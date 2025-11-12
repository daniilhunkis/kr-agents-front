import { useEffect, useState } from "react";
import api from "../lib/api";

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

export default function TelegramLogin() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    // Получаем данные Telegram WebApp
    const tg = (window as any).Telegram?.WebApp;
    if (!tg) return;

    tg.ready();
    const initDataUnsafe = tg.initDataUnsafe;
    if (initDataUnsafe?.user) {
      const tgUser = initDataUnsafe.user;
      setUser(tgUser);

      // Проверяем, зарегистрирован ли пользователь
      api
        .get(`/user/${tgUser.id}`)
        .then(() => setIsRegistered(true))
        .catch(() => setIsRegistered(false));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await api.post("/register", {
        id: user.id,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
      });
      setIsRegistered(true);
      alert("✅ Регистрация успешна!");
    } catch (error) {
      alert("Ошибка регистрации");
    }
  };

  if (isRegistered || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white text-black rounded-2xl p-6 w-80 shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-center">
          Добро пожаловать!
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="p-2 border rounded-md"
            placeholder="Имя"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
          />
          <input
            className="p-2 border rounded-md"
            placeholder="Фамилия"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          />
          <input
            className="p-2 border rounded-md"
            placeholder="Телефон"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white rounded-md py-2 mt-2 hover:bg-blue-700 transition"
          >
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
}

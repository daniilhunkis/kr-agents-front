import { useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function TelegramLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    const initTelegram = async () => {
      const tg = (window as any).Telegram?.WebApp;
      if (!tg) {
        alert("Telegram WebApp SDK не найден");
        return;
      }

      tg.ready(); // Telegram готов к работе
      const user = tg.initDataUnsafe?.user;

      if (!user) {
        alert("Не удалось получить данные пользователя Telegram");
        return;
      }

      // Проверяем, есть ли пользователь в БД
      try {
        const response = await axios.get(`/api/user/${user.id}`);
        const existingUser = response.data;

        if (existingUser && existingUser.phone) {
          // Пользователь уже зарегистрирован → на главную
          navigate("/");
        } else {
          // Телефона нет → на регистрацию
          navigate("/register");
        }
      } catch (err) {
        console.warn("Пользователь не найден, создаём новый:", err);
        navigate("/register");
      }
    };

    initTelegram();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-white text-center p-6">
      <h1 className="text-2xl font-bold mb-2">🚀 Вход через Telegram</h1>
      <p className="text-gray-400">
        Идёт подключение к вашему Telegram профилю...
      </p>
    </div>
  );
}

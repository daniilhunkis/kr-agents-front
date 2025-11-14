// src/components/TelegramLogin.tsx
import React, { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { getUser, registerUser, type UserDto } from "../lib/api";

export default function TelegramLogin() {
  const [isNew, setIsNew] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;

        // Если открыто в обычном браузере без Telegram — просто показываем форму
        if (!tgUser) {
          setIsNew(true);
          return;
        }

        try {
          // Пробуем получить пользователя
          const user = await getUser(tgUser.id);
          console.log("Пользователь уже зарегистрирован:", user);
          localStorage.setItem("kr_user_registered", "true");
          setIsNew(false);
          window.location.href = "/";
        } catch (err: any) {
          // 404 → новый юзер
          console.log("Новый пользователь, нужно заполнить форму");
          setIsNew(true);
        }
      } catch (e) {
        console.error("Ошибка инициализации Telegram WebApp", e);
        setIsNew(true);
      }
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const tgUser = WebApp.initDataUnsafe?.user;
      if (!tgUser) {
        alert("Не удалось получить данные Telegram пользователя.");
        return;
      }

      const payload: UserDto = {
        id: tgUser.id,
        // ВАЖНО: именно firstName / lastName / phone — как ждёт бэкенд
        firstName: name.trim(),
        lastName: surname.trim() || undefined,
        phone: phone.trim() || undefined,
      };

      console.log("Отправляем payload в /api/register:", payload);

      await registerUser(payload);

      localStorage.setItem("kr_user_registered", "true");
      WebApp.showAlert("Регистрация успешно завершена!");
      window.location.href = "/";
    } catch (err: any) {
      console.error("Ошибка при регистрации:", err?.response?.data || err);
      WebApp.showAlert("Ошибка при регистрации. Попробуйте позже.");
    }
  };

  if (isNew === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-lg">
        Загрузка...
      </div>
    );
  }

  // Уже есть в базе — маленький экран-заглушка (по идее проскочит очень быстро)
  if (!isNew) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-lg">
        Добро пожаловать!
      </div>
    );
  }

  // Новый пользователь — форма регистрации
  return (
    <div className="flex items-center justify-center h-screen bg-tgBg px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-card w-full max-w-md p-6 rounded-2xl shadow-soft flex flex-col gap-4"
      >
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Добро пожаловать 👋
        </h1>
        <p className="text-gray-400 text-center mb-4">
          Заполните короткую форму, чтобы продолжить
        </p>

        <input
          type="text"
          placeholder="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-3 rounded-xl bg-card2 text-white focus:outline-none"
          required
        />
        <input
          type="text"
          placeholder="Фамилия"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className="p-3 rounded-xl bg-card2 text-white focus:outline-none"
          required
        />
        <input
          type="tel"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-3 rounded-xl bg-card2 text-white focus:outline-none"
          required
        />

        <button
          type="submit"
          className="bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent/90 transition"
        >
          Продолжить
        </button>
      </form>
    </div>
  );
}

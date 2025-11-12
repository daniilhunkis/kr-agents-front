// src/components/TelegramLogin.tsx
import React, { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { getUser, registerUser } from "../lib/api";

export default function TelegramLogin() {
  const [isNew, setIsNew] = useState<boolean | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        if (!tgUser) {
          console.warn("Нет данных Telegram WebApp user");
          setIsNew(null);
          return;
        }

        const userId = tgUser.id;
        try {
          const user = await getUser(userId);
          console.log("Найден пользователь:", user);
          setIsNew(false);
          window.location.href = "/";
        } catch (err: any) {
          if (err?.response?.status === 404) {
            console.log("Новый пользователь, показываем форму");
            setIsNew(true);
          } else {
            console.error("Ошибка при проверке пользователя", err);
            setIsNew(true);
          }
        }
      } catch (e) {
        console.error("Ошибка init TelegramLogin", e);
        setIsNew(true);
      }
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tgUser = WebApp.initDataUnsafe?.user;
    if (!tgUser) {
      WebApp.showAlert("Не удалось получить данные Telegram. Откройте мини-приложение заново.");
      return;
    }

    try {
      await registerUser({
        id: tgUser.id,
        firstName,
        lastName,
        phone,
      });

      WebApp.showAlert("Регистрация успешно завершена!");
      window.location.href = "/";
    } catch (err) {
      console.error("Ошибка при регистрации", err);
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

  if (!isNew) {
    // Теоретически мы сюда почти не попадём, т.к. сразу редиректим
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-lg">
        Добро пожаловать!
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-black px-6">
      <form
        onSubmit={handleSubmit}
        className="bg-neutral-900 w-full max-w-md p-6 rounded-2xl shadow-lg flex flex-col gap-4"
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
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="p-3 rounded-xl bg-neutral-800 text-white focus:outline-none"
          required
        />
        <input
          type="text"
          placeholder="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="p-3 rounded-xl bg-neutral-800 text-white focus:outline-none"
        />
        <input
          type="tel"
          placeholder="Телефон"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="p-3 rounded-xl bg-neutral-800 text-white focus:outline-none"
          required
        />

        <button
          type="submit"
          className="bg-emerald-500 text-white font-semibold py-3 rounded-xl hover:bg-emerald-400 transition"
        >
          Продолжить
        </button>
      </form>
    </div>
  );
}

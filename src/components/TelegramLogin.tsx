import React, { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import axios from "axios";

export default function TelegramLogin() {
  const [isNew, setIsNew] = useState<boolean | null>(null);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");

  const API_BASE = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const init = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        if (!tgUser) return;

        const userId = tgUser.id;

        const check = await axios.get(`${API_BASE}/api/user/${userId}`);

        if (check.status === 200) {
          setIsNew(false);
          window.location.href = "/";
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          setIsNew(true);
        } else {
          console.error("Ошибка при проверке пользователя", err);
        }
      }
    };

    init();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tgUser = WebApp.initDataUnsafe?.user;
      if (!tgUser) return;

      await axios.post(`${API_BASE}/api/register`, {
        id: tgUser.id,
        firstName: name,
        lastName: surname,
        phone,
      });

      WebApp.showAlert("Регистрация успешно завершена!");
      window.location.href = "/";
    } catch (err) {
      console.error("Ошибка при регистрации", err);
      WebApp.showAlert("Ошибка при регистрации. Попробуйте позже.");
    }
  };

  if (isNew === null)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-lg">
        Загрузка...
      </div>
    );

  if (!isNew)
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white text-lg">
        Добро пожаловать!
      </div>
    );

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
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-3 rounded-xl bg-neutral-800 text-white focus:outline-none"
          required
        />
        <input
          type="text"
          placeholder="Фамилия"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
          className="p-3 rounded-xl bg-neutral-800 text-white focus:outline-none"
          required
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
          className="bg-accent text-white font-semibold py-3 rounded-xl hover:bg-accent/90 transition"
        >
          Продолжить
        </button>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    // Если приложение открыто внутри Telegram — пробуем подставить данные пользователя
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.initDataUnsafe?.user) {
      const user = tg.initDataUnsafe.user;
      setForm((prev) => ({
        ...prev,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
      }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.phone) {
      alert("Пожалуйста, заполните имя и номер телефона");
      return;
    }

    setLoading(true);
    try {
      // Отправляем данные на бэкенд
      await axios.post("/api/register", form);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Ошибка при регистрации");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white text-center p-6">
        <h2 className="text-2xl font-bold mb-2">✅ Готово!</h2>
        <p className="text-gray-400 mb-4">Ваш профиль успешно создан.</p>
        <a
          href="/"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
        >
          Перейти на главную
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 text-white p-6">
      <h1 className="text-2xl font-bold mb-2">👋 Добро пожаловать!</h1>
      <p className="text-gray-400 mb-4">Введите свои данные, чтобы начать пользоваться приложением</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="Имя"
          className="p-3 rounded-xl bg-gray-800 border border-gray-700"
        />

        <input
          type="text"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Фамилия"
          className="p-3 rounded-xl bg-gray-800 border border-gray-700"
        />

        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="Номер телефона"
          className="p-3 rounded-xl bg-gray-800 border border-gray-700"
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 p-3 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Сохраняем..." : "Продолжить"}
        </button>
      </form>
    </div>
  );
}

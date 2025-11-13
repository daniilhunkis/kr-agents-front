import React, { useState } from "react";
import { api } from "../lib/api";
import WebApp from "@twa-dev/sdk";

export default function AddObject() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [address, setAddress] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);

    try {
      const tgUser = WebApp.initDataUnsafe?.user;
      if (!tgUser) {
        alert("Ошибка: не найден Telegram user");
        return;
      }

      const fd = new FormData();
      fd.append("title", title);
      fd.append("price", price);
      fd.append("address", address);
      fd.append("userId", tgUser.id.toString());

      if (photo) fd.append("photo", photo);

      // 🔥 правильный вызов
      await api.post("/objects", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Объект добавлен!");
      setTitle("");
      setPrice("");
      setAddress("");
      setPhoto(null);
    } catch (err) {
      console.error(err);
      alert("Ошибка при добавлении объекта");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Добавить объект</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Название"
          className="p-3 rounded-xl bg-neutral-800"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="number"
          placeholder="Цена"
          className="p-3 rounded-xl bg-neutral-800"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Адрес"
          className="p-3 rounded-xl bg-neutral-800"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <input
          type="file"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          className="p-3 rounded-xl bg-neutral-800"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-600 rounded-xl py-3 font-semibold"
        >
          {loading ? "Загрузка..." : "Добавить"}
        </button>
      </form>
    </div>
  );
}

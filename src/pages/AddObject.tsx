// webapp/src/pages/AddObject.tsx
import { useState } from "react";
import { createObject } from "../lib/api";

export default function AddObject() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("title", form.title);
    fd.set("description", form.description);

    try {
      await createObject(fd);
      setMessage("✅ Объект успешно создан");
      setForm({ title: "", description: "" });
    } catch {
      setMessage("❌ Ошибка при создании объекта");
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-lg font-semibold mb-4">Добавить объект</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Название"
          className="w-full border rounded p-2"
        />
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Описание"
          className="w-full border rounded p-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
        >
          Сохранить
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
  );
}

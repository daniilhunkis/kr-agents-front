import { useState } from "react";

export default function ExpressPage() {
  const [rooms, setRooms] = useState<number>(1);
  const [budget, setBudget] = useState<number>(6000000);
  const [district, setDistrict] = useState("");

  const submit = () => {
    alert(`Экспресс-подборка отправлена:
Комнат: ${rooms}
Бюджет: ${budget.toLocaleString("ru-RU")} ₽
Район: ${district || "не указан"}`);
    // тут вызов POST /express-request
  };

  return (
    <div className="rounded-2xl bg-card p-4 border border-white/5 shadow-soft max-w-xl">
      <div className="text-lg font-semibold mb-3">Экспресс-подборка</div>
      <div className="grid gap-3">
        <label className="grid gap-1">
          <span className="text-sm text-white/70">Комнат</span>
          <input type="number" value={rooms} min={0} max={5}
                 onChange={(e) => setRooms(parseInt(e.target.value || "0"))}
                 className="bg-white/5 rounded-xl px-3 py-2 outline-none"/>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-white/70">Бюджет, ₽</span>
          <input type="number" value={budget}
                 onChange={(e) => setBudget(parseInt(e.target.value || "0"))}
                 className="bg-white/5 rounded-xl px-3 py-2 outline-none"/>
        </label>

        <label className="grid gap-1">
          <span className="text-sm text-white/70">Район</span>
          <input value={district} onChange={(e) => setDistrict(e.target.value)}
                 className="bg-white/5 rounded-xl px-3 py-2 outline-none" placeholder="Центральный / Фестивальный…"/>
        </label>

        <button onClick={submit}
                className="mt-2 rounded-xl bg-accent2 text-white px-4 py-2 font-semibold hover:bg-emerald-500/90">
          Отправить
        </button>
      </div>
    </div>
  );
}

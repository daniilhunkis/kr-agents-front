import { useState } from "react";

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]  = useState("");
  const [phone, setPhone] = useState("");

  const save = () => {
    if (!firstName || !lastName || !phone) return alert("Заполни все поля");
    alert(`Сохранили профиль: ${firstName} ${lastName}, ${phone}`);
    // POST /profile
  };

  return (
    <div className="max-w-xl grid gap-3">
      <div className="rounded-2xl bg-card p-3 border border-white/5">
        <div className="font-semibold">Профиль</div>
        <div className="text-sm text-white/70">Имя, фамилия и телефон обязательны при первом входе.</div>
      </div>

      <label className="grid gap-1">
        <span className="text-sm text-white/70">Имя</span>
        <input value={firstName} onChange={(e)=>setFirstName(e.target.value)} className="bg-white/5 rounded-xl px-3 py-2 outline-none"/>
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-white/70">Фамилия</span>
        <input value={lastName} onChange={(e)=>setLastName(e.target.value)} className="bg-white/5 rounded-xl px-3 py-2 outline-none"/>
      </label>
      <label className="grid gap-1">
        <span className="text-sm text-white/70">Телефон</span>
        <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="+7" className="bg-white/5 rounded-xl px-3 py-2 outline-none"/>
      </label>

      <button onClick={save} className="rounded-2xl bg-accent px-4 py-2 font-semibold shadow-glow hover:bg-accent/90 w-fit">
        Сохранить
      </button>
    </div>
  );
}

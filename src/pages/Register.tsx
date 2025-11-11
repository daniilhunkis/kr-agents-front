import { useState } from "react";

export default function Register() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [phone, setPhone] = useState("");

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Завершение регистрации</h1>
      <input className="border w-full p-2 rounded" placeholder="Имя" value={first} onChange={e=>setFirst(e.target.value)} />
      <input className="border w-full p-2 rounded" placeholder="Фамилия" value={last} onChange={e=>setLast(e.target.value)} />
      <input className="border w-full p-2 rounded" placeholder="Телефон" value={phone} onChange={e=>setPhone(e.target.value)} />
      <button className="bg-black text-white px-4 py-2 rounded">Сохранить</button>
    </div>
  );
}

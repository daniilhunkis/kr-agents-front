import ObjectCard from "../components/ObjectCard";
import { useMemo, useState } from "react";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const data: ObjectItem[] = useMemo(() => ([
    {
      id: "1", title: "2к, 58 м², 8/16", price: 7800000, address: "ул. Северная, 199",
      district: "Центральный", rooms: 2, area_total: 58, kitchen_area: 12,
      img: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?q=80&w=1200&auto=format&fit=crop"
    },
    {
      id: "2", title: "1к, 35 м², 6/12", price: 5400000, address: "ул. Тургенева, 100",
      district: "Фестивальный", rooms: 1, area_total: 35, kitchen_area: 9,
      img: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=1200&auto=format&fit=crop"
    }
  ]), []);

  const filtered = data.filter(d => d.title.toLowerCase().includes(q.toLowerCase()) || (d.district ?? "").toLowerCase().includes(q.toLowerCase()));

  const onShow = (id: string) => (window.location.href = `/shows?object_id=${id}`);
  const onFav = () => {};

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-card p-3 border border-white/5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск: район, метры, цена…"
          className="w-full bg-white/5 rounded-xl px-3 py-2 outline-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((o) => (
          <ObjectCard key={o.id} item={o} onShow={onShow} onFavorite={onFav}/>
        ))}
      </div>
    </div>
  );
}

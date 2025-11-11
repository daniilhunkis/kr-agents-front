import { useMemo, useState } from "react";

type ShowRow = { id: string; objectTitle: string; date: string; half: "AM"|"PM"; time?: string; status: "pending"|"confirmed"|"done" };

export default function ShowsPage() {
  const [rows, setRows] = useState<ShowRow[]>([
    { id: "sh1", objectTitle: "1к, Красная 12", date: "2025-11-12", half: "PM", time: "15:30", status: "pending" },
    { id: "sh2", objectTitle: "2к, Северная 199", date: "2025-11-13", half: "AM", time: "11:00", status: "confirmed" }
  ]);

  const grouped = useMemo(() => {
    const m = new Map<string, ShowRow[]>();
    rows.forEach(r => {
      const list = m.get(r.date) ?? [];
      list.push(r);
      m.set(r.date, list);
    });
    return Array.from(m.entries()).sort((a,b) => a[0].localeCompare(b[0]));
  }, [rows]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl bg-card p-3 border border-white/5">
        <div className="font-semibold mb-1">Календарь показов</div>
        <div className="text-sm text-white/70">Здесь список назначенных показов и их статусы.</div>
      </div>

      <div className="grid gap-3">
        {grouped.map(([date, list]) => (
          <div key={date} className="rounded-2xl bg-card2 border border-white/5 p-3">
            <div className="text-sm text-white/70 mb-2">{new Date(date).toLocaleDateString("ru-RU")}</div>
            <div className="grid gap-2">
              {list.map((r) => (
                <div key={r.id} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-2 bg-white/5 rounded-xl p-2">
                  <div className="font-medium">{r.objectTitle}</div>
                  <div className="text-xs px-2 py-1 rounded-lg bg-white/10">{r.half === "AM" ? "Первая половина" : "Вторая половина"}</div>
                  <div className="text-xs text-white/70">{r.time ?? "—"}</div>
                  <div className={`text-xs px-2 py-1 rounded-lg ${r.status === "confirmed" ? "bg-emerald-500/20 text-emerald-300" : r.status === "pending" ? "bg-yellow-500/20 text-yellow-300" : "bg-white/10"}`}>
                    {r.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

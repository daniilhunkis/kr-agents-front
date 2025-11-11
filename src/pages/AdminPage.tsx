export default function AdminPage() {
  return (
    <div className="grid gap-3">
      <div className="rounded-2xl bg-card p-3 border border-white/5">
        <div className="font-semibold">Админка / Модерация</div>
        <div className="text-sm text-white/70">Статусы объектов, подтверждение показов, ручные корректировки.</div>
      </div>

      <div className="rounded-2xl bg-card2 p-3 border border-white/5 text-white/70">
        Интерфейс модерации подключим к API — готов принять схемы.
      </div>
    </div>
  );
}

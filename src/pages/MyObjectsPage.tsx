export default function MyObjectsPage() {
  return (
    <div className="grid gap-3">
      <div className="rounded-2xl bg-card p-3 border border-white/5">
        <div className="font-semibold">Мои объекты</div>
        <div className="text-sm text-white/70">Добавляй, редактируй и отслеживай статус модерации.</div>
      </div>

      <button className="rounded-2xl bg-accent px-4 py-2 font-semibold shadow-glow hover:bg-accent/90 w-fit">
        + Добавить объект
      </button>

      {/* здесь будет таблица/список после подключения API */}
      <div className="rounded-2xl bg-card2 p-3 border border-white/5 text-white/70">
        Пока пусто. Добавь первый объект.
      </div>
    </div>
  );
}

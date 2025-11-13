// src/pages/MyObjectsPage.tsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import type { UserDto, ObjectDto } from "../lib/api";
import { getUser, registerUser, getMyObjects } from "../lib/api";

export default function MyObjectsPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [objects, setObjects] = useState<ObjectDto[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        if (!tgUser) {
          setLoading(false);
          return;
        }

        const u = await getUser(tgUser.id);
        setUser(u);
        setFirstName(u.firstName || "");
        setLastName(u.lastName || "");
        setPhone(u.phone || "");

        const objs = await getMyObjects(tgUser.id);
        setObjects(objs);
      } catch (e) {
        console.error("Ошибка загрузки профиля или объектов", e);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSavingProfile(true);
      await registerUser({
        id: user.id,
        firstName,
        lastName,
        phone,
        role: user.role,
      });
      WebApp.showAlert("Профиль обновлён");
      setUser((prev) =>
        prev
          ? { ...prev, firstName, lastName, phone }
          : { id: user.id, firstName, lastName, phone }
      );
    } catch (e) {
      console.error("Ошибка сохранения профиля", e);
      WebApp.showAlert("Не удалось сохранить профиль");
    } finally {
      setSavingProfile(false);
    }
  };

  const statusLabel: Record<string, string> = {
    pending: "На модерации",
    approved: "Одобрен",
    rejected: "Отклонён",
    revision: "На доработке",
  };

  const statusColor: Record<string, string> = {
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    rejected: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    revision: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-tgBg text-white">
        Загрузка...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-tgBg text-white px-6 text-center">
        <div className="text-xl mb-2">Нужно авторизоваться</div>
        <p className="text-sm text-white/70">
          Откройте мини-приложение из Telegram, чтобы мы могли подтянуть ваш
          профиль.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Профиль */}
      <div className="rounded-2xl bg-card p-4 border border-white/5">
        <h1 className="text-xl font-semibold mb-1">Мой профиль</h1>
        <p className="text-sm text-white/70 mb-3">
          Эти данные нужны, чтобы клиенты и застройщики могли с вами связаться.
        </p>

        <form onSubmit={handleSaveProfile} className="grid gap-2 text-sm">
          <input
            type="text"
            placeholder="Имя"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
            required
          />
          <input
            type="text"
            placeholder="Фамилия"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
          />
          <input
            type="tel"
            placeholder="Телефон"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
            required
          />

          <button
            type="submit"
            disabled={savingProfile}
            className="mt-2 py-2 rounded-xl bg-accent hover:bg-accent/90 text-sm font-semibold disabled:opacity-60"
          >
            {savingProfile ? "Сохраняем..." : "Сохранить профиль"}
          </button>
        </form>
      </div>

      {/* Кнопка добавить объект */}
      <div className="rounded-2xl bg-card2 p-4 border border-white/5 flex items-center justify-between gap-3">
        <div>
          <div className="font-semibold text-sm">Мои объекты</div>
          <div className="text-xs text-white/60">
            Добавляйте объекты и отправляйте их на модерацию.
          </div>
        </div>
        <Link
          to="/add-object"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold"
        >
          + Добавить объект
        </Link>
      </div>

      {/* Список объектов */}
      <div className="grid gap-3">
        {objects.length === 0 && (
          <div className="text-center text-sm text-white/60 py-4">
            У вас пока нет объектов. Нажмите &laquo;Добавить объект&raquo;, чтобы
            разместить первый.
          </div>
        )}

        {objects.map((obj) => (
          <div
            key={obj.id}
            className="rounded-2xl bg-card p-3 border border-white/5 flex flex-col gap-2"
          >
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="font-semibold text-sm">
                  {obj.title || `Объект #${obj.id}`}
                </div>
                <div className="text-xs text-white/60">
                  {obj.address || "Адрес не указан"}
                </div>
              </div>
              {obj.status && (
                <span
                  className={`text-[11px] px-2 py-1 rounded-full border ${
                    statusColor[obj.status] || "bg-black/40 border-white/10"
                  }`}
                >
                  {statusLabel[obj.status] || obj.status}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-white/70">
              {obj.price && (
                <span className="px-2 py-1 rounded-full bg-black/40 border border-white/10">
                  {obj.price.toLocaleString("ru-RU")} ₽
                </span>
              )}
              {obj.rooms !== undefined && (
                <span className="px-2 py-1 rounded-full bg-black/40 border border-white/10">
                  {obj.rooms === 0 ? "Студия" : `${obj.rooms}-комн.`}
                </span>
              )}
              {obj.areaTotal && (
                <span className="px-2 py-1 rounded-full bg-black/40 border border-white/10">
                  {obj.areaTotal} м²
                </span>
              )}
              {obj.renovation && (
                <span className="px-2 py-1 rounded-full bg-black/40 border border-white/10">
                  {obj.renovation}
                </span>
              )}
            </div>

            {obj.moderatorComment && (
              <div className="mt-1 text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3 py-2">
                Комментарий модератора: {obj.moderatorComment}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

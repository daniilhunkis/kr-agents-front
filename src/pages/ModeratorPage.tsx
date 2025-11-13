// src/pages/ModeratorPage.tsx
import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import type { ObjectDto, UserDto, ObjectStatus } from "../lib/api";
import {
  getUser,
  getModerationList,
  updateObjectStatus,
  changeModeratorPassword,
} from "../lib/api";

type Phase = "loading" | "no-access" | "ready";

export default function ModeratorPage() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [user, setUser] = useState<UserDto | null>(null);
  const [objects, setObjects] = useState<ObjectDto[]>([]);
  const [statusFilter, setStatusFilter] = useState<ObjectStatus | "all">(
    "pending"
  );
  const [comments, setComments] = useState<Record<number, string>>({});
  const [pwdOld, setPwdOld] = useState("");
  const [pwdNew, setPwdNew] = useState("");
  const [pwdNew2, setPwdNew2] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [loadingObjects, setLoadingObjects] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        if (!tgUser) {
          setPhase("no-access");
          return;
        }

        const u = await getUser(tgUser.id);
        setUser(u);

        if (u.role !== "moderator" && u.role !== "admin") {
          setPhase("no-access");
          return;
        }

        setPhase("ready");
        await loadObjects();
      } catch (e) {
        console.error("Ошибка инициализации модератора", e);
        setPhase("no-access");
      }
    };

    init();
  }, []);

  const loadObjects = async () => {
    try {
      setLoadingObjects(true);
      const list = await getModerationList();
      setObjects(list);
    } catch (e) {
      console.error("Ошибка загрузки объектов на модерацию", e);
    } finally {
      setLoadingObjects(false);
    }
  };

  const handleStatus = async (
    obj: ObjectDto,
    status: ObjectStatus,
    withComment?: boolean
  ) => {
    try {
      const comment = withComment ? comments[obj.id] || "" : undefined;
      await updateObjectStatus(obj.id, status, comment);
      // убираем объект из списка (или обновляем статус)
      setObjects((prev) =>
        prev
          .map((o) => (o.id === obj.id ? { ...o, status, moderatorComment: comment } : o))
          .filter((o) => (statusFilter === "all" ? true : o.status === statusFilter))
      );
      WebApp.showAlert("Статус обновлён");
    } catch (e) {
      console.error("Ошибка обновления статуса", e);
      WebApp.showAlert("Ошибка, попробуйте ещё раз");
    }
  };

  const handleCommentChange = (id: number, value: string) => {
    setComments((prev) => ({ ...prev, [id]: value }));
  };

  const filteredObjects =
    statusFilter === "all"
      ? objects
      : objects.filter((o) => o.status === statusFilter || !o.status);

  const statusLabel: Record<ObjectStatus, string> = {
    pending: "На модерации",
    approved: "Одобрено",
    rejected: "Отклонено",
    revision: "На доработку",
  };

  const statusColor: Record<ObjectStatus, string> = {
    pending: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    rejected: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    revision: "bg-sky-500/20 text-sky-300 border-sky-500/40",
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!pwdNew || pwdNew.length < 4) {
      WebApp.showAlert("Новый пароль должен быть не короче 4 символов");
      return;
    }
    if (pwdNew !== pwdNew2) {
      WebApp.showAlert("Пароли не совпадают");
      return;
    }

    try {
      setPwdSaving(true);
      await changeModeratorPassword(user.id, pwdOld, pwdNew);
      WebApp.showAlert("Пароль модератора обновлён");
      setPwdOld("");
      setPwdNew("");
      setPwdNew2("");
    } catch (e) {
      console.error("Ошибка смены пароля модератора", e);
      WebApp.showAlert("Ошибка, проверьте старый пароль");
    } finally {
      setPwdSaving(false);
    }
  };

  // --- Рендер ---

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-tgBg text-white">
        Загрузка...
      </div>
    );
  }

  if (phase === "no-access") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-tgBg text-white px-6">
        <div className="text-2xl mb-2">🛡 Нет доступа</div>
        <p className="text-center text-white/70">
          Эта страница доступна только модераторам или админам. Если вы считаете,
          что это ошибка — напишите главному администратору.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 pb-20">
      {/* Заголовок */}
      <div className="rounded-2xl bg-card p-4 border border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Модерация объектов</h1>
            <p className="text-sm text-white/60">
              Просмотр и проверка объектов, отправленных агентами.
            </p>
          </div>
          {user && (
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/40">
              {user.role === "admin" ? "Главный админ" : "Модератор"}
            </span>
          )}
        </div>
      </div>

      {/* Фильтры */}
      <div className="rounded-2xl bg-card2 p-3 border border-white/5 flex items-center justify-between gap-3">
        <div className="text-sm text-white/70">
          Объектов:{" "}
          <span className="font-semibold text-white">{filteredObjects.length}</span>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
        >
          <option value="pending">На модерации</option>
          <option value="revision">На доработке</option>
          <option value="approved">Одобренные</option>
          <option value="rejected">Отклонённые</option>
          <option value="all">Все</option>
        </select>
      </div>

      {/* Список объектов */}
      <div className="grid gap-3">
        {loadingObjects && (
          <div className="text-center text-white/70 text-sm">
            Загрузка объектов...
          </div>
        )}

        {!loadingObjects && filteredObjects.length === 0 && (
          <div className="text-center text-white/60 text-sm py-6">
            Сейчас нет объектов, ожидающих модерации.
          </div>
        )}

        {filteredObjects.map((obj) => (
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
                  className={`text-[11px] px-2 py-1 rounded-full border ${statusColor[obj.status]}`}
                >
                  {statusLabel[obj.status]}
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

            {/* Комментарий модератора */}
            <textarea
              placeholder="Комментарий модератора (для доработки / отказа)"
              value={comments[obj.id] ?? obj.moderatorComment ?? ""}
              onChange={(e) => handleCommentChange(obj.id, e.target.value)}
              className="w-full mt-1 text-xs bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white placeholder:text-white/40 focus:outline-none"
              rows={2}
            />

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => handleStatus(obj, "approved")}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold"
              >
                ✅ Одобрить
              </button>
              <button
                onClick={() => handleStatus(obj, "revision", true)}
                className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-semibold"
              >
                ✏️ На доработку
              </button>
              <button
                onClick={() => handleStatus(obj, "rejected", true)}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold"
              >
                ⛔ Отклонить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Блок смены пароля модератора */}
      {user && user.role === "moderator" && (
        <div className="mt-4 rounded-2xl bg-card2 p-4 border border-white/5">
          <h2 className="text-sm font-semibold mb-2">Пароль модератора</h2>
          <p className="text-[11px] text-white/60 mb-3">
            Пароль нужен для подтверждения действий на стороне бэка (мы его
            будем использовать в запросах модерации). Сейчас это скорее
            подготовка под безопасную логику.
          </p>

          <form onSubmit={handleChangePassword} className="grid gap-2 text-xs">
            <input
              type="password"
              placeholder="Старый пароль (если был)"
              value={pwdOld}
              onChange={(e) => setPwdOld(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
            />
            <input
              type="password"
              placeholder="Новый пароль"
              value={pwdNew}
              onChange={(e) => setPwdNew(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              required
            />
            <input
              type="password"
              placeholder="Повторите новый пароль"
              value={pwdNew2}
              onChange={(e) => setPwdNew2(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={pwdSaving}
              className="mt-1 py-2 rounded-xl bg-accent hover:bg-accent/90 text-xs font-semibold disabled:opacity-60"
            >
              {pwdSaving ? "Сохраняем..." : "Обновить пароль модератора"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

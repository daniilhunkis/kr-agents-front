import React, { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import WebApp from "@twa-dev/sdk";
import type { UserDto, ObjectDto } from "../lib/api";
import { getMyObjects } from "../lib/api";

type OutletCtx = { currentUser: UserDto | null };

function statusLabel(status: ObjectDto["status"]) {
  switch (status) {
    case "waiting":
      return "На модерации";
    case "approved":
      return "Одобрено";
    case "rejected":
      return "Отклонено";
    case "revision":
      return "Нужна доработка";
    default:
      return status;
  }
}

function statusColor(status: ObjectDto["status"]) {
  switch (status) {
    case "waiting":
      return "bg-amber-500/20 text-amber-300";
    case "approved":
      return "bg-emerald-500/20 text-emerald-300";
    case "rejected":
      return "bg-red-500/20 text-red-300";
    case "revision":
      return "bg-sky-500/20 text-sky-300";
    default:
      return "bg-gray-600/30 text-gray-200";
  }
}

export default function MyObjectsPage() {
  const { currentUser } = useOutletContext<OutletCtx>();
  const [objects, setObjects] = useState<ObjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        let userId = currentUser?.id;
        if (!userId) {
          const tgUser = WebApp.initDataUnsafe?.user;
          if (!tgUser) return;
          userId = tgUser.id;
        }

        const res = await getMyObjects(userId!);
        setObjects(res);
      } catch (e) {
        console.error("Ошибка загрузки объектов", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tgBg text-white">
        Загрузка ваших объектов...
      </div>
    );
  }

  const total = objects.length;
  const waiting = objects.filter((o) => o.status === "waiting").length;
  const approved = objects.filter((o) => o.status === "approved").length;
  const revision = objects.filter((o) => o.status === "revision").length;

  return (
    <div className="min-h-screen bg-tgBg text-white px-4 pb-20 pt-4">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Мои объекты</h1>
          <p className="text-sm text-gray-400 mt-1">
            Всего: {total} · На модерации: {waiting} · Одобрено: {approved} ·
            Доработка: {revision}
          </p>
        </div>
      </header>

      {total === 0 ? (
        <div className="bg-card2 rounded-2xl p-4 border border-gray-800 text-sm text-gray-300">
          У вас пока нет объектов. Нажмите «Добавить объект», чтобы создать первую
          заявку.
        </div>
      ) : (
        <div className="space-y-3">
          {objects.map((o) => {
            const mainPhoto = o.photos?.[0];

            return (
              <div
                key={o.id}
                className="bg-card2 rounded-2xl flex gap-3 border border-gray-800 overflow-hidden"
              >
                {mainPhoto ? (
                  <div className="w-28 h-28 shrink-0 bg-neutral-900">
                    <img
                      src={mainPhoto}
                      alt={o.street}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 shrink-0 bg-neutral-900 flex items-center justify-center text-xs text-gray-500">
                    нет фото
                  </div>
                )}

                <div className="flex-1 p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-sm">
                      {o.roomsType}
                      {o.roomsCustom ? ` · ${o.roomsCustom}` : ""} · {o.area} м²
                    </h2>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full ${statusColor(
                        o.status
                      )}`}
                    >
                      {statusLabel(o.status)}
                    </span>
                  </div>

                  <div className="text-xs text-gray-300">
                    {o.district} · ул. {o.street}, д. {o.house}
                    {o.flat ? `, кв. ${o.flat}` : ""} · этаж {o.floor || "-"}
                  </div>

                  <div className="text-sm font-semibold">
                    {o.price.toLocaleString("ru-RU")} ₽
                  </div>

                  <div className="text-[11px] text-gray-400">
                    Комиссия:{" "}
                    {o.commissionPlace === "inside"
                      ? "внутри цены"
                      : "сверху цены"}
                    ,{" "}
                    {o.commissionValueType === "percent"
                      ? `${o.commissionValue}%`
                      : `${o.commissionValue.toLocaleString("ru-RU")} ₽`}
                  </div>

                  {o.moderatorComment && (
                    <div className="mt-1 text-[11px] text-amber-300">
                      Комментарий модератора: {o.moderatorComment}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

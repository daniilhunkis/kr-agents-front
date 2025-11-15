import React, { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { getMyObjects, type ObjectDto } from "../lib/api";

export default function MyObjectsPage() {
  const tgUser = WebApp.initDataUnsafe?.user;
  const ownerId = tgUser?.id;

  const [objects, setObjects] = useState<ObjectDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!ownerId) return;
      try {
        const data = await getMyObjects(ownerId);
        setObjects(data);
      } catch (err) {
        console.error("Ошибка загрузки моих объектов", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [ownerId]);

  if (!ownerId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tgBg text-white">
        Откройте приложение внутри Telegram
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tgBg text-white">
        Загрузка...
      </div>
    );
  }

  const statusLabel: Record<string, string> = {
    pending: "На модерации",
    approved: "Одобрено",
    needs_fix: "На доработке",
    rejected: "Отклонено",
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-300",
    approved: "bg-emerald-500/20 text-emerald-300",
    needs_fix: "bg-orange-500/20 text-orange-300",
    rejected: "bg-red-500/20 text-red-300",
  };

  return (
    <div className="min-h-screen bg-tgBg text-white px-4 pb-20 pt-4">
      <h1 className="text-2xl font-bold mb-4">Мои объекты</h1>

      {objects.length === 0 && (
        <div className="text-gray-400 text-sm">
          У тебя пока нет объектов. Нажми «Добавить объект», чтобы отправить на
          модерацию.
        </div>
      )}

      <div className="space-y-3">
        {objects.map((o) => (
          <div
            key={o.id}
            className="bg-card2 rounded-2xl p-3 border border-gray-800 text-sm"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <div className="font-semibold">
                  {o.roomsType === "other" && o.roomsCustom
                    ? o.roomsCustom
                    : o.roomsType === "studio"
                    ? "Студия"
                    : `${o.roomsType}-к квартира`}
                  {o.areaTotal ? ` · ${o.areaTotal} м²` : ""}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {[o.district, o.street, o.house, o.complexName]
                    .filter(Boolean)
                    .join(", ")}
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-full text-[11px] ${statusColor[o.status] || "bg-gray-700 text-gray-200"}`}
              >
                {statusLabel[o.status] || o.status}
              </div>
            </div>

            <div className="mt-2 flex justify-between items-center">
              <div className="text-sm font-semibold">
                {o.price.toLocaleString("ru-RU")} ₽
              </div>
              <div className="text-[11px] text-gray-400 text-right">
                Комиссия: {o.commissionValue}{" "}
                {o.commissionUnit === "percent" ? "%" : "₽"} (
                {o.commissionType === "inside" ? "внутри цены" : "сверху"})
              </div>
            </div>

            {o.comment && (
              <div className="mt-2 text-xs text-gray-300">
                <span className="font-semibold">Комментарий модератора: </span>
                {o.comment}
              </div>
            )}

            {o.photos && o.photos.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto">
                {o.photos.slice(0, 3).map((src, idx) => (
                  <img
                    key={idx}
                    src={src}
                    className="w-20 h-16 object-cover rounded-lg border border-gray-700"
                    alt="photo"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

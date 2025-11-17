import React, { useState } from "react";
import WebApp from "@twa-dev/sdk";
import { createObject } from "../lib/api";

const DISTRICTS = [
  "Центральный",
  "Прикубанский",
  "Карасунский",
  "Западный",
  "Фестивальный",
  "Юбилейный",
  "Пашковский",
  "Гидростроителей",
  "Славянский",
  "Музыкальный",
  "Московский",
  "Витаминкомбинат",
  "ГМР",
  "Черемушки",
  "40 лет Победы",
  "Молодежный",
];

const ROOM_TYPES = [
  "Студия",
  "1-комнатная",
  "2-комнатная",
  "3-комнатная",
  "Евро-2",
  "Евро-3",
  "Другое",
];

type CommissionPlace = "inside" | "on_top";
type CommissionValueType = "percent" | "fixed";

export default function AddObject() {
  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [house, setHouse] = useState("");
  const [floor, setFloor] = useState("");

  const [roomsType, setRoomsType] = useState("Студия");
  const [roomsCustom, setRoomsCustom] = useState("");

  const [area, setArea] = useState("");
  const [kitchenArea, setKitchenArea] = useState("");
  const [price, setPrice] = useState("");

  const [commissionPlace, setCommissionPlace] =
    useState<CommissionPlace>("inside");
  const [commissionValue, setCommissionValue] = useState("");
  const [commissionValueType, setCommissionValueType] =
    useState<CommissionValueType>("percent");

  const [photos, setPhotos] = useState<File[]>([]);
  const [planPhotos, setPlanPhotos] = useState<File[]>([]);
  const [docPhotos, setDocPhotos] = useState<File[]>([]);

  const [offerAccepted, setOfferAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /** --- Telegram API: универсальный способ загрузки файлов --- */
  const requestFile = async (type: "photo" | "plan" | "doc") => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (!tg) {
        alert("Ошибка: мини-апп должен быть открыт внутри Telegram");
        return;
      }

      const file = await tg.requestFile({
        mime_types: ["image/*", "application/pdf"],
        multiple: false,
      });

      if (!file) return;

      const blob = await fetch(file.file_url).then((r) => r.blob());
      const f = new File([blob], file.file_name, { type: blob.type });

      if (type === "photo") setPhotos((prev) => [...prev, f]);
      if (type === "plan") setPlanPhotos((prev) => [...prev, f]);
      if (type === "doc") setDocPhotos((prev) => [...prev, f]);
    } catch (err) {
      console.error("requestFile error:", err);
    }
  };

  const validate = (): string | null => {
    if (!district) return "Выберите район";
    if (!street.trim()) return "Укажите улицу";
    if (!house.trim()) return "Укажите дом";
    if (!floor.trim()) return "Укажите этаж";

    if (!area.trim()) return "Укажите площадь";
    if (!price.trim()) return "Укажите цену";

    if (!commissionValue.trim()) return "Укажите комиссию";

    if (photos.length === 0) return "Добавьте минимум одно фото объекта";
    if (docPhotos.length === 0)
      return "Добавьте документы (ЕГРН/договор)";

    if (!offerAccepted)
      return "Вы должны согласиться с условиями публичной оферты";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    const tgUser = WebApp.initDataUnsafe?.user;
    if (!tgUser) {
      alert("Ошибка: откройте мини-апп через Telegram-бота");
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("owner_id", String(tgUser.id));
      fd.append("district", district);
      fd.append("street", street);
      fd.append("house", house);
      fd.append("floor", floor);

      fd.append("rooms_type", roomsType);
      if (roomsType === "Другое" && roomsCustom.trim()) {
        fd.append("rooms_custom", roomsCustom.trim());
      }

      fd.append("area", area);
      if (kitchenArea) fd.append("kitchen_area", kitchenArea);

      fd.append("price", price);
      fd.append("commission_place", commissionPlace);
      fd.append("commission_value", commissionValue);
      fd.append("commission_value_type", commissionValueType);

      photos.forEach((f) => fd.append("photos", f));
      planPhotos.forEach((f) => fd.append("plan_photos", f));
      docPhotos.forEach((f) => fd.append("doc_photos", f));

      await createObject(fd);

      alert("Объект отправлен на модерацию 🎉");

      // сброс формы
      setStreet("");
      setHouse("");
      setFloor("");
      setRoomsType("Студия");
      setRoomsCustom("");
      setArea("");
      setKitchenArea("");
      setPrice("");
      setCommissionPlace("inside");
      setCommissionValue("");
      setCommissionValueType("percent");
      setPhotos([]);
      setPlanPhotos([]);
      setDocPhotos([]);
      setOfferAccepted(false);
    } catch (err) {
      console.error(err);
      alert("Ошибка при отправке. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPreview = (files: File[]) => {
    return (
      <div className="flex gap-2 overflow-x-auto mt-2">
        {files.map((file, idx) => (
          <div
            key={idx}
            className="w-20 h-20 bg-neutral-800 rounded-xl flex items-center justify-center text-[10px] px-1 text-center"
          >
            {file.name}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-tgBg text-white px-4 pb-20 pt-4">
      <h1 className="text-2xl font-bold mb-4">Добавить объект</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Адрес */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Адрес</h2>

          <label className="text-xs text-gray-400">Район</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full rounded-xl bg-card px-4 py-3"
          >
            <option value="">Выберите район</option>
            {DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Улица"
              className="bg-card rounded-xl px-4 py-3"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
            />

            <input
              placeholder="Дом"
              className="bg-card rounded-xl px-4 py-3"
              value={house}
              onChange={(e) => setHouse(e.target.value)}
            />
          </div>

          <input
            placeholder="Этаж"
            className="bg-card rounded-xl px-4 py-3"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          />
        </section>

        {/* Параметры */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Параметры</h2>

          <select
            className="bg-card rounded-xl px-4 py-3"
            value={roomsType}
            onChange={(e) => setRoomsType(e.target.value)}
          >
            {ROOM_TYPES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>

          {roomsType === "Другое" && (
            <input
              placeholder="Свой вариант"
              className="bg-card rounded-xl px-4 py-3"
              value={roomsCustom}
              onChange={(e) => setRoomsCustom(e.target.value)}
            />
          )}

          <input
            placeholder="Площадь, м²"
            className="bg-card rounded-xl px-4 py-3"
            value={area}
            onChange={(e) => setArea(e.target.value)}
          />

          <input
            placeholder="Площадь кухни"
            className="bg-card rounded-xl px-4 py-3"
            value={kitchenArea}
            onChange={(e) => setKitchenArea(e.target.value)}
          />

          <input
            placeholder="Цена"
            className="bg-card rounded-xl px-4 py-3"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </section>

        {/* Фото / файлы */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Фотографии</h2>

          <button
            type="button"
            onClick={() => requestFile("photo")}
            className="bg-emerald-600 px-4 py-2 rounded-xl w-full"
          >
            + Добавить фото объекта
          </button>

          {renderPreview(photos)}

          <button
            type="button"
            onClick={() => requestFile("plan")}
            className="bg-neutral-700 px-4 py-2 rounded-xl w-full"
          >
            + Добавить планировку
          </button>

          {renderPreview(planPhotos)}

          <button
            type="button"
            onClick={() => requestFile("doc")}
            className="bg-neutral-700 px-4 py-2 rounded-xl w-full"
          >
            + Фото документов (ЕГРН/договор)
          </button>

          {renderPreview(docPhotos)}
        </section>

        {/* Оферта */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-2">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={offerAccepted}
              onChange={(e) => setOfferAccepted(e.target.checked)}
              className="mt-1"
            />
            <span>
              Я соглашаюсь с{" "}
              <a
                href="https://krd-agents.ru/oferta"
                target="_blank"
                className="text-emerald-300 underline"
              >
                условиями публичной оферты
              </a>{" "}
              и понимаю, что заключаю агентский договор на 50 000 ₽ в случае
              продажи объекта.
            </span>
          </label>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="bg-emerald-600 w-full py-3 rounded-xl font-semibold"
        >
          {submitting ? "Отправляем..." : "Отправить на модерацию"}
        </button>
      </form>
    </div>
  );
}

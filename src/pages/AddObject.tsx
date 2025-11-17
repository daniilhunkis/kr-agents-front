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
  const [docPhotos, setDocPhotos] = useState<File[]>([]); // here only PDF goes from input (images via requestMedia)

  const [offerAccepted, setOfferAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ===========================
  // PREVIEW
  // ===========================
  const renderPreview = (files: File[]) => (
    <div className="flex gap-3 overflow-x-auto mt-2">
      {files.map((file, idx) => {
        const url = URL.createObjectURL(file);
        return (
          <div
            key={idx}
            className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0"
          >
            <img src={url} className="w-full h-full object-cover" />
          </div>
        );
      })}
    </div>
  );

  // ===========================
  // requestMedia() — iOS PHOTO PICKER
  // ===========================
  const pickMedia = async (
    type: "photo" | "plan",
  ) => {
    try {
      const tg: any = (window as any).Telegram?.WebApp;
      if (!tg) {
        alert("Мини-апп должен работать внутри Telegram");
        return;
      }

      const result = await tg.requestMedia({
        media_type: ["photo"],
        max_items: 10,
      });

      if (!result || !result.media) return;

      const newFiles: File[] = [];

      for (const item of result.media) {
        const blob = await fetch(item.url).then((r) => r.blob());
        const file = new File([blob], `photo_${Date.now()}.jpg`, {
          type: blob.type,
        });
        newFiles.push(file);
      }

      if (type === "photo") setPhotos((prev) => [...prev, ...newFiles]);
      if (type === "plan") setPlanPhotos((prev) => [...prev, ...newFiles]);
    } catch (err) {
      console.error(err);
      alert("Ошибка выбора медиа");
    }
  };

  // ===========================
  // PDF INPUT FALLBACK
  // ===========================
  const handleDocs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const selected = Array.from(files);
    setDocPhotos((prev) => [...prev, ...selected]);

    e.target.value = "";
  };

  // ===========================
  // VALIDATION
  // ===========================
  const validate = () => {
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

  // ===========================
  // SUBMIT
  // ===========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validate();
    if (err) return alert(err);

    const tgUser = WebApp.initDataUnsafe?.user;
    if (!tgUser)
      return alert("Ошибка: откройте мини-апп через Telegram");

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

      // RESET
      setDistrict("");
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
      alert("Ошибка при отправке");
    } finally {
      setSubmitting(false);
    }
  };

  // ===========================
  // RENDER
  // ===========================
  return (
    <div className="min-h-screen bg-tgBg text-white px-4 pb-20 pt-4">
      <h1 className="text-2xl font-bold mb-4">Добавить объект</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

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

        {/* Загрузка файлов */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-6">
          <h2 className="font-semibold text-lg">Фотографии</h2>

          {/* Фото объекта */}
          <button
            type="button"
            onClick={() => pickMedia("photo")}
            className="bg-emerald-600 w-full py-3 rounded-xl text-center"
          >
            + Добавить фото объекта
          </button>

          {renderPreview(photos)}

          {/* Планировки */}
          <button
            type="button"
            onClick={() => pickMedia("plan")}
            className="bg-neutral-700 w-full py-3 rounded-xl text-center"
          >
            + Добавить планировку
          </button>

          {renderPreview(planPhotos)}

          {/* Документы (PDF) */}
          <div className="relative">
            <button
              type="button"
              className="bg-neutral-700 w-full py-3 rounded-xl text-center"
            >
              + Загрузить документы (PDF)
            </button>

            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleDocs}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          {/* PDF preview — показываем иконками */}
          {docPhotos.length > 0 && (
            <div className="flex gap-3 mt-2">
              {docPhotos.map((f, i) => (
                <div
                  key={i}
                  className="w-20 h-20 bg-neutral-800 rounded-xl flex items-center justify-center text-xs text-gray-300"
                >
                  PDF
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Оферта */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800">
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
                className="text-emerald-300 underline"
                target="_blank"
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

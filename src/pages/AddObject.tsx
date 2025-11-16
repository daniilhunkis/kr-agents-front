import React, { useRef, useState } from "react";
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

  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const planInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (files: FileList | null, type: "photo" | "plan" | "doc") => {
    if (!files || files.length === 0) return;

    const file = files[0]; // по одной
    if (!file) return;

    if (type === "photo") setPhotos((prev) => [...prev, file]);
    if (type === "plan") setPlanPhotos((prev) => [...prev, file]);
    if (type === "doc") setDocPhotos((prev) => [...prev, file]);
  };

  const validate = (): string | null => {
    if (!district) return "Выберите район";
    if (!street.trim()) return "Укажите улицу";
    if (!house.trim()) return "Укажите дом";
    if (!floor.trim()) return "Укажите этаж";

    if (!area.trim()) return "Укажите площадь";
    if (!price.trim()) return "Укажите цену";

    if (photos.length === 0) return "Добавьте минимум одно фото объекта";
    if (docPhotos.length === 0)
      return "Добавьте документы (ЕГРН/договор)";

    if (!agreed) return "Вы должны согласиться с условиями оферты";

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
      alert("Откройте приложение через Telegram-бота");
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
      if (roomsType === "Другое" && roomsCustom.trim())
        fd.append("rooms_custom", roomsCustom.trim());

      fd.append("area", area.replace(",", "."));
      if (kitchenArea)
        fd.append("kitchen_area", kitchenArea.replace(",", "."));

      fd.append("price", price.replace(" ", ""));

      fd.append("commission_place", commissionPlace);
      fd.append(
        "commission_value",
        commissionValue.replace(",", ".").replace(" ", "")
      );
      fd.append("commission_value_type", commissionValueType);

      photos.forEach((f) => fd.append("photos", f));
      planPhotos.forEach((f) => fd.append("plan_photos", f));
      docPhotos.forEach((f) => fd.append("doc_photos", f));

      await createObject(fd);

      alert("Объект отправлен на модерацию 🎉");

      // сброс формы
      setDistrict("");
      setStreet("");
      setHouse("");
      setFloor("");
      setArea("");
      setKitchenArea("");
      setPrice("");
      setRoomsType("Студия");
      setRoomsCustom("");
      setCommissionPlace("inside");
      setCommissionValue("");
      setCommissionValueType("percent");
      setPhotos([]);
      setPlanPhotos([]);
      setDocPhotos([]);
      setAgreed(false);

    } catch (err) {
      console.error(err);
      alert("Ошибка отправки. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFilesPreview = (files: File[]) => (
    files.length > 0 && (
      <div className="flex gap-2 overflow-x-auto mt-2">
        {files.map((f, i) => (
          <div
            key={i}
            className="w-20 h-20 bg-neutral-800 rounded-xl flex items-center justify-center text-[10px] text-center px-1"
          >
            {f.name}
          </div>
        ))}
      </div>
    )
  );

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
            className="w-full rounded-xl bg-card px-4 py-3 text-white border border-gray-700"
          >
            <option value="">Выберите район</option>
            {DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Улица"
              className="rounded-xl bg-card px-4 py-3 border border-gray-700"
            />
            <input
              value={house}
              onChange={(e) => setHouse(e.target.value)}
              placeholder="Дом"
              className="rounded-xl bg-card px-4 py-3 border border-gray-700"
            />
          </div>

          <input
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            placeholder="Этаж"
            className="rounded-xl bg-card px-4 py-3 border border-gray-700"
          />
        </section>

        {/* Параметры */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Параметры</h2>

          <select
            value={roomsType}
            onChange={(e) => setRoomsType(e.target.value)}
            className="rounded-xl bg-card px-4 py-3 border border-gray-700"
          >
            {ROOM_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          {roomsType === "Другое" && (
            <input
              value={roomsCustom}
              onChange={(e) => setRoomsCustom(e.target.value)}
              placeholder="Свой вариант"
              className="rounded-xl bg-card px-4 py-3 border border-gray-700"
            />
          )}

          <div className="grid grid-cols-2 gap-3">
            <input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Площадь, м²"
              className="rounded-xl bg-card px-4 py-3 border border-gray-700"
            />
            <input
              value={kitchenArea}
              onChange={(e) => setKitchenArea(e.target.value)}
              placeholder="Кухня, м²"
              className="rounded-xl bg-card px-4 py-3 border border-gray-700"
            />
          </div>

          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Цена, ₽"
            className="rounded-xl bg-card px-4 py-3 border border-gray-700"
          />
        </section>

        {/* Комиссия */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Комиссия</h2>

          <div className="grid grid-cols-2 gap-3">
            <select
              value={commissionPlace}
              onChange={(e) =>
                setCommissionPlace(e.target.value as CommissionPlace)
              }
              className="rounded-xl bg-card px-4 py-3 border border-gray-700"
            >
              <option value="inside">Внутри цены</option>
              <option value="on_top">Сверху</option>
            </select>

            <select
              value={commissionValueType}
              onChange={(e) =>
                setCommissionValueType(e.target.value as CommissionValueType)
              }
              className="rounded-xl bg-card px-4 py-3 border border-gray-700"
            >
              <option value="percent">% от сделки</option>
              <option value="fixed">Фиксированная сумма ₽</option>
            </select>
          </div>

          <input
            value={commissionValue}
            onChange={(e) => setCommissionValue(e.target.value)}
            placeholder="Размер комиссии"
            className="rounded-xl bg-card px-4 py-3 border border-gray-700"
          />
        </section>

        {/* Фото */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-4">
          <h2 className="font-semibold text-lg">Фото</h2>

          <button
            type="button"
            onClick={() => photoInputRef.current?.click()}
            className="bg-emerald-600 px-4 py-2 rounded-xl"
          >
            + Добавить фото объекта
          </button>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => addFiles(e.target.files, "photo")}
          />
          {renderFilesPreview(photos)}

          <button
            type="button"
            onClick={() => planInputRef.current?.click()}
            className="bg-neutral-700 px-4 py-2 rounded-xl"
          >
            + Фото планировки
          </button>
          <input
            ref={planInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => addFiles(e.target.files, "plan")}
          />
          {renderFilesPreview(planPhotos)}

          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="bg-neutral-700 px-4 py-2 rounded-xl"
          >
            + Документы (ЕГРН/договор)
          </button>
          <input
            ref={docInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => addFiles(e.target.files, "doc")}
          />
          {renderFilesPreview(docPhotos)}
        </section>

        {/* Оферта */}
        <div className="flex items-start gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="w-5 h-5"
          />
          <span>
            Я соглашаюсь с условиями оферты и заключаю агентский договор
            на <b>50 000 ₽</b> в случае продажи объекта.
          </span>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 py-3 rounded-2xl disabled:opacity-50 font-semibold"
        >
          {submitting ? "Отправляем..." : "Отправить на модерацию"}
        </button>
      </form>
    </div>
  );
}

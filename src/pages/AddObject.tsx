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
  const [flat, setFlat] = useState("");
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

  const [submitting, setSubmitting] = useState(false);

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const planInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const addFiles = (files: FileList | null, type: "photo" | "plan" | "doc") => {
    if (!files || files.length === 0) return;
    const list = Array.from(files);
    if (type === "photo") setPhotos((prev) => [...prev, ...list]);
    if (type === "plan") setPlanPhotos((prev) => [...prev, ...list]);
    if (type === "doc") setDocPhotos((prev) => [...prev, ...list]);
  };

  const validate = (): string | null => {
    if (!district) return "Выберите район";
    if (!street.trim()) return "Укажите улицу";
    if (!house.trim()) return "Укажите дом";
    if (!floor.trim()) return "Укажите этаж";

    if (!area.trim()) return "Укажите площадь";
    if (!price.trim()) return "Укажите цену";

    if (!commissionValue.trim())
      return "Укажите размер комиссии (процент или ₽)";
    if (photos.length === 0) return "Добавьте минимум одно фото объекта";
    if (docPhotos.length === 0)
      return "Добавьте фото документов (ЕГРН/договор)";

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
      alert("Не удалось получить Telegram-пользователя, откройте через бот");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("owner_id", String(tgUser.id));
      formData.append("district", district);
      formData.append("street", street);
      formData.append("house", house);
      if (flat) formData.append("flat", flat);
      formData.append("floor", floor);

      formData.append("rooms_type", roomsType);
      if (roomsType === "Другое" && roomsCustom.trim()) {
        formData.append("rooms_custom", roomsCustom.trim());
      }

      formData.append("area", area.replace(",", "."));
      if (kitchenArea) {
        formData.append("kitchen_area", kitchenArea.replace(",", "."));
      }
      formData.append("price", price.replace(" ", ""));

      formData.append("commission_place", commissionPlace);
      formData.append(
        "commission_value",
        commissionValue.replace(",", ".").replace(" ", "")
      );
      formData.append("commission_value_type", commissionValueType);

      photos.forEach((file) => formData.append("photos", file));
      planPhotos.forEach((file) => formData.append("plan_photos", file));
      docPhotos.forEach((file) => formData.append("doc_photos", file));

      await createObject(formData);

      alert("Объект отправлен на модерацию 🎉");

      // сброс формы
      setStreet("");
      setHouse("");
      setFlat("");
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
    } catch (error) {
      console.error(error);
      alert("Ошибка при добавлении объекта. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFilesPreview = (files: File[]) => {
    if (files.length === 0) return null;

    return (
      <div className="flex gap-2 overflow-x-auto mt-2">
        {files.map((f, idx) => (
          <div
            key={idx}
            className="w-20 h-20 bg-neutral-800 rounded-xl flex items-center justify-center text-[10px] text-center px-1"
          >
            {f.name}
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

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Район</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
              required
            >
              <option value="">Выберите район</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Улица</label>
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
                placeholder="Красная"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Дом</label>
              <input
                value={house}
                onChange={(e) => setHouse(e.target.value)}
                className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
                placeholder="12"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Квартира (если есть)</label>
              <input
                value={flat}
                onChange={(e) => setFlat(e.target.value)}
                className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
                placeholder="45"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Этаж</label>
              <input
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
                className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
                placeholder="9/17"
                required
              />
            </div>
          </div>
        </section>

        {/* Параметры */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Параметры</h2>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Комнат</label>
            <select
              value={roomsType}
              onChange={(e) => setRoomsType(e.target.value)}
              className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
            >
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {roomsType === "Другое" && (
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Свой вариант</label>
              <input
                value={roomsCustom}
                onChange={(e) => setRoomsCustom(e.target.value)}
                className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
                placeholder="Например: свободной планировки"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Площадь, м²</label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
                placeholder="38"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Площадь кухни, м²</label>
              <input
                value={kitchenArea}
                onChange={(e) => setKitchenArea(e.target.value)}
                className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
                placeholder="10"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Цена, ₽</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
              placeholder="5200000"
              required
            />
          </div>
        </section>

        {/* Комиссия */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Комиссия</h2>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Расположение</label>
              <select
                value={commissionPlace}
                onChange={(e) =>
                  setCommissionPlace(e.target.value as CommissionPlace)
                }
                className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
              >
                <option value="inside">Внутри цены</option>
                <option value="on_top">Сверху</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-400">Тип</label>
              <select
                value={commissionValueType}
                onChange={(e) =>
                  setCommissionValueType(e.target.value as CommissionValueType)
                }
                className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
              >
                <option value="percent">% от сделки</option>
                <option value="fixed">Фиксированная сумма ₽</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">
              Значение комиссии ({commissionValueType === "percent"
                ? "%"
                : "₽"}
              )
            </label>
            <input
              value={commissionValue}
              onChange={(e) => setCommissionValue(e.target.value)}
              className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
              placeholder={commissionValueType === "percent" ? "3" : "150000"}
              required
            />
          </div>
        </section>

        {/* Фото */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Фото</h2>

          <div>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-sm font-semibold"
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
          </div>

          <div>
            <button
              type="button"
              onClick={() => planInputRef.current?.click()}
              className="rounded-xl bg-neutral-700 hover:bg-neutral-600 px-4 py-2 text-sm"
            >
              + Добавить фото планировки
            </button>
            <input
              ref={planInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => addFiles(e.target.files, "plan")}
            />
            {renderFilesPreview(planPhotos)}
          </div>

          <div>
            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              className="rounded-xl bg-neutral-700 hover:bg-neutral-600 px-4 py-2 text-sm"
            >
              + Фото документов (ЕГРН, договор)
            </button>
            <input
              ref={docInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => addFiles(e.target.files, "doc")}
            />
            {renderFilesPreview(docPhotos)}
          </div>
        </section>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 py-3 font-semibold mt-2"
        >
          {submitting ? "Отправляем..." : "Отправить на модерацию"}
        </button>
      </form>
    </div>
  );
}

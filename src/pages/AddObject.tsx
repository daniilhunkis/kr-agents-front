import React, { useRef, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { createObject } from "../lib/api";

// Расширенный список всех районов Краснодара
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

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const planInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  // iOS fix — input must reset value after each upload
  const resetInputValue = (ref: React.RefObject<HTMLInputElement>) => {
    if (ref.current) ref.current.value = "";
  };

  const addFiles = (
    files: FileList | null,
    type: "photo" | "plan" | "doc",
    ref: React.RefObject<HTMLInputElement>
  ) => {
    if (!files || files.length === 0) return;

    const list = Array.from(files);
    if (type === "photo") setPhotos((prev) => [...prev, ...list]);
    if (type === "plan") setPlanPhotos((prev) => [...prev, ...list]);
    if (type === "doc") setDocPhotos((prev) => [...prev, ...list]);

    resetInputValue(ref);
  };

  const validate = (): string | null => {
    if (!district) return "Выберите район";
    if (!street.trim()) return "Укажите улицу";
    if (!house.trim()) return "Укажите дом";
    if (!floor.trim()) return "Укажите этаж";

    if (!area.trim()) return "Укажите площадь";
    if (!price.trim()) return "Укажите цену";

    if (!commissionValue.trim())
      return "Укажите размер комиссии";
    if (photos.length === 0) return "Добавьте минимум одно фото объекта";
    if (docPhotos.length === 0)
      return "Добавьте фото документов";
    if (!offerAccepted)
      return "Вы должны согласиться с условиями оферты";

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
      alert("Откройте приложение через Телеграм");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("owner_id", String(tgUser.id));
      formData.append("district", district);
      formData.append("street", street);
      formData.append("house", house);

      formData.append("floor", floor);
      formData.append("rooms_type", roomsType);

      if (roomsType === "Другое" && roomsCustom.trim()) {
        formData.append("rooms_custom", roomsCustom.trim());
      }

      formData.append("area", area.replace(",", "."));
      if (kitchenArea) {
        formData.append("kitchen_area", kitchenArea.replace(",", "."));
      }
      formData.append("price", price.replace(/ /g, ""));

      formData.append("commission_place", commissionPlace);
      formData.append(
        "commission_value",
        commissionValue.replace(",", ".").replace(/ /g, "")
      );
      formData.append("commission_value_type", commissionValueType);

      photos.forEach((file) => formData.append("photos", file));
      planPhotos.forEach((file) => formData.append("plan_photos", file));
      docPhotos.forEach((file) => formData.append("doc_photos", file));

      await createObject(formData);

      alert("Объект отправлен на модерацию 🎉");
      window.location.href = "/my-objects";
    } catch (e) {
      console.error(e);
      alert("Ошибка добавления объекта");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPreview = (files: File[]) => (
    <div className="flex gap-2 overflow-x-auto mt-2">
      {files.map((file, i) => (
        <div
          key={i}
          className="w-20 h-20 bg-neutral-900 rounded-xl flex items-center justify-center text-[10px] px-1 text-gray-300"
        >
          {file.name}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-tgBg text-white px-4 pb-20 pt-4">
      <h1 className="text-2xl font-bold mb-4">Добавить объект</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Адрес */}
        <section className="bg-card2 p-4 rounded-2xl border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Адрес</h2>

          <div>
            <label className="text-xs text-gray-400">Район</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
              className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white mt-1"
            >
              <option value="">Выберите район</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Улица</label>
            <input
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
              className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white"
              placeholder="Красная"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Дом</label>
            <input
              value={house}
              onChange={(e) => setHouse(e.target.value)}
              required
              className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white"
              placeholder="12"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-gray-400">Этаж</label>
            <input
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              required
              className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white"
              placeholder="9/17"
            />
          </div>
        </section>

        {/* Параметры */}
        <section className="bg-card2 p-4 rounded-2xl border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Параметры</h2>

          <div>
            <label className="text-xs text-gray-400">Комнат</label>
            <select
              value={roomsType}
              onChange={(e) => setRoomsType(e.target.value)}
              className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white mt-1"
            >
              {ROOM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {roomsType === "Другое" && (
            <div>
              <label className="text-xs text-gray-400">Свой вариант</label>
              <input
                value={roomsCustom}
                onChange={(e) => setRoomsCustom(e.target.value)}
                className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white"
                placeholder="Например: свободной планировки"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">Площадь, м²</label>
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
                className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Площадь кухни</label>
              <input
                value={kitchenArea}
                onChange={(e) => setKitchenArea(e.target.value)}
                className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400">Цена, ₽</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white"
            />
          </div>
        </section>

        {/* Комиссия */}
        <section className="bg-card2 p-4 rounded-2xl border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Комиссия</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400">Расположение</label>
              <select
                value={commissionPlace}
                onChange={(e) =>
                  setCommissionPlace(e.target.value as CommissionPlace)
                }
                className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white mt-1"
              >
                <option value="inside">Внутри цены</option>
                <option value="on_top">Сверху</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-gray-400">Тип</label>
              <select
                value={commissionValueType}
                onChange={(e) =>
                  setCommissionValueType(e.target.value as CommissionValueType)
                }
                className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white mt-1"
              >
                <option value="percent">%</option>
                <option value="fixed">₽</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-400">
              Значение комиссии ({commissionValueType === "percent" ? "%" : "₽"})
            </label>
            <input
              value={commissionValue}
              onChange={(e) => setCommissionValue(e.target.value)}
              required
              className="w-full bg-card rounded-xl px-4 py-3 border border-gray-700 text-white"
            />
          </div>
        </section>

        {/* Фото */}
        <section className="bg-card2 p-4 rounded-2xl border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Фото</h2>

          {/* Фото объекта */}
          <label className="block">
            <div className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-center">
              + Добавить фото объекта
            </div>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => addFiles(e.target.files, "photo", photoInputRef)}
            />
          </label>
          {renderPreview(photos)}

          {/* Фото планировки */}
          <label className="block">
            <div className="rounded-xl bg-neutral-700 px-4 py-2 text-sm text-center">
              + Фото планировки
            </div>
            <input
              ref={planInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => addFiles(e.target.files, "plan", planInputRef)}
            />
          </label>
          {renderPreview(planPhotos)}

          {/* Фото документов */}
          <label className="block">
            <div className="rounded-xl bg-neutral-700 px-4 py-2 text-sm text-center">
              + Фото документов (ЕГРН, договор)
            </div>
            <input
              ref={docInputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={(e) => addFiles(e.target.files, "doc", docInputRef)}
            />
          </label>
          {renderPreview(docPhotos)}
        </section>

        {/* Оферта */}
        <div className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={offerAccepted}
            onChange={(e) => setOfferAccepted(e.target.checked)}
            className="mt-1"
            required
          />
          <p className="text-gray-300 text-xs leading-tight">
            Я подтверждаю, что соглашаюсь с агентским договором и обязуюсь
            выплатить <b>50 000 ₽</b> в случае продажи объекта через сервис.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-sm disabled:opacity-50"
        >
          {submitting ? "Отправляем..." : "Отправить на модерацию"}
        </button>
      </form>
    </div>
  );
}

import React, { useState } from "react";
import WebApp from "@twa-dev/sdk";
import { createObject } from "../lib/api";

export default function AddObject() {
  const tgUser = WebApp.initDataUnsafe?.user;
  const ownerId = tgUser?.id;

  const [district, setDistrict] = useState("");
  const [street, setStreet] = useState("");
  const [complexName, setComplexName] = useState("");
  const [house, setHouse] = useState("");
  const [floor, setFloor] = useState("");

  const [roomsType, setRoomsType] = useState("studio");
  const [roomsCustom, setRoomsCustom] = useState("");

  const [areaTotal, setAreaTotal] = useState<string>("");
  const [kitchenArea, setKitchenArea] = useState<string>("");

  const [price, setPrice] = useState<string>("");

  const [commissionType, setCommissionType] = useState<"inside" | "on_top">(
    "inside"
  );
  const [commissionValue, setCommissionValue] = useState<string>("");
  const [commissionUnit, setCommissionUnit] = useState<"percent" | "rub">("percent");

  const [photos, setPhotos] = useState<FileList | null>(null);
  const [planPhotos, setPlanPhotos] = useState<FileList | null>(null);
  const [docsPhotos, setDocsPhotos] = useState<FileList | null>(null);

  const [loading, setLoading] = useState(false);

  if (!ownerId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tgBg text-white">
        Откройте приложение внутри Telegram
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || !areaTotal) {
      alert("Укажи цену и площадь");
      return;
    }

    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("owner_id", String(ownerId));
      fd.append("district", district);
      fd.append("street", street);
      fd.append("complex_name", complexName);
      fd.append("house", house);
      fd.append("floor", floor);

      fd.append("rooms_type", roomsType);
      fd.append("rooms_custom", roomsType === "other" ? roomsCustom : "");

      fd.append("area_total", areaTotal.replace(",", "."));
      fd.append("kitchen_area", (kitchenArea || "0").replace(",", "."));
      fd.append("price", price.replace(" ", ""));

      fd.append("commission_type", commissionType);
      fd.append("commission_value", (commissionValue || "0").replace(" ", ""));
      fd.append("commission_unit", commissionUnit);

      if (photos) {
        Array.from(photos).forEach((file) => {
          fd.append("photos", file);
        });
      }
      if (planPhotos) {
        Array.from(planPhotos).forEach((file) => {
          fd.append("plan_photos", file);
        });
      }
      if (docsPhotos) {
        Array.from(docsPhotos).forEach((file) => {
          fd.append("docs_photos", file);
        });
      }

      await createObject(fd);

      alert("Объект отправлен на модерацию ✅");
      // можно редиректнуть в "Мои объекты"
      // window.location.href = "/profile";
    } catch (err) {
      console.error(err);
      alert("Ошибка при сохранении объекта");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tgBg text-white px-4 pb-20 pt-4">
      <h1 className="text-2xl font-bold mb-4">Добавить объект</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-card2 rounded-2xl p-4 border border-gray-800"
      >
        {/* Адрес */}
        <div className="space-y-2">
          <h2 className="font-semibold text-lg mb-1">Адрес</h2>
          <input
            className="w-full bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
            placeholder="Район"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
          />
          <input
            className="w-full bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
            placeholder="Улица"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
          <input
            className="w-full bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
            placeholder="ЖК (если есть)"
            value={complexName}
            onChange={(e) => setComplexName(e.target.value)}
          />
          <div className="flex gap-2">
            <input
              className="w-1/2 bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
              placeholder="Дом"
              value={house}
              onChange={(e) => setHouse(e.target.value)}
            />
            <input
              className="w-1/2 bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
              placeholder="Этаж"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
            />
          </div>
        </div>

        {/* Комнаты */}
        <div className="space-y-2">
          <h2 className="font-semibold text-lg mb-1">Комнат</h2>
          <select
            className="w-full bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
            value={roomsType}
            onChange={(e) => setRoomsType(e.target.value)}
          >
            <option value="studio">Студия</option>
            <option value="1">1ккв</option>
            <option value="2">2ккв</option>
            <option value="3">3ккв</option>
            <option value="other">Другое</option>
          </select>
          {roomsType === "other" && (
            <input
              className="w-full bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
              placeholder="Например: 4ккв, евро-3 и т.п."
              value={roomsCustom}
              onChange={(e) => setRoomsCustom(e.target.value)}
            />
          )}
        </div>

        {/* Площади */}
        <div className="space-y-2">
          <h2 className="font-semibold text-lg mb-1">Площадь</h2>
          <div className="flex gap-2">
            <input
              className="w-1/2 bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
              placeholder="Общая, м²"
              value={areaTotal}
              onChange={(e) => setAreaTotal(e.target.value)}
            />
            <input
              className="w-1/2 bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
              placeholder="Кухня, м²"
              value={kitchenArea}
              onChange={(e) => setKitchenArea(e.target.value)}
            />
          </div>
        </div>

        {/* Цена */}
        <div className="space-y-2">
          <h2 className="font-semibold text-lg mb-1">Цена</h2>
          <input
            className="w-full bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
            placeholder="Цена, ₽"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>

        {/* Комиссия */}
        <div className="space-y-2">
          <h2 className="font-semibold text-lg mb-1">Комиссия</h2>
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <select
                className="w-1/2 bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
                value={commissionType}
                onChange={(e) =>
                  setCommissionType(e.target.value as "inside" | "on_top")
                }
              >
                <option value="inside">Внутри цены</option>
                <option value="on_top">Сверху</option>
              </select>
              <select
                className="w-1/2 bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
                value={commissionUnit}
                onChange={(e) =>
                  setCommissionUnit(e.target.value as "percent" | "rub")
                }
              >
                <option value="percent">% от цены</option>
                <option value="rub">₽ фикс</option>
              </select>
            </div>
            <input
              className="w-full bg-card px-3 py-2 rounded-xl text-sm outline-none border border-gray-700 focus:border-emerald-500"
              placeholder="Размер комиссии (число)"
              value={commissionValue}
              onChange={(e) => setCommissionValue(e.target.value)}
            />
          </div>
        </div>

        {/* Фото */}
        <div className="space-y-2">
          <h2 className="font-semibold text-lg mb-1">Фото</h2>
          <label className="block text-sm text-gray-300">
            Фото квартиры
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(e.target.files)}
              className="mt-1 block w-full text-xs text-gray-400"
            />
          </label>

          <label className="block text-sm text-gray-300">
            Фото планировки (если есть)
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPlanPhotos(e.target.files)}
              className="mt-1 block w-full text-xs text-gray-400"
            />
          </label>

          <label className="block text-sm text-gray-300">
            Фото документов (ЕГРН, договор)
            <input
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={(e) => setDocsPhotos(e.target.files)}
              className="mt-1 block w-full text-xs text-gray-400"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 transition py-3 rounded-xl font-semibold mt-2"
        >
          {loading ? "Отправляем..." : "Отправить на модерацию"}
        </button>
      </form>
    </div>
  );
}

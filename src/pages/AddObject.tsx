import React, { useState } from "react";
import WebApp from "@twa-dev/sdk";
import { createObject } from "../lib/api";

/* ============================
   CONSTANTS
=============================== */

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

/* ============================
   DETECT IOS
=============================== */
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

/* ============================
   COMPRESSOR
=============================== */
async function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX_WIDTH = 1600;

      const scale = Math.min(1, MAX_WIDTH / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" }));
        },
        "image/webp",
        0.75
      );
    };
  });
}

/* ============================
   MAIN COMPONENT
=============================== */

export default function AddObject() {
  /* FORM STATES */
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

  const MAX_FILES = 24;

  const totalFiles = () =>
    photos.length + planPhotos.length + docPhotos.length;

  const checkLimit = (count: number) => {
    if (totalFiles() + count > MAX_FILES) {
      alert(`Максимум ${MAX_FILES} файлов`);
      return false;
    }
    return true;
  };

  /* ============================
     REMOVE FILE
  =============================== */
  const removeFile = (
    index: number,
    type: "photo" | "plan" | "doc"
  ) => {
    if (type === "photo") setPhotos((p) => p.filter((_, i) => i !== index));
    else if (type === "plan") setPlanPhotos((p) => p.filter((_, i) => i !== index));
    else setDocPhotos((p) => p.filter((_, i) => i !== index));
  };

  /* ============================
     IOS PICKER (PHOTO ONLY)
  =============================== */
  const pickIOS = async (target: "photo" | "plan" | "doc") => {
    try {
      const tg: any = (window as any).Telegram?.WebApp;

      if (!tg?.showImagePicker) {
        // Fallback → input
        document.getElementById(`${target}_fallback`)?.click();
        return;
      }

      const res = await tg.showImagePicker({ multiple: true });

      if (!res || !res.images) return;
      if (!checkLimit(res.images.length)) return;

      const newFiles: File[] = [];

      for (const imgB64 of res.images) {
        const base64 = imgB64.split(",")[1];
        const bin = atob(base64);
        const array = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) array[i] = bin.charCodeAt(i);

        let file = new File([array], `doc_${Date.now()}.jpg`, { type: "image/jpeg" });
        file = await compressImage(file);

        newFiles.push(file);
      }

      if (target === "photo") setPhotos((p) => [...p, ...newFiles]);
      if (target === "plan") setPlanPhotos((p) => [...p, ...newFiles]);
      if (target === "doc") setDocPhotos((p) => [...p, ...newFiles]);
    } catch (e) {
      console.error(e);
      alert("Не удалось выбрать фото");
    }
  };

  /* ============================
     FILE INPUT FALLBACK
  =============================== */
  const pickWeb = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "photo" | "plan" | "doc"
  ) => {
    const files = e.target.files;
    if (!files) return;
    if (!checkLimit(files.length)) return;

    const arr = Array.from(files);
    const newFiles: File[] = [];

    for (const f of arr) {
      if (f.type.startsWith("image/")) {
        const c = await compressImage(f);
        newFiles.push(c);
      } else {
        newFiles.push(f); // PDF
      }
    }

    if (target === "photo") setPhotos((p) => [...p, ...newFiles]);
    if (target === "plan") setPlanPhotos((p) => [...p, ...newFiles]);
    if (target === "doc") setDocPhotos((p) => [...p, ...newFiles]);

    e.target.value = "";
  };

  /* ============================
     PREVIEW
  =============================== */
  const Preview = ({
    files,
    type,
  }: {
    files: File[];
    type: "photo" | "plan" | "doc";
  }) => (
    <div className="flex gap-3 overflow-x-auto mt-2">
      {files.map((file, i) => {
        const url = URL.createObjectURL(file);

        return (
          <div key={i} className="relative w-20 h-20">
            {type !== "doc" ? (
              <img
                src={url}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-neutral-800 rounded-xl flex items-center justify-center text-xs">
                PDF
              </div>
            )}

            <button
              type="button"
              onClick={() => removeFile(i, type)}
              className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );

  /* ============================
     VALIDATE
  =============================== */
  const validate = () => {
    if (!district) return "Выберите район";
    if (!street.trim()) return "Укажите улицу";
    if (!house.trim()) return "Укажите дом";
    if (!floor.trim()) return "Укажите этаж";

    if (!area.trim()) return "Укажите площадь";
    if (!price.trim()) return "Укажите цену";
    if (!commissionValue.trim()) return "Укажите комиссию";

    if (photos.length === 0) return "Добавьте хотя бы одно фото объекта";
    if (docPhotos.length === 0) return "Добавьте документы";

    if (!offerAccepted)
      return "Нужно согласиться с условиями оферты";

    return null;
  };

  /* ============================
     SUBMIT
  =============================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const err = validate();
    if (err) return alert(err);

    const tgUser = WebApp.initDataUnsafe?.user;
    if (!tgUser) return alert("Откройте мини-апп через Telegram");

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

      alert("Объект отправлен!");

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
      alert("Ошибка отправки");
    } finally {
      setSubmitting(false);
    }
  };

  /* ============================
     RENDER
  =============================== */

  return (
    <div className="min-h-screen bg-tgBg text-white px-4 pb-20 pt-4">
      <h1 className="text-2xl font-bold mb-4">Добавить объект</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ADDRESS */}
        <section className="bg-card2 p-4 rounded-2xl border border-gray-800 space-y-3">
          <h2 className="font-semibold text-lg">Адрес</h2>

          <label className="text-xs text-gray-400">Район</label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full bg-card rounded-xl px-4 py-3"
          >
            <option value="">Выберите район</option>
            {DISTRICTS.map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Улица"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="bg-card rounded-xl px-4 py-3"
            />

            <input
              placeholder="Дом"
              value={house}
              onChange={(e) => setHouse(e.target.value)}
              className="bg-card rounded-xl px-4 py-3"
            />
          </div>

          <input
            placeholder="Этаж"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
            className="bg-card rounded-xl px-4 py-3"
          />
        </section>

        {/* PARAMETERS */}
        <section className="bg-card2 p-4 rounded-2xl border border-gray-800 space-y-3">
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
              value={roomsCustom}
              onChange={(e) => setRoomsCustom(e.target.value)}
              className="bg-card rounded-xl px-4 py-3"
            />
          )}

          <input
            placeholder="Площадь, м²"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            className="bg-card rounded-xl px-4 py-3"
          />

          <input
            placeholder="Площадь кухни"
            value={kitchenArea}
            onChange={(e) => setKitchenArea(e.target.value)}
            className="bg-card rounded-xl px-4 py-3"
          />

          <input
            placeholder="Цена"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="bg-card rounded-xl px-4 py-3"
          />
        </section>

        {/* FILES */}
        <section className="bg-card2 p-4 rounded-2xl border border-gray-800 space-y-6">
          <h2 className="font-semibold text-lg">Фотографии</h2>

          {/* PHOTOS */}
          <button
            type="button"
            onClick={() =>
              isIOS ? pickIOS("photo") : document.getElementById("photo_in")?.click()
            }
            className="bg-emerald-600 w-full py-3 rounded-xl"
          >
            + Добавить фото объекта
          </button>

          {!isIOS && (
            <input
              id="photo_in"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => pickWeb(e, "photo")}
            />
          )}

          <Preview files={photos} type="photo" />

          {/* PLANS */}
          <button
            type="button"
            onClick={() =>
              isIOS ? pickIOS("plan") : document.getElementById("plan_in")?.click()
            }
            className="bg-neutral-700 w-full py-3 rounded-xl"
          >
            + Добавить планировку
          </button>

          {!isIOS && (
            <input
              id="plan_in"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => pickWeb(e, "plan")}
            />
          )}

          <Preview files={planPhotos} type="plan" />

          {/* DOCUMENTS */}
          <button
            type="button"
            onClick={() =>
              isIOS
                ? pickIOS("doc")
                : document.getElementById("docs_in")?.click()
            }
            className="bg-neutral-700 w-full py-3 rounded-xl"
          >
            + Фото или PDF документов
          </button>

          {!isIOS && (
            <input
              id="docs_in"
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={(e) => pickWeb(e, "doc")}
            />
          )}

          <Preview files={docPhotos} type="doc" />
        </section>

        {/* OFERTA */}
        <section className="bg-card2 p-4 rounded-2xl border border-gray-800">
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
              >
                условиями публичной оферты
              </a>
              .
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

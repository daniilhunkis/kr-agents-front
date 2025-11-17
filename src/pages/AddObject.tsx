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
   iOS DETECTOR
=============================== */
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

/* ============================
   IMAGE COMPRESSOR (JPEG/WebP)
=============================== */
async function compressImage(file: File, maxWidth = 1600, quality = 0.75): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = maxWidth / img.width;
      const width = img.width > maxWidth ? maxWidth : img.width;
      const height = img.width > maxWidth ? img.height * scale : img.height;

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return resolve(file);
          resolve(new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" }));
        },
        "image/webp",
        quality
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

  /* FILE STATES */
  const [photos, setPhotos] = useState<File[]>([]);
  const [planPhotos, setPlanPhotos] = useState<File[]>([]);
  const [docPhotos, setDocPhotos] = useState<File[]>([]);

  const [offerAccepted, setOfferAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const MAX_FILES = 24;

  /* ============================
     HELPERS
  =============================== */

  const totalFiles = () =>
    photos.length + planPhotos.length + docPhotos.length;

  const ensureLimit = (count: number) => {
    if (totalFiles() + count > MAX_FILES) {
      alert(`Максимум ${MAX_FILES} файлов`);
      return false;
    }
    return true;
  };

  /* ============================
     DELETE BUTTON
  =============================== */
  const removeFile = (
    index: number,
    from: "photo" | "plan" | "doc"
  ) => {
    if (from === "photo") {
      setPhotos((prev) => prev.filter((_, i) => i !== index));
    } else if (from === "plan") {
      setPlanPhotos((prev) => prev.filter((_, i) => i !== index));
    } else {
      setDocPhotos((prev) => prev.filter((_, i) => i !== index));
    }
  };

  /* ============================
     iOS PHOTO PICKER
  =============================== */
  const pickImagesIOS = async (target: "photo" | "plan") => {
    try {
      const tg: any = (window as any).Telegram?.WebApp;
      const res = await tg.showImagePicker({ multiple: true });

      if (!res || !res.images) return;

      if (!ensureLimit(res.images.length)) return;

      const newFiles: File[] = [];

      for (const base64 of res.images) {
        const binary = atob(base64.split(",")[1]);
        const array = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);

        let file = new File([array], `photo_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        file = await compressImage(file);
        newFiles.push(file);
      }

      if (target === "photo") setPhotos((p) => [...p, ...newFiles]);
      if (target === "plan") setPlanPhotos((p) => [...p, ...newFiles]);
    } catch (err) {
      console.error(err);
      alert("Не удалось выбрать фото");
    }
  };

  /* ============================
     ANDROID/DESKTOP INPUT PICKER
  =============================== */
  const pickImagesWeb = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "photo" | "plan"
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (!ensureLimit(files.length)) return;

    const arr = Array.from(files);
    const newFiles: File[] = [];

    for (const f of arr) {
      const compressed = await compressImage(f);
      newFiles.push(compressed);
    }

    if (target === "photo") setPhotos((p) => [...p, ...newFiles]);
    if (target === "plan") setPlanPhotos((p) => [...p, ...newFiles]);

    e.target.value = "";
  };

  /* ============================
     PDF FILE PICKER (ANDROID/PC ONLY)
  =============================== */
  const handleDocs = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (!ensureLimit(files.length)) return;

    setDocPhotos((p) => [...p, ...Array.from(files)]);

    e.target.value = "";
  };

  /* ============================
     VALIDATION
  =============================== */

  const validate = () => {
    if (!district) return "Выберите район";
    if (!street.trim()) return "Укажите улицу";
    if (!house.trim()) return "Укажите дом";
    if (!floor.trim()) return "Укажите этаж";

    if (!area.trim()) return "Укажите площадь";
    if (!price.trim()) return "Укажите цену";
    if (!commissionValue.trim()) return "Укажите комиссию";

    if (photos.length === 0) return "Добавьте минимум одно фото";
    if (docPhotos.length === 0) return "Добавьте документы (фото или PDF)";

    if (!offerAccepted)
      return "Вы должны согласиться с условиями оферты";

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
    if (!tgUser) return alert("Ошибка: откройте мини-апп через Telegram");

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

      alert("Объект отправлен на модерацию!");

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
     PREVIEW COMPONENT
  =============================== */

  const Preview = ({
    files,
    type,
  }: {
    files: File[];
    type: "photo" | "plan" | "doc";
  }) => (
    <div className="flex gap-3 mt-2 overflow-x-auto">
      {files.map((file, idx) => {
        const url = URL.createObjectURL(file);
        return (
          <div key={idx} className="relative w-20 h-20">
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
              onClick={() => removeFile(idx, type)}
              className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );

  /* ============================
     RENDER
  =============================== */

  return (
    <div className="min-h-screen bg-tgBg text-white px-4 pb-20 pt-4">
      <h1 className="text-2xl font-bold mb-4">Добавить объект</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ADDRESS */}
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

        {/* PARAMETERS */}
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

        {/* FILE UPLOAD */}
        <section className="bg-card2 rounded-2xl p-4 border border-gray-800 space-y-6">
          <h2 className="font-semibold text-lg">Фотографии</h2>

          {/* PHOTOS */}
          <button
            type="button"
            onClick={() => (isIOS ? pickImagesIOS("photo") : document.getElementById("photo_web")?.click())}
            className="bg-emerald-600 w-full py-3 rounded-xl"
          >
            + Добавить фото объекта
          </button>

          {!isIOS && (
            <input
              id="photo_web"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => pickImagesWeb(e, "photo")}
            />
          )}

          <Preview files={photos} type="photo" />

          {/* PLANS */}
          <button
            type="button"
            onClick={() => (isIOS ? pickImagesIOS("plan") : document.getElementById("plan_web")?.click())}
            className="bg-neutral-700 w-full py-3 rounded-xl"
          >
            + Добавить планировку
          </button>

          {!isIOS && (
            <input
              id="plan_web"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => pickImagesWeb(e, "plan")}
            />
          )}

          <Preview files={planPhotos} type="plan" />

          {/* DOCUMENTS — ONLY ANDROID/DESKTOP */}
          {!isIOS && (
            <>
              <div className="relative">
                <button
                  type="button"
                  className="bg-neutral-700 w-full py-3 rounded-xl text-center"
                  onClick={() => document.getElementById("docs_pdf")?.click()}
                >
                  + Загрузить документы (PDF)
                </button>
                <input
                  id="docs_pdf"
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={handleDocs}
                />
              </div>

              <Preview files={docPhotos} type="doc" />
            </>
          )}

          {/* iOS DOES NOT SUPPORT PDF SELECTION INSIDE TELEGRAM */}
          {isIOS && (
            <p className="text-xs text-gray-400">
              На iOS документы можно загружать только как фото (через камеру)
            </p>
          )}
        </section>

        {/* OFERTA */}
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
              >
                условиями оферты
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

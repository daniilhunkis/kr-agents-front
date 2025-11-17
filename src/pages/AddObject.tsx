import React, { useState, useEffect } from "react";
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

const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

/* ============================
   BOT TOKEN FROM ENV
=============================== */

const BOT_TOKEN = import.meta.env.VITE_BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("ERROR: VITE_BOT_TOKEN not found in env");
}

/* ============================
   COMPRESS IMAGE
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
          if (!blob) {
            resolve(file);
            return;
          }
          const compressed = new File(
            [blob],
            file.name.replace(/\.\w+$/, ".webp"),
            { type: "image/webp" }
          );
          resolve(compressed);
        },
        "image/webp",
        0.75
      );
    };
  });
}

/* ============================
   DOWNLOAD FILE FROM TELEGRAM
=============================== */

async function downloadFileFromTelegram(fileId: string): Promise<File | null> {
  try {
    // 1. Get file_path
    const getFileUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
    const getFileResp = await fetch(getFileUrl).then((r) => r.json());

    if (!getFileResp.ok) {
      console.error("File getFile error", getFileResp);
      return null;
    }

    const filePath = getFileResp.result.file_path;
    const downloadUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // 2. Download file binary
    const blob = await fetch(downloadUrl).then((r) => r.blob());

    // 3. Convert to File
    const filename = filePath.split("/").pop() || "file.jpg";
    return new File([blob], filename, { type: blob.type });
  } catch (err) {
    console.error("downloadFileFromTelegram error", err);
    return null;
  }
}

/* ============================
   MAIN COMPONENT — BEGIN
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

  const [commissionPlace, setCommissionPlace] = useState("inside");
  const [commissionValue, setCommissionValue] = useState("");
  const [commissionValueType, setCommissionValueType] =
    useState("percent");

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
  ================================ */
  const removeFile = (
    index: number,
    type: "photo" | "plan" | "doc"
  ) => {
    if (type === "photo") {
      setPhotos((p) => p.filter((_, i) => i !== index));
    } else if (type === "plan") {
      setPlanPhotos((p) => p.filter((_, i) => i !== index));
    } else {
      setDocPhotos((p) => p.filter((_, i) => i !== index));
    }
  };

  /* ============================
     LISTEN TO web_app_data
     (file_id arrives here)
  ================================ */

  const [pendingTarget, setPendingTarget] =
    useState<"photo" | "plan" | "doc" | null>(null);

  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!e.data?.event) return;
      if (e.data.event !== "web_app_data") return;

      try {
        const data = JSON.parse(e.data.data);
        if (!data.file_id) return;

        if (!pendingTarget) return;

        addFileFromTelegram(data.file_id, pendingTarget);
      } catch (err) {
        console.error("web_app_data parse error", err);
      }
    }

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [pendingTarget]);

  /* ============================
     ADD FILE FROM TELEGRAM FILE_ID
  ================================ */

  async function addFileFromTelegram(
    fileId: string,
    target: "photo" | "plan" | "doc"
  ) {
    try {
      const file = await downloadFileFromTelegram(fileId);
      if (!file) {
        alert("Не удалось загрузить файл");
        return;
      }

      if (!checkLimit(1)) return;

      let finalFile = file;
      if (file.type.startsWith("image/")) {
        finalFile = await compressImage(file);
      }

      if (target === "photo") {
        setPhotos((p) => [...p, finalFile]);
      } else if (target === "plan") {
        setPlanPhotos((p) => [...p, finalFile]);
      } else {
        setDocPhotos((p) => [...p, finalFile]);
      }
    } catch (err) {
      console.error("addFileFromTelegram error", err);
      alert("Ошибка обработки файла");
    } finally {
      setPendingTarget(null);
    }
  }

  /* ============================
     REQUEST WRITE ACCESS (open picker)
  ================================ */

  async function openTelegramPicker(
    target: "photo" | "plan" | "doc"
  ) {
    try {
      setPendingTarget(target);

      const ok = await (window as any).Telegram.WebApp.requestWriteAccess();

      if (!ok) {
        alert("Telegram не дал доступ на отправку медиа");
        setPendingTarget(null);
        return;
      }

      // Теперь пользователь выбирает фото, Telegram отправляет боту,
      // бот отвечает web_app_data → ловим в useEffect → сохраняем.
    } catch (err) {
      console.error("openTelegramPicker error", err);
      setPendingTarget(null);
      alert("Ошибка открытия выбора медиа");
    }
  }

  /* ============================
     FALLBACK FOR ANDROID/DESKTOP
  ================================ */

  const handleFileInput = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "photo" | "plan" | "doc"
  ) => {
    const files = e.target.files;
    if (!files) return;

    if (!checkLimit(files.length)) return;

    const arr = Array.from(files);
    const processed: File[] = [];

    for (const f of arr) {
      let out = f;
      if (f.type.startsWith("image/")) {
        out = await compressImage(f);
      }
      processed.push(out);
    }

    if (target === "photo") setPhotos((p) => [...p, ...processed]);
    else if (target === "plan") setPlanPhotos((p) => [...p, ...processed]);
    else setDocPhotos((p) => [...p, ...processed]);

    e.target.value = "";
  };

  /* ============================
   PREVIEW COMPONENT
================================ */

const Preview = ({
  files,
  type,
}: {
  files: File[];
  type: "photo" | "plan" | "doc";
}) => (
  <div className="flex gap-3 overflow-x-auto mt-3 pb-1">
    {files.map((file, i) => {
      const url = URL.createObjectURL(file);

      return (
        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
          {file.type.startsWith("image/") ? (
            <img
              src={url}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-neutral-700 flex items-center justify-center text-xs">
              PDF
            </div>
          )}

          <button
            type="button"
            onClick={() => removeFile(i, type)}
            className="absolute top-0 right-0 bg-red-600 text-white w-5 h-5 rounded-full text-xs"
          >
            ×
          </button>
        </div>
      );
    })}
  </div>
);

/* ============================
   VALIDATION
================================ */

const validate = () => {
  if (!district) return "Выберите район";
  if (!street.trim()) return "Укажите улицу";
  if (!house.trim()) return "Укажите дом";
  if (!floor.trim()) return "Укажите этаж";
  if (!area.trim()) return "Укажите площадь";
  if (!price.trim()) return "Укажите цену";
  if (!commissionValue.trim()) return "Укажите комиссию";

  if (photos.length === 0) return "Добавьте хотя бы 1 фото";
  if (docPhotos.length === 0) return "Добавьте документы";

  if (!offerAccepted)
    return "Подтвердите согласие с условиями оферты";

  return null;
};

/* ============================
   SUBMIT
================================ */

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const error = validate();
  if (error) return alert(error);

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

    alert("Объект отправлен на модерацию");

    // reset
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
================================ */

return (
  <div className="min-h-screen bg-tgBg text-white px-4 pb-20 pt-4">
    <h1 className="text-2xl font-bold mb-4">Добавить объект</h1>

    <form className="space-y-6" onSubmit={handleSubmit}>

      {/* Адрес */}
      <section className="bg-card2 p-4 rounded-2xl border border-gray-800 space-y-3">
        <h2 className="font-semibold text-lg">Адрес</h2>

        <select
          className="w-full bg-card rounded-xl px-4 py-3"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="">Выберите район</option>
          {DISTRICTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            className="bg-card rounded-xl px-4 py-3"
            placeholder="Улица"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
          />
          <input
            className="bg-card rounded-xl px-4 py-3"
            placeholder="Дом"
            value={house}
            onChange={(e) => setHouse(e.target.value)}
          />
        </div>

        <input
          className="bg-card rounded-xl px-4 py-3"
          placeholder="Этаж"
          value={floor}
          onChange={(e) => setFloor(e.target.value)}
        />
      </section>

      {/* Параметры */}
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
            className="bg-card rounded-xl px-4 py-3"
            placeholder="Свой вариант"
            value={roomsCustom}
            onChange={(e) => setRoomsCustom(e.target.value)}
          />
        )}

        <input
          className="bg-card rounded-xl px-4 py-3"
          placeholder="Площадь, м²"
          value={area}
          onChange={(e) => setArea(e.target.value)}
        />

        <input
          className="bg-card rounded-xl px-4 py-3"
          placeholder="Площадь кухни"
          value={kitchenArea}
          onChange={(e) => setKitchenArea(e.target.value)}
        />

        <input
          className="bg-card rounded-xl px-4 py-3"
          placeholder="Цена"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </section>

      {/* Файлы */}
      <section className="bg-card2 p-4 rounded-2xl border border-gray-800 space-y-6">
        <h2 className="font-semibold text-lg">Фотографии</h2>

        {/* Фото */}
        <button
          type="button"
          className="bg-emerald-600 py-3 rounded-xl w-full"
          onClick={() =>
            isIOS
              ? openTelegramPicker("photo")
              : document.getElementById("photo_input")?.click()
          }
        >
          + Фото объекта
        </button>

        {!isIOS && (
          <input
            id="photo_input"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileInput(e, "photo")}
            className="hidden"
          />
        )}

        <Preview files={photos} type="photo" />

        {/* Планировки */}
        <button
          type="button"
          className="bg-neutral-700 py-3 rounded-xl w-full"
          onClick={() =>
            isIOS
              ? openTelegramPicker("plan")
              : document.getElementById("plan_input")?.click()
          }
        >
          + Планировки
        </button>

        {!isIOS && (
          <input
            id="plan_input"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileInput(e, "plan")}
            className="hidden"
          />
        )}

        <Preview files={planPhotos} type="plan" />

        {/* Документы */}
        <button
          type="button"
          className="bg-neutral-700 py-3 rounded-xl w-full"
          onClick={() =>
            isIOS
              ? openTelegramPicker("doc")
              : document.getElementById("docs_input")?.click()
          }
        >
          + Фото / PDF документов
        </button>

        {!isIOS && (
          <input
            id="docs_input"
            type="file"
            accept="image/*,application/pdf"
            multiple
            onChange={(e) => handleFileInput(e, "doc")}
            className="hidden"
          />
        )}

        <Preview files={docPhotos} type="doc" />
      </section>

      {/* Оферта */}
      <section className="bg-card2 p-4 rounded-2xl border border-gray-800">
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            className="mt-1"
            checked={offerAccepted}
            onChange={(e) => setOfferAccepted(e.target.checked)}
          />
          <span>
            Я соглашаюсь с{" "}
            <a
              href="https://krd-agents.ru/oferta"
              target="_blank"
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
        className="bg-emerald-600 py-3 rounded-xl w-full font-semibold"
      >
        {submitting ? "Отправляем..." : "Отправить на модерацию"}
      </button>
    </form>
  </div>
);
}

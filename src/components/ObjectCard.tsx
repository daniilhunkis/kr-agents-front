import { Heart, CalendarClock, Copy, MapPin, Ruler, Bath, Home } from "lucide-react";
import { motion } from "framer-motion";

export type ObjectItem = {
  id: string;
  title: string;
  price: number;
  address: string;
  district?: string;
  rooms: number;
  area_total: number;
  kitchen_area?: number;
  renovation?: string;
  img: string; // URL
  seller_agent_tg?: string; // юзернейм для назначения показа
};

function formatPrice(n: number) {
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}

export default function ObjectCard({ item, onShow, onFavorite }: {
  item: ObjectItem;
  onShow: (id: string) => void;
  onFavorite: (id: string) => void;
}) {
  const copyOffer = async () => {
    const lines = [
      `🏠 ${item.title}`,
      `💰 ${formatPrice(item.price)}`,
      item.district ? `📍 Район: ${item.district}` : `📍 Адрес: ${item.address}`,
      `🛏 Комнат: ${item.rooms}`,
      `📐 Площадь: ${item.area_total} м²` + (item.kitchen_area ? `, кухня ${item.kitchen_area} м²` : ""),
      item.renovation ? `🛠 Ремонт: ${item.renovation}` : "",
      "",
      `Ссылка на заявку/показ — без комиссий для покупателя.`,
    ].filter(Boolean).join("\n");

    await navigator.clipboard.writeText(lines);
  };

  return (
    <motion.div
      layout
      className="rounded-2xl bg-card shadow-soft border border-white/5 overflow-hidden"
      whileHover={{ y: -2 }}
    >
      <div className="relative aspect-[16/10]">
        <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 px-2 py-1 rounded-xl bg-black/50 backdrop-blur text-xs">
          {formatPrice(item.price)}
        </div>
        <button
          onClick={() => onFavorite(item.id)}
          className="absolute top-3 right-3 p-2 rounded-xl bg-black/50 backdrop-blur hover:bg-black/60"
          aria-label="add-favorite"
        >
          <Heart className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-3">
        <div>
          <div className="font-semibold leading-tight">{item.title}</div>
          <div className="text-sm text-white/70 flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{item.district ?? item.address}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center gap-1 bg-white/5 rounded-xl px-2 py-1">
            <Home className="w-4 h-4"/><span>{item.rooms} комн.</span>
          </div>
          <div className="flex items-center gap-1 bg-white/5 rounded-xl px-2 py-1">
            <Ruler className="w-4 h-4"/><span>{item.area_total} м²</span>
          </div>
          <div className="flex items-center gap-1 bg-white/5 rounded-xl px-2 py-1">
            <Bath className="w-4 h-4"/><span>{item.kitchen_area ? `${item.kitchen_area} м² кухня` : "санузел"}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onShow(item.id)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 shadow-glow"
          >
            <CalendarClock className="w-4 h-4" />
            Показ
          </button>
          <button
            onClick={() => onFavorite(item.id)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15"
          >
            <Heart className="w-4 h-4" />
            Избранное
          </button>
          <button
            onClick={copyOffer}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15"
          >
            <Copy className="w-4 h-4" />
            Скопировать
          </button>
        </div>
      </div>
    </motion.div>
  );
}

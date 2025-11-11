import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export type StoryItem = {
  id: string;
  title: string;
  cover: string; // URL
  count: number; // кол-во карточек внутри
};

export default function StoryCarousel({
  category,
  items
}: {
  category: string;
  items: StoryItem[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dx: number) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <div className="rounded-2xl bg-card p-3 shadow-soft border border-white/5">
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <div className="text-sm text-white/60">Категория</div>
          <div className="font-semibold">{category}</div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scrollBy(-300)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10">
            <ChevronLeft className="w-5 h-5"/>
          </button>
          <button onClick={() => scrollBy(300)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10">
            <ChevronRight className="w-5 h-5"/>
          </button>
        </div>
      </div>

      <div ref={ref} className="flex gap-3 overflow-x-auto no-scrollbar scroll-smooth px-1">
        {items.map((s) => (
          <motion.button
            key={s.id}
            whileTap={{ scale: 0.97 }}
            className="min-w-[140px] w-[140px] aspect-[9/16] rounded-2xl overflow-hidden relative group"
            onClick={() => {/* переход в сторис-лензу по категории */}}
          >
            <img src={s.cover} alt={s.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"/>
            <div className="absolute bottom-2 left-2 right-2">
              <div className="text-sm font-semibold leading-tight">{s.title}</div>
              <div className="text-xs text-white/70">{s.count} предлож.</div>
            </div>
            <div className="absolute inset-0 ring-2 ring-transparent group-hover:ring-accent/60 rounded-2xl transition"/>
          </motion.button>
        ))}
      </div>
    </div>
  );
}

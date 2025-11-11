import { useEffect, useState } from "react";
import StoryCarousel from "../components/StoryCarousel";
import ObjectCard from "../components/ObjectCard";
import { Link } from "react-router-dom";
import api from "../lib/api";

export default function Home() {
  const [stories, setStories] = useState<any[]>([]);
  const [objects, setObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const onShow = (id: string) => {
    console.log("Показ объекта:", id);
  };

  const onFav = (id: string) => {
    console.log("Добавлено в избранное:", id);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storiesRes, objectsRes] = await Promise.all([
          api.get("/stories"),
          api.get("/objects"),
        ]);
        setStories(storiesRes.data || []);
        setObjects(objectsRes.data || []);
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-white p-4">Загрузка...</div>;

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-white text-2xl font-bold mb-2">Главная</h1>

      <StoryCarousel category="Все категории" items={stories} />

      <div className="grid sm:grid-cols-2 gap-3">
        <Link
          to="/search"
          className="rounded-2xl bg-accent text-white p-4 text-center font-semibold shadow-glow hover:bg-accent/90"
        >
          🔎 Поиск по базе
        </Link>
        <Link
          to="/express"
          className="rounded-2xl bg-accent2 text-white p-4 text-center font-semibold hover:bg-emerald-500/90"
        >
          ⚡ Заказать экспресс-подборку
        </Link>
      </div>

      <h2 className="text-white text-xl font-semibold mt-4">
        Лучшие предложения
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {objects.map((o) => (
          <ObjectCard
            key={o.id}
            item={o}
            onShow={() => onShow(o.id)}
            onFavorite={() => onFav(o.id)}
          />
        ))}
      </div>
    </div>
  );
}

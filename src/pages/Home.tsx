import { useEffect, useState } from "react";
import StoryCarousel from "../components/StoryCarousel";
import ObjectCard from "../components/ObjectCard";
import { Link } from "react-router-dom";
import { fetchObjects, fetchStories } from "../api";

export default function Home() {
  const [stories, setStories] = useState<any[]>([]);
  const [objects, setObjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const onShow = (id: string) => {
    window.location.href = `/shows?object_id=${id}`;
  };

  const onFav = (id: string) => {
    alert(`Добавлено в избранное: ${id}`);
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [storiesData, objectsData] = await Promise.all([
          fetchStories(),
          fetchObjects()
        ]);
        setStories(storiesData);
        setObjects(objectsData);
      } catch (e) {
        console.error("Ошибка загрузки данных:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="text-white p-4">Загрузка...</div>;

  return (
    <div className="flex flex-col gap-4 min-h-screen p-4 text-white">
      <h1 className="text-3xl font-bold text-center mb-2">🏡 Главная страница</h1>

      {/* Stories */}
      <div className="grid gap-3">
        <StoryCarousel category="Все категории" items={stories} />
      </div>

      {/* Кнопки */}
      <div className="grid sm:grid-cols-2 gap-3">
        <Link to="/search" className="rounded-2xl bg-accent text-white p-4 text-center font-semibold shadow-glow hover:bg-accent/90">
          🔎 Поиск по базе
        </Link>
        <Link to="/express" className="rounded-2xl bg-accent2 text-white p-4 text-center font-semibold hover:bg-emerald-500/90">
          ⚡ Экспресс-подбор
        </Link>
      </div>

      {/* Объекты */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {objects.map((o) => (
          <ObjectCard key={o.id} item={o} onShow={onShow} onFavorite={onFav} />
        ))}
      </div>
      <div className="flex flex-col gap-4">
        {/* лучшие предложения */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {objects.map((o) => (
            <ObjectCard key={o.id} item={o} onShow={onShow} onFavorite={onFav} />
          ))}
        </div>
      </div>
    </div>
  );
}

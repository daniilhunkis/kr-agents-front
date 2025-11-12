import { useState } from "react";

export default function SearchPage() {
  const [form, setForm] = useState({
    query: "", // район / улица / ЖК
    rooms: "",
    priceFrom: "",
    priceTo: "",
    areaFrom: "",
    areaTo: "",
    kitchenFrom: "",
    kitchenTo: "",
    renovation: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Поиск по параметрам:", form);
    // TODO: тут будет API-запрос, например:
    // axios.get(`/api/objects`, { params: form })
  };

  return (
    <div className="flex flex-col gap-4 text-white p-4">
      <h1 className="text-2xl font-bold">🔍 Поиск недвижимости</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Район / улица / ЖК */}
        <input
          type="text"
          name="query"
          value={form.query}
          onChange={handleChange}
          placeholder="Район, улица или ЖК"
          className="p-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 border border-gray-700"
        />

        {/* Кол-во комнат */}
        <select
          name="rooms"
          value={form.rooms}
          onChange={handleChange}
          className="p-3 rounded-xl bg-gray-800 text-white border border-gray-700"
        >
          <option value="">Количество комнат</option>
          <option value="studio">Студия</option>
          <option value="1">1-комнатная</option>
          <option value="2">2-комнатная</option>
          <option value="3">3-комнатная</option>
        </select>

        {/* Цена */}
        <div className="flex gap-2">
          <input
            type="number"
            name="priceFrom"
            value={form.priceFrom}
            onChange={handleChange}
            placeholder="Цена от"
            className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700"
          />
          <input
            type="number"
            name="priceTo"
            value={form.priceTo}
            onChange={handleChange}
            placeholder="до"
            className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700"
          />
        </div>

        {/* Площадь */}
        <div className="flex gap-2">
          <input
            type="number"
            name="areaFrom"
            value={form.areaFrom}
            onChange={handleChange}
            placeholder="Площадь от"
            className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700"
          />
          <input
            type="number"
            name="areaTo"
            value={form.areaTo}
            onChange={handleChange}
            placeholder="до"
            className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700"
          />
        </div>

        {/* Площадь кухни */}
        <div className="flex gap-2">
          <input
            type="number"
            name="kitchenFrom"
            value={form.kitchenFrom}
            onChange={handleChange}
            placeholder="Кухня от"
            className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700"
          />
          <input
            type="number"
            name="kitchenTo"
            value={form.kitchenTo}
            onChange={handleChange}
            placeholder="до"
            className="flex-1 p-3 rounded-xl bg-gray-800 border border-gray-700"
          />
        </div>

        {/* Ремонт */}
        <select
          name="renovation"
          value={form.renovation}
          onChange={handleChange}
          className="p-3 rounded-xl bg-gray-800 text-white border border-gray-700"
        >
          <option value="">Тип ремонта</option>
          <option value="черновой">Черновой</option>
          <option value="предчистовой">Предчистовой</option>
          <option value="ремонт">С ремонтом</option>
          <option value="дизайнерский">Дизайнерский</option>
        </select>

        <button
          type="submit"
          className="mt-2 p-3 bg-blue-600 rounded-xl text-white font-semibold hover:bg-blue-700 transition"
        >
          Найти
        </button>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import { getUser, changeModeratorPassword } from "../lib/api";
import type { UserDto } from "../lib/api";

export default function ModeratorPage() {
  const [user, setUser] = useState<UserDto | null>(null);
  const [step, setStep] = useState<"loading" | "no-access" | "login" | "panel">(
    "loading",
  );
  const [password, setPassword] = useState("");
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");

  useEffect(() => {
    const init = async () => {
      const tgUser = WebApp.initDataUnsafe?.user;
      if (!tgUser) {
        setStep("no-access");
        return;
      }

      try {
        const u = await getUser(tgUser.id);
        if (u.role !== "moderator") {
          setStep("no-access");
          return;
        }
        setUser(u);
        setStep("login");
      } catch {
        setStep("no-access");
      }
    };

    init();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.moderatorPassword) {
      // если вдруг пароля нет — пускаем и просим сразу задать новый
      setStep("panel");
      return;
    }
    if (password === user.moderatorPassword) {
      setStep("panel");
    } else {
      alert("Неверный пароль модератора");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await changeModeratorPassword(user.id, oldPwd, newPwd);
      alert("Пароль успешно изменён");
      setOldPwd("");
      setNewPwd("");
      setUser({ ...user, moderatorPassword: newPwd });
    } catch (err) {
      console.error(err);
      alert("Ошибка при смене пароля");
    }
  };

  if (step === "loading") {
    return <div className="p-4 text-white">Загрузка...</div>;
  }

  if (step === "no-access") {
    return (
      <div className="p-4 text-white">
        Нет доступа. Эта страница только для модераторов.
      </div>
    );
  }

  if (step === "login") {
    return (
      <div className="flex items-center justify-center h-full">
        <form
          onSubmit={handleLogin}
          className="bg-neutral-900 p-6 rounded-2xl shadow-lg w-full max-w-sm flex flex-col gap-4"
        >
          <h2 className="text-xl font-semibold text-center mb-2">
            🛡 Вход модератора
          </h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль модератора"
            className="p-3 rounded-xl bg-neutral-800 text-white focus:outline-none text-center"
            required
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 transition rounded-xl py-2 font-semibold"
          >
            Войти
          </button>
        </form>
      </div>
    );
  }

  // panel
  return (
    <div className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Панель модератора 🛡</h1>

      <p className="mb-4 text-gray-300">
        Здесь позже будет список объектов для модерации: принять / доработать / отклонить.
      </p>

      <div className="mt-6 max-w-md bg-neutral-900 p-4 rounded-2xl">
        <h2 className="text-lg font-semibold mb-3">Смена пароля модератора</h2>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <input
            type="password"
            value={oldPwd}
            onChange={(e) => setOldPwd(e.target.value)}
            placeholder="Текущий пароль"
            className="p-2 rounded-xl bg-neutral-800 text-white focus:outline-none"
            required
          />
          <input
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="Новый пароль"
            className="p-2 rounded-xl bg-neutral-800 text-white focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 transition rounded-xl py-2 font-semibold"
          >
            Обновить пароль
          </button>
        </form>
      </div>
    </div>
  );
}

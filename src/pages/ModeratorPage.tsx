import React, { useEffect, useState } from "react";
import WebApp from "@twa-dev/sdk";
import type { UserDto } from "../lib/api";
import { getUser, changeModeratorPassword } from "../lib/api";

type Stage = "loading" | "no_access" | "need_password" | "authorized";

export default function ModeratorPage() {
  const [stage, setStage] = useState<Stage>("loading");
  const [user, setUser] = useState<UserDto | null>(null);

  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [changePwdMsg, setChangePwdMsg] = useState<string | null>(null);

  const [isLoadingPwdChange, setIsLoadingPwdChange] = useState(false);

  // ---- 1. Загружаем пользователя по Telegram ID ----
  useEffect(() => {
    const init = async () => {
      try {
        const tgUser = WebApp.initDataUnsafe?.user;
        if (!tgUser) {
          setStage("no_access");
          return;
        }

        const userId = tgUser.id as number;
        const u = await getUser(userId);

        setUser(u);

        if (u.role === "moderator" || u.role === "admin") {
          // Модератор или админ — но пускаем только через пароль
          setStage("need_password");
        } else {
          setStage("no_access");
        }
      } catch (err) {
        console.error("Ошибка загрузки пользователя для модерации", err);
        setStage("no_access");
      }
    };

    init();
  }, []);

  // ---- 2. Обработка логина по паролю модератора ----
  const handleModeratorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!user) return;

    const storedPwd = (user as any).moderatorPassword as string | undefined;

    if (!storedPwd) {
      setLoginError(
        "Пароль модератора ещё не назначен. Попросите главного админа выдать вам пароль."
      );
      return;
    }

    if (loginPassword.trim() === storedPwd) {
      setStage("authorized");
      setLoginPassword("");
    } else {
      setLoginError("Неверный пароль модератора");
    }
  };

  // ---- 3. Смена пароля модератора (изнутри панели) ----
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newPwd || newPwd.length < 4) {
      setChangePwdMsg("Новый пароль должен быть не короче 4 символов");
      return;
    }

    setIsLoadingPwdChange(true);
    setChangePwdMsg(null);

    try {
      await changeModeratorPassword(user.id, {
        oldPassword: oldPwd || undefined,
        newPassword: newPwd,
      });

      // Локально обновим пароль (чтобы вход по новому паролю сразу работал)
      setUser((prev) =>
        prev ? ({ ...prev, moderatorPassword: newPwd } as any) : prev
      );
      setOldPwd("");
      setNewPwd("");
      setChangePwdMsg("Пароль успешно изменён");
    } catch (err) {
      console.error("Ошибка смены пароля модератора", err);
      setChangePwdMsg("Ошибка при смене пароля. Проверьте старый пароль.");
    } finally {
      setIsLoadingPwdChange(false);
    }
  };

  // ---- 4. Рендер состояний ----

  if (stage === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tgBg text-white">
        Загрузка...
      </div>
    );
  }

  if (stage === "no_access") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tgBg text-white px-6">
        <div className="bg-card2 rounded-2xl p-6 max-w-md w-full text-center shadow-soft">
          <h1 className="text-2xl font-bold mb-3">Нет доступа</h1>
          <p className="text-gray-300 text-sm">
            Эта страница доступна только пользователям с ролью{" "}
            <span className="text-emerald-400 font-semibold">
              модератор
            </span>{" "}
            или{" "}
            <span className="text-emerald-400 font-semibold">админ</span>.
            Попросите главного админа выдать вам права.
          </p>
        </div>
      </div>
    );
  }

  // --- Страница ввода пароля модератора ---
  if (stage === "need_password") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-tgBg text-white px-6">
        <form
          onSubmit={handleModeratorLogin}
          className="bg-card2 rounded-2xl p-6 max-w-md w-full shadow-soft flex flex-col gap-4"
        >
          <h1 className="text-2xl font-bold text-center mb-1">
            Вход модератора
          </h1>
          <p className="text-gray-300 text-sm text-center mb-2">
            Введите пароль модератора, который выдали вам в админке.
          </p>

          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder="Пароль модератора"
            className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500"
          />

          {loginError && (
            <div className="text-red-400 text-xs text-center">{loginError}</div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 transition py-3 font-semibold shadow-glow"
          >
            Войти
          </button>

          <p className="text-[11px] text-gray-400 text-center mt-1">
            Если вы модератор, но не знаете пароль — напишите главному
            администратору.
          </p>
        </form>
      </div>
    );
  }

  // --- Основная панель модерации (после ввода пароля) ---
  return (
    <div className="min-h-screen bg-tgBg text-white px-4 pb-20 pt-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Панель модератора</h1>
        {user && (
          <p className="text-sm text-gray-400 mt-1">
            {user.firstName} {user.lastName} · роль{" "}
            <span className="text-emerald-400 font-semibold">
              {user.role}
            </span>
          </p>
        )}
      </header>

      {/* Блок модерации объектов */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Объекты на модерации</h2>
          <span className="text-xs text-gray-400">
            (подключим к API /api/objects/moderation)
          </span>
        </div>

        <div className="bg-card2 rounded-2xl p-4 border border-gray-800 text-sm text-gray-300">
          <p>
            Здесь будет список объектов, которые требуют модерации: одобрить,
            вернуть на доработку или отклонить.
          </p>
          <p className="mt-2">
            Как только реализуем backend для объектов, сюда добавятся карточки с
            кнопками действий.
          </p>
        </div>
      </section>

      {/* Блок смены пароля модератора */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Сменить пароль модератора</h2>
        <form
          onSubmit={handleChangePassword}
          className="bg-card2 rounded-2xl p-4 border border-gray-800 flex flex-col gap-3 max-w-md"
        >
          <input
            type="password"
            value={oldPwd}
            onChange={(e) => setOldPwd(e.target.value)}
            placeholder="Текущий пароль (если есть)"
            className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
          />
          <input
            type="password"
            value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)}
            placeholder="Новый пароль (например, 6-значный код)"
            className="w-full rounded-xl bg-card px-4 py-3 text-white outline-none border border-gray-700 focus:border-emerald-500 text-sm"
            required
          />

          {changePwdMsg && (
            <div className="text-xs text-center text-gray-300">
              {changePwdMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoadingPwdChange}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 transition py-2.5 font-semibold text-sm"
          >
            {isLoadingPwdChange ? "Сохраняем..." : "Обновить пароль"}
          </button>

          <p className="text-[11px] text-gray-400">
            Вы можете периодически менять пароль модератора. Не передавайте его
            третьим лицам.
          </p>
        </form>
      </section>
    </div>
  );
}
